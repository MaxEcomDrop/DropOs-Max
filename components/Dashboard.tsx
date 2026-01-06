
import React, { useState, useEffect } from 'react';
import { Quote, Package, DollarSign, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Dashboard: React.FC<{ isOlheiro: boolean, theme: 'light' | 'dark' }> = ({ isOlheiro }) => {
  const [stats, setStats] = useState({ products: 0, sales: 0, profit: 0 });

  useEffect(() => {
    const loadStats = async () => {
      if (!supabase) return;
      const { count: pCount } = await supabase.from('produtos').select('*', { count: 'exact', head: true });
      const { data: vData } = await supabase.from('vendas').select('valor_liquido');
      const profit = vData?.reduce((acc, v) => acc + v.valor_liquido, 0) || 0;
      setStats({ products: pCount || 0, sales: vData?.length || 0, profit });
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="nu-card bg-[#820AD1] text-white flex items-center gap-4 py-4 px-6 border-none shadow-lg shadow-[#820AD1]/20">
        <Quote size={20} className="opacity-50" />
        <p className="text-sm font-medium italic">"O lucro é o oxigênio da sua empresa. Não pare de respirar."</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="nu-card flex flex-col justify-between group hover:border-[#820AD1]/50 transition-all">
           <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Lucro Acumulado</span>
              <DollarSign size={16} className="text-[#03D56F]" />
           </div>
           <div className={`text-3xl font-bold tracking-tighter ${isOlheiro ? 'blur-md' : 'text-[#03D56F]'}`}>
              {stats.profit.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
           </div>
        </div>

        <div className="nu-card flex flex-col justify-between group hover:border-[#820AD1]/50 transition-all">
           <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">SKUs em Estoque</span>
              <Package size={16} className="text-[#820AD1]" />
           </div>
           <div className="text-3xl font-bold tracking-tighter">{stats.products} <span className="text-xs text-[var(--text-muted)] font-normal">Cadastrados</span></div>
        </div>

        <div className="nu-card flex flex-col justify-between group hover:border-[#820AD1]/50 transition-all">
           <div className="flex justify-between items-start">
              <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Vendas Totais</span>
              <ShoppingBag size={16} className="text-[#820AD1]" />
           </div>
           <div className="text-3xl font-bold tracking-tighter">{stats.sales} <span className="text-xs text-[var(--text-muted)] font-normal">Pedidos</span></div>
        </div>
      </div>
    </div>
  );
};
