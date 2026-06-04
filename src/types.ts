export interface LoadItem {
  id: string;
  name: string;
  qty: number;
  powerW: number;
  hoursPerDay: number;
  daysPerMonth: number;
}

export interface AppState {
  project: {
    clientName: string;
    cep?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
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
    method: 'manual' | 'loadProfile';
    monthlyAvgKwh: number;
    dailyKwh: number;
    loads: LoadItem[];
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
  backup: {
    enabled: boolean;
    frequency: 'manual' | 'hourly' | 'daily';
    method: 'local' | 'download';
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

  // Losses Breakdown
  energyNominalDc: number; // STC energy before losses
  lossShadingKwh: number;
  lossSoilingKwh: number;
  lossMismatchKwh: number;
  lossTemperatureKwh: number;
  lossCablingKwh: number;
  lossInverterKwh: number;
  lossDegradationKwh: number;
  energyActualAc: number; // Final AC energy

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
  economicData: Array<{ year: number; noSolarCumulative: number; solarCumulative: number; }>;

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

