
import React, { useState, useEffect } from 'react';
import { Wallet, AlertTriangle, RefreshCw, Calculator, Plus, CheckCircle, Trash2, X, Briefcase, Zap, Search } from 'lucide-react';
import { FinancialEntry, FinanceCategory } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface FinanceProps { isOlheiro: boolean; }

export const Finance: React.FC<FinanceProps> = ({ isOlheiro }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConciliacao, setShowConciliacao] = useState(false);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    if (!supabase) return setLoading(false);
    const { data } = await supabase.from('financeiro').select('*').order('data', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const formatCurrency = (val: number) => isOlheiro ? 'R$ ****' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const entradas = entries.filter(e => e.tipo === 'Entrada').reduce((acc, e) => acc + e.valor, 0);
  const saidas = entries.filter(e => e.tipo === 'Saída').reduce((acc, e) => acc + e.valor, 0);
  const dasEstimado = entradas * 0.06; // 6% Estimado

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Resumo Financeiro Inteligente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nu-card bg-[#820AD1] text-white">
           <p className="text-[10px] font-black uppercase opacity-60">Fluxo Total</p>
           <p className="text-2xl font-bold">{formatCurrency(entradas - saidas)}</p>
        </div>
        <div className="nu-card bg-red-500 text-white">
           <p className="text-[10px] font-black uppercase opacity-60">Prev. Imposto (DAS)</p>
           <p className="text-2xl font-bold">{formatCurrency(dasEstimado)}</p>
        </div>
        <div className="nu-card bg-[var(--bg-card)]">
           <p className="text-[10px] font-black uppercase text-orange-500">Pix Pendentes</p>
           <p className="text-2xl font-bold">R$ 1.420,00</p>
        </div>
        <button onClick={() => setShowConciliacao(true)} className="nu-card bg-[#03D56F]/10 border-[#03D56F] border flex flex-col justify-center items-center text-[#03D56F] gap-2 hover:bg-[#03D56F] hover:text-white transition-all">
           <Search size={20} />
           <span className="text-[10px] font-black uppercase">Conciliação Pix</span>
        </button>
      </div>

      {/* Modal de Conciliação Pix */}
      {showConciliacao && (
        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="nu-card w-full max-w-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
                 <h3 className="font-bold uppercase tracking-widest text-sm">Conciliação de Pix</h3>
                 <button onClick={()=>setShowConciliacao(false)}><X size={20}/></button>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">Verifique os comprovantes e dê baixa nos pagamentos pendentes.</p>
              <div className="divide-y divide-[var(--border-color)]">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#820AD1]/10 flex items-center justify-center text-[#820AD1]"><Zap size={16}/></div>
                         <div>
                            <p className="text-sm font-bold">Venda #{1000 + i} - WhatsApp</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase">CLIENTE: Maria Silva</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-sm font-bold text-[#03D56F]">R$ 159,90</span>
                         <button className="nu-button-primary !py-2 !px-4 text-[10px]">VER COMPROVANTE</button>
                         <button className="p-2 bg-[#03D56F] text-white rounded-lg"><CheckCircle size={16}/></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Simulador de Antecipação */}
      <div className="nu-card bg-[var(--bg-primary)] border-[#820AD1]/20 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <Calculator size={24} className="text-[#820AD1]" />
            <div>
               <h4 className="font-bold text-sm uppercase">Simulador de Antecipação</h4>
               <p className="text-xs text-[var(--text-muted)]">Saiba quanto custa receber hoje o que cairia em 30 dias.</p>
            </div>
         </div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <input type="number" placeholder="Valor a Antecipar" className="nu-input max-w-[200px]" />
            <div className="text-right">
               <p className="text-[10px] font-black text-[#820AD1] uppercase">Você recebe:</p>
               <p className="text-lg font-bold text-[#03D56F]">R$ 0,00</p>
            </div>
         </div>
      </div>

      {/* Fluxo de Caixa Real */}
      <div className="nu-card !p-0 overflow-hidden">
         <div className="p-6 bg-[var(--bg-primary)] flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest">Movimentação Financeira (V8)</h3>
            <div className="flex gap-2">
               <span className="bg-[#03D56F]/20 text-[#03D56F] text-[9px] font-black px-3 py-1 rounded-full">ENTRADAS: {formatCurrency(entradas)}</span>
               <span className="bg-red-500/20 text-red-500 text-[9px] font-black px-3 py-1 rounded-full">SAÍDAS: {formatCurrency(saidas)}</span>
            </div>
         </div>
         <table className="w-full text-left">
            <tbody className="divide-y divide-[var(--border-color)]">
               {entries.map(e => (
                  <tr key={e.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                     <td className="p-6 text-xs font-bold">{new Date(e.data).toLocaleDateString()}</td>
                     <td className="p-6 font-bold text-sm">{e.descricao}</td>
                     <td className={`p-6 font-bold text-sm ${e.tipo === 'Entrada' ? 'text-[#03D56F]' : 'text-red-500'}`}>
                        {e.tipo === 'Entrada' ? '+' : '-'} {formatCurrency(e.valor)}
                     </td>
                     <td className="p-6">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${e.status === 'Pago' ? 'bg-[#03D56F]/20 text-[#03D56F]' : 'bg-orange-500/20 text-orange-500'}`}>{e.status}</span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};
