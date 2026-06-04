export interface AppState {
  project: {
    clientName: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    altitude: number;
    utility: string;
    tariffGroup: string;
    gridPhase: 'Monofásico' | 'Bifásico' | 'Trifásico';
    gridVoltage: number;
    contractedDemand: number;
  };
  climate: {
    hsp: number;
    avgTemp: number;
    minTemp: number;
    maxTemp: number;
  };
  consumption: {
    monthlyAvgKwh: number;
    dailyKwh: number;
  };
  equipment: {
    modulePower: number;
    moduleVoc: number;
    moduleVmp: number;
    moduleIsc: number;
    moduleImp: number;
    moduleTempCoeffVoc: number;
    moduleTempCoeffPmax: number;
    moduleEfficiency: number;
    moduleArea: number;
    moduleWeight: number;
    inverterPower: number;
    inverterMaxDcV: number;
    inverterMpptMinV: number;
    inverterMpptMaxV: number;
    inverterMaxI: number;
    inverterEfficiency: number;
    batteryTech: 'LiFePO4' | 'Lead-Acid' | 'AGM' | 'Gel';
    batteryVoltage: number;
    batteryCapacity: number;
    batteryDod: number;
    batteryCycles: number;
  };
  sizing: {
    systemType: 'On-Grid' | 'Off-Grid' | 'Híbrido';
    autonomyDays: number;
    oversizingFactor: number;
    maxDcAcRatio: number;
    losses: {
      shading: number;
      soiling: number;
      mismatch: number;
      cabling: number;
    };
    cableDistanceDc: number;
    cableDistanceAc: number;
  };
  finance: {
    capexPerWp: number;
    batteryCostPerUnit: number;
    opexYearly: number;
    energyTariff: number;
    tariffInflation: number;
    discountRate: number;
    analysisYears: number;
  };
}

export interface CalculationResults {
  // Energy
  dailyEnergyWh: number;
  monthlyEnergyKwh: number;
  annualEnergyKwh: number;
  
  // PV
  requiredPvPowerW: number;
  actualPvPowerW: number;
  numModules: number;
  totalArea: number;
  totalWeight: number;
  dcAcRatio: number;
  performanceRatio: number;
  specificYield: number;

  // Strings (Inverter limits)
  vocMaxTemp: number;
  vmpMinTemp: number;
  maxModulesPerString: number;
  minModulesPerString: number;
  strings: number;
  modsPerString: number;
  
  // Electrical / Protections
  iscArray: number;
  breakerCcA: number;
  breakerAcA: number;
  cableAcSect: number;
  cableDcSect: number;
  voltageDropDc: number;
  voltageDropAc: number;
  dpsCcV: number;

  // Storage
  reqAh: number;
  battSer: number;
  battPar: number;
  totalBatts: number;
  storageKwhBruto: number;
  storageKwhUtil: number;

  // Finance
  capexTotal: number;
  lcoe: number;
  vpl: number;
  tir: number;
  payback: number;
  roi: number;
  yearlySavingsStart: number;

  // Calculation Memory
  calculationMemory: Array<{
    step: string;
    description: string;
    formula: string;
    values: string;
    result: string;
    norm?: string;
  }>;
}

