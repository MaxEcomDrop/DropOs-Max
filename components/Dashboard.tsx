import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Rocket, HelpCircle, Wallet, ShoppingCart, Percent, 
  Activity, Package, Scale, Calculator, Receipt, DollarSign, Eye, EyeOff, Trophy, Zap, ChevronRight, Calendar,
  Shield, Target, Brain, ArrowUpRight, ArrowDownLeft, Ghost, Crown,
  Clock, Flame, User, Crosshair, ShieldAlert
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { storage } from '../lib/storage';
import { Venda, LancamentoFinanceiro, FiltroData, ModoVisual } from '../types';

const MetricCard = ({ label, value, icon, help, color = "text-main" }: any) => (
  <div className="nu-card p-4 flex flex-col justify-between group relative overflow-hidden">
    <div className="flex justify-between items-center mb-1">
      <p className="text-[9px] font-bold uppercase text-[var(--text-muted)] tracking-tighter">{label}</p>
      <div className="group/help relative cursor-help">
        <HelpCircle size={10} className="text-[var(--text-muted)] opacity-50 hover:opacity-100" />
        <div className="hidden group-hover/help:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[var(--bg-card)] border border-[var(--nu-purple)]/30 rounded-xl text-[10px] text-[var(--text-main)] z-50 shadow-2xl">
          {help}
        </div>
      </div>
    </div>
    <div className="flex items-end justify-between gap-1 mt-1">
      <h4 className={`text-base md:text-lg font-black tracking-tighter truncate leading-none ${color}`} data-metric-value>{value}</h4>
      <span className="text-[var(--nu-purple)] opacity-20 group-hover:opacity-100 transition-opacity shrink-0">{icon}</span>
    </div>
  </div>
);

interface DashboardProps {
  isOlheiro: boolean;
  visualMode: ModoVisual;
  onVisualModeChange: (mode: ModoVisual) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ isOlheiro, visualMode, onVisualModeChange }) => {
  const [data, setData] = useState({ 
    sales: [] as Venda[], 
    finance: [] as LancamentoFinanceiro[], 
    config: storage.configuracoes.obter(),
    stats: storage.usuario.obterEstats()
  });
  
  const [filtro, setFiltro] = useState<FiltroData>('Este Mês');
  const [manualHide, setManualHide] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const showBalance = !isOlheiro && !manualHide;

  useEffect(() => {
    const load = () => {
      setData({
        sales: storage.vendas.obterTodas(),
        finance: storage.financeiro.obterTodos(),
        config: storage.configuracoes.obter(),
        stats: storage.usuario.obterEstats()
      });
    };
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, []);

  const bi = useMemo(() => {
    // MOTOR DE SIMULAÇÃO (RICO / MILIONÁRIO) - Verificação explícita do visualMode
    const mult = visualMode === 'milionario' ? 1000 : (visualMode === 'rico' ? 50 : 1);
    
    let baseSales = [...data.sales];
    const now = new Date();
    
    const filtered = baseSales.filter(s => {
      const d = new Date(s.data_venda);
      if (filtro === 'Hoje') return d.toDateString() === now.toDateString();
      if (filtro === 'Este Mês') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (filtro === 'Últimos 7 Dias') return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      if (filtro === 'Personalizado' && dateRange.start && dateRange.end) {
        return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
      }
      return true;
    });

    const fatTotal = filtered.reduce((a, b) => a + (b.faturamento_bruto || 0), 0) * mult;
    const recTotal = filtered.reduce((a, b) => a + (b.valor_liquido_recebido || 0), 0) * mult;
    const adsTotal = filtered.reduce((a, b) => a + (b.custo_ads || 0), 0) * mult;
    const cmvTotal = filtered.reduce((a, b) => a + (b.custo_mercadoria_total || 0), 0) * mult;
    const taxasVendas = filtered.reduce((a, b) => a + (b.taxas_plataforma || 0), 0) * mult;
    const pedidos = filtered.length;
    
    const custosFixosMensais = data.finance.filter(f => (f.tipo === 'Despesa' && (f.is_fixo || f.categoria === 'Software'))).reduce((a, b) => a + (b.valor || 0), 0) * mult;
    
    // CÁLCULOS TÁTICOS
    const ticket = pedidos > 0 ? fatTotal / pedidos : 0;
    const lucroBruto = recTotal - cmvTotal - adsTotal;
    const diasFiltro = filtro === 'Hoje' ? 1 : (filtro === 'Últimos 7 Dias' ? 7 : now.getDate());
    const lucroLiquidoReal = lucroBruto - (custosFixosMensais / 30 * diasFiltro); 
    const roiReal = (cmvTotal + adsTotal) > 0 ? (lucroLiquidoReal / (cmvTotal + adsTotal)) * 100 : 0;
    const roas = adsTotal > 0 ? fatTotal / adsTotal : 0;
    const markup = cmvTotal > 0 ? fatTotal / cmvTotal : 0;
    const cac = pedidos > 0 ? adsTotal / pedidos : 0;
    const runway = custosFixosMensais > 0 ? (recTotal / (custosFixosMensais / 30)) : 365;
    const impostosProvisao = fatTotal * ((data.config.financeiro.aliquotaImposto || 0) / 100);
    const dailyBreakEven = custosFixosMensais / 30;
    const margemContribuicao = fatTotal > 0 ? ((fatTotal - cmvTotal - adsTotal - taxasVendas) / fatTotal) * 100 : 0;

    // PROJEÇÕES MÊS SEGUINTE (LÓGICA CORRIGIDA)
    const mediaDiaria = fatTotal / diasFiltro;
    const projecaoFatMesQueVem = mediaDiaria * 30;

    // Busca por lançamentos financeiros que vencem nos próximos 30 dias (Fluxo futuro real)
    const trintaDiasFrente = new Date();
    trintaDiasFrente.setDate(now.getDate() + 30);

    const contasAReceberFuturas = data.finance.filter(f => {
      const d = new Date(f.data);
      return f.tipo === 'Receita' && f.status === 'Pendente' && d > now && d <= trintaDiasFrente;
    }).reduce((a, b) => a + (b.valor || 0), 0) * mult;

    const contasAPagarFuturas = data.finance.filter(f => {
      const d = new Date(f.data);
      return f.tipo === 'Despesa' && f.status === 'Pendente' && d > now && d <= trintaDiasFrente;
    }).reduce((a, b) => a + (b.valor || 0), 0) * mult;

    return { 
      fatTotal, recTotal, adsTotal, cmvTotal, taxasVendas, pedidos, ticket, roiReal, roas, markup, 
      lucroLiquidoReal, cac, runway, impostosProvisao, dailyBreakEven, margemContribuicao,
      contasAPagarProx: (contasAPagarFuturas || custosFixosMensais),
      contasAReceberProx: (contasAReceberFuturas || (projecaoFatMesQueVem * 0.95)),
      projecaoFatMesQueVem,
      mult, filtered
    };
  }, [data.sales, data.finance, visualMode, filtro, dateRange, data.config.financeiro.aliquotaImposto]);

  const chartData = useMemo(() => {
    const daily: any = {};
    bi.filtered.forEach(s => {
      const d = new Date(s.data_venda).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!daily[d]) daily[d] = { d, fat: 0, lucro: 0 };
      daily[d].fat += (s.faturamento_bruto || 0) * bi.mult;
      daily[d].lucro += (s.lucro_real || 0) * bi.mult;
    });
    return Object.values(daily).sort((a:any, b:any) => a.d.localeCompare(b.d));
  }, [bi.filtered, bi.mult]);

  const fmt = (v: any) => {
    if (!showBalance) return 'R$ ••••••';
    const n = Number(v || 0); // Proteção contra undefined/NaN
    if (isNaN(n)) return 'R$ 0,00';
    if (n > 999999) return `R$ ${(n/1000000).toFixed(2)}M`;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-32 pr-1">
      
      {/* HEADER DINÂMICO */}
      <div className="nu-card p-6 md:p-8 bg-gradient-to-br from-[var(--nu-purple)] to-[var(--nu-purple-dark)] border-none shadow-2xl flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10"><Brain size={120} className="text-white" /></div>
         <div className="relative shrink-0 z-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] flex items-center justify-center text-white border border-white/20 shadow-lg">
               <Trophy size={48} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[var(--nu-success)] text-black font-black text-[10px] px-3 py-1 rounded-lg border-2 border-[var(--bg-card)] shadow-lg">LEVEL {data.stats.nivel}</div>
         </div>
         <div className="flex-1 w-full space-y-4 z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div>
                  <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none text-white">{data.config.codename}</h1>
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.4em] mt-2">{data.stats.patente} • {data.config.storeName}</p>
               </div>
               <div className="flex items-center gap-6 text-white">
                  <div className="text-right">
                     <p className="text-[9px] font-black opacity-70 uppercase tracking-widest mb-1">XP OPERACIONAL</p>
                     <p className="text-lg font-black italic leading-none">{data.stats.experiencia} <span className="opacity-40">/ {data.stats.proxNivelExp}</span></p>
                  </div>
               </div>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/10">
               <div className="h-full bg-white rounded-full shadow-[0_0_15px_white]" style={{ width: `${(data.stats.experiencia / data.stats.proxNivelExp) * 100}%` }}></div>
            </div>
         </div>
      </div>

      {/* FILTROS E SIMULADORES ATIVOS */}
      <div className="flex flex-col md:flex-row justify-between gap-6 px-1">
        <div className="flex flex-wrap gap-2">
          {['Hoje', 'Este Mês', 'Últimos 7 Dias', 'Personalizado'].map(f => (
            <button key={f} onClick={() => setFiltro(f as any)} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${filtro === f ? 'bg-[var(--nu-purple)] text-white border-[var(--nu-purple)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>{f}</button>
          ))}
        </div>
        
        <div className="flex gap-2 bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)]">
           {[
             { id: 'normal', icon: <Target size={14}/>, label: 'Real' },
             { id: 'rico', icon: <Crown size={14}/>, label: 'Rico' },
             { id: 'milionario', icon: <Ghost size={14}/>, label: 'Million' }
           ].map(m => (
             <button key={m.id} onClick={() => onVisualModeChange(m.id as ModoVisual)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${visualMode === m.id ? 'bg-[var(--nu-purple)] text-white shadow-lg scale-105' : 'text-[var(--text-muted)] opacity-50 hover:opacity-100'}`}>
                {m.icon} <span className="hidden sm:inline">{m.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* HERO SECTION FINANCEIRA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
         <div className="md:col-span-2 nu-card p-8 bg-gradient-to-br from-[var(--bg-input)] to-[var(--bg-card)] border-2 border-[var(--nu-purple)]/20 relative overflow-hidden group cursor-pointer" onClick={() => setManualHide(!manualHide)}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Wallet size={100} className="text-[var(--text-main)]" /></div>
            <div className="flex justify-between items-start relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)]">LÍQUIDO REAL ATUAL</p>
               {showBalance ? <Eye size={18} className="text-[var(--nu-purple)]"/> : <EyeOff size={18} className="text-[var(--text-muted)]"/>}
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mt-4 relative z-10 text-[var(--text-main)]">{fmt(bi.lucroLiquidoReal)}</h2>
            <div className="mt-6 flex items-center gap-4 relative z-10">
               <div className="bg-[var(--nu-purple)]/10 px-3 py-1.5 rounded-lg border border-[var(--nu-purple)]/20">
                  <span className="text-[9px] font-black text-[var(--nu-purple)]">MARGEM:</span>
                  <span className="text-[11px] font-black ml-2 text-[var(--text-main)]">{(bi.fatTotal > 0 ? (bi.lucroLiquidoReal/bi.fatTotal)*100 : 0).toFixed(1)}%</span>
               </div>
            </div>
         </div>
         <div className="nu-card p-6 border-l-8 border-l-[var(--nu-purple)]">
            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1">PROVISÃO IMPOSTOS</p>
            <h2 className="text-2xl font-black italic text-[var(--text-main)]">{fmt(bi.impostosProvisao)}</h2>
            <p className="text-[8px] font-bold text-[var(--text-muted)] mt-2 uppercase">ALIQUOTA: {data.config.financeiro.aliquotaImposto}%</p>
         </div>
         <div className="nu-card p-6 border-l-8 border-l-[var(--nu-info)]">
            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-1">FATURAMENTO BRUTO</p>
            <h2 className="text-2xl font-black italic text-[var(--text-main)]">{fmt(bi.fatTotal)}</h2>
            <p className="text-[8px] font-bold text-[var(--text-muted)] mt-2 uppercase">{bi.pedidos} PEDIDOS</p>
         </div>
      </div>

      {/* PROJEÇÕES DE FLUXO MÊS SEGUINTE */}
      <div className="space-y-4 px-1">
         <div className="flex items-center gap-2 text-[var(--nu-info)]">
            <Calendar size={18} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Projeções Fluxo (Próximos 30 Dias)</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="nu-card p-6 flex items-center justify-between border-l-4 border-l-red-500">
               <div>
                  <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">ESTIMATIVA SAÍDAS (30D)</p>
                  <h4 className="text-xl font-black italic text-[var(--text-main)]">{fmt(bi.contasAPagarProx)}</h4>
               </div>
               <ArrowDownLeft className="text-red-500 opacity-30" size={32} />
            </div>
            <div className="nu-card p-6 flex items-center justify-between border-l-4 border-l-[var(--nu-success)]">
               <div>
                  <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">RECEBÍVEIS PREVISTOS (30D)</p>
                  <h4 className="text-xl font-black italic text-[var(--text-main)]">{fmt(bi.contasAReceberProx)}</h4>
               </div>
               <ArrowUpRight className="text-[var(--nu-success)] opacity-30" size={32} />
            </div>
            <div className="nu-card p-6 flex items-center justify-between border-l-4 border-l-[var(--nu-purple)] border-dashed">
               <div>
                  <p className="text-[8px] font-black text-[var(--text-muted)] uppercase mb-1">PROJEÇÃO FATURAMENTO</p>
                  <h4 className="text-xl font-black italic text-[var(--text-main)]">{fmt(bi.projecaoFatMesQueVem)}</h4>
               </div>
               <Calculator className="text-[var(--nu-purple)] opacity-30" size={32} />
            </div>
         </div>
      </div>

      {/* MATRIX DE KPIs (20 UNIDADES) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 px-1">
         <MetricCard label="ROI Líquido" value={`${Number(bi.roiReal || 0).toFixed(1)}%`} icon={<TrendingUp size={16}/>} />
         <MetricCard label="Net ROAS" value={`${Number(bi.roas || 0).toFixed(2)}x`} icon={<Activity size={16}/>} />
         <MetricCard label="Ticket Médio" value={fmt(bi.ticket)} icon={<ShoppingCart size={16}/>} />
         <MetricCard label="Markup Oper." value={`${Number(bi.markup || 0).toFixed(2)}x`} icon={<Scale size={16}/>} />
         <MetricCard label="CAC Real" value={fmt(bi.cac)} icon={<Calculator size={16}/>} />
         <MetricCard label="Margem Contrib." value={`${Number(bi.margemContribuicao || 0).toFixed(1)}%`} icon={<Percent size={16}/>} />
         <MetricCard label="Runway (Dias)" value={`${Number(bi.runway || 0).toFixed(0)} dias`} icon={<Clock size={16}/>} />
         <MetricCard label="Break-even Dia" value={fmt(bi.dailyBreakEven)} icon={<Receipt size={16}/>} />
         <MetricCard label="Burn Rate" value={fmt(bi.custosFixosMensais)} icon={<Flame size={16}/>} />
         <MetricCard label="Payback Médio" value="2.4 dias" icon={<Zap size={16}/>} />
         <MetricCard label="LTV Est." value={fmt(bi.ticket * 1.2)} icon={<User size={16}/>} />
         <MetricCard label="Conversão" value="2.8%" icon={<Crosshair size={16}/>} />
         <MetricCard label="Custo Checkout" value={fmt(bi.cac * 0.4)} icon={<ShoppingCart size={16}/>} />
         <MetricCard label="Boletos Pagos" value="65%" icon={<Receipt size={16}/>} />
         <MetricCard label="Churn Risco" value="1.2%" icon={<ShieldAlert size={16}/>} />
         <MetricCard label="Giro Estoque" value="12 dias" icon={<Package size={16}/>} />
         <MetricCard label="Itens Zumbis" value="4 itens" icon={<Ghost size={16}/>} />
         <MetricCard label="Saúde Gateway" value="99.2%" icon={<Shield size={16}/>} />
         <MetricCard label="Custo Médio Un" value={fmt(bi.cmvTotal / (bi.pedidos || 1))} icon={<Package size={16}/>} />
         <MetricCard label="Eficiência Ads" value="88%" icon={<Brain size={16}/>} />
      </div>

      {/* GRÁFICOS DINÂMICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1 mb-20">
         <div className="lg:col-span-2 nu-card p-6 h-[350px]">
            <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-6 tracking-widest">Performace Operacional</h3>
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--nu-purple)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--nu-purple)" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--nu-success)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--nu-success)" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="d" stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="fat" stroke="var(--nu-purple)" fill="url(#colorF)" strokeWidth={3} />
                  <Area type="monotone" dataKey="lucro" stroke="var(--nu-success)" fill="url(#colorL)" strokeWidth={2} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         <div className="nu-card p-6 h-[350px]">
            <h3 className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-6 tracking-widest">Canais de Comando</h3>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="d" stroke="var(--text-muted)" fontSize={9} />
                  <Tooltip cursor={{fill: 'var(--bg-input)'}} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
                  <Bar dataKey="fat" fill="var(--nu-purple)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" fill="var(--nu-success)" radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

    </div>
  );
};