import React, { useState, useMemo, useEffect } from 'react';
import { AppState } from './types';
import { runEngineeringCalculations } from './calculator';
import { ModularForms } from './components/FormBlocks';
import { ReportPanel } from './components/ReportPanel';
import { Sun, CheckSquare, Folder, Cloud, Zap, Database, Cpu, ShieldAlert, DollarSign, PieChart as ChartIcon, Moon } from 'lucide-react';

const defaultState: AppState = {
  project: {
    clientName: 'Demo Ltda', cep: '', street: '', number: '', neighborhood: '', city: 'Sao Paulo', state: 'SP', lat: -23.5505, lng: -46.6333, altitude: 760, utility: 'Enel', tariffGroup: 'B3', gridPhase: 'Trifásico', gridVoltage: 220, contractedDemand: 30
  },
  climate: {
    hsp: 4.5, avgTemp: 22, minTemp: 10, maxTemp: 35
  },
  consumption: {
    method: 'loadProfile',
    monthlyAvgKwh: 1200, dailyKwh: 40,
    loads: [
      { id: '1', name: 'Geladeira', qty: 1, powerW: 250, hoursPerDay: 24, daysPerMonth: 30 },
      { id: '2', name: 'Micro-ondas', qty: 1, powerW: 1200, hoursPerDay: 0.5, daysPerMonth: 30 },
      { id: '3', name: 'TV LED', qty: 2, powerW: 100, hoursPerDay: 6, daysPerMonth: 30 },
      { id: '4', name: 'Modem/Roteador', qty: 1, powerW: 15, hoursPerDay: 24, daysPerMonth: 30 }
    ]
  },
  equipment: {
    modulePower: 550, moduleVoc: 49.8, moduleVmp: 41.5, moduleIsc: 14.1, moduleImp: 13.2, moduleTempCoeffVoc: -0.27, moduleTempCoeffPmax: -0.34, moduleEfficiency: 21.3, moduleArea: 2.58, moduleWeight: 28.6,
    inverterPower: 8000, inverterMaxDcV: 1000, inverterMpptMinV: 160, inverterMpptMaxV: 850, inverterMpptCount: 2, inverterMaxI: 22, inverterEfficiency: 98.3,
    batteryTech: 'LiFePO4', batteryVoltage: 48, batteryCapacity: 100, batteryDod: 80, batteryCycles: 6000, batteryMaxDischargeA: 50
  },
  sizing: {
    systemType: 'Híbrido', autonomyDays: 1, simultaneityFactor: 0.8, cableDistanceDc: 20, cableDistanceAc: 10, oversizingFactor: 10, maxDcAcRatio: 1.20,
    losses: { shading: 2.0, soiling: 1.5, mismatch: 1.0, cabling: 1.5 }
  },
  finance: {
    capexPerWp: 3.50, batteryCostPerUnit: 4000, opexYearly: 500, energyTariff: 1.05, tariffInflation: 4.5, discountRate: 10.0, analysisYears: 25
  },
  backup: {
    enabled: false, frequency: 'manual', method: 'local'
  }
};

const MODULES = [
  { id: 'cadastro', label: 'Cadastro do Projeto', icon: Folder },
  { id: 'clima', label: 'Dados Climáticos', icon: Cloud },
  { id: 'consumo', label: 'Análise de Consumo', icon: Zap },
  { id: 'equipamentos', label: 'Base de Equip.', icon: Database },
  { id: 'sizing', label: 'Arquitetura / Sizing', icon: Cpu },
  { id: 'financeiro', label: 'Viabilidade Econôm.', icon: DollarSign },
  { id: 'relatorio', label: 'Dashboard & Reports', icon: ChartIcon },
];

export default function App() {
  const [state, setState] = useState<AppState>(defaultState);
  const [activeTab, setActiveTab] = useState('cadastro');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const updateState = (section: keyof AppState, field: string, value: any) => {
    setState(prev => {
      const next = { ...prev };
      (next[section] as any)[field] = value;
      return next;
    });
  };

  const results = useMemo(() => runEngineeringCalculations(state), [state]);

  useEffect(() => {
    if (!state.backup.enabled || state.backup.frequency === 'manual') return;
    
    // In a real scenario we'd use exactly 1 hr or 24 hrs. 
    // For safety in this environment let's calculate the correct ms.
    const intervalMs = state.backup.frequency === 'hourly' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const intervalId = setInterval(() => {
      if (state.backup.method === 'local') {
        localStorage.setItem('pvstudio_backup_auto', JSON.stringify(state));
        console.log('Automated local backup saved.');
      } else {
        // Automatically downloading files via interval without user interaction can be blocked by browsers,
        // but this shows the architectural intent.
        console.log('Automated download backup initiated.');
      }
    }, intervalMs);
    
    return () => clearInterval(intervalId);
  }, [state]);

  return (
    <div className={`min-h-screen bg-bg text-ink font-sans flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible ${isDarkMode ? 'dark' : ''}`}>
      
      {/* GLOBAL HEADER (Hidden in print) */}
      <header className="h-16 bg-white dark:bg-[#1A1A1A] border-b border-line flex items-center justify-between px-8 flex-shrink-0 print:hidden z-10 shadow-sm relative">
        <div className="flex items-center gap-3">
          <Sun className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-serif italic m-0 text-ink tracking-wide">
            PvStudio Pro <span className="font-sans font-bold text-xs uppercase bg-black dark:bg-[#333] text-white px-2 py-1 not-italic ml-2 tracking-widest rounded-sm">Enterprise</span>
          </h1>
        </div>
        <div className="flex gap-4 font-mono text-xs items-center">
          <div className="flex flex-col text-right hidden sm:flex">
             <span className="text-[#888]">Normativas em conformidade</span>
             <span className="text-solar-blue font-bold tracking-widest">NBR 16690 / 5410 / IEC</span>
          </div>
          <div className="h-6 w-px bg-line mx-2"></div>
          <div className="flex items-center gap-1 text-[#27AE60] bg-[#E8F8F5] dark:bg-[#1E3A2F] px-2 py-1 rounded">
             <CheckSquare className="w-4 h-4" />
             <span>Validador Ativo</span>
          </div>
          <div className="h-6 w-px bg-line mx-2"></div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#666] dark:text-gray-300"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <main className="flex-1 overflow-hidden flex print:flex-col relative">
        
        {/* SIDEBAR NAV */}
        <aside className="w-64 bg-[#EEECE6] dark:bg-[#121212] border-r border-line flex flex-col print:hidden">
          <div className="p-4 border-b border-line flex-shrink-0">
             <div className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-1">PROJETO ATUAL</div>
             <div className="text-sm font-bold truncate text-ink">{state.project.clientName}</div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            {MODULES.map(mod => (
              <button
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-xs uppercase tracking-wider font-bold transition-colors border-l-4 ${activeTab === mod.id ? 'bg-black/5 dark:bg-white/5 border-accent text-ink' : 'border-transparent text-[#666] dark:text-[#888] hover:text-ink hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <mod.icon className="w-4 h-4 opacity-70" />
                {mod.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* PANEL 1: FORMS (Only show if not report) */}
        {activeTab !== 'relatorio' ? (
          <section className="flex-1 overflow-y-auto p-8 2xl:p-12 print:hidden scroll-smooth relative">
            <div className="max-w-5xl">
              <header className="mb-8 border-b border-line pb-4">
                <h2 className="text-xl font-serif italic m-0 text-ink">{MODULES.find(m => m.id === activeTab)?.label}</h2>
              </header>
              <ModularForms state={state} update={updateState} currentTab={activeTab} />
            </div>
          </section>
        ) : (
           <div className="flex-1 overflow-y-auto relative bg-white dark:bg-[#1A1A1A]">
              <ReportPanel state={state} results={results} />
           </div>
        )}

      </main>

    </div>
  );
}
