import React from 'react';
import { AppState } from '../types';

export const Block = ({ title, children }: any) => (
  <section className="mb-10">
    <span className="text-[10px] uppercase tracking-[0.1em] text-[#888] mb-4 block font-bold">{title}</span>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border-t border-l border-line bg-white">
      {children}
    </div>
  </section>
);

export const Field = ({ label, children, unit }: any) => (
  <div className="border-r border-b border-line p-4 flex flex-col justify-center relative focus-within:bg-[#FAFAF9] transition-colors">
    <label className="text-[9px] uppercase tracking-widest text-[#666] mb-2 font-bold">{label}</label>
    <div className="flex items-center">
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

export function ModularForms({ state, update, currentTab }: { state: AppState, update: Function, currentTab: string }) {
  const updater = (sec: keyof AppState, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    update(sec, field, val);
  };

  if (currentTab === 'cadastro') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Informações Gerais do Projeto">
          <Field label="Nome do Cliente"><Input type="text" value={state.project.clientName} onChange={updater('project','clientName')} /></Field>
          <Field label="Cidade"><Input type="text" value={state.project.city} onChange={updater('project','city')} /></Field>
          <Field label="Estado"><Input type="text" value={state.project.state} onChange={updater('project','state')} /></Field>
          <Field label="Latitude"><Input type="number" step="0.0001" value={state.project.lat} onChange={updater('project','lat')} /></Field>
          <Field label="Longitude"><Input type="number" step="0.0001" value={state.project.lng} onChange={updater('project','lng')} /></Field>
          <Field label="Altitude" unit="m"><Input type="number" value={state.project.altitude} onChange={updater('project','altitude')} /></Field>
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
        <Block title="Potencial Solar Meteorológico (GHI/DNI)">
          <Field label="Irradiação Média (HSP)" unit="kWh/m²/dia"><Input type="number" step="0.01" value={state.climate.hsp} onChange={updater('climate','hsp')} /></Field>
          <Field label="Temperatura Média Anual" unit="°C"><Input type="number" value={state.climate.avgTemp} onChange={updater('climate','avgTemp')} /></Field>
          <Field label="Temperátura Mínima Extrema" unit="°C"><Input type="number" value={state.climate.minTemp} onChange={updater('climate','minTemp')} /></Field>
          <Field label="Temperatura Máxima Extrema" unit="°C"><Input type="number" value={state.climate.maxTemp} onChange={updater('climate','maxTemp')} /></Field>
        </Block>
        <div className="text-xs text-[#888] font-mono mt-4 p-4 border border-line border-dashed text-center">Integração API NASA POWER / SolarGIS (Simulado na versão offline)</div>
      </div>
    );
  }

  if (currentTab === 'consumo') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Análise de Faturamento de Carga">
          <Field label="Consumo Mensal Médio" unit="kWh/mês"><Input type="number" value={state.consumption.monthlyAvgKwh} onChange={updater('consumption','monthlyAvgKwh')} /></Field>
          <Field label="Consumo Diário Base" unit="kWh/dia"><Input type="number" step="0.1" value={state.consumption.dailyKwh} onChange={updater('consumption','dailyKwh')} /></Field>
        </Block>
      </div>
    );
  }

  if (currentTab === 'equipamentos') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Módulos Fotovoltaicos (Specs PAN)">
          <Field label="Potência Pmax" unit="W"><Input type="number" value={state.equipment.modulePower} onChange={updater('equipment','modulePower')} /></Field>
          <Field label="Voc" unit="V"><Input type="number" step="0.01" value={state.equipment.moduleVoc} onChange={updater('equipment','moduleVoc')} /></Field>
          <Field label="Vmp" unit="V"><Input type="number" step="0.01" value={state.equipment.moduleVmp} onChange={updater('equipment','moduleVmp')} /></Field>
          <Field label="Isc" unit="A"><Input type="number" step="0.01" value={state.equipment.moduleIsc} onChange={updater('equipment','moduleIsc')} /></Field>
          <Field label="Imp" unit="A"><Input type="number" step="0.01" value={state.equipment.moduleImp} onChange={updater('equipment','moduleImp')} /></Field>
          <Field label="Coef. Temp. Voc" unit="%/°C"><Input type="number" step="0.001" value={state.equipment.moduleTempCoeffVoc} onChange={updater('equipment','moduleTempCoeffVoc')} /></Field>
          <Field label="Coef. Temp. Pmax" unit="%/°C"><Input type="number" step="0.001" value={state.equipment.moduleTempCoeffPmax} onChange={updater('equipment','moduleTempCoeffPmax')} /></Field>
          <Field label="Eficiência Módulo" unit="%"><Input type="number" step="0.1" value={state.equipment.moduleEfficiency} onChange={updater('equipment','moduleEfficiency')} /></Field>
          <Field label="Área do Módulo" unit="m²"><Input type="number" step="0.01" value={state.equipment.moduleArea} onChange={updater('equipment','moduleArea')} /></Field>
          <Field label="Peso do Módulo" unit="kg"><Input type="number" step="0.1" value={state.equipment.moduleWeight} onChange={updater('equipment','moduleWeight')} /></Field>
        </Block>
        <Block title="Inversor de Frequência (OND)">
          <Field label="Potência Nominal CA" unit="W"><Input type="number" value={state.equipment.inverterPower} onChange={updater('equipment','inverterPower')} /></Field>
          <Field label="Máxima Tensão CC (Entrada)" unit="V"><Input type="number" value={state.equipment.inverterMaxDcV} onChange={updater('equipment','inverterMaxDcV')} /></Field>
          <Field label="MPPT Voltagem Mínima" unit="V"><Input type="number" value={state.equipment.inverterMpptMinV} onChange={updater('equipment','inverterMpptMinV')} /></Field>
          <Field label="MPPT Voltagem Máxima" unit="V"><Input type="number" value={state.equipment.inverterMpptMaxV} onChange={updater('equipment','inverterMpptMaxV')} /></Field>
          <Field label="Corrente Max Entrada CC" unit="A"><Input type="number" value={state.equipment.inverterMaxI} onChange={updater('equipment','inverterMaxI')} /></Field>
          <Field label="Eficiência Euro" unit="%"><Input type="number" step="0.1" value={state.equipment.inverterEfficiency} onChange={updater('equipment','inverterEfficiency')} /></Field>
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
          <Field label="DoD (Profundidade Max)" unit="%"><Input type="number" value={state.equipment.batteryDod} onChange={updater('equipment','batteryDod')} /></Field>
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
          <Field label="Autonomia Desejada (Off/Híbr." unit="Dias"><Input type="number" step="0.5" value={state.sizing.autonomyDays} onChange={updater('sizing','autonomyDays')} /></Field>
          <Field label="Oversize (Margem)" unit="%">
            <Select value={state.sizing.oversizingFactor} onChange={updater('sizing','oversizingFactor')}>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
            </Select>
          </Field>
          <Field label="Relação CC/CA Máx" unit="">
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
          <Field label="Sombreamento e Horizonte" unit="%"><Input type="number" step="0.1" value={state.sizing.losses.shading} onChange={(e: any) => update('sizing', 'losses', {...state.sizing.losses, shading: Number(e.target.value)})} /></Field>
          <Field label="Sujidade (Soiling)" unit="%"><Input type="number" step="0.1" value={state.sizing.losses.soiling} onChange={(e: any) => update('sizing', 'losses', {...state.sizing.losses, soiling: Number(e.target.value)})} /></Field>
          <Field label="Mismatch (Diodos/Degrad.)" unit="%"><Input type="number" step="0.1" value={state.sizing.losses.mismatch} onChange={(e: any) => update('sizing', 'losses', {...state.sizing.losses, mismatch: Number(e.target.value)})} /></Field>
          <Field label="Perdas Resistivas Cabos" unit="%"><Input type="number" step="0.1" value={state.sizing.losses.cabling} onChange={(e: any) => update('sizing', 'losses', {...state.sizing.losses, cabling: Number(e.target.value)})} /></Field>
        </Block>
      </div>
    );
  }

  if (currentTab === 'financeiro') {
    return (
      <div className="animate-in fade-in duration-300">
        <Block title="Inputs Econômicos e Valuation">
          <Field label="CAPEX: Preço por Wp Base" unit="R$/Wp"><Input type="number" step="0.01" value={state.finance.capexPerWp} onChange={updater('finance','capexPerWp')} /></Field>
          <Field label="CAPEX: Preço Bateria Unid." unit="R$"><Input type="number" step="10" value={state.finance.batteryCostPerUnit} onChange={updater('finance','batteryCostPerUnit')} /></Field>
          <Field label="OPEX Anual Estimado" unit="R$/ano"><Input type="number" value={state.finance.opexYearly} onChange={updater('finance','opexYearly')} /></Field>
          <Field label="Tarifa Energia Atual" unit="R$/kWh"><Input type="number" step="0.01" value={state.finance.energyTariff} onChange={updater('finance','energyTariff')} /></Field>
          <Field label="Inflação Tarifária (Anual)" unit="%"><Input type="number" step="0.5" value={state.finance.tariffInflation} onChange={updater('finance','tariffInflation')} /></Field>
          <Field label="Taxa de Desconto (TMA)" unit="%/ano"><Input type="number" step="0.1" value={state.finance.discountRate} onChange={updater('finance','discountRate')} /></Field>
          <Field label="Prazo de Análise" unit="Anos"><Input type="number" value={state.finance.analysisYears} onChange={updater('finance','analysisYears')} /></Field>
        </Block>
      </div>
    );
  }

  return <div>Selecione o módulo na barra lateral.</div>;
}
