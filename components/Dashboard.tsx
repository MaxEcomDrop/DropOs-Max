
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Target, Activity, Shield, Calculator, Cpu, Sparkles, UserCheck, Wallet
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { storage } from '../lib/storage';
import { Venda, LancamentoFinanceiro } from '../types';
import { motion } from 'framer-motion';

export const Dashboard: React.FC<{ isOlheiro: boolean, visualMode: string, setIsOlheiro: any }> = ({ isOlheiro, visualMode }) => {
  const [data, setData] = useState({ 
    sales: [] as Venda[], 
    finance: [] as LancamentoFinanceiro[], 
    config: storage.configuracoes.obter()
  });

  useEffect(() => {
    const load = () => {
      setData({
        sales: storage.vendas.obterTodas(),
        finance: storage.financeiro.obterTodos(),
        config: storage.configuracoes.obter()
      });
    };
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, []);

  const bi = useMemo(() => {
    let salesData = [...data.sales];
    let financeData = [...data.finance];
    
    // Motor de Simulação Visual (Apenas visual, não salva)
    const mult = visualMode === 'milionario' ? 1000 : (visualMode === 'rico' ? 50 : 1);
    
    const fatBruto = salesData.reduce((acc, s) => acc + s.faturamento_bruto, 0) * mult;
    const lucroReal = salesData.reduce((acc, s) => acc + s.lucro_real, 0) * mult;
    const comissaoFunc = salesData.reduce((acc, s) => acc + (s.comissao_paga || 0), 0) * mult;
    
    const receitasExtra = financeData.filter(f => f.tipo === 'Receita').reduce((acc, f) => acc + f.valor, 0) * mult;
    const despesasExtra = financeData.filter(f => f.tipo === 'Despesa').reduce((acc, f) => acc + f.valor, 0) * mult;

    // Cálculo de Imposto Automático (Regime Fiscal)
    let imposto = 0;
    if (data.config.financeiro.regime === 'MEI') imposto = data.config.financeiro.valorDasMensal;
    else imposto = fatBruto * (data.config.financeiro.aliquotaImposto / 100);

    const saldoReal = (fatBruto + receitasExtra) - (despesasExtra + imposto + comissaoFunc);
    const metaRestante = Math.max(data.config.metas.mensal - fatBruto, 0);

    return { fatBruto, lucroReal, comissaoFunc, saldoReal, imposto, metaRestante };
  }, [data, visualMode]);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex flex-col gap-8 pb-20 text-left">
      
      {/* HEADER DE SALDO E COMISSÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 nu-card p-10 bg-gradient-to-br from-[var(--nu-purple)] to-[#3e0563] border-none text-white">
            <div className="flex items-center gap-6 mb-8">
               <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md"><Wallet size={32}/></div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Saldo Real em Caixa (Pós-Custos)</p>
                  <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter ${isOlheiro ? 'ghost-blur' : ''}`}>{fmt(bi.saldoReal)}</h2>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-black/20 rounded-2xl">
                  <p className="text-[8px] font-black uppercase opacity-50 mb-1">Comissões Devidas (Funcionário)</p>
                  <span className="text-xl font-black italic text-[var(--nu-info)]">{fmt(bi.comissaoFunc)}</span>
               </div>
               <div className="p-4 bg-black/20 rounded-2xl">
                  <p className="text-[8px] font-black uppercase opacity-50 mb-1">Impostos Provisionados</p>
                  <span className="text-xl font-black italic text-red-300">{fmt(bi.imposto)}</span>
               </div>
            </div>
         </div>

         <div className="nu-card p-10 flex flex-col justify-center items-center text-center gap-4">
            <Target size={40} className="text-[var(--nu-purple)] mb-2" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Meta de Faturamento</p>
            <h4 className="text-3xl font-black italic">{fmt(data.config.metas.mensal)}</h4>
            <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden p-0.5 mt-2">
               <div className="h-full xp-bar-fire rounded-full" style={{width: `${Math.min((bi.fatBruto/data.config.metas.mensal)*100, 100)}%`}} />
            </div>
            <p className="text-[9px] font-bold text-[var(--nu-purple)] uppercase mt-2">Restam {fmt(bi.metaRestante)} para o alvo</p>
         </div>
      </div>

      {/* GRÁFICOS ZERADOS POR PADRÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="nu-card p-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
               <TrendingUp size={18} className="text-[var(--nu-purple)]" /> CURVA DE FATURAMENTO REAL
            </h3>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.sales.length > 0 ? data.sales.map((s, i) => ({ n: i+1, v: s.faturamento_bruto })) : [{n:0, v:0}]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.1} />
                    <XAxis dataKey="n" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="v" stroke="var(--nu-purple)" fill="var(--nu-purple)" fillOpacity={0.1} strokeWidth={4} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="nu-card p-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
               <Activity size={18} className="text-[var(--nu-info)]" /> EFICIÊNCIA DE CANAL
            </h3>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sales.length > 0 ? [
                    { n: 'TikTok', v: data.sales.filter(s=>s.canal==='TikTok').length },
                    { n: 'Shopee', v: data.sales.filter(s=>s.canal==='Shopee').length },
                    { n: 'M. Livre', v: data.sales.filter(s=>s.canal==='Mercado Livre').length },
                  ] : [{n:'Sem Dados', v:0}]}>
                    <XAxis dataKey="n" tick={{fontSize: 10, fill: 'var(--text-muted)'}} />
                    <Bar dataKey="v" radius={[6,6,0,0]}>
                       {data.sales.map((_, i) => <Cell key={i} fill={['#820AD1', '#00E5FF', '#00FF9C'][i % 3]} />)}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* UTILITÁRIOS OPERACIONAIS FUNCIONAIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         <button onClick={() => {
           const sku = `DRP-${Math.random().toString(36).substring(2,6).toUpperCase()}-${new Date().getFullYear()}`;
           alert(`GERADOR SKU SUPREMO:\nSua sugestão de código único é: ${sku}`);
         }} className="nu-card p-8 hover:bg-[var(--nu-purple)] hover:text-white transition-all group flex flex-col items-center gap-3">
            <Cpu size={32} className="text-[var(--nu-purple)] group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest">Gerador SKU</span>
         </button>

         <button onClick={() => {
           const p = prompt("Valor de Venda Alvo (R$):", "197");
           const c = prompt("Custo do Produto (R$):", "40");
           const a = prompt("Custo de Ads Estimado (R$):", "30");
           if (p && c && a) {
             const lucro = Number(p) - Number(c) - Number(a);
             alert(`CALCULADORA ROI RÁPIDA:\nLucro por Unidade: ${fmt(lucro)}\nROI: ${((lucro/Number(a))*100).toFixed(1)}%`);
           }
         }} className="nu-card p-8 hover:bg-[var(--nu-purple)] hover:text-white transition-all group flex flex-col items-center gap-3">
            <Calculator size={32} className="text-[var(--nu-purple)] group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest">Simulador ROI</span>
         </button>

         <div className="nu-card p-8 flex flex-col items-center gap-3 opacity-50 cursor-not-allowed">
            <Sparkles size={32} className="text-[var(--nu-purple)]" />
            <span className="text-[10px] font-black uppercase tracking-widest">IA Copywriting</span>
         </div>

         <div className="nu-card p-8 flex flex-col items-center gap-3 opacity-50 cursor-not-allowed">
            <UserCheck size={32} className="text-[var(--nu-purple)]" />
            <span className="text-[10px] font-black uppercase tracking-widest">RH & Gestão</span>
         </div>
      </div>
    </div>
  );
};
