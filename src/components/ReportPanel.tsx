import React, { useState } from 'react';
import { AppState, CalculationResults } from '../types';
import { Download, FileText, Settings, ShieldAlert, Cpu, Zap, Battery, LineChart, Hash, Server, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, Legend } from 'recharts';
import jsPDF from 'jspdf';

export function ReportPanel({ state, results }: { state: AppState, results: CalculationResults }) {
  
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pWidth = doc.internal.pageSize.getWidth();
      
      const addTitle = (text: string, y: number) => {
        doc.setFillColor(26, 26, 26);
        doc.rect(14, y - 5, pWidth - 28, 7, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont("courier", "bold");
        doc.text(text.toUpperCase(), 16, y);
      };
      
      const addRow = (label: string, value: string, y: number) => {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(label, 14, y);
        
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(value, pWidth - 14, y, { align: 'right' });
        
        doc.setDrawColor(220, 220, 220);
        doc.line(14, y + 2, pWidth - 14, y + 2);
      };

      // PAGE 1: COVER & EXECUTIVE SUMMARY
      doc.setFontSize(22);
      doc.setFont("times", "italic");
      doc.setTextColor(26, 26, 26);
      doc.text("ESTUDO TÉCNICO FOTOVOLTAICO", 14, 25);
      
      doc.setFontSize(14);
      doc.setFont("courier", "normal");
      doc.setTextColor(211, 84, 0);
      doc.text(`PROJETO: ${state.project.clientName || 'N/A'}`, 14, 32);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Sistema: ${state.sizing.systemType}`, 14, 40);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pWidth - 14, 40, { align: 'right' });
      
      doc.setDrawColor(26, 26, 26);
      doc.setLineWidth(0.5);
      doc.line(14, 45, pWidth - 14, 45);

      let currentY = 60;
      addTitle("INFORMAÇÕES DO PROJETO", currentY);
      currentY += 10;
      addRow("Cliente", state.project.clientName, currentY); currentY += 8;
      addRow("Endereço", `${state.project.street || ''}, ${state.project.number || ''}`, currentY); currentY += 8;
      addRow("Cidade / UF", `${state.project.city || ''} / ${state.project.state || ''}`, currentY); currentY += 8;
      addRow("Concessionária", state.project.utility, currentY); currentY += 8;
      addRow("Demanda Contratada", `${state.project.contractedDemand} kW`, currentY); currentY += 8;
      
      currentY += 10;
      addTitle("1. GERAÇÃO E DESEMPENHO", currentY);
      currentY += 10;
      addRow("Energia Mensal Gerada", `${results.monthlyEnergyKwh.toLocaleString('pt-BR')} kWh/mês`, currentY); currentY += 8;
      addRow("Potência FV Recomendada", `${(results.actualPvPowerW/1000).toFixed(2)} kWp`, currentY); currentY += 8;
      addRow("Performance Ratio (PR)", `${(results.performanceRatio * 100).toFixed(1)} %`, currentY); currentY += 8;
      addRow("Yield Específico", `${results.specificYield.toFixed(0)} kWh/kWp/ano`, currentY); currentY += 8;
      
      doc.addPage();
      currentY = 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(`Projeto: ${state.project.clientName} | Pg 2`, 14, 10);
      
      addTitle("2. ARRANJO FOTOVOLTAICO (SIZING)", currentY);
      currentY += 10;
      addRow("Quantidade de Módulos", `${results.numModules} un.`, currentY); currentY += 8;
      addRow("Arranjos (Strings)", `${results.strings} seq.`, currentY); currentY += 8;
      addRow("Módulos por String", `${results.modsPerString} un.`, currentY); currentY += 8;
      addRow("Relação DC/AC", `${results.dcAcRatio.toFixed(2)} x`, currentY); currentY += 8;
      addRow("Área Estimada", `${results.totalArea.toFixed(1)} m²`, currentY); currentY += 8;
      addRow("Peso Estimado", `${results.totalWeight.toFixed(1)} kg`, currentY); currentY += 8;
      addRow("Voc Max @ Frio", `${results.vocMaxTemp.toFixed(1)} V`, currentY); currentY += 8;
      
      currentY += 10;
      addTitle("3. ENGENHARIA E PROTEÇÕES", currentY);
      currentY += 10;
      addRow("Disjuntor CC (String)", `${results.breakerCcA} A`, currentY); currentY += 8;
      addRow("DPS CC (Tensão Cont.)", `${results.dpsCcV} V`, currentY); currentY += 8;
      addRow("Condutor CC", `${results.cableDcSect} mm²`, currentY); currentY += 8;
      addRow("Disjuntor CA (Geral)", `${results.breakerAcA} A`, currentY); currentY += 8;
      addRow("Condutor CA", `${results.cableAcSect} mm²`, currentY); currentY += 8;
      
      if (state.sizing.systemType !== 'On-Grid') {
        currentY += 10;
        addTitle("4. ARMAZENAMENTO (BESS)", currentY);
        currentY += 10;
        addRow("Topologia", `${results.battSer}S ${results.battPar}P`, currentY); currentY += 8;
        addRow("Capacidade Útil", `${results.storageKwhUtil.toFixed(1)} kWh`, currentY); currentY += 8;
        addRow("Capacidade Bruta", `${results.storageKwhBruto.toFixed(1)} kWh`, currentY); currentY += 8;
      }
      
      currentY += 10;
      addTitle("ESCOPO DE FORNECIMENTO", currentY);
      currentY += 10;
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      
      const scopeItems = [
        `- ${results.numModules}x Módulos Fotovoltaicos de ${state.equipment.modulePower}W (${(results.actualPvPowerW/1000).toFixed(2)} kWp)`,
        `- 1x Inversor ${state.sizing.systemType} de ${state.equipment.inverterPower}W`,
        state.sizing.systemType !== 'On-Grid' ? `- ${results.totalBatts}x Baterias ${state.equipment.batteryTech} ${state.equipment.batteryVoltage}V (${results.storageKwhBruto.toFixed(1)} kWh)` : null,
        `- String box / Quadros CA e Proteções dimensionados NBR 5410/16690`,
        `- Cabos solares e conectores MC4 correspondentes`,
        `- Estruturas de fixação para coberturas/solo padrão`,
        `- Projeto Executivo, ART de Instalação e Homologação na ${state.project.utility}`
      ].filter(Boolean) as string[];
      
      scopeItems.forEach(item => {
        doc.text(item, 14, currentY);
        currentY += 7;
      });
      
      currentY += 20;
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.setTextColor(39, 174, 96);
      doc.text(`INVESTIMENTO TOTAL (CAPEX): R$ ${results.capexTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, currentY);
      
      currentY += 40;
      doc.setDrawColor(100, 100, 100);
      doc.line(20, currentY, (pWidth/2)-10, currentY);
      doc.line((pWidth/2)+10, currentY, pWidth-20, currentY);
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      doc.text("MgS System Solar", 20, currentY + 5);
      doc.text(state.project.clientName || 'Cliente', (pWidth/2)+10, currentY + 5);
      
      doc.save(`Projeto_Fotovoltaico_${state.project.clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Houve um erro ao gerar o PDF.');
    } finally {
      setIsExporting(false);
    }
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

  const GridItem = ({ label, value, unit, icon: Icon, warn = false }: any) => (
    <div className={`p-4 border-b border-line bg-white dark:bg-[#1E1E1E] ${warn ? 'border-l-4 border-l-[#D35400]' : ''}`}>
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

  return (
    <div className="flex flex-col h-full bg-[#F9F9F7] dark:bg-[#121212] print:bg-white print:w-full print:absolute print:inset-0 print:p-8">
      
      {/* ACTION BAR (Hidden in print) */}
      <div className="flex justify-between items-center p-6 border-b border-line print:hidden">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#2980B9]">Relatório (Executive Summary)</span>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="p-2 border border-line bg-white text-ink hover:bg-black/5 dark:bg-[#1E1E1E] dark:text-white dark:hover:bg-[#2A2A2A] rounded cursor-pointer flex items-center gap-2 transition-colors">
            <Activity className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">Imprimir / Salvar</span>
          </button>
          <button onClick={handleExportPDF} disabled={isExporting} className="p-2 border border-line bg-ink text-white hover:bg-[#333] rounded cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-50">
            <Download className="w-4 h-4" />
            <span className="text-xs uppercase font-bold tracking-wider">{isExporting ? 'Processando...' : 'Exportar PDF'}</span>
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
              <GridItem icon={LineChart} label="Potência FV Recomendada" value={(results.actualPvPowerW/1000).toFixed(2)} unit="kWp" />
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
              <GridItem label="Relação DC/AC" value={results.dcAcRatio.toFixed(2)} unit="x" warn={results.dcAcRatio > state.sizing.maxDcAcRatio} />
              <GridItem label="Área Estimada" value={results.totalArea.toFixed(1)} unit="m²" />
              <GridItem label="Peso Estimado" value={(results.totalWeight).toFixed(1)} unit="kg" />
              <GridItem icon={ShieldAlert} label="Voc Max @ Frio" value={results.vocMaxTemp.toFixed(1)} unit="V" warn={results.vocMaxTemp > state.equipment.inverterMaxDcV} />
              <GridItem label="Vmp Min @ Calor" value={results.vmpMinTemp.toFixed(1)} unit="V" />
           </div>
           {results.vocMaxTemp > (state.equipment.inverterMaxDcV || Infinity) && (
              <div className="bg-[#FFF9F5] dark:bg-[#2A1E14] border border-[#D35400] text-[#D35400] text-[10px] p-2 mt-2 font-mono">
                !! ALERTA NBR 16690: A Tensão Voc a frio excede a máxima do inversor.
              </div>
           )}
           {results.dcAcRatio > state.sizing.maxDcAcRatio && (
              <div className="bg-[#FFF9F5] dark:bg-[#2A1E14] border border-[#D35400] text-[#D35400] text-[10px] p-2 mt-2 font-mono">
                !! ALERTA: A Relação DC/AC atual ({results.dcAcRatio.toFixed(2)}) ultrapassa o limite especificado ({state.sizing.maxDcAcRatio}). Considere um inversor maior.
              </div>
           )}
        </div>

        {/* PROTEÇÕES CA/CC */}
        <div className="print:break-inside-avoid">
           <h3 className="text-[10px] bg-[#34495E] text-white inline-block px-2 py-1 font-mono uppercase mb-2">3. Eng. Elétrica e Proteções</h3>
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
            </div>
          </div>
        )}

        {/* ECONOMIC ANALYSIS */}
        <div className="print:break-inside-avoid mt-8">
           <h3 className="text-[10px] bg-[#2980B9] text-white inline-block px-2 py-1 font-mono uppercase mb-2">5. Análise Econômica de Longo Prazo</h3>
           <div className="bg-white dark:bg-[#1E1E1E] border border-line p-4">
             <div className="text-xs font-mono text-[#666] mb-4 uppercase tracking-widest text-center">
               Fluxo de Caixa Acumulado ao longo de {state.finance.analysisYears} anos (Cenário "Sem Solar" vs "Com Solar")
             </div>
             <div className="w-full h-[350px]">
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
                   <Line type="monotone" dataKey="noSolarCumulative" name="Cenário SEM Solar (Gasto Acumulado com Concessionária)" stroke="#E74C3C" strokeWidth={2} dot={false} />
                   <Line type="monotone" dataKey="solarCumulative" name="Cenário COM Solar (CAPEX + OPEX + Economia Acumulada)" stroke="#27AE60" strokeWidth={2} dot={false} />
                 </RechartsLineChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* MEMÓRIA DE CÁLCULO */}
        <div className="print:break-before-page mt-12 mb-12">
          <h3 className="text-[10px] bg-ink text-white inline-block px-2 py-1 font-mono uppercase mb-4">6. Memória de Cálculo (Engenharia)</h3>
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
           <div className="text-[14px] font-bold tracking-[0.2em] uppercase text-ink">PvStudio Pro Enterprise</div>
           <div className="text-[9px] font-mono mt-1">Plataforma de Engenharia Avançada • Validação Automática NBR/IEC</div>
        </div>

      </div>
    </div>
  );
}
