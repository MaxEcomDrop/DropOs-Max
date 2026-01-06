
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingUp, Target, ShieldCheck, Flame, Trophy, Activity, AlertTriangle, Briefcase, Quote } from 'lucide-react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Sale, Product } from '../types';

interface DashboardProps { isOlheiro: boolean; theme: 'light' | 'dark'; }

const FRASES = [
  "O lucro é o aplauso que você recebe por servir bem o seu cliente.",
  "Estoque parado é dinheiro perdendo valor. Gire rápido!",
  "Sua margem é o seu oxigênio. Não venda sem saber quanto sobra.",
  "Vender é vaidade, lucro é sanidade, caixa é realidade.",
  "O segredo do sucesso é a constância no propósito."
];

export const Dashboard: React.FC<DashboardProps> = ({ isOlheiro, theme }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [frase, setFrase] = useState("");

  useEffect(() => {
    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)]);
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) return setLoading(false);
    const { data: sData } = await supabase.from('vendas').select('*');
    const { data: pData } = await supabase.from('produtos').select('*');
    setSales(sData || []);
    setProducts(pData || []);
    setLoading(false);
  };

  const formatCurrency = (val: number) => isOlheiro ? 'R$ ****' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const calculateStreak = () => {
    if (!sales.length) return 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = [...new Set(sales.map(s => s.data))].sort();
    return dates.length; // Simplificado para total de dias ativos
  };

  const calculateHealth = () => {
    let score = 85;
    const zombies = products.filter(p => {
      if (!p.last_sold_at) return true;
      const diff = new Date().getTime() - new Date(p.last_sold_at).getTime();
      return diff > (60 * 24 * 60 * 60 * 1000);
    }).length;
    score -= (zombies * 5);
    return Math.min(Math.max(score, 0), 100);
  };

  const abcData = products.map(p => {
    const profit = sales.filter(s => s.product_id === p.id)
      .reduce((acc, s) => acc + (s.valor_liquido - (p.custo * s.quantidade)), 0);
    return { name: p.nome, profit };
  }).sort((a, b) => b.profit - a.profit).slice(0, 5);

  const totalDaily = sales.filter(s => s.data === new Date().toISOString().split('T')[0]).reduce((acc, s) => acc + s.valor_bruto, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner Motivacional */}
      <div className="nu-card bg-[var(--nu-purple)] text-white border-none flex items-center gap-4 py-4 px-6 shadow-lg shadow-[var(--nu-purple)]/20">
        <Quote size={20} className="opacity-50" />
        <p className="text-sm font-medium italic">"{frase}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="nu-card flex items-center gap-4 bg-[#820AD1]/5 border-[#820AD1]/20">
          <div className="w-10 h-10 rounded-2xl bg-[#820AD1] flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Saúde do Negócio</p>
            <p className="text-xl font-bold">{calculateHealth()}% de Eficiência</p>
          </div>
        </div>
        <div className="nu-card flex items-center justify-between px-8 bg-gradient-to-r from-[#820AD1] to-[#4c0677] text-white border-transparent shadow-xl">
          <div className="flex items-center gap-4">
            <Flame size={24} className="text-orange-400 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold uppercase opacity-80">Ofensiva (Dias Ativos)</p>
              <p className="text-xl font-bold">{calculateStreak()} Dias Seguidos</p>
            </div>
          </div>
          <Trophy size={24} className="opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="nu-card flex flex-col justify-between">
           <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Meta de Salário</span>
           <div className={`text-3xl font-bold tracking-tighter my-2 ${isOlheiro ? 'blur-md' : ''}`}>{formatCurrency(totalDaily * 0.3)}</div>
           <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden">
              <div className="h-full bg-[#03D56F] rounded-full transition-all duration-1000" style={{ width: '45%' }} />
           </div>
        </div>
        
        <div className="nu-card flex flex-col justify-between">
           <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Giro de Estoque</span>
           <div className="text-3xl font-bold tracking-tighter my-2">1.8x <span className="text-xs text-[var(--text-muted)]">/mês</span></div>
           <p className="text-[10px] font-bold text-[#03D56F] uppercase">Velocidade Saudável</p>
        </div>

        <div className="nu-card flex flex-col justify-between">
           <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Faturamento Hoje</span>
           <div className={`text-3xl font-bold tracking-tighter my-2 ${isOlheiro ? 'blur-md' : ''}`}>{formatCurrency(totalDaily)}</div>
           <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden">
              <div className="h-full bg-[#820AD1] rounded-full transition-all duration-1000" style={{ width: `${(totalDaily/1000)*100}%` }} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="nu-card lg:col-span-2">
           <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={16} className="text-[#820AD1]"/> Performance Semanal</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={abcData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: theme==='dark'?'#262626':'#FFF' }} />
                  <Bar dataKey="profit" fill="#820AD1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="nu-card !p-0 overflow-hidden">
           <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-xs font-bold uppercase tracking-widest">Curva ABC (Top Lucro)</h3>
           </div>
           <div className="divide-y divide-[var(--border-color)]">
              {abcData.map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{item.name}</span>
                    <span className="text-[9px] font-black text-[#820AD1] uppercase">RANK #{i+1}</span>
                  </div>
                  <span className={`font-bold text-sm text-[#03D56F] ${isOlheiro ? 'blur-sm' : ''}`}>{formatCurrency(item.profit)}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
