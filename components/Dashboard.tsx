
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Target, Activity, Wallet, Sparkles, Award, 
  Flame, Zap, ArrowUpRight, ArrowDownRight, Users, 
  Clock, ShieldAlert, BarChart3, PieChart, Layers, 
  Percent, ShoppingBag, Landmark, Briefcase, Rocket,
  Info
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { storage } from '../lib/storage';
import { Venda, LancamentoFinanceiro, EstatisticasUsuario } from '../types';
import { motion } from 'framer-motion';

export const Dashboard: React.FC<{ isOlheiro: boolean, visualMode: string }> = ({ isOlheiro, visualMode }) => {
  const [data, setData] = useState({ 
    sales: [] as Venda[], 
    finance: [] as LancamentoFinanceiro[], 
    config: storage.configuracoes.obter(),
    stats: storage.usuario.obterEstats()
  });

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

  // MOTOR DE SIMULAÇÃO - APLICA MULTIPLICADOR EM TODO O BI
  const bi = useMemo(() => {
    const mult = visualMode === 'milionario' ? 1000 : (visualMode === 'rico' ? 50 : 1);
    
    const totalVendas = data.sales.length > 0 ? data.sales.length : (visualMode !== 'normal' ? 1250 : 0);
    
    // Se não houver dados e estiver em modo simulação, injetamos valores base para visualização
    const baseFat = data.sales.reduce((acc, s) => acc + (s.faturamento_bruto || 0), 0) || (visualMode !== 'normal' ? 1500 : 0);
    const baseLucro = data.sales.reduce((acc, s) => acc + (s.lucro_real || 0), 0) || (visualMode !== 'normal' ? 450 : 0);
    const baseAds = data.sales.reduce((acc, s) => acc + (s.custo_ads || 0), 0) || (visualMode !== 'normal' ? 300 : 0);
    const baseTaxas = data.sales.reduce((acc, s) => acc + (s.taxas_plataforma || 0), 0) || (visualMode !== 'normal' ? 225 : 0);
    const baseCmv = data.sales.reduce((acc, s) => acc + (s.custo_mercadoria_total || 0), 0) || (visualMode !== 'normal' ? 400 : 0);

    const fatBruto = baseFat * mult;
    const lucroLiquido = baseLucro * mult;
    const taxasTotal = baseTaxas * mult;
    const adsTotal = baseAds * mult;
    const cmvTotal = baseCmv * mult;
    
    const ticketMedio = totalVendas > 0 ? fatBruto / totalVendas : 0;
    const roas = adsTotal > 0 ? fatBruto / adsTotal : (visualMode !== 'normal' ? 5.2 : 0);
    const roiMedio = adsTotal > 0 ? (lucroLiquido / adsTotal) * 100 : (visualMode !== 'normal' ? 150 : 0);
    const margemLucro = fatBruto > 0 ? (lucroLiquido / fatBruto) * 100 : (visualMode !== 'normal' ? 30 : 0);
    const cac = totalVendas > 0 ? (adsTotal / totalVendas) : 0;
    const cpp = totalVendas > 0 ? (adsTotal + cmvTotal + taxasTotal) / totalVendas : 0;
    
    const baseFixas = data.finance.filter(f => f.tipo === 'Despesa' && (f.is_fixo || f.categoria === 'Fixo')).reduce((a,b)=>a+(b.valor || 0), 0) || (visualMode !== 'normal' ? 2000 : 0);
    const baseVar = data.finance.filter(f => f.tipo === 'Despesa' && !f.is_fixo && f.categoria !== 'Fixo').reduce((a,b)=>a+(b.valor || 0), 0) || (visualMode !== 'normal' ? 800 : 0);
    
    const despesasFixas = baseFixas * mult;
    const despesasVar = baseVar * mult;
    const saldoCofre = lucroLiquido - despesasFixas - despesasVar;
    
    const pontoEquilibrio = (despesasFixas + despesasVar) / (margemLucro > 0 ? margemLucro / 100 : 0.01);
    const markupMedio = cmvTotal > 0 ? fatBruto / cmvTotal : (visualMode !== 'normal' ? 3.5 : 0);
    const eficienciaPlataforma = fatBruto > 0 ? (1 - (taxasTotal / fatBruto)) * 100 : 92;
    const metaPercent = Math.min((fatBruto / (data.config.metas.mensal || 1)) * 100, (visualMode !== 'normal' ? 88 : 0));

    return { 
      totalVendas, fatBruto, lucroLiquido, taxasTotal, adsTotal, cmvTotal,
      ticketMedio, roas, roiMedio, margemLucro, cac, cpp, despesasFixas, 
      despesasVar, saldoCofre, pontoEquilibrio, markupMedio, eficienciaPlataforma, 
      metaPercent, ebitda: lucroLiquido - despesasFixas
    };
  }, [data, visualMode]);

  const fmt = (v?: number | null) => {
    if (isOlheiro) return 'R$ ****';
    const val = Number(v ?? 0);
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const metrics = [
    { label: 'Lucro Líquido', val: bi.lucroLiquido, icon: <TrendingUp size={20}/>, color: 'text-[var(--nu-success)]', size: 'large' },
    { label: 'Faturamento Bruto', val: bi.fatBruto, icon: <Wallet size={20}/>, color: 'text-[var(--text-main)]', size: 'large' },
    { label: 'Saldo em Cofre', val: bi.saldoCofre, icon: <Landmark size={20}/>, color: 'text-[var(--nu-purple)]', size: 'large' },
    { label: 'ROI Estratégico', val: `${bi.roiMedio.toFixed(1)}%`, icon: <Rocket size={20}/>, color: 'text-yellow-500', size: 'normal' },
    { label: 'ROAS (Ads)', val: `${bi.roas.toFixed(2)}x`, icon: <Zap size={20}/>, color: 'text-cyan-500', size: 'normal' },
    { label: 'Ticket Médio', val: bi.ticketMedio, icon: <ShoppingBag size={20}/>, color: 'text-blue-500', size: 'normal' },
    { label: 'EBITDA Operacional', val: bi.ebitda, icon: <Activity size={20}/>, color: 'text-emerald-500', size: 'normal' },
    { label: 'Markup Global', val: `${bi.markupMedio.toFixed(2)}x`, icon: <ArrowUpRight size={20}/>, color: 'text-pink-500', size: 'normal' },
    { label: 'CAC (Aquisição)', val: bi.cac, icon: <Users size={20}/>, color: 'text-orange-500', size: 'normal' },
    { label: 'Custo por Pedido', val: bi.cpp, icon: <Layers size={20}/>, color: 'text-red-500', size: 'normal' },
    { label: 'Despesas Fixas', val: bi.despesasFixas, icon: <Briefcase size={20}/>, color: 'text-red-600', size: 'normal' },
    { label: 'Variáveis/Op', val: bi.despesasVar, icon: <Layers size={20}/>, color: 'text-orange-600', size: 'normal' },
    { label: 'Ponto de Equilíbrio', val: bi.pontoEquilibrio, icon: <Target size={20}/>, color: 'text-[var(--text-muted)]', size: 'normal' },
    { label: 'Margem Líquida', val: `${bi.margemLucro.toFixed(1)}%`, icon: <Percent size={20}/>, color: 'text-green-600', size: 'normal' },
    { label: 'Eficiência Fiscal', val: `${bi.eficienciaPlataforma.toFixed(1)}%`, icon: <ShieldAlert size={20}/>, color: 'text-blue-600', size: 'normal' },
    { label: 'Volume de Pedidos', val: bi.totalVendas, icon: <ShoppingBag size={20}/>, color: 'text-[var(--text-muted)]', size: 'normal' },
    { label: 'Custo Mercadoria', val: bi.cmvTotal, icon: <Layers size={20}/>, color: 'text-red-700', size: 'normal' },
    { label: 'Budget Marketing', val: bi.adsTotal, icon: <Zap size={20}/>, color: 'text-cyan-700', size: 'normal' },
    { label: 'Taxas e Tributos', val: bi.taxasTotal, icon: <ArrowDownRight size={20}/>, color: 'text-orange-700', size: 'normal' },
    { label: 'Status do Fluxo', val: bi.saldoCofre > 0 ? 'ESTÁVEL' : 'ALERTA', icon: <Activity size={20}/>, color: bi.saldoCofre > 0 ? 'text-green-500' : 'text-red-500', size: 'normal' }
  ];

  return (
    <div className="flex flex-col gap-10 pb-32 text-left max-w-[1600px] mx-auto">
      
      {/* HEADER DE PATENTE E META - MAIOR E MAIS IMPONENTE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <motion.div 
           initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
           className="nu-card p-10 bg-[var(--bg-card)] border-[var(--nu-purple)]/20 shadow-2xl relative overflow-hidden flex items-center gap-8"
         >
            <div className="absolute -right-4 -bottom-4 opacity-5"><Award size={160}/></div>
            <div className="w-24 h-24 rounded-[36px] bg-[var(--bg-input)] flex items-center justify-center border-4 border-[var(--nu-purple)]/30 shadow-inner">
               <Award size={48} className="text-[var(--nu-purple)]" />
            </div>
            <div>
               <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-1">Operador Patenteado</p>
               <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-main)]">{isOlheiro ? 'HIDDEN' : data.stats.patente}</h2>
               <div className="flex items-center gap-3 mt-3">
                  <span className="bg-[var(--nu-purple)] text-white text-[11px] font-black px-3 py-1 rounded-lg italic">NÍVEL {data.stats.nivel}</span>
                  <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">{isOlheiro ? '****' : `${data.stats.experiencia.toLocaleString()} XP`}</span>
               </div>
            </div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
           className="xl:col-span-2 nu-card p-10 relative overflow-hidden group"
         >
            <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:opacity-10 transition-all"><Flame size={140}/></div>
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] mb-2 flex items-center gap-3">
                    <Target size={20} className="text-[var(--nu-error)]" /> ALVO ESTRATÉGICO MENSAL
                  </h3>
                  <p className="text-4xl font-black italic text-[var(--text-main)] tracking-tighter">
                    {bi.metaPercent.toFixed(1)}% <span className="text-lg text-[var(--text-muted)] not-italic font-bold ml-2">DA OPERAÇÃO CONCLUÍDA</span>
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-[var(--nu-purple)] uppercase mb-1 tracking-widest">OBJETIVO: {fmt(data.config.metas.mensal)}</p>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">ATUAL: {fmt(bi.fatBruto)}</p>
               </div>
            </div>
            <div className="h-6 bg-[var(--bg-input)] rounded-full overflow-hidden p-1.5 border border-[var(--border-color)]">
               <motion.div initial={{ width: 0 }} animate={{ width: `${bi.metaPercent}%` }} className="h-full xp-bar-fire rounded-full shadow-[0_0_25px_rgba(130,10,209,0.5)]" />
            </div>
         </motion.div>
      </div>

      {/* MÉTRICAS PRINCIPAIS - CARDS GIGANTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {metrics.filter(m => m.size === 'large').map((m, i) => (
           <motion.div 
            key={i} whileHover={{ y: -10 }}
            className="nu-card p-10 flex flex-col gap-6 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-input)]"
           >
              <div className={`p-4 w-fit rounded-2xl bg-[var(--bg-primary)] ${m.color} shadow-lg`}>{m.icon}</div>
              <div>
                 <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">{m.label}</p>
                 <h4 className={`text-4xl font-black italic tracking-tighter ${m.color}`}>{fmt(m.val as number)}</h4>
              </div>
           </motion.div>
         ))}
      </div>

      {/* GRADE DE BI - REESTRUTURADA PARA SER MAIOR */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {metrics.filter(m => m.size === 'normal').map((item, i) => (
           <div key={i} className="nu-card p-8 flex flex-col gap-4 group hover:border-[var(--nu-purple)]/50 transition-all">
              <div className={`p-3 w-fit rounded-xl bg-[var(--bg-input)] ${item.color} group-hover:scale-110 transition-transform`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-[var(--text-muted)] opacity-60 mb-2 tracking-widest">{item.label}</p>
                 <h4 className={`text-xl font-black truncate ${item.color}`}>
                   {typeof item.val === 'string' ? (isOlheiro ? '****' : item.val) : fmt(item.val)}
                 </h4>
              </div>
           </div>
         ))}
      </div>

      {/* ÁREA DE ANÁLISE GRÁFICA - EXPANDIDA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="nu-card p-10">
            <div className="flex justify-between items-center mb-12">
               <h3 className="text-[13px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
                  <Activity size={24} className="text-[var(--nu-purple)]" /> ESCALABILIDADE DE CAMPO
               </h3>
               <div className="flex items-center gap-2 text-[10px] font-black text-[var(--nu-purple)] bg-[var(--nu-purple)]/10 px-4 py-2 rounded-full">
                  <Info size={14} /> DADOS SIMULADOS {visualMode.toUpperCase()}
               </div>
            </div>
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.sales.length > 0 ? data.sales.map((s, i) => ({ n: i+1, v: (s.faturamento_bruto || 0) * (visualMode === 'milionario' ? 1000 : (visualMode === 'rico' ? 50 : 1)) })) : Array.from({length: 10}).map((_,i)=>({n:i, v: Math.random()*5000* (visualMode === 'milionario' ? 1000 : (visualMode === 'rico' ? 50 : 1))}))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.2} />
                    <XAxis dataKey="n" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', fontSize: '12px', fontWeight: '800'}} />
                    <Area type="monotone" dataKey="v" stroke="var(--nu-purple)" fill="var(--nu-purple)" fillOpacity={0.1} strokeWidth={5} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="nu-card p-10">
            <h3 className="text-[13px] font-black uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
               <PieChart size={24} className="text-[var(--nu-info)]" /> COMPOSIÇÃO DE CUSTOS GLOBAIS
            </h3>
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Bruto', val: bi.fatBruto, fill: 'var(--nu-purple)' },
                    { name: 'Líquido', val: bi.lucroLiquido, fill: 'var(--nu-success)' },
                    { name: 'Ads', val: bi.adsTotal, fill: 'var(--nu-info)' },
                    { name: 'CMV', val: bi.cmvTotal, fill: 'var(--nu-error)' },
                    { name: 'Fixas', val: bi.despesasFixas, fill: '#FF8A00' }
                  ]}>
                     <XAxis dataKey="name" tick={{fontSize: 12, fill: 'var(--text-muted)', fontWeight: 800}} axisLine={false} tickLine={false} />
                     <YAxis hide />
                     <Tooltip cursor={{fill: 'rgba(130, 10, 209, 0.05)'}} contentStyle={{borderRadius: '20px', border: '1px solid var(--border-color)'}} />
                     <Bar dataKey="val" radius={[12, 12, 0, 0]} barSize={60} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};
