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
  let dailyKwh = 0;
  let monthlyKwh = 0;
  
  let peakPowerW = 0;
  let priorityPeakPowerW = 0;
  let peakPowerVA = 0;
  let priorityPeakPowerVA = 0;
  let priorityDailyKwh = 0;
  let hasPriorityLoads = false;

  if (s.consumption.method === 'loadProfile' && s.consumption.loads) {
    s.consumption.loads.forEach(load => {
      // Wh/day
      const whDay = load.qty * load.powerW * load.hoursPerDay;
      const whMonth = whDay * load.daysPerMonth;
      
      const loadPower = load.qty * load.powerW;
      const fp = load.powerFactor && load.powerFactor > 0 ? load.powerFactor : 1;
      const loadVA = loadPower / fp;
      
      peakPowerW += loadPower;
      peakPowerVA += loadVA;
      
      if (load.isPriority) {
          hasPriorityLoads = true;
          priorityPeakPowerW += loadPower;
          priorityPeakPowerVA += loadVA;
          priorityDailyKwh += whDay / 1000;
      }
      
      dailyKwh += whDay / 1000;
      monthlyKwh += whMonth / 1000;
    });
  } else {
    dailyKwh = s.consumption.dailyKwh > 0 ? s.consumption.dailyKwh : (s.consumption.monthlyAvgKwh / 30);
    monthlyKwh = s.consumption.monthlyAvgKwh > 0 ? s.consumption.monthlyAvgKwh : (dailyKwh * 30);
    peakPowerW = (dailyKwh * 1000) / 4; // Generic assumption
    peakPowerVA = peakPowerW / 0.92; // Generic FP assumption for global
  }
  
  // Apply simultaneity
  let effectivePeakPowerW = peakPowerW * (s.sizing.simultaneityFactor || 0.8);
  let effectivePriorityPeakPowerW = priorityPeakPowerW * (s.sizing.simultaneityFactor || 0.8);
  let effectivePeakPowerVA = peakPowerVA * (s.sizing.simultaneityFactor || 0.8);
  let effectivePriorityPeakPowerVA = priorityPeakPowerVA * (s.sizing.simultaneityFactor || 0.8);
  
  const annualEnergyKwh = monthlyKwh * 12;

  // 2. Perdas (Performance Ratio) e Cachoeira de Perdas
  const hsp = s.climate.hsp || 4.5;
  const tempLoss = 0.05; // ~5% loss from temperature on average
  const inverterLoss = 1 - (s.equipment.inverterEfficiency / 100);

  // 3. Sizing PV
  const totalLossesComp = 1 - (
    (1 - s.sizing.losses.shading / 100) * 
    (1 - s.sizing.losses.soiling / 100) * 
    (1 - s.sizing.losses.mismatch / 100) * 
    (1 - s.sizing.losses.cabling / 100)
  );
  const PR = isGrid ? (1 - totalLossesComp) * (1 - tempLoss) * (1 - inverterLoss) : 0.65; // Off-grid PR is typically lower due to battery cycle losses

  const targetPowerW = ((monthlyKwh * 1000) / (hsp * 30 * PR));
  const oversizeTarget = 1 + (s.sizing.oversizingFactor || 0) / 100;
  const requiredPvPowerW = targetPowerW * oversizeTarget;
  
  const numModules = Math.ceil(requiredPvPowerW / s.equipment.modulePower);
  const actualPvPowerW = numModules * s.equipment.modulePower;
  
  const totalArea = numModules * (s.equipment.moduleArea || 0);
  const totalWeight = numModules * (s.equipment.moduleWeight || 0);
  
  // ==========================================
  // INVERTER AUTO-DIMENSIONING LOGIC
  // ==========================================
  let minInverterPowerW = actualPvPowerW / (s.sizing.maxDcAcRatio || 1.25);
  
  if (s.consumption.method === 'loadProfile' && s.consumption.loads && s.consumption.loads.length > 0) {
     // Com base na soma das potências nominais (W) de todas as cargas cadastradas
     let targetPower = 0;
     s.consumption.loads.forEach(l => {
        // margem de segurança de 25% para cargas de alta potência (>= 1000W)
        const isHighPower = l.powerW >= 1000;
        const margin = isHighPower ? 1.25 : 1.0;
             
        targetPower += (l.powerW * l.qty) * margin;
     });
     
     if (targetPower > minInverterPowerW) {
        minInverterPowerW = targetPower;
     }
  } else if (!isGrid) {
     const peakApparentPowerVA = (hasPriorityLoads && s.sizing.systemType === 'Híbrido') ? effectivePriorityPeakPowerVA : effectivePeakPowerVA;
     if (peakApparentPowerVA > minInverterPowerW) {
        minInverterPowerW = peakApparentPowerVA;
     }
  }
  
  // Snap to commercial sizes
  const commercialSizes = [1000, 1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000];
  let recommendedInverterPowerW = commercialSizes.find(size => size >= minInverterPowerW) || (Math.ceil(minInverterPowerW / 5000) * 5000);
  
  // Override for calculation if set to Auto
  if (s.equipment.inverterMode === 'auto' || !s.equipment.inverterMode) {
     s.equipment.inverterPower = recommendedInverterPowerW;
  }
  const dcAcRatio = actualPvPowerW / (s.equipment.inverterPower || 1);

  // Losses Waterfall Calculation
  const energyNominalDc = (actualPvPowerW * hsp * 365) / 1000;
  let currentEnergy = energyNominalDc;

  const lossTemperatureKwh = currentEnergy * tempLoss;
  currentEnergy -= lossTemperatureKwh;

  const lossMismatchKwh = currentEnergy * (s.sizing.losses.mismatch / 100);
  currentEnergy -= lossMismatchKwh;

  const lossShadingKwh = currentEnergy * (s.sizing.losses.shading / 100);
  currentEnergy -= lossShadingKwh;

  const lossSoilingKwh = currentEnergy * (s.sizing.losses.soiling / 100);
  currentEnergy -= lossSoilingKwh;

  const lossCablingKwh = currentEnergy * (s.sizing.losses.cabling / 100);
  currentEnergy -= lossCablingKwh;

  const lossInverterKwh = currentEnergy * inverterLoss;
  currentEnergy -= lossInverterKwh;

  const lossDegradationKwh = currentEnergy * 0.007; // Year 1 Degradation
  currentEnergy -= lossDegradationKwh;

  const energyActualAc = isGrid ? currentEnergy : currentEnergy * 0.85; // battery extra losses if offgrid

  const specificYield = actualPvPowerW > 0 ? (energyActualAc / (actualPvPowerW/1000)) : 0;

  // 4. Limites Térmicos (NBR 16690)
  const deltaTMin = s.climate.minTemp - 25; 
  const deltaTMax = (s.climate.maxTemp + 35) - 25; 
  const vocMaxTemp = s.equipment.moduleVoc * (1 + (s.equipment.moduleTempCoeffVoc / 100) * deltaTMin);
  const vmpMinTemp = s.equipment.moduleVmp * (1 + (s.equipment.moduleTempCoeffPmax / 100) * deltaTMax);

  const maxModulesPerString = Math.floor(s.equipment.inverterMaxDcV / (vocMaxTemp || 1));
  const minModulesPerString = Math.ceil(s.equipment.inverterMpptMinV / (vmpMinTemp || 1));
  
  let strings = 1;
  let modsPerString = numModules;
  
  // Basic max module loop logic
  while (modsPerString > maxModulesPerString && maxModulesPerString > 0) {
     strings++;
     modsPerString = Math.floor(numModules / strings); 
  }
  
  const stringVocMax = vocMaxTemp * modsPerString;
  const stringVmpMin = vmpMinTemp * modsPerString;

  // Se a corrente ficar muito alta, dividimos ainda mais as strings?
  // Normalmente só verificamos.
  const mpptCount = s.equipment.inverterMpptCount || 1;
  const stringsPerMppt = Math.ceil(strings / mpptCount);
  const currentPerMppt = stringsPerMppt * s.equipment.moduleIsc;

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
  let reqAh = 0, battSer = 0, battPar = 0, totalBatts = 0, storageKwhBruto = 0, storageKwhUtil = 0, batteryBankMaxPowerW = 0;
  if (!isGrid) {
    const isHybrid = s.sizing.systemType === 'Híbrido';
    const targetDailyWh = (isHybrid && hasPriorityLoads) ? (priorityDailyKwh * 1000) : (dailyKwh * 1000);
    const targetPeakPowerW = (isHybrid && hasPriorityLoads) ? effectivePriorityPeakPowerW : effectivePeakPowerW;
    
    let requiredWh = targetDailyWh * s.sizing.autonomyDays;
    const sysVoltage = s.equipment.batteryVoltage || 48; // Assume 48V for large banks if not specified otherwise in tech
    
    // Using 90% generic efficiency for the bank
    reqAh = requiredWh / (sysVoltage * (s.equipment.batteryDod/100) * 0.90); 
    
    battSer = Math.ceil(sysVoltage / (s.equipment.batteryVoltage || 12));
    battPar = Math.ceil(reqAh / (s.equipment.batteryCapacity || 100));
    totalBatts = battSer * battPar;
    
    // 5. Respeitar o limite de potência da bateria
    const maxDischargeA = s.equipment.batteryMaxDischargeA || 50;
    batteryBankMaxPowerW = battPar * maxDischargeA * sysVoltage; 

    // If battery power is not enough for target peak, increase parallel branches
    if (batteryBankMaxPowerW < targetPeakPowerW) {
        let additionalBattPar = Math.ceil((targetPeakPowerW - batteryBankMaxPowerW) / (maxDischargeA * sysVoltage));
        battPar += additionalBattPar;
        totalBatts = battSer * battPar;
        batteryBankMaxPowerW = battPar * maxDischargeA * sysVoltage;
    }

    storageKwhBruto = (totalBatts * (s.equipment.batteryVoltage || 12) * (s.equipment.batteryCapacity || 100)) / 1000;
    storageKwhUtil = storageKwhBruto * (s.equipment.batteryDod/100);
  }

  // 7. Financeiro (LCOE, VPL, TIR)
  const hardwareBase = s.finance.costMethod === 'total' 
    ? (s.finance.finalKitCost || 20000)
    : actualPvPowerW * s.finance.capexPerWp;
  const battBase = totalBatts * s.finance.batteryCostPerUnit;
  const capexTotal = hardwareBase + battBase;
  
  const yearlyTargetKwh = energyActualAc; // use actual computed AC generation
  const yearlySavingsStart = Math.min(annualEnergyKwh, yearlyTargetKwh) * s.finance.energyTariff; // capped at consumption limit for simplified net metering
  
  // Project cash flows
  const cashFlows = [];
  const generatedEnergy = [];
  const economicData = [];
  const years = s.finance.analysisYears;
  const degradation = 0.007; // 0.7% a.a.
  const inflation = s.finance.tariffInflation / 100;
  
  let noSolarCum = 0;
  let solarCum = -capexTotal;
  let accumSavings = 0;
  
  const dieselCapex = s.finance.dieselGensetCost || 15000;
  const dieselFuelCostYearly = (s.finance.dieselFuelPrice || 6.0) * (s.finance.dieselConsumptionPerHour || 2.5) * (s.finance.dieselRuntimeYearly || 100);
  let dieselCumulative = -dieselCapex;
  
  economicData.push({
    year: 0,
    noSolarCumulative: 0,
    solarCumulative: solarCum,
    cumulativeSavings: 0,
    dieselCumulative: dieselCumulative,
    capexLine: capexTotal
  });

  for(let y=1; y<=years; y++) {
    let energyY = yearlyTargetKwh * Math.pow(1 - degradation, y);
    let tariffY = s.finance.energyTariff * Math.pow(1 + inflation, y);
    
    // No Solar: they pay the full bill with inflated tariff
    let billNoSolar = annualEnergyKwh * tariffY;
    noSolarCum -= billNoSolar;
    
    // Solar: they save 'savings' on the bill, but have 'costs'
    let savings = Math.min(annualEnergyKwh, energyY) * tariffY; // bill 
    let costs = s.finance.opexYearly; // ignoring OPEX inflation for simplicity
    
    // Inverter exchange at year 12
    if(y === 12) costs += (s.equipment.inverterPower * 0.8); // 80c per watt estimate
    
    cashFlows.push(savings - costs);
    generatedEnergy.push(energyY);
    
    accumSavings += (savings - costs);
    
    // Their net flow for the year is effectively: - (billNoSolar - savings) - costs
    // Which means: solarCum = solarCum - (billNoSolar - savings) - costs
    solarCum += (savings - costs) - billNoSolar;
    
    let currentDieselCosts = (dieselFuelCostYearly + (s.finance.dieselOpexYearly || 1200)) * Math.pow(1 + inflation, y);
    dieselCumulative -= billNoSolar + currentDieselCosts;
    
    economicData.push({
      year: y,
      noSolarCumulative: noSolarCum,
      solarCumulative: solarCum,
      cumulativeSavings: accumSavings,
      dieselCumulative: dieselCumulative,
      capexLine: capexTotal
    });
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
      formula: 'Ediaria = Consumo Mensal ÷ 30',
      values: `Ediaria = ${monthlyKwh.toFixed(1)} ÷ 30`,
      result: `${dailyKwh.toFixed(1)} kWh/dia`
    },
    {
       step: 'Etapa 1.1',
       description: 'Potência Aparente de Pico Simultânea',
       formula: 'S_pico (VA) = Soma(P_carga ÷ FP) × F. de Simult.',
       values: `S_pico = ${((hasPriorityLoads && s.sizing.systemType === 'Híbrido' ? priorityPeakPowerVA : peakPowerVA)/1000).toFixed(2)}kVA × ${(s.sizing.simultaneityFactor || 0.8)}`,
       result: `${((hasPriorityLoads && s.sizing.systemType === 'Híbrido' ? effectivePriorityPeakPowerVA : effectivePeakPowerVA)/1000).toFixed(2)} kVA`
    },
    ...(!isGrid ? [{
       step: 'Etapa 1.2',
       description: 'Verificação Inversor vs Cargas Apparentes',
       formula: 'Inversor (VA) >= S_pico_efetivo (VA)',
       values: `Inv: ${s.equipment.inverterPower}VA vs Peak: ${((hasPriorityLoads && s.sizing.systemType === 'Híbrido' ? effectivePriorityPeakPowerVA : effectivePeakPowerVA)).toFixed(0)}VA`,
       result: s.equipment.inverterPower >= ((hasPriorityLoads && s.sizing.systemType === 'Híbrido' ? effectivePriorityPeakPowerVA : effectivePeakPowerVA)) ? 'OK' : 'ALERTA!'
    }] : []),
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
    },
    {
      step: 'Etapa 7',
      description: 'Arranjo de Strings (Inversor)',
      formula: 'Strings / MPPTs',
      values: `${numModules} Mod ÷ ${strings} Strings = ${modsPerString} Mod/String`,
      result: `${strings} Strings (em ${mpptCount} MPPTs)`
    },
    {
       step: 'Etapa 8',
       description: 'Corrente de Curto-Circuito por MPPT (Validação)',
       formula: 'Imp_MPPT = Strings_por_MPPT × Isc_Modulo <= Max_I_Inversor',
       norm: 'Limites do Fabricante',
       values: `I = ${stringsPerMppt} × ${s.equipment.moduleIsc}A = ${currentPerMppt.toFixed(2)}A (Max: ${s.equipment.inverterMaxI}A)`,
       result: currentPerMppt <= s.equipment.inverterMaxI ? 'OK' : 'ALERTA: Isc EXCEDE LIMITE!'
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
    recommendedInverterPowerW: s.equipment.inverterPower,
    
    // Losses Breakdown
    energyNominalDc,
    lossShadingKwh,
    lossSoilingKwh,
    lossMismatchKwh,
    lossTemperatureKwh,
    lossCablingKwh,
    lossInverterKwh,
    lossDegradationKwh,
    energyActualAc,

    vocMaxTemp, vmpMinTemp, stringVocMax, stringVmpMin, maxModulesPerString, minModulesPerString, strings, modsPerString,
    mpptCount, stringsPerMppt, currentPerMppt,
    iscArray, breakerCcA, breakerAcA, cableAcSect, cableDcSect, voltageDropDc, voltageDropAc, dpsCcV,
    
    reqAh, battSer, battPar, totalBatts, storageKwhBruto, storageKwhUtil, batteryBankMaxPowerW,
    
    capexTotal, lcoe, vpl, tir, payback, roi, yearlySavingsStart, economicData,
    
    calculationMemory
  };
}
