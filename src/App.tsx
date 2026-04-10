import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Printer, Trash2, LayoutDashboard, Users, FolderOpen, Settings, Calculator, FileText, Eye, EyeOff, Sun, Moon, LogOut, HelpCircle, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- INTERFACES ---
interface LoadItem {
  id: string;
  nome: string;
  qtd: number;
  w: number;
  h: number;
  fatorPartida: number;
}

// --- COMPONENTE DE LOGIN (SIMULADO) ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-black text-2xl">SP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">SOLARPRO v26.0</h1>
          <p className="text-slate-500 mt-2">Engenharia e Dimensionamento Off-Grid</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:text-white" placeholder="E-mail" />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-xl border dark:bg-slate-900 dark:text-white" placeholder="Senha" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 text-slate-400">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Entrar no Sistema</button>
        </form>
      </div>
    </div>
  );
};

// --- APLICAÇÃO PRINCIPAL ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'dimensionamento' | 'suporte'>('dimensionamento');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Estados de Dimensionamento
  const [itens, setItens] = useState<LoadItem[]>([
    { id: '1', nome: "Geladeira Duplex", qtd: 1, w: 250, h: 24, fatorPartida: 5 },
    { id: '2', nome: "Bomba d'água 1/2cv", qtd: 1, w: 375, h: 1, fatorPartida: 7 },
  ]);
  
  const [potPainel, setPotPainel] = useState(550);
  const [tensao, setTensao] = useState(24);
  const [tipoBateria, setTipoBateria] = useState('LiFePO4');
  const [correnteMaxInversor, setCorrenteMaxInversor] = useState(150); // NOVO CAMPO
  const [comprimentoCabo, setComprimentoCabo] = useState(5);
  const [horasSolPleno, setHorasSolPleno] = useState(5.5);
  const [diasAutonomia, setDiasAutonomia] = useState(2);
  const [dod, setDod] = useState(90);
  const [capacidadeBateriaIndividual, setCapacidadeBateriaIndividual] = useState(280);
  const [tensaoBateriaIndividual, setTensaoBateriaIndividual] = useState(12);
  const [custoAhBateria, setCustoAhBateria] = useState(15);
  const [fatorCorrecaoConsumo, setFatorCorrecaoConsumo] = useState(20);
  const [eficienciaSistema, setEficienciaSistema] = useState(85);

  // --- LÓGICA DE ENGENHARIA (O CÉREBRO) ---
  const dimensionamento = useMemo(() => {
    let totalWh = 0;
    let cargaSimultaneaNominal = 0;
    let maiorSurtoIndividual = 0;
    let maiorWpItem = 0;

    itens.forEach(it => {
      const consumo = it.w * it.h * it.qtd;
      totalWh += consumo;
      cargaSimultaneaNominal += (it.w * it.qtd);
      const surto = it.w * it.fatorPartida;
      if (surto > maiorSurtoIndividual) {
        maiorSurtoIndividual = surto;
        maiorWpItem = it.w;
      }
    });

    const maiorPico = (cargaSimultaneaNominal - maiorWpItem) + maiorSurtoIndividual;
    const consumoCorrigido = totalWh * (1 + (fatorCorrecaoConsumo / 100));
    const hsp = horasSolPleno > 0 ? horasSolPleno : 5;
    const efisist = eficienciaSistema / 100;

    // Painéis
    const nP = Math.ceil(consumoCorrigido / (potPainel * hsp * efisist));
    const potenciaRealPainel = nP * potPainel;
    const geracaoDiaria = potenciaRealPainel * hsp * efisist;

    // Baterias
    const whNecessarioBanco = (consumoCorrigido * diasAutonomia) / ((dod / 100) * 0.95);
    const batAhTotalNecessario = whNecessarioBanco / tensao;
    const bateriasEmParalelo = Math.ceil(batAhTotalNecessario / capacidadeBateriaIndividual);
    const bateriasEmSerie = Math.ceil(tensao / tensaoBateriaIndividual);
    const totalBaterias = bateriasEmParalelo * bateriasEmSerie;
    
    // Correntes e Proteção
    const correntePicoInversor = maiorPico / tensao;
    const ampControlador = Math.ceil((potenciaRealPainel / tensao) * 1.25);
    const taxaDescargaSegura = (tipoBateria.includes('Lítio') || tipoBateria === 'LiFePO4') ? 1.0 : 0.2;
    const capacidadeDescargaMaxBanco = (bateriasEmParalelo * capacidadeBateriaIndividual) * taxaDescargaSegura;

    // Bitola do Cabo (Queda de Tensão 2%)
    const bitolasComerciais = [6, 10, 16, 25, 35, 50, 70, 95];
    const bitolaCalculada = (2 * comprimentoCabo * ampControlador * 0.0172) / (tensao * 0.02);
    const bitolaSugerida = bitolasComerciais.find(b => b >= bitolaCalculada) || 120;
    const quedaPercentual = ((2 * comprimentoCabo * ampControlador * 0.0172) / bitolaSugerida / tensao) * 100;

    // Alertas
    const alertas = [];
    if (correntePicoInversor > correnteMaxInversor) alertas.push(`ERRO INVERSOR: Pico de ${correntePicoInversor.toFixed(0)}A excede limite do equipamento (${correnteMaxInversor}A).`);
    if (correntePicoInversor > capacidadeDescargaMaxBanco) alertas.push(`RISCO BATERIA: Descarga de ${correntePicoInversor.toFixed(0)}A é perigosa para este banco (${capacidadeDescargaMaxBanco.toFixed(0)}A máx).`);
    if (quedaPercentual > 3) alertas.push("CABO: Queda de tensão acima de 3%. Perda de energia detectada.");

    return {
      maiorPico, nP, batAhTotalNecessario, ampControlador, bitolaSugerida, totalWh,
      consumoCorrigido, geracaoDiaria, totalBaterias, bateriasEmParalelo, bateriasEmSerie,
      quedaPercentual, alertas, protecao: {
        disjuntorBat: Math.ceil((maiorPico / tensao) * 1.25),
        disjuntorPainel: Math.ceil(ampControlador * 1.1)
      }
    };
  }, [itens, potPainel, tensao, horasSolPleno, diasAutonomia, dod, capacidadeBateriaIndividual, tensaoBateriaIndividual, correnteMaxInversor, comprimentoCabo, tipoBateria]);

  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      {/* Sidebar Simples */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-950 text-white transition-all p-4 hidden md:block`}>
        <div className="font-black text-xl mb-10 flex items-center gap-2">
          <Sun className="text-yellow-500" /> {!isSidebarCollapsed && "SOLARPRO"}
        </div>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab('dimensionamento')} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800"><Calculator size={20}/> {!isSidebarCollapsed && "Dimensionar"}</button>
          <button onClick={() => window.print()} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800"><Printer size={20}/> {!isSidebarCollapsed && "Imprimir"}</button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-800">
            {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>} {!isSidebarCollapsed && "Tema"}
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dimensionamento Off-Grid</h1>
            <p className="opacity-60">Projeto técnico profissional para sistemas isolados</p>
          </div>
          <div className="bg-blue-600 text-white p-3 rounded-2xl font-bold shadow-lg">MGS SYSTEM SOLAR</div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna de Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Calculator className="text-blue-600"/> Cargas do Sistema</h2>
                <button onClick={() => setItens([...itens, { id: Date.now().toString(), nome: "Nova Carga", qtd: 1, w: 100, h: 5, fatorPartida: 1 }])} className="bg-blue-50 text-blue-600 p-2 rounded-xl text-sm font-bold">+ Adicionar</button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="opacity-50 border-b">
                  <th className="text-left pb-2">Equipamento</th><th className="pb-2">W</th><th className="pb-2">Partida</th><th className="pb-2">H/Dia</th><th className="pb-2"></th>
                </tr></thead>
                <tbody>
                  {itens.map(item => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3"><input className="bg-transparent font-medium outline-none" value={item.nome} onChange={(e) => setItens(itens.map(i => i.id === item.id ? {...i, nome: e.target.value} : i))}/></td>
                      <td className="text-center"><input type="number" className="w-16 bg-slate-100 dark:bg-slate-900 p-1 rounded" value={item.w} onChange={(e) => setItens(itens.map(i => i.id === item.id ? {...i, w: Number(e.target.value)} : i))}/></td>
                      <td className="text-center"><input type="number" className="w-12 bg-slate-100 dark:bg-slate-900 p-1 rounded" value={item.fatorPartida} onChange={(e) => setItens(itens.map(i => i.id === item.id ? {...i, fatorPartida: Number(e.target.value)} : i))}/></td>
                      <td className="text-center"><input type="number" className="w-12 bg-slate-100 dark:bg-slate-900 p-1 rounded" value={item.h} onChange={(e) => setItens(itens.map(i => i.id === item.id ? {...i, h: Number(e.target.value)} : i))}/></td>
                      <td className="text-right"><button onClick={() => setItens(itens.filter(i => i.id !== item.id))}><Trash2 size={16} className="text-red-400"/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold opacity-50 block mb-2">HSP (SOL PLENO)</label>
                <input type="number" step="0.1" value={horasSolPleno} onChange={(e) => setHorasSolPleno(Number(e.target.value))} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold"/>
              </div>
              <div>
                <label className="text-xs font-bold opacity-50 block mb-2">TENSÃO SISTEMA</label>
                <select value={tensao} onChange={(e) => setTensao(Number(e.target.value))} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold">
                  <option value={12}>12V</option><option value={24}>24V</option><option value={48}>48V</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold opacity-50 block mb-2">CORRENTE MÁX INVERSOR (A)</label>
                <input type="number" value={correnteMaxInversor} onChange={(e) => setCorrenteMaxInversor(Number(e.target.value))} className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold text-red-500"/>
              </div>
            </section>
          </div>

          {/* Resultados Laterais */}
          <div className="space-y-6">
            <div className="bg-slate-950 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Sun size={100}/></div>
               <h3 className="text-yellow-500 font-black uppercase tracking-widest text-xs mb-4">Resultado do Dimensionamento</h3>
               <div className="space-y-6">
                 <div><p className="text-sm opacity-60 uppercase font-bold">Inversor Mínimo (Pico)</p><div className="text-5xl font-black">{dimensionamento.maiorPico}W</div></div>
                 <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                   <div><p className="text-[10px] opacity-40 font-bold uppercase">Painéis ({potPainel}W)</p><div className="text-2xl font-bold">{dimensionamento.nP} un</div></div>
                   <div><p className="text-[10px] opacity-40 font-bold uppercase">Baterias (Ah)</p><div className="text-2xl font-bold">{dimensionamento.totalBaterias} un</div></div>
                   <div><p className="text-[10px] opacity-40 font-bold uppercase">Bitola Cabo</p><div className="text-2xl font-bold">{dimensionamento.bitolaSugerida}mm²</div></div>
                   <div><p className="text-[10px] opacity-40 font-bold uppercase">Controlador</p><div className="text-2xl font-bold text-blue-400">{dimensionamento.ampControlador}A</div></div>
                 </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold flex items-center gap-2 mb-4"><ShieldCheck className="text-green-500"/> String Box & Proteção</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="text-sm font-medium opacity-70">Disjuntor Bateria</span><span className="font-black">{dimensionamento.protecao.disjuntorBat}A DC</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="text-sm font-medium opacity-70">Disjuntor Painéis</span><span className="font-black">{dimensionamento.protecao.disjuntorPainel}A DC</span>
                </div>
              </div>
            </div>

            {dimensionamento.alertas.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/30">
                <h4 className="text-amber-600 font-bold flex items-center gap-2 mb-2"><AlertTriangle size={20}/> Alertas Técnicos</h4>
                <ul className="text-xs space-y-2 font-medium text-amber-800 dark:text-amber-400">
                  {dimensionamento.alertas.map((a, i) => <li key={i}>• {a}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
