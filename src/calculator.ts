import { AppState, CalculationResults } from './types';

// Financial Engine Helpers
function calculateNPV(rate: number, cashFlows: number[], initial: number) {
  return cashFlows.reduce((acc, val, i) => acc + val / Math.pow(1 + rate, i + 1), 0) - initial;
}

function calculateIRR(cashFlows: number[], initial: number) {
  let min = 0.0, max = 1.0, irr = 0.0;
  for(let i=0; i<100; i++) {
    irr = (min + max) / 2;
    let npv = calculateNPV(irr, cashFlows, initial);
    if(Math.abs(npv) < 1) break;
    if(npv > 0) min = irr;
    else max = irr;
  }
  return irr;
}

/**
 * Motor Avançado de Dimensionamento PVSyst-Like
 * Em conformidade com NBR 16690, NBR 5410.
 */
export function runEngineeringCalculations(s: AppState): CalculationResults {
  const isGrid = s.sizing.systemType === 'On-Grid';
  
  // 1. Balanço Energético
  const dailyKwh = s.consumption.dailyKwh > 0 ? s.consumption.dailyKwh : (s.consumption.monthlyAvgKwh / 30);
  const monthlyKwh = s.consumption.monthlyAvgKwh > 0 ? s.consumption.monthlyAvgKwh : (dailyKwh * 30);
  const annualEnergyKwh = monthlyKwh * 12;

  // 2. Perdas (Performance Ratio)
  const totalLosses = 1 - (
    (1 - s.sizing.losses.shading / 100) * 
    (1 - s.sizing.losses.soiling / 100) * 
    (1 - s.sizing.losses.mismatch / 100) * 
    (1 - s.sizing.losses.cabling / 100)
  );
  
  const tempLoss = 0.05; // ~5% loss from temperature on average
  const inverterLoss = 1 - (s.equipment.inverterEfficiency / 100);
  const PR = isGrid ? (1 - totalLosses) * (1 - tempLoss) * (1 - inverterLoss) : 0.65; // Off-grid PR is typically lower due to battery cycle losses

  // 3. Sizing PV
  const hsp = s.climate.hsp || 4.5;
  const targetPowerW = ((monthlyKwh * 1000) / (hsp * 30 * PR));
  const oversizeTarget = 1 + (s.sizing.oversizingFactor || 0) / 100;
  const requiredPvPowerW = targetPowerW * oversizeTarget;
  
  const numModules = Math.ceil(requiredPvPowerW / s.equipment.modulePower);
  const actualPvPowerW = numModules * s.equipment.modulePower;
  
  const totalArea = numModules * (s.equipment.moduleArea || 0);
  const totalWeight = numModules * (s.equipment.moduleWeight || 0);
  const dcAcRatio = actualPvPowerW / (s.equipment.inverterPower || 1);

  const specificYield = actualPvPowerW > 0 ? (annualEnergyKwh / (actualPvPowerW/1000)) : 0;

  // 4. Limites Térmicos (NBR 16690)
  const deltaTMin = s.climate.minTemp - 25; 
  const deltaTMax = (s.climate.maxTemp + 35) - 25; 
  const vocMaxTemp = s.equipment.moduleVoc * (1 + (s.equipment.moduleTempCoeffVoc / 100) * deltaTMin);
  const vmpMinTemp = s.equipment.moduleVmp * (1 + (s.equipment.moduleTempCoeffPmax / 100) * deltaTMax);

  const maxModulesPerString = Math.floor(s.equipment.inverterMaxDcV / (vocMaxTemp || 1));
  const minModulesPerString = Math.ceil(s.equipment.inverterMpptMinV / (vmpMinTemp || 1));
  
  let strings = 1;
  let modsPerString = numModules;
  if (modsPerString > maxModulesPerString && maxModulesPerString > 0) {
     strings = Math.ceil(numModules / maxModulesPerString);
     modsPerString = Math.ceil(numModules / strings); 
  }

  // 5. Proteções e Cabos
  const iscArray = s.equipment.moduleIsc * strings;
  const breakerCcA = Math.ceil(iscArray * 1.25);
  const dpsCcV = Math.ceil((s.equipment.moduleVoc * modsPerString) * 1.2 / 100) * 100 + 40; 
  
  const vac = s.project.gridPhase === 'Monofásico' ? s.project.gridVoltage : (s.project.gridPhase === 'Bifásico' ? s.project.gridVoltage : s.project.gridVoltage * 1.732);
  const iac = s.equipment.inverterPower / (vac || 220);
  const breakerAcA = Math.ceil(iac * 1.25);
  
  const cableAcSect = breakerAcA > 63 ? 16 : breakerAcA > 40 ? 10 : breakerAcA > 32 ? 6 : breakerAcA > 20 ? 4 : 2.5;
  const cableDcSect = iscArray > 25 ? 6 : 4;

  // Quedas de Tensão Estimada (2*L*I / C*S) - C=56 para Cobre
  const voltageDropDc = (2 * s.sizing.cableDistanceDc * iscArray) / (56 * cableDcSect) || 0;
  const voltageDropAc = (2 * s.sizing.cableDistanceAc * iac) / (56 * cableAcSect) || 0;

  // 6. Armazenamento (Baterias)
  let reqAh = 0, battSer = 0, battPar = 0, totalBatts = 0, storageKwhBruto = 0, storageKwhUtil = 0;
  if (!isGrid) {
    const requiredWh = dailyKwh * 1000 * s.sizing.autonomyDays;
    const sysVoltage = s.equipment.batteryVoltage || 48; // Assume 48V for large banks if not specified otherwise in tech
    
    // Using 90% generic efficiency for the bank
    reqAh = requiredWh / (sysVoltage * (s.equipment.batteryDod/100) * 0.90); 
    
    battSer = Math.ceil(sysVoltage / (s.equipment.batteryVoltage || 12));
    battPar = Math.ceil(reqAh / (s.equipment.batteryCapacity || 100));
    totalBatts = battSer * battPar;
    
    storageKwhBruto = (totalBatts * s.equipment.batteryVoltage * s.equipment.batteryCapacity) / 1000;
    storageKwhUtil = storageKwhBruto * (s.equipment.batteryDod/100);
  }

  // 7. Financeiro (LCOE, VPL, TIR)
  const hardwareBase = actualPvPowerW * s.finance.capexPerWp;
  const battBase = totalBatts * s.finance.batteryCostPerUnit;
  const capexTotal = hardwareBase + battBase;
  
  const yearlySavingsStart = annualEnergyKwh * s.finance.energyTariff;
  
  // Project cash flows
  const cashFlows = [];
  const generatedEnergy = [];
  const years = s.finance.analysisYears;
  const degradation = 0.007; // 0.7% a.a.
  const inflation = s.finance.tariffInflation / 100;
  
  for(let y=1; y<=years; y++) {
    let energyY = annualEnergyKwh * Math.pow(1 - degradation, y);
    let tariffY = s.finance.energyTariff * Math.pow(1 + inflation, y);
    let savings = energyY * tariffY;
    let costs = s.finance.opexYearly; // ignoring OPEX inflation for simplicity
    
    // Inverter exchange at year 12
    if(y === 12) costs += (s.equipment.inverterPower * 0.8); // 80c per watt estimate
    
    cashFlows.push(savings - costs);
    generatedEnergy.push(energyY);
  }

  const vpl = calculateNPV(s.finance.discountRate/100, cashFlows, capexTotal);
  const tir = calculateIRR(cashFlows, capexTotal) * 100;
  
  // Payback simples
  let accum = -capexTotal;
  let payback = 0;
  for(let y=0; y<years; y++) {
    accum += cashFlows[y];
    if(accum >= 0 && payback === 0) {
      // interpolate
      payback = (y + 1) - (accum / cashFlows[y]);
      break;
    }
  }

  // LCOE
  const disc = s.finance.discountRate / 100;
  const presentValueCosts = capexTotal + cashFlows.reduce((acc, _, y) => acc + s.finance.opexYearly / Math.pow(1 + disc, y+1), 0);
  const presentValueEnergy = generatedEnergy.reduce((acc, e, y) => acc + e / Math.pow(1 + disc, y+1), 0);
  const lcoe = presentValueCosts / presentValueEnergy;

  const roi = ((cashFlows.reduce((a,b)=>a+b,0) - capexTotal) / capexTotal) * 100;

  // 8. Calculation Memory
  const calculationMemory = [
    {
      step: 'Etapa 1',
      description: 'Energia Diária Necessária',
      formula: 'Ediaria = ConsumoMensal ÷ 30',
      values: `Ediaria = ${monthlyKwh.toFixed(1)} ÷ 30`,
      result: `${dailyKwh.toFixed(1)} kWh/dia`
    },
    {
      step: 'Etapa 2',
      description: 'Potência FV Mínima Nominal',
      formula: 'Pfv = (ConsumoMensal × 1000) ÷ (HSP × PR × 30)',
      values: `Pfv = (${monthlyKwh.toFixed(1)} * 1000) ÷ (${hsp} × ${PR.toFixed(2)} × 30)`,
      result: `${(targetPowerW / 1000).toFixed(2)} kWp`
    },
    {
      step: 'Etapa 2B',
      description: 'Potência FV c/ Oversize (Margem)',
      formula: 'Pfv_req = Pfv × (1 + Margem)',
      values: `Pfv_req = ${(targetPowerW / 1000).toFixed(2)} × ${oversizeTarget}`,
      result: `${(requiredPvPowerW / 1000).toFixed(2)} kWp`
    },
    {
      step: 'Etapa 3',
      description: 'Número de Módulos (Arredondamento P/ Cima)',
      formula: 'Nmod = Pfv_req ÷ Potencia_do_Modulo',
      values: `Nmod = ${Math.ceil(requiredPvPowerW)}W ÷ ${s.equipment.modulePower}W`,
      result: `${numModules} unidades`
    },
    {
      step: 'Etapa 4',
      description: 'Relação DC/AC (Overloading)',
      formula: 'F_Overload = Potencia_FV_Total ÷ Potencia_Inversor',
      values: `F = ${actualPvPowerW}W ÷ ${s.equipment.inverterPower}W`,
      result: `${dcAcRatio.toFixed(2)}x`
    },
    {
      step: 'Etapa 5',
      description: 'Correção de Tensão (Voc) pela Temperatura Mínima',
      formula: 'Voc_Max = Voc_STC × (1 + Coef_Temp × DeltaT_Min)',
      norm: 'NBR 16690',
      values: `Voc_Max = ${s.equipment.moduleVoc} V × (1 + (${s.equipment.moduleTempCoeffVoc}/100) × ${deltaTMin} °C)`,
      result: `${vocMaxTemp.toFixed(2)} V`
    },
    {
      step: 'Etapa 6',
      description: 'Tamanho Máximo da String',
      formula: 'MaxMod = Inverter_Max_DC_V ÷ Voc_Max',
      norm: 'NBR 16690',
      values: `MaxMod = ${s.equipment.inverterMaxDcV} V ÷ ${vocMaxTemp.toFixed(2)} V`,
      result: `${maxModulesPerString} un.`
    }
  ];

  return {
    dailyEnergyWh: dailyKwh * 1000, 
    monthlyEnergyKwh: monthlyKwh, 
    annualEnergyKwh,
    requiredPvPowerW, 
    actualPvPowerW, 
    numModules,
    performanceRatio: PR,
    specificYield,
    totalArea,
    totalWeight,
    dcAcRatio,
    
    vocMaxTemp, vmpMinTemp, maxModulesPerString, minModulesPerString, strings, modsPerString,
    iscArray, breakerCcA, breakerAcA, cableAcSect, cableDcSect, voltageDropDc, voltageDropAc, dpsCcV,
    
    reqAh, battSer, battPar, totalBatts, storageKwhBruto, storageKwhUtil,
    
    capexTotal, lcoe, vpl, tir, payback, roi, yearlySavingsStart,
    
    calculationMemory
  };
}
