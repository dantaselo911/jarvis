import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Smartphone, 
  CheckCircle2, 
  XCircle,
  Calendar,
  ClipboardList,
  Target,
  ArrowUpRight,
  Activity,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Stats {
  balance: number;
  income: number;
  outcome: number;
}

interface Finance {
  id: number;
  amount: number;
  category: string;
  description: string;
  type: 'entrada' | 'saída';
  date: string;
}

export default function App() {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<any>({ isConnected: false, qrCode: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'config'>('dashboard');

  const fetchData = async () => {
    try {
      const [resDashboard, resStatus] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/status')
      ]);
      const dashboardData = await resDashboard.json();
      const statusData = await resStatus.json();
      
      setData(dashboardData);
      setStatus(statusData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white/50 font-mono tracking-widest text-xs">
      <motion.div 
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="flex items-center gap-3"
      >
        <Zap className="w-4 h-4 animate-pulse text-cyan-400" />
        SISTEMA.JARVIS_INICIANDO...
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center rotate-[-12deg] bg-white/5">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-bold tracking-tighter text-2xl uppercase italic">Jarvis</h1>
              <p className="stat-label">Assistente Neural v2.0</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] font-medium text-white/50">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`transition-all ${activeTab === 'dashboard' ? 'text-white border-b border-cyan-400 pb-1' : 'hover:text-white'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`transition-all ${activeTab === 'reports' ? 'text-white border-b border-cyan-400 pb-1' : 'hover:text-white'}`}
              >
                Relatórios
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={`transition-all ${activeTab === 'config' ? 'text-white border-b border-cyan-400 pb-1' : 'hover:text-white'}`}
              >
                Configurações
              </button>
            </nav>
            <div className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 border ${
              status.isConnected 
                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {status.isConnected ? 'Sistema Online' : 'Aguardando Autenticação'}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Hero Section */}
            <div className="mb-16">
              <h2 className="text-6xl md:text-8xl font-thin tracking-tight leading-none mb-4">
                Controle <span className="italic font-bold text-cyan-400">Total.</span>
              </h2>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="glass-button flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest">Nó em Tempo Real</span>
                </div>
                <p className="text-white/40 text-sm max-w-md font-light leading-relaxed">
                  Seu ecossistema financeiro está sendo monitorado pelo Jarvis. 
                  Todos os dados criptografados e sincronizados via WhatsApp.
                </p>
              </div>
            </div>

            {/* QR Code Section */}
            <AnimatePresence>
              {!status.isConnected && status.qrCode && (
                <motion.section 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-16 glass-card p-12 border-cyan-500/20 flex flex-col items-center gap-8"
                >
                  <div className="text-center">
                    <span className="stat-label mb-2 block">Autenticação de Sistema Requerida</span>
                    <h3 className="text-3xl font-light">Vincule o Jarvis ao seu Dispositivo</h3>
                  </div>
                  <div className="p-2 bg-white rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <img src={status.qrCode} alt="WhatsApp QR Code" className="w-64 h-64 grayscale contrast-125" />
                  </div>
                  <p className="stat-label text-white/20">Aguardando handshake WebSocket...</p>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 grid-flow-row border border-white/10 rounded-3xl overflow-hidden mb-16 bg-white/[0.02]">
              <StatPanel 
                label="Saldo Atual" 
                value={data?.stats.balance} 
                suffix="/ BRL"
                trend={12.5}
                active
              />
              <StatPanel 
                label="Total de Entradas" 
                value={data?.stats.income} 
                color="emerald" 
              />
              <StatPanel 
                label="Total de Saídas" 
                value={data?.stats.outcome} 
                color="rose" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-8 space-y-12">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-light flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5 text-cyan-400" />
                      Log de Transações
                    </h3>
                    <span className="stat-label">{data?.finances.length} Nós Ativos</span>
                  </div>
                  
                  <div className="space-y-1">
                    {data?.finances.map((f: Finance) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        key={f.id} 
                        className="group flex items-center justify-between p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                            f.type === 'entrada' 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 group-hover:scale-110' 
                              : 'bg-white/5 border-white/10 text-white group-hover:scale-110'
                          }`}>
                            {f.type === 'entrada' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          </div>
                          <div>
                            <p className="font-medium text-lg leading-tight uppercase tracking-tight">{f.description || f.category}</p>
                            <div className="flex gap-3 items-center">
                              <span className="stat-label text-white/30">{f.category}</span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="stat-label text-white/30">{new Date(f.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-2xl font-mono tracking-tighter ${f.type === 'entrada' ? 'text-emerald-400' : 'text-white'}`}>
                          {f.type === 'saída' ? '-' : '+'} R${f.amount.toFixed(2)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-16">
                <div>
                  <h4 className="stat-label mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Diretrizes Ativas
                  </h4>
                  <div className="space-y-4">
                    {data?.reminders.map((r: any) => (
                      <div key={r.id} className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col gap-3 group hover:border-cyan-400/30 transition-all">
                        <span className="text-white/80 font-medium leading-tight uppercase">{r.title}</span>
                        <div className="flex items-center justify-between">
                          <span className="stat-label text-cyan-400/60 font-bold">{r.due_date}</span>
                          <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="stat-label mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Objetivos Neurais
                  </h4>
                  <div className="space-y-8">
                    {data?.goals.map((g: any) => (
                      <div key={g.id} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-bold uppercase tracking-tight">{g.title}</span>
                          <span className="stat-label text-white/40">
                            {Math.round((g.current_amount / g.target_amount) * 100)}% Completo
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(100, (g.current_amount / g.target_amount) * 100)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.5)]" 
                          />
                        </div>
                        <div className="flex justify-between font-mono text-[10px] text-white/20">
                          <span>R$ {g.current_amount}</span>
                          <span>META R$ {g.target_amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-light mb-6 uppercase tracking-tighter">Relatórios Analíticos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="glass-card p-6 border-white/5">
                <span className="stat-label">Volume Mensal</span>
                <p className="text-2xl mt-2 font-mono">R$ {data?.stats.income.toFixed(2)}</p>
              </div>
              <div className="glass-card p-6 border-white/5">
                <span className="stat-label">Taxa de Queima</span>
                <p className="text-2xl mt-2 font-mono">R$ {data?.stats.outcome.toFixed(2)}</p>
              </div>
            </div>
            <p className="stat-label text-white/20 mt-12 italic border-t border-white/5 pt-8">
              A análise profunda da rede neural está processando seus dados passados. 
              Geração de relatório PDF disponível no próximo ciclo.
            </p>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 max-w-xl mx-auto">
            <h2 className="text-4xl font-light mb-12 uppercase tracking-tighter text-center">Protocolos Jarvis</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 glass-card">
                <div>
                  <p className="font-medium">Modo de Resposta</p>
                  <p className="text-xs text-white/40">Jarvis responde de forma curta e técnica.</p>
                </div>
                <div className="w-10 h-5 bg-cyan-400 rounded-full relative">
                   <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-black rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-6 glass-card opacity-50">
                <div>
                  <p className="font-medium">Sincronização Cloud</p>
                  <p className="text-xs text-white/40">Backup automático no Firebase Firestore Ativo.</p>
                </div>
                <CheckCircle2 className="text-emerald-400" />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <footer className="mt-32 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white/20 font-mono text-[9px] uppercase tracking-[0.3em]">
            Jarvis OS // Motor Financeiro Pessoal v2.0
          </div>
          <div className="flex gap-8 items-center opacity-30 grayscale saturate-0">
            <span className="stat-label">Firebase Firestore</span>
            <span className="stat-label">React 19</span>
            <span className="stat-label">Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatPanel({ label, value, color = 'white', trend = 0, suffix = '', active = false }: { 
  label: string, 
  value: number, 
  color?: string, 
  trend?: number, 
  suffix?: string,
  active?: boolean 
}) {
  return (
    <div className={`p-10 flex flex-col justify-between group transition-all duration-500 border-b md:border-b-0 md:border-r border-white/10 last:border-0 ${active ? 'bg-white/[0.03]' : 'hover:bg-white/[0.01]'}`}>
      <div>
        <div className="flex items-center justify-between mb-8">
          <span className="stat-label">{label}</span>
          {trend !== 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <ArrowUpRight size={12} />
              +{trend}%
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2 overflow-hidden">
          <h3 className={`text-4xl md:text-5xl font-mono font-bold tracking-tighter transition-colors duration-500 ${color === 'emerald' ? 'text-emerald-400/80' : color === 'rose' ? 'text-rose-400/80' : 'text-white'}`}>
            {(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <span className="text-white/20 text-xs font-mono">{suffix}</span>
        </div>
      </div>
      <div className="mt-12 h-[2px] w-full bg-white/5 overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full w-full ${active ? 'bg-cyan-400' : 'bg-white/20'}`} 
        />
      </div>
    </div>
  );
}
