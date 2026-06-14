import React from 'react';
import { AppState, CalculationResults } from '../types';
import { Download, FileText, Settings, ShieldAlert, AlertTriangle, Cpu, Zap, Battery, LineChart, Hash, Server, DollarSign, Activity, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, Legend } from 'recharts';

export function ReportPanel({ state, results }: { state: AppState, results: CalculationResults }) {
  
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // O recurso nativo de impressão do navegador é o único que renderiza perfeitamente
    // as media-queries de Tailwind (print:), garantindo o layout formatado para PDF.
    window.print();
  };

  const handleExportCSV = () => {
    // Basic CSV mockup
    const csvContent = "data:text/csv;charset=utf-8,Parâmetro,Valor\nGerado,OK";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `memorial.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const GridItem = ({ label, value, unit, icon: Icon, warn = false, title }: any) => (
    <div className={`p-4 border-b border-line bg-white dark:bg-[#1E1E1E] ${warn ? 'border-l-4 border-l-[#D35400]' : ''}`} title={title}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#666] uppercase tracking-wider flex items-center gap-1">
          {Icon && <Icon className="w-3 h-3 opacity-60" />} {label}
        </span>
      </div>
      <div className="font-mono text-lg font-bold text-ink">
        {value} <span className="text-[10px] text-[#888] font-sans">{unit}</span>
      </div>
    </div>
  );

  let currentWaterfall = results.energyNominalDc;
  const waterfallData = [
    { name: 'Nominal DC', transparent: 0, yield: currentWaterfall, loss: 0, isTotal: true }
  ];
  const addLoss = (name: string, loss: number) => {
    currentWaterfall -= loss;
    waterfallData.push({ name, transparent: currentWaterfall, yield: 0, loss, isTotal: false });
  };
  addLoss('Temperatura', results.lossTemperatureKwh);
  addLoss('Mismatch', results.lossMismatchKwh);
  addLoss('Sujidade', results.lossSoilingKwh);
  addLoss('Sombreamento', results.lossShadingKwh);
  addLoss('Cabos', results.lossCablingKwh);
  addLoss('Inversor', results.lossInverterKwh);
  addLoss('Degradação (Ano 1)', results.lossDegradationKwh);

  if (state.sizing.systemType !== 'On-Grid') {
    const storageLoss = currentWaterfall - results.energyActualAc;
    addLoss('Baterias', storageLoss);
  }

  waterfallData.push({ name: 'Útil CA', transparent: 0, yield: results.energyActualAc, loss: 0, isTotal: true });

  const customLossColor = "#E74C3C";
  const customYieldColor = "#27AE60";

  const inverterComparisonData = [
    { load: 5, selected: state.equipment.inverterEfficiency - 5, generic: 90, premium: 95 },
    { load: 10, selected: state.equipment.inverterEfficiency - 3, generic: 92, premium: 96.5 },
    { load: 20, selected: state.equipment.inverterEfficiency - 1.5, generic: 94, premium: 98 },
    { load: 30, selected: state.equipment.inverterEfficiency - 0.5, generic: 95.5, premium: 98.7 },
    { load: 50, selected: state.equipment.inverterEfficiency, generic: 96, premium: 99 },
    { load: 75, selected: state.equipment.inverterEfficiency - 0.2, generic: 95.8, premium: 98.8 },
    { load: 100, selected: state.equipment.inverterEfficiency - 0.5, generic: 95, premium: 98.5 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F9F9F7] dark:bg-[#121212] print:bg-white print:w-full print:absolute print:inset-0 print:p-8">
      
      {/* ACTION BAR (Hidden in print) */}
      <div className="flex justify-between items-center p-6 border-b border-line print:hidden">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#2980B9]">Relatório (Executive Summary)</span>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="p-2 border border-line bg-white text-ink hover:bg-black/5 dark:bg-[#1E1E1E] dark:text-white dark:hover:bg-[#2A2A2A] rounded cursor-pointer flex items-center gap-2 transition-colors">
            <Activity className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">Visualização Simplificada</span>
          </button>
          <button onClick={handleExportPDF} className="p-2 border border-line bg-[#2980B9] text-white hover:bg-[#1A5276] rounded cursor-pointer flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">Gerar PDF Consolidado</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto print:p-0 print:overflow-visible">
        
        {/* DOCUMENT HEADER (For print) */}
        <div className="hidden print:block mb-10 pb-6 border-b-2 border-ink">
          <h1 className="text-2xl font-serif italic m-0 text-ink">ESTUDO TÉCNICO FOTOVOLTAICO</h1>
          <h2 className="text-sm font-mono mt-2 text-[#D35400]">PROJETO: {state.project.clientName || 'N/A'} - {state.project.city || 'N/A'}</h2>
          <div className="flex gap-4 mt-4 font-mono text-[10px] text-[#666]">
             <div>SISTEMA: <span className="font-bold text-ink">{state.sizing.systemType}</span></div>
             <div>DIRETRIZES: <span className="font-bold text-ink">NBR 16690 / 5410 / IEC 62548</span></div>
             <div>DATA: <span className="font-bold text-ink">{new Date().toLocaleDateString('pt-BR')}</span></div>
          </div>
        </div>

        {/* RESUMO GERAÇÃO e BALANÇO */}
        <div>
           <h3 className="text-[10px] bg-ink text-white inline-block px-2 py-1 font-mono uppercase mb-2">1. Geração e Desempenho</h3>
           <div className="grid grid-cols-2 gap-px bg-line border border-line mb-6">
              <GridItem icon={Zap} label="Energia Mensal Gerada" value={results.monthlyEnergyKwh.toLocaleString('pt-BR')} unit="kWh/mês" />
              <GridItem icon={LineChart} label={`Potência Pico da Usina (${results.numModules}x ${state.equipment.modulePower}W)`} value={(results.actualPvPowerW/1000).toFixed(2)} unit="kWp" />
              <GridItem label="Performance Ratio (PR)" value={(results.performanceRatio * 100).toFixed(1)} unit="%" />
              <GridItem label="Yield Específico" value={results.specificYield.toFixed(0)} unit="kWh/kWp/ano" />
           </div>

           <h3 className="text-[10px] bg-[#E67E22] text-white inline-block px-2 py-1 font-mono uppercase mb-2">1B. Balanço Energético (Análise de Perdas)</h3>
           <div className="bg-white dark:bg-[#1E1E1E] border border-line p-4 print:break-inside-avoid">
             <div className="w-full h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                   <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#666' }} />
                   <YAxis tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#666' }} />
                   <Tooltip 
                     formatter={(value: any, name: any, props: any) => {
                       if (name === 'transparent') return null;
                       return [`${Number(value).toFixed(1)} kWh/ano`, name === 'loss' ? 'Perda' : 'Energia'];
                     }}
                     labelStyle={{ fontWeight: 'bold', color: '#333' }} 
                     itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                   />
                   <Bar dataKey="transparent" stackId="a" fill="transparent" />
                   <Bar dataKey="yield" stackId="a" fill={customYieldColor} />
                   <Bar dataKey="loss" stackId="a" fill={customLossColor} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
             
             {/* Tabela de Perdas Discriminada */}
             <div className="mt-6 border-t border-line pt-4">
               <table className="w-full text-[10px] font-mono text-left">
                 <thead>
                   <tr className="text-[#888] uppercase border-b border-line">
                     <th className="pb-2 font-normal">Fator de Perda</th>
                     <th className="pb-2 font-normal text-right">Impacto (kWh/ano)</th>
                     <th className="pb-2 font-normal text-right">% Relativo</th>
                   </tr>
                 </thead>
                 <tbody>
                   {waterfallData.filter(d => !d.isTotal).map((loss, idx) => (
                     <tr key={idx} className="border-b border-line last:border-0 hover:bg-[#F9F9F7] dark:hover:bg-[#2A2A2A]">
                       <td className="py-2 text-ink capitalize">{loss.name}</td>
                       <td className="py-2 text-right text-[#E74C3C]">- {loss.loss.toFixed(1)}</td>
                       <td className="py-2 text-right text-[#666]">
                         {((loss.loss / results.energyNominalDc) * 100).toFixed(1)}%
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>

        {/* DIMENSIONAMENTO DO ARRANJO */}
        <div className="print:break-inside-avoid">
           <h3 className="text-[10px] bg-[#2980B9] text-white inline-block px-2 py-1 font-mono uppercase mb-2">2. Arranjo (Sizing)</h3>
           <div className="grid grid-cols-2 gap-px bg-line border border-line">
              <GridItem icon={Hash} label="Quantidade de Módulos" value={results.numModules} unit="un." />
              <GridItem icon={Server} label="Arranjos (Strings)" value={results.strings} unit="seq." />
              <GridItem icon={Settings} label="Módulos por String" value={results.modsPerString} unit="un." />
              <GridItem label="MPPTs Usados" value={results.mpptCount} unit="un." />
              <GridItem label="Strings / MPPT" value={results.stringsPerMppt} unit="seq." />
              <GridItem label="Corrente / MPPT" value={results.currentPerMppt.toFixed(1)} unit="A" warn={results.currentPerMppt > state.equipment.inverterMaxI} />
              <GridItem label="Relação DC/AC" value={results.dcAcRatio.toFixed(2)} unit="x" warn={results.dcAcRatio > state.sizing.maxDcAcRatio} />
              <GridItem label="Área Estimada" value={results.totalArea.toFixed(1)} unit="m²" />
              <GridItem label="Peso Estimado" value={(results.totalWeight).toFixed(1)} unit="kg" />
              <GridItem icon={ShieldAlert} label="String Voc Máx @ Frio" value={results.stringVocMax.toFixed(1)} unit="V" warn={results.stringVocMax > state.equipment.inverterMaxDcV} />
              <GridItem label="String Vmp Mín @ Calor" value={results.stringVmpMin.toFixed(1)} unit="V" warn={results.stringVmpMin < state.equipment.inverterMpptMinV} />
           </div>
           
           <div className="hidden">
             {results.stringVocMax > (state.equipment.inverterMaxDcV || Infinity) && (
                <div className="bg-[#FFF9F5] dark:bg-[#2A1E14] border border-[#D35400] text-[#D35400] text-[10px] p-2 font-mono flex items-center gap-2">
                  <ShieldAlert size={12} />
                  !! ALERTA NBR 16690: A Tensão máxima da String a frio ({results.stringVocMax.toFixed(0)}V) excede o limite do inversor ({state.equipment.inverterMaxDcV}V). Risco de danos ao equipamento.
                </div>
             )}
             {results.stringVmpMin < (state.equipment.inverterMpptMinV || 0) && (
                <div className="bg-[#FFF9F5] dark:bg-[#2A1E14] border border-[#F39C12] text-[#F39C12] text-[10px] p-2 font-mono flex items-center gap-2">
                  <AlertTriangle size={12} />
                  ! AVISO: A Tensão mínima da String a quente ({results.stringVmpMin.toFixed(0)}V) está abaixo da tensão mínima do MPPT ({state.equipment.inverterMpptMinV}V). Perda de eficiência / 'clipping'.
                </div>
             )}
             {results.currentPerMppt > (state.equipment.inverterMaxI || Infinity) && (
                <div className="bg-[#FFF9F5] dark:bg-[#2A1E14] border border-[#D35400] text-[#D35400] text-[10px] p-2 font-mono flex items-center gap-2">
                  <ShieldAlert size={12} />
                  !! ALERTA: A corrente máxima por MPPT ({results.currentPerMppt.toFixed(1)}A) excede a capacidade do inversor ({state.equipment.inverterMaxI}A). Cuidado com corte de pico ou danos.
                </div>
             )}
             {results.dcAcRatio > state.sizing.maxDcAcRatio && (
                <div className="bg-[#FFF9F5] dark:bg-[#2A1E14] border border-[#D35400] text-[#D35400] text-[10px] p-2 font-mono flex items-center gap-2">
                  <AlertTriangle size={12} />
                  !! ALERTA: A Relação DC/AC atual ({results.dcAcRatio.toFixed(2)}) ultrapassa o limite especificado ({state.sizing.maxDcAcRatio}). Considere um inversor maior.
                </div>
             )}
             {(() => {
                const priorityPower = (state.consumption?.loads || []).filter((l: any) => l.isPriority).reduce((acc: number, l: any) => acc + (l.powerW * l.qty), 0);
                const maxInvPower = state.equipment.inverterPower || 0;
                if (priorityPower > maxInvPower) {
                   return (
                      <div className="bg-[#FDEDEC] dark:bg-[#2A1111] border border-[#E74C3C] text-[#C0392B] text-[10px] p-2 font-mono flex items-center gap-2">
                         <ShieldAlert size={12} />
                         !! ALERTA: A somatória das cargas prioritárias ({priorityPower}W) excede a capacidade nominal do inversor ({maxInvPower}W). Risco de desarme do sistema.
                      </div>
                   );
                }
                return null;
             })()}
           </div>
        </div>

        {/* VALIDAÇÃO DE SEGURANÇA */}
        <div className="print:break-inside-avoid mb-6">
           <h3 className="text-[10px] bg-[#C0392B] text-white inline-block px-2 py-1 font-mono uppercase mb-2">3. Validação de Segurança (Limites Inversor)</h3>
           <div className="bg-white dark:bg-[#1E1E1E] border border-line overflow-hidden">
              <table className="w-full text-left font-sans text-xs">
                 <thead className="bg-[#FAFAF9] dark:bg-[#2A2A2A] text-[#666] border-b border-line text-[9px] uppercase tracking-wider">
                    <tr>
                       <th className="p-2 font-normal whitespace-nowrap">Parâmetro Dimensional</th>
                       <th className="p-2 font-normal text-right">Especificação (Arranjo)</th>
                       <th className="p-2 font-normal text-right whitespace-nowrap">Limite Equipamento</th>
                       <th className="p-2 font-normal text-center">Status</th>
                    </tr>
                 </thead>
                 <tbody className="font-mono text-[11px] text-ink">
                    <tr className="border-b border-line last:border-0 hover:bg-[#F9F9F7] dark:hover:bg-[#2A2A2A]">
                       <td className="p-2 pl-3">Voc Máxima (Clima Frio)</td>
                       <td className="p-2 text-right">{results.stringVocMax.toFixed(1)} V</td>
                       <td className="p-2 text-right opacity-70">Máx. {state.equipment.inverterMaxDcV} V</td>
                       <td className="p-2 text-center">
                          {results.stringVocMax <= state.equipment.inverterMaxDcV ? (
                             <span className="bg-[#27AE60] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase">OK</span>
                          ) : (
                             <span className="bg-[#E74C3C] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold">Risco</span>
                          )}
                       </td>
                    </tr>
                    <tr className="border-b border-line last:border-0 hover:bg-[#F9F9F7] dark:hover:bg-[#2A2A2A]">
                       <td className="p-2 pl-3">Vmp Mínima (Clima Quente)</td>
                       <td className="p-2 text-right">{results.stringVmpMin.toFixed(1)} V</td>
                       <td className="p-2 text-right opacity-70">Mín. {state.equipment.inverterMpptMinV} V</td>
                       <td className="p-2 text-center">
                          {results.stringVmpMin >= state.equipment.inverterMpptMinV ? (
                             <span className="bg-[#27AE60] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase">OK</span>
                          ) : (
                             <span className="bg-[#F39C12] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold">Aviso</span>
                          )}
                       </td>
                    </tr>
                    <tr className="border-b border-line last:border-0 hover:bg-[#F9F9F7] dark:hover:bg-[#2A2A2A]">
                       <td className="p-2 pl-3">Corrente Curto-Circuito / MPPT</td>
                       <td className="p-2 text-right">{results.currentPerMppt.toFixed(1)} A</td>
                       <td className="p-2 text-right opacity-70">Máx. {state.equipment.inverterMaxI} A</td>
                       <td className="p-2 text-center">
                          {results.currentPerMppt <= state.equipment.inverterMaxI ? (
                             <span className="bg-[#27AE60] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase">OK</span>
                          ) : (
                             <span className="bg-[#E74C3C] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold">Risco</span>
                          )}
                       </td>
                    </tr>
                    <tr className="border-b border-line last:border-0 hover:bg-[#F9F9F7] dark:hover:bg-[#2A2A2A]">
                       <td className="p-2 pl-3">Sizing Factor (Overloading)</td>
                       <td className={`p-2 text-right ${results.dcAcRatio > (state.sizing.maxDcAcRatio || 1.25) ? 'text-[#e74c3c] font-bold' : ''}`}>{results.dcAcRatio.toFixed(2)}x</td>
                       <td className="p-2 text-right opacity-70">Máx. {(state.sizing.maxDcAcRatio || 1.25).toFixed(2)}x</td>
                       <td className="p-2 text-center">
                          {results.dcAcRatio <= (state.sizing.maxDcAcRatio || 1.25) ? (
                             <span className="bg-[#27AE60] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase">OK</span>
                          ) : (
                             <span className="bg-[#E74C3C] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold" title="Sobrecarregamento (Overloading) acima do recomendado!">Risco</span>
                          )}
                       </td>
                    </tr>
                    {(() => {
                       const isHybridOrOff = state.sizing.systemType !== 'On-Grid';
                       const priorityLoads = (state.consumption?.loads || []).filter((l: any) => isHybridOrOff ? l.isPriority : true);
                       
                       let priorityTotalPowerW = 0;
                       if (state.consumption?.method === 'loadProfile') {
                          priorityTotalPowerW = priorityLoads.reduce((acc: number, l: any) => acc + (l.powerW * l.qty), 0);
                       } else if (isHybridOrOff) {
                          const dailyWh = (state.consumption?.dailyKwh || 0) * 1000;
                          priorityTotalPowerW = (dailyWh / 4) * (state.sizing.simultaneityFactor || 0.8);
                       }

                       if (isHybridOrOff && priorityTotalPowerW > 0) {
                          return (
                             <>
                                <tr className="border-b border-line last:border-0 hover:bg-[#F9F9F7] dark:hover:bg-[#2A2A2A]">
                                   <td className="p-2 pl-3">Aten. em Backup / Plena Carga</td>
                                   <td className="p-2 text-right">{Math.ceil(priorityTotalPowerW)} W</td>
                                   <td className="p-2 text-right opacity-70">Máx. {state.equipment.inverterPower || 0} W</td>
                                   <td className="p-2 text-center">
                                      {priorityTotalPowerW <= (state.equipment.inverterPower || 0) ? (
                                         <span className="bg-[#27AE60] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase">OK</span>
                                      ) : (
                                         <span className="bg-[#E74C3C] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold">Risco</span>
                                      )}
                                   </td>
                                </tr>
                                {results.batteryBankMaxPowerW > 0 && (
                                <tr className="border-b border-line last:border-0 hover:bg-[#F9F9F7] dark:hover:bg-[#2A2A2A]">
                                   <td className="p-2 pl-3">Dimensionamento Inv. vs Bateria</td>
                                   <td className={`p-2 text-right ${((state.equipment.inverterPower || 0) < results.batteryBankMaxPowerW) ? 'text-[#e74c3c] font-bold' : ''}`}>Inv {state.equipment.inverterPower || 0}W</td>
                                   <td className="p-2 text-right opacity-70">Banco {results.batteryBankMaxPowerW.toFixed(0)}W</td>
                                   <td className="p-2 text-center">
                                      {(state.equipment.inverterPower || 0) >= results.batteryBankMaxPowerW ? (
                                         <span className="bg-[#27AE60] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase">OK</span>
                                      ) : (
                                         <span className="bg-[#E74C3C] text-white px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold text-center">ALERTA</span>
                                      )}
                                   </td>
                                </tr>
                                )}
                             </>
                          );
                       }
                       return null;
                    })()}
                 </tbody>
              </table>
           </div>
        </div>

        {state.sizing.systemType !== 'On-Grid' && (
           <div className="print:break-inside-avoid">
              <h3 className="text-[10px] bg-[#D35400] text-white inline-block px-2 py-1 font-mono uppercase mb-2">PONTOS DE ATENÇÃO (CARGAS PRIORITÁRIAS)</h3>
              <div className="bg-[#FFF9F5] dark:bg-[#2A1E14] border border-[#E67E22] p-4 text-xs text-[#D35400] font-sans mb-6">
                 <ul className="list-disc pl-4 space-y-2">
                    <li><strong>01. Tensão dos Equipamentos:</strong> Verificar se a tensão (127V/220V) bate com a saída do inversor escolhido.</li>
                    <li><strong>02. Equipamentos de Alta Potência:</strong> Cargas com motores dão pico de partida de 3 a 5 vezes o nominal. O Inversor {results.recommendedInverterPowerW ? `(automático: ${results.recommendedInverterPowerW}W)` : ''} precisa absorver o pico.</li>
                    <li><strong>03. Quantidades de Fases das Cargas:</strong> Especificar claramente se as cargas são Bifásicas, Monofásicas ou Trifásicas e compatibilizar.</li>
                 </ul>
              </div>
           </div>
        )}

        {/* PROTEÇÕES CA/CC */}
        <div className="print:break-inside-avoid">
           <h3 className="text-[10px] bg-[#34495E] text-white inline-block px-2 py-1 font-mono uppercase mb-2">4. Eng. Elétrica e Proteções</h3>
           <div className="grid grid-cols-2 gap-px bg-line border border-line">
              <GridItem label="Disjuntor CC (String P.)" value={`${results.breakerCcA}`} unit="A" />
              <GridItem label="DPS CC (Tensão Cont.)" value={`${results.dpsCcV}`} unit="V" />
              <GridItem label="Condutor CC" value={`${results.cableDcSect}`} unit="mm²" />
              <GridItem label="Disjuntor CA (Geral)" value={`${results.breakerAcA}`} unit="A" />
              <GridItem label="Condutor CA" value={`${results.cableAcSect}`} unit="mm²" />
              <GridItem label="Queda Tensão CC" value={`${results.voltageDropDc.toFixed(2)}`} unit="V" />
           </div>
        </div>

        {/* ARMAZENAMENTO */}
        {state.sizing.systemType !== 'On-Grid' && (
          <div className="print:break-inside-avoid">
            <h3 className="text-[10px] bg-[#27AE60] text-white inline-block px-2 py-1 font-mono uppercase mb-2">4. BESS (Armazenamento)</h3>
            <div className="grid grid-cols-2 gap-px bg-line border border-line">
                <GridItem icon={Battery} label="Capacidade Nominal" value={Math.ceil(results.reqAh).toLocaleString('pt-BR')} unit="Ah" />
                <GridItem icon={Cpu} label="Topologia Física" value={`${results.battSer}S ${results.battPar}P`} unit="arr." />
                <GridItem label="Energia Bruta" value={results.storageKwhBruto.toFixed(1)} unit="kWh" />
                <GridItem label="Energia Útil (V_DoD)" value={results.storageKwhUtil.toFixed(1)} unit="kWh" />
                {(() => {
                  const isHybrid = state.sizing.systemType === 'Híbrido';
                  const isLoadProfile = state.consumption?.method === 'loadProfile';
                  const priorityLoads = (state.consumption?.loads || []).filter((l: any) => isHybrid ? l.isPriority : true);
                  
                  let totalPowerW = 0;
                  let dailyEnergyWh = 0;
                  
                  if (!isLoadProfile) {
                    dailyEnergyWh = (state.consumption?.dailyKwh || 0) * 1000;
                    totalPowerW = dailyEnergyWh / 24; // Simple continuous average
                  } else {
                    priorityLoads.forEach((l: any) => {
                      totalPowerW += (l.powerW || 0) * (l.qty || 1);
                      dailyEnergyWh += (l.powerW || 0) * (l.qty || 1) * (l.hoursPerDay || 0);
                    });
                  }
                  
                  if (dailyEnergyWh === 0 && totalPowerW === 0) return null;
                  
                  const averagePowerW = dailyEnergyWh > 0 ? dailyEnergyWh / 24 : 0;
                  const autonomyAvgProfile = averagePowerW > 0 ? (results.storageKwhUtil * 1000) / averagePowerW : 0;
                  const autonomyMaxPower = totalPowerW > 0 ? (results.storageKwhUtil * 1000) / totalPowerW : 0;

                  return (
                    <>
                      <GridItem icon={Clock} label="Autonomia (Uso Médio)" value={autonomyAvgProfile > 0 ? autonomyAvgProfile.toFixed(1) : '-'} unit="h" title="Com base no consumo diário espaçado" />
                      <GridItem icon={Clock} label="Autonomia (Plena Carga)" value={autonomyMaxPower > 0 ? autonomyMaxPower.toFixed(1) : '-'} unit="h" title="Todos os equipamentos prioritários ao mesmo tempo" />
                    </>
                  );
                })()}
            </div>
          </div>
        )}

        {/* COMPARATIVO DE INVERSORES */}
        <div className="print:break-inside-avoid mt-8">
           <h3 className="text-[10px] bg-[#8E44AD] text-white inline-block px-2 py-1 font-mono uppercase mb-2">5. Comparativo de Eficiência (Inversores)</h3>
           <div className="bg-white dark:bg-[#1E1E1E] border border-line p-4">
             <div className="text-xs font-mono text-[#666] mb-4 uppercase tracking-widest text-center">
               Curva de Rendimento x Potência de Entrada (Carga %)
             </div>
             <div className="w-full h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <RechartsLineChart data={inverterComparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                   <XAxis dataKey="load" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} label={{ value: 'Potência de Entrada / Carga (%)', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                   <YAxis domain={['dataMin - 2', 100]} fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                   <Tooltip 
                     formatter={(value: number) => `${value.toFixed(1)}%`}
                     labelFormatter={(label) => `Carga: ${label}%`}
                     contentStyle={{ fontSize: '12px', fontFamily: 'monospace' }} 
                   />
                   <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif' }} />
                   <Line type="step" dataKey="generic" name="Inversor String Básico" stroke="#95A5A6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                   <Line type="monotone" dataKey="selected" name="Modelo Selecionado" stroke="#2980B9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                   <Line type="monotone" dataKey="premium" name="Microinversor / Premium" stroke="#F39C12" strokeWidth={2} dot={false} />
                 </RechartsLineChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* ECONOMIC ANALYSIS */}
        <div className="print:break-inside-avoid mt-8">
           <h3 className="text-[10px] bg-[#2980B9] text-white inline-block px-2 py-1 font-mono uppercase mb-2">6. Análise Econômica de Longo Prazo</h3>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <div className="bg-white dark:bg-[#1E1E1E] border border-line p-4">
               <div className="text-xs font-mono text-[#666] mb-4 uppercase tracking-widest text-center">
                 Fluxo de Caixa Acumulado (Cenário "Sem Solar" vs "Com Solar")
               </div>
               <div className="w-full h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <RechartsLineChart data={results.economicData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                     <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'Ano', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                     <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                     <Tooltip 
                       formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                       labelFormatter={(label) => `Ano ${label}`}
                       contentStyle={{ fontSize: '12px', fontFamily: 'monospace' }} 
                     />
                     <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif' }} />
                     <Line type="monotone" dataKey="noSolarCumulative" name="Gasto s/ Solar" stroke="#E74C3C" strokeWidth={2} dot={false} />
                     <Line type="monotone" dataKey="solarCumulative" name="Caixa c/ Solar" stroke="#27AE60" strokeWidth={2} dot={false} />
                   </RechartsLineChart>
                 </ResponsiveContainer>
               </div>
             </div>

             <div className="bg-white dark:bg-[#1E1E1E] border border-line p-4">
               <div className="text-xs font-mono text-[#666] mb-4 uppercase tracking-widest text-center">
                 Curva de Retorno de Investimento (Payback)
               </div>
               <div className="w-full h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <RechartsLineChart data={results.economicData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                     <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'Ano', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                     <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                     <Tooltip 
                       formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                       labelFormatter={(label) => `Ano ${label}`}
                       contentStyle={{ fontSize: '12px', fontFamily: 'monospace' }} 
                     />
                     <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'sans-serif' }} />
                     <Line type="monotone" dataKey="capexLine" name="Custo CAPEX" stroke="#E74C3C" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                     <Line type="monotone" dataKey="cumulativeSavings" name="Economia Acumulada" stroke="#3498DB" strokeWidth={2} dot={false} />
                   </RechartsLineChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>
        </div>

        {/* MEMÓRIA DE CÁLCULO */}
        <div className="print:break-before-page mt-12 mb-12">
          <h3 className="text-[10px] bg-ink text-white inline-block px-2 py-1 font-mono uppercase mb-4">7. Memória de Cálculo (Engenharia)</h3>
          <div className="space-y-4">
            {results.calculationMemory.map((mem, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1E1E1E] border border-line p-4">
                <div className="flex justify-between items-center mb-2 border-b border-line pb-2">
                  <span className="font-bold text-xs uppercase text-ink">{mem.step} - {mem.description}</span>
                  {mem.norm && <span className="text-[9px] font-mono bg-[#E8F8F5] text-[#27AE60] px-2 py-0.5">{mem.norm}</span>}
                </div>
                <div className="font-mono text-xs text-[#666] space-y-1 mb-3">
                  <div>[Fórmula] {mem.formula}</div>
                  <div>[Valores] {mem.values}</div>
                </div>
                <div className="text-sm font-bold text-ink">
                  = <span className="text-solar-blue">{mem.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROPOSTA COMERCIAL - PAGE BREAK PARA PDF */}
        <div className="print:break-before-page mt-12 pt-8 print:mt-0 print:pt-0">
          <div className="hidden print:block mb-8 pb-6 border-b-2 border-ink">
            <h1 className="text-2xl font-serif italic m-0 text-ink">PROPOSTA COMERCIAL FOTOVOLTAICA</h1>
            <h2 className="text-sm font-mono mt-2 text-[#D35400]">PREPARADA PARA: {state.project.clientName || 'N/A'}</h2>
          </div>

          <h3 className="text-[10px] bg-ink text-white inline-block px-2 py-1 font-mono uppercase mb-2">Resumo Financeiro do Investimento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line mb-6">
             <div className="p-6 bg-white dark:bg-[#1E1E1E] border-b border-r border-line text-center md:col-span-2">
                <div className="text-xs text-[#666] uppercase tracking-widest mb-2 font-bold">Investimento Total Estimado (CAPEX)</div>
                <div className="text-3xl font-serif text-ink font-bold text-[#27AE60]">
                   R$ {results.capexTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-[#888] font-mono mt-2">Inclui Equipamentos, Projetos e Instalação</div>
             </div>
             <GridItem icon={Zap} label="Economia Anual Estimada (Início)" value={`R$ ${results.yearlySavingsStart.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} unit="/ ano" />
             <GridItem icon={DollarSign} label="Payback Simples" value={results.payback.toFixed(1)} unit="Anos" />
             <GridItem label="ROI (Retorno do Investimento)" value={`${results.roi.toFixed(1)}`} unit="%" />
             <GridItem label="VPL (Valor Presente Líquido)" value={`R$ ${(results.vpl/1000).toFixed(1)}k`} unit="" />
          </div>

          <h3 className="text-[10px] bg-ink text-white inline-block px-2 py-1 font-mono uppercase mb-2 mt-4">Escopo de Fornecimento</h3>
          <ul className="text-sm font-mono space-y-2 border border-line p-5 bg-white dark:bg-[#1E1E1E] text-ink leading-relaxed">
            <li>- {results.numModules}x Módulos Fotovoltaicos de {state.equipment.modulePower}W ({results.actualPvPowerW/1000} kWp)</li>
            <li>- 1x Inversor {state.sizing.systemType} de {state.equipment.inverterPower}W</li>
            {state.sizing.systemType !== 'On-Grid' && (
              <li>- {results.totalBatts}x Baterias {state.equipment.batteryTech} {state.equipment.batteryVoltage}V {state.equipment.batteryCapacity}Ah ({results.storageKwhBruto.toFixed(1)} kWh bruto)</li>
            )}
            <li>- String box / Quadros CA e Proteções (DPS, Disjuntores) dimensionados NBR 5410/16690</li>
            <li>- Cabos solares e conectores MC4 correspondentes</li>
            <li>- Estruturas de fixação para coberturas/solo padrão</li>
            <li>- Projeto Executivo, ART de Instalação e Homologação na {state.project.utility}</li>
          </ul>
          
          <div className="mt-12 pt-12 border-t border-line grid grid-cols-2 gap-8 text-center print:mt-32">
             <div>
                <div className="border-b border-line w-4/5 mx-auto mb-2 h-8"></div>
                <div className="text-xs uppercase font-bold text-ink">MgS System Solar</div>
                <div className="text-[10px] font-mono text-[#888]">Engenheiro Responsável</div>
             </div>
             <div>
                <div className="border-b border-line w-4/5 mx-auto mb-2 h-8"></div>
                <div className="text-xs uppercase font-bold text-ink">{state.project.clientName}</div>
                <div className="text-[10px] font-mono text-[#888]">De Acordo (Cliente)</div>
             </div>
          </div>
        </div>

        <div className="hidden print:block mt-8 pt-4 border-t border-line text-center opacity-60">
           <div className="text-[14px] font-bold tracking-[0.2em] uppercase text-ink">Casa Off-Grid</div>
           <div className="text-[9px] font-mono mt-1">Plataforma de Engenharia Avançada • Validação Automática NBR/IEC</div>
        </div>

      </div>
    </div>
  );
}
