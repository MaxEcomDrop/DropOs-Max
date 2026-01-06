
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Flame, Trophy, TrendingUp, Target, Briefcase, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Sale } from '../types';

export const Dashboard: React.FC<{ isOlheiro: boolean, theme: 'light' | 'dark' }> = ({ isOlheiro }) => {
  const [data, setData] = useState({ products: 0, sales: 0, profit: 0 });

  useEffect(() => {
    const fetchRealData = async () => {
      if (!supabase) return;
      const { count: pCount } = await supabase.from('produtos').select('*', { count: 'exact', head: true });
      const { data: vData } = await supabase.from('vendas').select('valor_liquido');
      const profit = vData?.reduce((acc, v) => acc + v.valor_liquido, 0) || 0;
      setData({ products: pCount || 0, sales: vData?.length || 0, profit });
    };
    fetchRealData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="nu-card bg-[#820AD1] text-white flex items-center gap-4 py-4 px-6 border-none">
        <Quote size={20} className="opacity-50" />
        <p className="text-sm italic">"Vender é vaidade, lucro é sanidade, caixa é realidade."</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="nu-card flex flex-col justify-between h-32">
           <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Faturamento Real</span>
           <div className={`text-3xl font-bold tracking-tighter ${isOlheiro ? 'blur-md' : ''}`}>{data.profit.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
        </div>
        <div className="nu-card flex flex-col justify-between h-32">
           <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Produtos Ativos</span>
           <div className="text-3xl font-bold tracking-tighter">{data.products} <span className="text-xs text-[var(--text-muted)]">Unidades</span></div>
        </div>
        <div className="nu-card flex flex-col justify-between h-32">
           <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Vendas</span>
           <div className="text-3xl font-bold tracking-tighter">{data.sales} <span className="text-xs text-[var(--text-muted)]">Operações</span></div>
        </div>
      </div>
    </div>
  );
};
