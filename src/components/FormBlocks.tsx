import React from 'react';
import { AppState, CalculationResults } from '../types';
import { HelpCircle, MapPin } from 'lucide-react';
import { MapPicker } from './MapPicker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export const Block = ({ title, children }: any) => (
  <section className="mb-10">
    <span className="text-[10px] uppercase tracking-[0.1em] text-[#888] mb-4 block font-bold">{title}</span>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border-t border-l border-line bg-white dark:bg-[#1E1E1E]">
      {children}
    </div>
  </section>
);

export const Field = ({ label, children, unit, hint }: any) => (
  <div className="border-r border-b border-line p-4 flex flex-col justify-center relative focus-within:bg-[#FAFAF9] dark:focus-within:bg-[#252525] transition-colors group">
    <label className="text-[9px] uppercase tracking-widest text-[#666] mb-2 font-bold flex items-center gap-1">
      {label}
      {hint && (
        <div className="relative inline-flex items-center group/tooltip">
          <HelpCircle className="w-3 h-3 text-[#999] hover:text-[#333] dark:hover:text-[#CCC] transition-colors cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity bg-ink text-white text-[10px] p-2 rounded w-48 text-center z-50 normal-case font-normal shadow-lg">
            {hint}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-ink"></div>
          </div>
        </div>
      )}
    </label>
    <div className="flex items-center z-0 relative">
      {children}
      {unit && <span className="ml-2 text-xs font-mono text-[#888]">{unit}</span>}
    </div>
  </div>
);

export const Input = (props: any) => (
  <input {...props} className={"w-full bg-transparent border-b border-transparent hover:border-line focus:border-accent focus:ring-0 outline-none font-mono text-sm text-ink py-1 transition-colors " + props.className} />
);

export const Select = (props: any) => (
  <select {...props} className="w-full bg-transparent border-b border-transparent hover:border-line focus:border-accent outline-none font-mono text-sm text-ink py-1 transition-colors">
    {props.children}
  </select>
);

const MODULE_DATABASE = [
  { id: 'custom', name: 'Personalizado (Entrada Manual)' },
  { id: 'jinko_550', name: 'Jinko Solar Tiger Pro 545-555W', power: 550, voc: 49.9, vmp: 40.9, isc: 14.01, imp: 13.45, coeffVoc: -0.25, coeffPmax: -0.35, eff: 21.33, area: 2.58, weight: 28.9 },
  { id: 'jinko_575', name: 'JinkoSolar Tiger Neo N-type 575W', power: 575, voc: 51.27, vmp: 42.22, isc: 14.31, imp: 13.62, coeffVoc: -0.25, coeffPmax: -0.29, eff: 22.26, area: 2.58, weight: 28.0 },
  { id: 'longi_545', name: 'LONGI Hi-MO5 545W', power: 545, voc: 49.65, vmp: 41.8, isc: 13.92, imp: 13.04, coeffVoc: -0.26, coeffPmax: -0.34, eff: 21.1, area: 2.58, weight: 27.5 },
  { id: 'longi_580', name: 'LONGI Hi-MO6 Explorer 580W', power: 580, voc: 52.06, vmp: 43.91, isc: 14.14, imp: 13.21, coeffVoc: -0.23, coeffPmax: -0.29, eff: 22.5, area: 2.58, weight: 27.5 },
  { id: 'canadian_600', name: 'Canadian Solar HiKu7 600W', power: 600, voc: 41.3, vmp: 34.9, isc: 18.52, imp: 17.2, coeffVoc: -0.26, coeffPmax: -0.34, eff: 21.2, area: 2.83, weight: 31.0 },
  { id: 'canadian_650', name: 'Canadian Solar HiKu7 650W', power: 650, voc: 38.5, vmp: 32.2, isc: 21.46, imp: 20.19, coeffVoc: -0.26, coeffPmax: -0.34, eff: 20.9, area: 3.11, weight: 34.4 },
  { id: 'trina_550', name: 'Trina Vertex 550W', power: 550, voc: 37.9, vmp: 31.6, isc: 18.52, imp: 17.4, coeffVoc: -0.25, coeffPmax: -0.34, eff: 21.0, area: 2.62, weight: 28.6 },
  { id: 'trina_670', name: 'Trina Vertex 670W', power: 670, voc: 46.1, vmp: 38.2, isc: 18.62, imp: 17.55, coeffVoc: -0.25, coeffPmax: -0.34, eff: 21.6, area: 3.10, weight: 33.9 },
  { id: 'osda_550', name: 'OSDA Solar 550W', power: 550, voc: 50.0, vmp: 41.8, isc: 13.99, imp: 13.16, coeffVoc: -0.27, coeffPmax: -0.35, eff: 21.3, area: 2.58, weight: 28.6 },
  { id: 'jasolar_550', name: 'JA Solar DeepBlue 3.0 550W', power: 550, voc: 49.9, vmp: 41.96, isc: 14.00, imp: 13.11, coeffVoc: -0.27, coeffPmax: -0.35, eff: 21.3, area: 2.58, weight: 28.6 },
];

const INVERTER_DATABASE = [
  { id: 'auto', name: 'Dimensionamento Automático Pelo Sistema (Ideal)' },
  { id: 'custom', name: 'Personalizado (Entrada Manual)' },
  { id: 'deye_sun_5k', name: 'Deye 5kW SUN-5K-SG03LP1-EU', power: 5000, maxDcV: 500, mpptMinV: 150, mpptMaxV: 425, mpptCount: 2, maxI: 13, eff: 97.6 },
  { id: 'deye_sun_8k', name: 'Deye 8kW SUN-8K-SG01LP1-EU', power: 8000, maxDcV: 500, mpptMinV: 150, mpptMaxV: 425, mpptCount: 2, maxI: 26, eff: 97.6 },
  { id: 'deye_sun_12k', name: 'Deye 12kW SUN-12K-SG04LP3-EU', power: 12000, maxDcV: 800, mpptMinV: 200, mpptMaxV: 650, mpptCount: 2, maxI: 26, eff: 97.6 },
  { id: 'growatt_min5k', name: 'Growatt MIN 5000TL-X', power: 5000, maxDcV: 550, mpptMinV: 80, mpptMaxV: 500, mpptCount: 2, maxI: 13.5, eff: 98.4 },
  { id: 'growatt_mac60k', name: 'Growatt MAC 60KTL3-X LV', power: 60000, maxDcV: 1100, mpptMinV: 200, mpptMaxV: 1000, mpptCount: 3, maxI: 40, eff: 98.8 },
  { id: 'fronius_primo5', name: 'Fronius Primo 5.0-1', power: 5000, maxDcV: 1000, mpptMinV: 200, mpptMaxV: 800, mpptCount: 2, maxI: 12, eff: 98.1 },
  { id: 'fronius_symo15', name: 'Fronius Symo 15.0-3-M', power: 15000, maxDcV: 1000, mpptMinV: 320, mpptMaxV: 800, mpptCount: 2, maxI: 27, eff: 98.1 },
  { id: 'sungrow_rs5', name: 'Sungrow SG5.0RS', power: 5000, maxDcV: 600, mpptMinV: 40, mpptMaxV: 560, mpptCount: 2, maxI: 16, eff: 97.9 },
  { id: 'sungrow_cx33', name: 'Sungrow SG33CX', power: 33000, maxDcV: 1100, mpptMinV: 200, mpptMaxV: 1000, mpptCount: 3, maxI: 26, eff: 98.6 },
  { id: 'huawei_sun5k', name: 'Huawei SUN2000-5KTL-L1', power: 5000, maxDcV: 600, mpptMinV: 90, mpptMaxV: 560, mpptCount: 2, maxI: 12.5, eff: 98.4 },
  { id: 'huawei_sun30k', name: 'Huawei SUN2000-30KTL-M3', power: 30000, maxDcV: 1100, mpptMinV: 200, mpptMaxV: 1000, mpptCount: 4, maxI: 26, eff: 98.7 },
  { id: 'solis_5k', name: 'Solis 5K-2G', power: 5000, maxDcV: 600, mpptMinV: 90, mpptMaxV: 520, mpptCount: 2, maxI: 11, eff: 97.8 },
];

export function ModularForms({ state, update, currentTab, results }: { state: AppState, update: Function, currentTab: string, results?: CalculationResults }) {
  const updater = (sec: keyof AppState, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    update(sec, field, val);
  };

  const [isLocating, setIsLocating] = React.useState(false);
  const [isFetchingClimate, setIsFetchingClimate] = React.useState(false);
  const [selectedModuleId, setSelectedModuleId] = React.useState('custom');
  const [selectedInverterId, setSelectedInverterId] = React.useState('auto');

  const onModuleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedModuleId(id);
    if (id !== 'custom') {
      const sp = MODULE_DATABASE.find(m => m.id === id);
      if (sp) {
        update('equipment', 'modulePower', sp.power);
        update('equipment', 'moduleVoc', sp.voc);
        update('equipment', 'moduleVmp', sp.vmp);
        update('equipment', 'moduleIsc', sp.isc);
        update('equipment', 'moduleImp', sp.imp);
        update('equipment', 'moduleTempCoeffVoc', sp.coeffVoc);
        update('equipment', 'moduleTempCoeffPmax', sp.coeffPmax);
        update('equipment', 'moduleEfficiency', sp.eff);
        update('equipment', 'moduleArea', sp.area);
        update('equipment', 'moduleWeight', sp.weight);
      }
    }
  };

  const onInverterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedInverterId(id);
    if (id === 'auto') {
      update('equipment', 'inverterMode', 'auto');
    } else {
      update('equipment', 'inverterMode', 'manual');
      if (id !== 'custom') {
        const inv = INVERTER_DATABASE.find(i => i.id === id);
        if (inv) {
          update('equipment', 'inverterPower', inv.power);
          update('equipment', 'inverterMaxDcV', inv.maxDcV);
          update('equipment', 'inverterMpptMinV', inv.mpptMinV);
          update('equipment', 'inverterMpptMaxV', inv.mpptMaxV);
          update('equipment', 'inverterMpptCount', inv.mpptCount);
          update('equipment', 'inverterMaxI', inv.maxI);
          update('equipment', 'inverterEfficiency', inv.eff);
        }
      }
    }
  };

  const fetchCep = async () => {
    const cep = state.project.cep?.replace(/\D/g, '');
    if (cep && cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          update('project', 'street', data.logradouro);
          update('project', 'neighborhood', data.bairro);
          update('project', 'city', data.localidade);
          update('project', 'state', data.uf);
          // Try to geocode automatically with available data
          geocodeAddress(`${data.logradouro}, ${data.localidade}, ${data.uf}, Brazil`);
        }
      } catch (e) {
        console.error('Erro ao buscar CEP', e);
       }
    }
  };

  const fetchClimateData = async (lat: number, lng: number) => {
    setIsFetchingClimate(true);
    try {
      // Historical climate API from Open-Meteo for the past year to get average radiation and temperatures
      const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2023-01-01&end_date=2023-12-31&daily=shortwave_radiation_sum,temperature_2m_mean,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`);
      const data = await res.json();
      
      if (data && data.daily) {
        const sw = data.daily.shortwave_radiation_sum.filter((v: number) => v !== null);
        const tmean = data.daily.temperature_2m_mean.filter((v: number) => v !== null);
        const tmax = data.daily.temperature_2m_max.filter((v: number) => v !== null);
        const tmin = data.daily.temperature_2m_min.filter((v: number) => v !== null);

        if (sw.length > 0) {
          const avgSw = sw.reduce((a: number,b: number) => a+b, 0) / sw.length;
          update('climate', 'hsp', Number((avgSw * 0.277778).toFixed(2))); // convert MJ/m² to kWh/m² (HSP)
          
          if (data.daily.time) {
            const monthlySums: number[] = new Array(12).fill(0);
            const monthlyCounts: number[] = new Array(12).fill(0);
            data.daily.time.forEach((dateStr: string, idx: number) => {
               if (data.daily.shortwave_radiation_sum[idx] !== null) {
                  const month = parseInt(dateStr.split('-')[1], 10) - 1;
                  monthlySums[month] += data.daily.shortwave_radiation_sum[idx];
                  monthlyCounts[month]++;
               }
            });
            const monthlyHsp = monthlySums.map((sum, i) => {
               const avg = monthlyCounts[i] > 0 ? sum / monthlyCounts[i] : 0;
               return Number((avg * 0.277778).toFixed(2));
            });
            update('climate', 'monthlyHsp', monthlyHsp);
          }

          update('climate', 'avgTemp', Number((tmean.reduce((a: number,b: number) => a+b, 0) / tmean.length).toFixed(1)));
          update('climate', 'minTemp', Number(Math.min(...tmin).toFixed(1)));
          update('climate', 'maxTemp', Number(Math.max(...tmax).toFixed(1)));
        }
      }
      
      // Also grab altitude
      const altRes = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
      const altData = await altRes.json();
      if (altData && altData.elevation && altData.elevation.length > 0) {
        update('project', 'altitude', Math.round(altData.elevation[0]));
      }

    } catch(e) {
      console.error("Erro ao buscar dados climáticos", e);
    } finally {
      setIsFetchingClimate(false);
    }
  };

  const geocodeAddress = async (addressQuery?: string) => {
    setIsLocating(true);
    const query = addressQuery || `${state.project.street || ''} ${state.project.number || ''}, ${state.project.neighborhood || ''}, ${state.project.city || ''}, ${state.project.state || ''}, Brazil`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        update('project', 'lat', lat);
        update('project', 'lng', lng);
        await fetchClimateData(lat, lng);
      }
    } catch (e) {
      console.error('Erro ao geocodificar', e);
    } finally {
      setIsLocating(false);
    }
  };

  if (currentTab === 'cadastro') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Informações Gerais do Projeto">
          <Field label="Nome do Cliente"><Input type="text" value={state.project.clientName} onChange={updater('project','clientName')} /></Field>
          <Field label="CEP"><Input type="text" value={state.project.cep || ''} onChange={updater('project','cep')} onBlur={fetchCep} placeholder="00000-000" /></Field>
          <Field label="Rua / Logradouro"><Input type="text" value={state.project.street || ''} onChange={updater('project','street')} onBlur={() => geocodeAddress()} /></Field>
          <Field label="Número"><Input type="text" value={state.project.number || ''} onChange={updater('project','number')} onBlur={() => geocodeAddress()} /></Field>
          <Field label="Bairro"><Input type="text" value={state.project.neighborhood || ''} onChange={updater('project','neighborhood')} onBlur={() => geocodeAddress()} /></Field>
          <Field label="Cidade"><Input type="text" value={state.project.city} onChange={updater('project','city')} onBlur={() => geocodeAddress()} /></Field>
          <Field label="Estado"><Input type="text" value={state.project.state} onChange={updater('project','state')} onBlur={() => geocodeAddress()} /></Field>
          <div className="border-r border-b border-line p-4 flex flex-col justify-center relative focus-within:bg-[#FAFAF9] dark:focus-within:bg-[#252525] transition-colors col-span-1 md:col-span-2 xl:col-span-3">
             <div className="flex items-center gap-4">
                <button onClick={() => geocodeAddress()} disabled={isLocating} className="bg-solar-blue text-white px-4 py-2 text-xs font-bold rounded cursor-pointer hover:bg-blue-600 disabled:opacity-50">
                  {isLocating ? 'Buscando Coordenadas...' : 'Atualizar Coordenadas via Endereço'}
                </button>
             </div>
          </div>
          <Field label="Latitude"><Input type="number" step="0.0001" value={state.project.lat} onChange={updater('project','lat')} /></Field>
          <Field label="Longitude"><Input type="number" step="0.0001" value={state.project.lng} onChange={updater('project','lng')} /></Field>
          <Field label="Altitude" unit="m"><Input type="number" value={state.project.altitude} onChange={updater('project','altitude')} /></Field>
        </Block>
        
        <Block title="Seleção de Localização no Mapa">
           <div className="col-span-1 md:col-span-2 xl:col-span-3 p-4 relative">
              <div className="flex items-center gap-2 mb-4 text-[#C0392B] font-bold text-xs uppercase">
                 <MapPin className="w-4 h-4" /> Selecione o local exato
              </div>
              <MapPicker lat={state.project.lat} lng={state.project.lng} onChange={(lat, lng) => {
                 update('project', 'lat', lat);
                 update('project', 'lng', lng);
                 fetchClimateData(lat, lng);
              }} />
              {isFetchingClimate && <div className="absolute inset-0 bg-white/80 dark:bg-[#121212]/80 flex items-center justify-center font-bold text-sm text-[#C0392B] z-10 backdrop-blur-sm">Buscando dados climáticos da região...</div>}
           </div>
        </Block>
        <Block title="Rede Elétrica e Concessionária">
          <Field label="Distribuidora (Concessionária)"><Input type="text" value={state.project.utility} onChange={updater('project','utility')} /></Field>
          <Field label="Grupo Tarifário">
            <Select value={state.project.tariffGroup} onChange={updater('project','tariffGroup')}>
              <option>B1 (Residencial)</option>
              <option>B2 (Rural)</option>
              <option>B3 (Comercial)</option>
              <option>A4/A3 (Média Tensão)</option>
            </Select>
          </Field>
          <Field label="Topologia da Rede">
            <Select value={state.project.gridPhase} onChange={updater('project','gridPhase')}>
              <option>Monofásico</option>
              <option>Bifásico</option>
              <option>Trifásico</option>
            </Select>
          </Field>
          <Field label="Tensão da Rede (CA)" unit="V"><Input type="number" value={state.project.gridVoltage} onChange={updater('project','gridVoltage')} /></Field>
          <Field label="Demanda Contratada" unit="kW"><Input type="number" value={state.project.contractedDemand} onChange={updater('project','contractedDemand')} /></Field>
        </Block>
      </div>
    );
  }

  if (currentTab === 'clima') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Captura Automática de Dados Solares (CRECESB / INMET)">
           <div className="col-span-1 md:col-span-2 xl:col-span-3 p-4 relative bg-[#FAFAF9] dark:bg-[#1A1A1A] border-b border-line">
              <div className="flex items-center gap-2 mb-4 text-[#C0392B] font-bold text-xs uppercase">
                 <MapPin className="w-4 h-4" /> Selecione as Coordenadas para Sincronizar o HSP (Substitui entrada manual)
              </div>
              <MapPicker lat={state.project.lat} lng={state.project.lng} onChange={(lat, lng) => {
                 update('project', 'lat', lat);
                 update('project', 'lng', lng);
                 fetchClimateData(lat, lng);
              }} />
              {isFetchingClimate && <div className="absolute inset-0 bg-white/80 dark:bg-[#121212]/80 flex items-center justify-center font-bold text-sm text-[#C0392B] z-10 backdrop-blur-sm">Sincronizando banco de dados solar...</div>}
           </div>
        </Block>

        <Block title="Potencial Solar Meteorológico (GHI/DNI)">
          <Field label="Irradiação Média (HSP / CRECESB)" hint="Valor obtido automaticamente pelas coordenadas geográficas." unit="kWh/m²/dia"><Input type="number" readOnly className="opacity-60 bg-transparent" value={state.climate.hsp} /></Field>
          <Field label="Temperatura Média Anual" unit="°C"><Input type="number" readOnly className="opacity-60 bg-transparent" value={state.climate.avgTemp} /></Field>
          <Field label="Temperátura Mínima Extrema" unit="°C"><Input type="number" readOnly className="opacity-60 bg-transparent" value={state.climate.minTemp} /></Field>
          <Field label="Temperatura Máxima Extrema" unit="°C"><Input type="number" readOnly className="opacity-60 bg-transparent" value={state.climate.maxTemp} /></Field>
        </Block>
        
        {state.climate.monthlyHsp && state.climate.monthlyHsp.length === 12 && (
           <div className="mt-6 border border-line bg-white dark:bg-[#1E1E1E] p-4 text-center">
              <h3 className="text-[10px] uppercase tracking-widest text-[#666] font-bold mb-4">Sazonalidade da Irradiação Solar (HSP)</h3>
              <div className="w-full h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => ({ month: m, hsp: state.climate.monthlyHsp![i] }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                       <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}`} />
                       <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(2)} kWh/m²/dia`, 'HSP']}
                          contentStyle={{ fontSize: '12px', fontFamily: 'monospace' }} 
                       />
                       <Bar dataKey="hsp" fill="#F39C12" radius={[2, 2, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        )}
        
        <div className="text-[10px] text-[#888] font-mono mt-4 p-4 border border-line border-dashed text-center">Os dados de Radiação Solar (GHI) são sincronizados via modelagem climática equivalente às fontes oficiais (INPE/CRECESB) a partir da geolocalização.</div>
      </div>
    );
  }

  if (currentTab === 'consumo') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Metodologia de Consumo">
          <Field label="Método de Dimensionamento">
             <Select value={state.consumption.method} onChange={updater('consumption','method')}>
               <option value="manual">Entrada Manual (Fatura)</option>
               <option value="loadProfile">Levantamento de Cargas (Quadro)</option>
             </Select>
          </Field>
        </Block>
        
        {state.consumption.method === 'manual' ? (
          <Block title="Análise de Faturamento Manual">
            <Field label="Consumo Mensal Médio" unit="kWh/mês"><Input type="number" value={state.consumption.monthlyAvgKwh} onChange={updater('consumption','monthlyAvgKwh')} /></Field>
            <Field label="Consumo Diário Base" unit="kWh/dia"><Input type="number" step="0.1" value={state.consumption.dailyKwh} onChange={updater('consumption','dailyKwh')} /></Field>
          </Block>
        ) : (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#888] font-bold">Levantamento de Carga</span>
              <button 
                onClick={() => {
                  const newLoad = { id: Date.now().toString(), name: 'Nova Carga', qty: 1, powerW: 100, hoursPerDay: 1, daysPerMonth: 30, startHour: 18 };
                  update('consumption', 'loads', [...(state.consumption.loads || []), newLoad]);
                }}
                className="bg-accent text-white px-3 py-1 text-xs font-bold rounded cursor-pointer hover:bg-[#B34500]"
              >
                + Adicionar Carga
              </button>
            </div>
            
            <div className="border border-line bg-white dark:bg-[#1E1E1E] overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-[#FAFAF9] dark:bg-[#2A2A2A] text-[#666] dark:text-[#888] border-b border-line uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-normal">Equipamento</th>
                    <th className="p-3 font-normal w-16 text-center" title="Prioridade (p/ Híbrido/Off-Grid)">Prio.</th>
                    <th className="p-3 font-normal w-24">Quant.</th>
                    <th className="p-3 font-normal w-32">Potência (W)</th>
                    <th className="p-3 font-normal w-24">FP</th>
                    <th className="p-3 font-normal w-24">Hora Início</th>
                    <th className="p-3 font-normal w-28">Horas/Dia</th>
                    <th className="p-3 font-normal w-28">Dias/Mês</th>
                    <th className="p-3 font-normal w-32">Energia (kWh/mês)</th>
                    <th className="p-3 font-normal w-12 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(state.consumption.loads || []).map((load: any, index: number) => {
                    const kwhMonth = (load.qty * load.powerW * load.hoursPerDay * load.daysPerMonth) / 1000;
                    
                    const updateLoad = (field: string, val: any) => {
                       const newLoads = [...state.consumption.loads];
                       newLoads[index] = { ...load, [field]: val };
                       update('consumption', 'loads', newLoads);
                    };

                    return (
                      <tr key={load.id} className="border-b border-line last:border-0 hover:bg-[#F9F9F7] dark:hover:bg-[#2A2A2A]">
                        <td className="p-2"><Input value={load.name} onChange={(e: any) => updateLoad('name', e.target.value)} /></td>
                        <td className="p-2 text-center"><input type="checkbox" checked={load.isPriority || false} onChange={(e: any) => updateLoad('isPriority', e.target.checked)} className="cursor-pointer" /></td>
                        <td className="p-2"><Input type="number" min="1" value={load.qty} onChange={(e: any) => updateLoad('qty', Number(e.target.value))} /></td>
                        <td className="p-2"><Input type="number" step="1" value={load.powerW} onChange={(e: any) => updateLoad('powerW', Number(e.target.value))} /></td>
                        <td className="p-2"><Input type="number" step="0.05" min="0.1" max="1" value={load.powerFactor || 1} onChange={(e: any) => updateLoad('powerFactor', Number(e.target.value))} /></td>
                        <td className="p-2"><Input type="number" min="0" max="23" value={load.startHour ?? 18} onChange={(e: any) => updateLoad('startHour', Number(e.target.value))} /></td>
                        <td className="p-2"><Input type="number" step="0.1" value={load.hoursPerDay} onChange={(e: any) => updateLoad('hoursPerDay', Number(e.target.value))} /></td>
                        <td className="p-2"><Input type="number" min="1" max="31" value={load.daysPerMonth} onChange={(e: any) => updateLoad('daysPerMonth', Number(e.target.value))} /></td>
                        <td className="p-3 text-[#27AE60] font-bold">{kwhMonth.toFixed(1)}</td>
                        <td className="p-2 text-center">
                           <button onClick={() => {
                              const newLoads = state.consumption.loads.filter((_, i) => i !== index);
                              update('consumption', 'loads', newLoads);
                           }} className="text-[#E74C3C] hover:text-[#C0392B] pb-1 px-2 text-lg">×</button>
                        </td>
                      </tr>
                    );
                  })}
                  {(state.consumption.loads || []).length === 0 && (
                    <tr><td colSpan={10} className="p-6 text-center text-[#888]">Nenhuma carga cadastrada. Adicione equipamentos.</td></tr>
                  )}
                </tbody>
              </table>
              <div className="p-4 border-t border-line bg-[#FAFAF9] dark:bg-[#1A1A1A] text-right font-bold text-sm">
                Total Estimado: <span className="text-solar-blue ml-2">
                  {((state.consumption.loads || []).reduce((acc: number, load: any) => acc + ((load.qty * load.powerW * load.hoursPerDay * load.daysPerMonth) / 1000), 0)).toFixed(1)} kWh/mês
                </span>
              </div>
            </div>
            
            {(() => {
              const priorityPower = (state.consumption.loads || []).filter((l: any) => l.isPriority).reduce((acc: number, l: any) => acc + (l.powerW * l.qty), 0);
              const maxInvPower = state.equipment.inverterPower || 0;
              if (priorityPower > maxInvPower) {
                return (
                  <div className="mt-4 p-4 border border-[#E74C3C] bg-[#FDEDEC] dark:bg-[#2A1111] text-[#C0392B] rounded shadow-sm text-xs font-bold flex items-start">
                    <svg className="w-4 h-4 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <span>Lembrete: A potência somada das cargas prioritárias ({priorityPower}W) excede a capacidade nominal do inversor ({maxInvPower}W). Ajuste o inversor ou reveja as cargas para evitar desarme.</span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Daily Load Profile Chart */}
            {(state.consumption.loads || []).length > 0 && (() => {
               const profile = Array.from({ length: 24 }).map((_, i) => ({ hour: `${i}h`, kw: 0 }));
               (state.consumption.loads || []).forEach((load: any) => {
                 const kW = (load.qty * load.powerW) / 1000;
                 const start = load.startHour ?? 18;
                 const duration = Math.ceil(load.hoursPerDay);
                 if (duration > 0) {
                   for (let d = 0; d < duration; d++) {
                     const h = (start + d) % 24;
                     profile[h].kw += kW;
                   }
                 }
               });
               
               return (
                 <div className="mt-6 border border-line bg-white dark:bg-[#1E1E1E] p-4">
                   <h3 className="text-[10px] uppercase tracking-widest text-[#666] font-bold mb-4 text-center">Perfil de Carga Diário (Pico de Demanda)</h3>
                   <div className="w-full h-[250px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={profile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                         <XAxis dataKey="hour" fontSize={10} axisLine={false} tickLine={false} />
                         <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} kW`} />
                         <Tooltip 
                           formatter={(value: number) => [`${value.toFixed(2)} kW`, 'Demanda']}
                           contentStyle={{ fontSize: '12px', fontFamily: 'monospace' }} 
                         />
                         <Bar dataKey="kw" fill="#E74C3C" radius={[2, 2, 0, 0]} />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               );
            })()}
          </section>
        )}
      </div>
    );
  }

  if (currentTab === 'equipamentos') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Módulos Fotovoltaicos (Specs PAN)">
          <div className="mb-4 p-4 border-b border-line bg-[#FAFAF9] dark:bg-[#1A1A1A]">
            <label className="block text-[10px] uppercase font-bold text-[#666] tracking-widest mb-2">Base de Dados de Módulos</label>
            <Select value={selectedModuleId} onChange={onModuleSelect}>
              {MODULE_DATABASE.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
          <Field label="Potência Pmax" unit="W" hint="Potência nominal máxima do módulo sob STC (1000W/m², 25°C). Define a base de potência do arranjo."><Input type="number" value={state.equipment.modulePower} onChange={updater('equipment','modulePower')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Voc" unit="V" hint="Tensão de Circuito Aberto. Crucial para avaliar qual será a tensão máxima da string para não estourar o inversor no frio."><Input type="number" step="0.01" value={state.equipment.moduleVoc} onChange={updater('equipment','moduleVoc')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Vmp" unit="V"><Input type="number" step="0.01" value={state.equipment.moduleVmp} onChange={updater('equipment','moduleVmp')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Isc" unit="A" hint="Corrente de Curto Circuito. Fundamental para o dimensionamento dos disjuntores e cabos do lado de Corrente Contínua."><Input type="number" step="0.01" value={state.equipment.moduleIsc} onChange={updater('equipment','moduleIsc')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Imp" unit="A"><Input type="number" step="0.01" value={state.equipment.moduleImp} onChange={updater('equipment','moduleImp')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Coef. Temp. Voc" unit="%/°C" hint="Fator multiplicador do aumento da tensão quando a célula exposta a temperaturas frias (abaixo de 25°C)."><Input type="number" step="0.001" value={state.equipment.moduleTempCoeffVoc} onChange={updater('equipment','moduleTempCoeffVoc')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Coef. Temp. Pmax" unit="%/°C" hint="Medida percentual de perda térmica na potência fotovoltaica, quando acima dos limites da Condição Standard."><Input type="number" step="0.001" value={state.equipment.moduleTempCoeffPmax} onChange={updater('equipment','moduleTempCoeffPmax')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Eficiência Módulo" unit="%"><Input type="number" step="0.1" value={state.equipment.moduleEfficiency} onChange={updater('equipment','moduleEfficiency')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Área do Módulo" unit="m²"><Input type="number" step="0.01" value={state.equipment.moduleArea} onChange={updater('equipment','moduleArea')} disabled={selectedModuleId !== 'custom'} /></Field>
          <Field label="Peso do Módulo" unit="kg"><Input type="number" step="0.1" value={state.equipment.moduleWeight} onChange={updater('equipment','moduleWeight')} disabled={selectedModuleId !== 'custom'} /></Field>
        </Block>
        <Block title="Inversor de Frequência (OND)">
          <div className="mb-4 p-4 border-b border-line bg-[#FAFAF9] dark:bg-[#1A1A1A]">
            <label className="block text-[10px] uppercase font-bold text-[#666] tracking-widest mb-2">Base de Dados de Inversores</label>
            <Select value={selectedInverterId} onChange={onInverterSelect}>
              {INVERTER_DATABASE.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
          {(() => {
             const priorityPower = (state.consumption?.loads || []).filter((l: any) => l.isPriority).reduce((acc: number, l: any) => acc + (l.powerW * l.qty), 0);
             const maxInvPower = results?.recommendedInverterPowerW || state.equipment.inverterPower || 0;
             if (priorityPower > maxInvPower) {
                return (
                   <div className="mb-6 p-4 border-l-4 border-[#E74C3C] bg-[#FDEDEC] dark:bg-[#2A1111] text-[#C0392B] rounded-r shadow-sm text-xs font-bold font-mono">
                      Atenção: A soma das cargas prioritárias ({priorityPower}W) excede o Inversor Automático ({maxInvPower}W). Risco de sobrecarga ou desarme.
                   </div>
                );
             }
             return null;
          })()}
          <Field label="Potência Nominal CA" unit="W" hint={selectedInverterId === 'auto' ? "Potência do Inversor (Sugerida pelo dimensionamento)" : "Potência efetiva que converte a energia"}><Input type="number" readOnly={selectedInverterId === 'auto'} value={selectedInverterId === 'auto' ? results?.recommendedInverterPowerW || state.equipment.inverterPower : state.equipment.inverterPower} onChange={updater('equipment','inverterPower')} className={selectedInverterId === 'auto' ? "opacity-50" : ""} disabled={selectedInverterId !== 'custom' && selectedInverterId !== 'auto'} /></Field>
          <Field label="Máxima Tensão CC (Entrada)" unit="V" hint="Tensão máxima absoluta."><Input type="number" value={state.equipment.inverterMaxDcV} onChange={updater('equipment','inverterMaxDcV')} disabled={selectedInverterId !== 'custom'} /></Field>
          <Field label="MPPT Voltagem Mínima" unit="V" hint="Tensão de base para garantir a captura das cadeias sob baixa luminosidade/nublado."><Input type="number" value={state.equipment.inverterMpptMinV} onChange={updater('equipment','inverterMpptMinV')} disabled={selectedInverterId !== 'custom'} /></Field>
          <Field label="MPPT Voltagem Máxima" unit="V" hint="Limite operacional no qual ocorre tracking eficaz com rendimento Euro (pico da parabólica de rendimento)."><Input type="number" value={state.equipment.inverterMpptMaxV} onChange={updater('equipment','inverterMpptMaxV')} disabled={selectedInverterId !== 'custom'} /></Field>
          <Field label="Quant. de MPPTs" unit="un." hint="Número de rastreadores de máxima potência independentes disponíveis no inversor."><Input type="number" min="1" value={state.equipment.inverterMpptCount || 1} onChange={updater('equipment','inverterMpptCount')} disabled={selectedInverterId !== 'custom'} /></Field>
          <Field label="Corrente Máx. por MPPT" unit="A" hint="Limite de corrente de curto-circuito (Isc) ou operação (Imp) suportado por cada entrada MPPT do inversor."><Input type="number" value={state.equipment.inverterMaxI} onChange={updater('equipment','inverterMaxI')} disabled={selectedInverterId !== 'custom'} /></Field>
          <Field label="Eficiência Euro" unit="%" hint="Eficiência Europeia média ponderada nos estágios de carga e tensão intermédias."><Input type="number" step="0.1" value={state.equipment.inverterEfficiency} onChange={updater('equipment','inverterEfficiency')} disabled={selectedInverterId !== 'custom'} /></Field>
        </Block>
        <Block title="Bateria (BESS)">
          <Field label="Química Celular">
            <Select value={state.equipment.batteryTech} onChange={updater('equipment','batteryTech')}>
              <option>LiFePO4</option>
              <option>Lead-Acid</option>
              <option>Gel</option>
            </Select>
          </Field>
          <Field label="Voltagem Nominal" unit="V"><Input type="number" value={state.equipment.batteryVoltage} onChange={updater('equipment','batteryVoltage')} /></Field>
          <Field label="Capacidade Nominal" unit="Ah"><Input type="number" value={state.equipment.batteryCapacity} onChange={updater('equipment','batteryCapacity')} /></Field>
          <Field label="Corrente Máx. Descarga" unit="A" hint="Limite técnico de descarga da bateria (ex: BMS Limit ou C-rate). Relevante para potência de pico híbrida."><Input type="number" value={state.equipment.batteryMaxDischargeA || 50} onChange={updater('equipment','batteryMaxDischargeA')} /></Field>
          <Field label="DoD (Profundidade Max)" unit="%" hint="Depth of Discharge: Nível tolerável de uso percentual diário para garantir a expectativa de vida (ciclos vitais) do acumulador. (ex. 80 para Lítio, 50 para Chumbo)."><Input type="number" value={state.equipment.batteryDod} onChange={updater('equipment','batteryDod')} /></Field>
          <Field label="Ciclos Vitais" unit="ciclos"><Input type="number" value={state.equipment.batteryCycles} onChange={updater('equipment','batteryCycles')} /></Field>
        </Block>
      </div>
    );
  }

  if (currentTab === 'sizing' || currentTab === 'baterias' || currentTab === 'protecoes') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Diretrizes do Sistema (Configurações de Dimensionamento)">
          <Field label="Tipo de Arquitetura">
            <Select value={state.sizing.systemType} onChange={updater('sizing','systemType')}>
              <option>On-Grid</option>
              <option>Off-Grid</option>
              <option>Híbrido</option>
            </Select>
          </Field>
          <Field label="Autonomia Desejada (Off/Híbr." unit="Dias" hint="Quantidade de dias que o banco de baterias deve sustentar as cargas sem sol (Duração da Autonomia)."><Input type="number" step="0.5" value={state.sizing.autonomyDays} onChange={updater('sizing','autonomyDays')} /></Field>
          <Field label="Fato de Simultaneidade" unit="" hint="Parcela das cargas prioritárias que funcionará ao mesmo tempo (0.1 a 1.0). Fundamental para não sobrecarregar inversor/bateria."><Input type="number" step="0.1" min="0.1" max="1.0" value={state.sizing.simultaneityFactor || 0.8} onChange={updater('sizing','simultaneityFactor')} /></Field>
          <Field label="Oversize (Margem)" unit="%" hint="Margem adicional de potência CC acrescida para lidar com degradação secular e crescimento de consumo.">
            <Select value={state.sizing.oversizingFactor} onChange={updater('sizing','oversizingFactor')}>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
            </Select>
          </Field>
          <Field label="Relação CC/CA Máx" unit="" hint="Oversizing Factor (Overload Ratio). Expressa o quanto a potência de pico dos painéis supera o nível nominal do inversor (1.1x ~ 1.35x recomendado).">
            <Select value={state.sizing.maxDcAcRatio} onChange={updater('sizing','maxDcAcRatio')}>
              <option value="0.80">0.80</option>
              <option value="1.00">1.00</option>
              <option value="1.20">1.20</option>
              <option value="1.30">1.30</option>
              <option value="1.50">1.50</option>
            </Select>
          </Field>
          <Field label="Distância Cabos CC (Arranjo)" unit="m"><Input type="number" value={state.sizing.cableDistanceDc} onChange={updater('sizing','cableDistanceDc')} /></Field>
          <Field label="Distância Cabos CA (Quadro)" unit="m"><Input type="number" value={state.sizing.cableDistanceAc} onChange={updater('sizing','cableDistanceAc')} /></Field>
        </Block>
        <Block title="Mapeamento de Perdas (Yield Factors)">
          <Field label="Sombreamento e Horizonte" unit="%" hint="Perdas por obstruções físicas como prédios ou árvores que interceptam a trajetória solar no local."><Input type="number" step="0.1" value={state.sizing.losses.shading} onChange={(e: any) => update('sizing', 'losses', {...state.sizing.losses, shading: Number(e.target.value)})} /></Field>
          <Field label="Sujidade (Soiling)" unit="%" hint="Camada de poeira, pólen, neve ou detritos sobre a superfície de vidro do painel que reduz captação."><Input type="number" step="0.1" value={state.sizing.losses.soiling} onChange={(e: any) => update('sizing', 'losses', {...state.sizing.losses, soiling: Number(e.target.value)})} /></Field>
          <Field label="Mismatch (Diodos/Degrad.)" unit="%" hint="Perdas por variações sutis no rendimento elétrico entre diferentes painéis na mesma string."><Input type="number" step="0.1" value={state.sizing.losses.mismatch} onChange={(e: any) => update('sizing', 'losses', {...state.sizing.losses, mismatch: Number(e.target.value)})} /></Field>
          <Field label="Perdas Resistivas Cabos" unit="%"><Input type="number" step="0.1" value={state.sizing.losses.cabling} onChange={(e: any) => update('sizing', 'losses', {...state.sizing.losses, cabling: Number(e.target.value)})} /></Field>
        </Block>
        <Block title="Redundância e Backup de Dados do Projeto">
          <Field label="Backup Automático">
            <Select value={state.backup.enabled ? 'true' : 'false'} onChange={(e: any) => update('backup', 'enabled', e.target.value === 'true')}>
              <option value="false">Desativado</option>
              <option value="true">Ativado</option>
            </Select>
          </Field>
          <Field label="Cronograma de Salvos">
            <Select value={state.backup.frequency} onChange={(e: any) => update('backup', 'frequency', e.target.value)} disabled={!state.backup.enabled}>
              <option value="manual">Apenas Manual</option>
              <option value="hourly">A cada hora</option>
              <option value="daily">Diário</option>
            </Select>
          </Field>
          <Field label="Destino da Configuração">
            <Select value={state.backup.method} onChange={(e: any) => update('backup', 'method', e.target.value)} disabled={!state.backup.enabled}>
              <option value="local">Base de Dados Local</option>
              <option value="download">Download (JSON)</option>
            </Select>
          </Field>
        </Block>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              if (state.backup.method === 'download') {
                const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
                const anchor = document.createElement('a');
                anchor.setAttribute("href", data);
                anchor.setAttribute("download", "pvstudio_backup.json");
                anchor.click();
              } else {
                localStorage.setItem('pvstudio_backup', JSON.stringify(state));
                alert('Backup salvo localmente com sucesso!');
              }
            }}
            className="bg-ink hover:bg-[#333] text-white px-6 py-2 rounded text-xs font-mono tracking-widest uppercase transition-colors"
          >
            Executar Backup Manual Agora
          </button>
        </div>
      </div>
    );
  }

  if (currentTab === 'financeiro') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Inputs Econômicos e Valuation">
          <Field label="Método de Custo do Kit">
            <Select value={state.finance.costMethod || 'perWp'} onChange={updater('finance','costMethod')}>
              <option value="perWp">Estimado por R$ / Watt-pico (Wp)</option>
              <option value="total">Valor Fixo (Preço Final do Kit)</option>
            </Select>
          </Field>
          {state.finance.costMethod === 'total' ? (
            <Field label="Valor do Kit (Final)" unit="R$" hint="Valor total do orçamento fechado do kit solar fotovoltaico para cálculo do payback."><Input type="number" step="100" value={state.finance.finalKitCost || 20000} onChange={updater('finance','finalKitCost')} /></Field>
          ) : (
            <Field label="CAPEX: Preço por Wp Base" unit="R$/Wp" hint="Capital Expenditure: Avalia o custo de compra + instalação padronizado por Watt pico. (Ex: 3,50 $/Wp)"><Input type="number" step="0.01" value={state.finance.capexPerWp} onChange={updater('finance','capexPerWp')} /></Field>
          )}
          <Field label="CAPEX: Preço Bateria Unid." unit="R$"><Input type="number" step="10" value={state.finance.batteryCostPerUnit} onChange={updater('finance','batteryCostPerUnit')} /></Field>
          <Field label="OPEX Anual Estimado" unit="R$/ano" hint="Operational Expenditure: Despesa contínua, operação e manutenção do sistema anualmente."><Input type="number" value={state.finance.opexYearly} onChange={updater('finance','opexYearly')} /></Field>
          <Field label="Tarifa Energia Atual" unit="R$/kWh"><Input type="number" step="0.01" value={state.finance.energyTariff} onChange={updater('finance','energyTariff')} /></Field>
          <Field label="Inflação Tarifária (Anual)" unit="%"><Input type="number" step="0.5" value={state.finance.tariffInflation} onChange={updater('finance','tariffInflation')} /></Field>
          <Field label="Taxa de Desconto (TMA)" unit="%/ano" hint="Taxa Mínima de Atratividade (TMA): Rendimento básico desejado pelo inversor com base no CDI ou afins, usado no cálculo do NPV."><Input type="number" step="0.1" value={state.finance.discountRate} onChange={updater('finance','discountRate')} /></Field>
          <Field label="Prazo de Análise" unit="Anos" hint="Ciclo de vida analisado para avaliação do fluxo de caixa e retorno financeiro."><Input type="number" value={state.finance.analysisYears} onChange={updater('finance','analysisYears')} /></Field>
        </Block>

        <Block title="Alternativa: Gerador a Diesel (Comparativo TCO)">
          <Field label="Custo Inicial (CAPEX Gerador)" unit="R$" hint="Valor pago na aquisição do gerador."><Input type="number" step="100" value={state.finance.dieselGensetCost || 15000} onChange={updater('finance','dieselGensetCost')} /></Field>
          <Field label="Preço do Diesel" unit="R$/L"><Input type="number" step="0.1" value={state.finance.dieselFuelPrice || 6.0} onChange={updater('finance','dieselFuelPrice')} /></Field>
          <Field label="Consumo do Gerador" unit="L/h"><Input type="number" step="0.1" value={state.finance.dieselConsumptionPerHour || 2.5} onChange={updater('finance','dieselConsumptionPerHour')} /></Field>
          <Field label="Uso Estimado Anual" unit="hs/ano" hint="Quantas horas por ano estima-se que o gerador ficará ligado como backup."><Input type="number" step="1" value={state.finance.dieselRuntimeYearly || 100} onChange={updater('finance','dieselRuntimeYearly')} /></Field>
          <Field label="Manutenção Anual (Gerador)" unit="R$/ano"><Input type="number" step="100" value={state.finance.dieselOpexYearly || 1200} onChange={updater('finance','dieselOpexYearly')} /></Field>
        </Block>

        {results && results.economicData && (
          <div className="mt-8 border border-line bg-white dark:bg-[#1E1E1E] p-4">
            <h3 className="text-[10px] uppercase tracking-widest text-[#666] font-bold mb-4 text-center">Curva de Retorno de Investimento (Payback / TCO)</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.economicData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'Ano', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                    labelFormatter={(label) => `Ano ${label}`}
                    contentStyle={{ fontSize: '12px', fontFamily: 'monospace' }} 
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif' }} />
                  <Line type="monotone" dataKey="capexLine" name="Custo CAPEX Solar" stroke="#E74C3C" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="cumulativeSavings" name="Fluxo Sistema Solar" stroke="#3498DB" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="dieselCumulative" name="Fluxo Gerador Diesel" stroke="#9B59B6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div>Selecione o módulo na barra lateral.</div>;
}
