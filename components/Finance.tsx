
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Wallet, X, Trash2, Search, Calendar, Filter, Layers, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { storage, notificar } from '../lib/storage';
import { LancamentoFinanceiro, CategoriaFinanceira } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Finance: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [entries, setEntries] = useState<LancamentoFinanceiro[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState<Partial<LancamentoFinanceiro>>({ 
    descricao: '', valor: 0, tipo: 'Despesa', categoria: 'Fixo', 
    status: 'Pago', data: new Date().toISOString().split('T')[0], is_fixo: true
  });

  useEffect(() => {
    const load = () => setEntries(storage.financeiro.obterTodos());
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, []);

  const fmt = (v: number) => {
    if (isOlheiro) return 'R$ ****';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col gap-10 pb-40 text-left">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Cofre Central</h2>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Gestão de Fluxo: Fixos, Variáveis e Longo Prazo</p>
         </div>
         <button onClick={() => setFormOpen(true)} className="btn-fire !py-3 !px-8 flex items-center gap-3">
            <Plus size={18} /> MOVIMENTAÇÃO
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="nu-card p-8 border-l-4 border-l-[var(--nu-success)]">
            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-2">Entradas (Receitas)</p>
            <h4 className="text-2xl font-black italic text-[var(--nu-success)]">{fmt(entries.filter(e=>e.tipo==='Receita').reduce((a,b)=>a+b.valor,0))}</h4>
         </div>
         <div className="nu-card p-8 border-l-4 border-l-red-500">
            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-2">Saídas (Fixo/Operacional)</p>
            <h4 className="text-2xl font-black italic text-red-500">{fmt(entries.filter(e=>e.tipo==='Despesa').reduce((a,b)=>a+b.valor,0))}</h4>
         </div>
         <div className="nu-card p-8 border-l-4 border-l-[var(--nu-purple)]">
            <p className="text-[9px] font-black uppercase text-[var(--text-muted)] mb-2">Saldo em Conta</p>
            <h4 className="text-2xl font-black italic text-[var(--nu-purple)]">
              {fmt(entries.filter(e=>e.tipo==='Receita').reduce((a,b)=>a+b.valor,0) - entries.filter(e=>e.tipo==='Despesa').reduce((a,b)=>a+b.valor,0))}
            </h4>
         </div>
      </div>

      <div className="nu-card overflow-hidden">
         <div className="p-8 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
               <input className="nu-input !pl-12 w-full" placeholder="Filtrar por Descrição..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-black/40 text-[9px] font-black uppercase text-[var(--text-muted)]">
                     <th className="px-8 py-5">Data / Vencimento</th>
                     <th className="px-8 py-5">Identificação</th>
                     <th className="px-8 py-5 text-center">Classe</th>
                     <th className="px-8 py-5 text-right">Valor</th>
                     <th className="px-8 py-5 text-center">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {entries.filter(e => e.descricao.toLowerCase().includes(searchTerm.toLowerCase())).map(e => (
                    <tr key={e.id} className="hover:bg-white/5 group transition-all">
                       <td className="px-8 py-5 text-[10px] font-bold text-[var(--text-muted)]">{new Date(e.data).toLocaleDateString()}</td>
                       <td className="px-8 py-5 text-xs font-black uppercase italic">{isOlheiro ? '******' : e.descricao}</td>
                       <td className="px-8 py-5 text-center">
                          <span className={`text-[8px] font-black px-2 py-1 rounded bg-white/5 ${e.is_fixo ? 'text-orange-400' : 'text-blue-400'}`}>
                             {e.is_fixo ? 'FIXA' : 'VARIÁVEL'}
                          </span>
                       </td>
                       <td className={`px-8 py-5 text-right font-black italic ${e.tipo === 'Receita' ? 'text-[var(--nu-success)]' : 'text-red-400'}`}>
                          {e.tipo === 'Receita' ? '+' : '-'}{fmt(e.valor)}
                       </td>
                       <td className="px-8 py-5 text-center">
                          <button onClick={() => storage.financeiro.excluir(e.id)} className="p-2 text-red-500/20 group-hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <AnimatePresence>
         {formOpen && (
           <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
              <motion.form 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onSubmit={(ev) => {
                  ev.preventDefault();
                  storage.financeiro.salvar(form);
                  setFormOpen(false);
                }}
                className="nu-card w-full max-w-xl p-10 space-y-8"
              >
                 <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <h3 className="text-2xl font-black uppercase italic">Nova Movimentação</h3>
                    <button type="button" onClick={() => setFormOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X/></button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={()=>setForm({...form, tipo:'Receita', is_fixo: false})} className={`p-4 rounded-xl border-2 font-black text-[10px] ${form.tipo==='Receita' ? 'bg-[var(--nu-success)]/10 border-[var(--nu-success)] text-[var(--nu-success)]' : 'opacity-30'}`}>ENTRADA</button>
                    <button type="button" onClick={()=>setForm({...form, tipo:'Despesa'})} className={`p-4 rounded-xl border-2 font-black text-[10px] ${form.tipo==='Despesa' ? 'bg-red-500/10 border-red-500 text-red-500' : 'opacity-30'}`}>SAÍDA</button>
                 </div>
                 <div className="space-y-4">
                    <input required className="nu-input w-full font-bold uppercase" value={form.descricao} onChange={e=>setForm({...form, descricao:e.target.value})} placeholder="DESCRIÇÃO DO LANÇAMENTO" />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="number" step="0.01" min="0" required className="nu-input w-full font-black text-center" value={form.valor || ''} onChange={e=>setForm({...form, valor:Number(e.target.value)})} placeholder="R$ 0,00" />
                       <input type="date" required className="nu-input w-full font-black text-center" value={form.data} onChange={e=>setForm({...form, data:e.target.value})} />
                    </div>
                    {form.tipo === 'Despesa' && (
                      <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                          <input type="checkbox" className="hidden" checked={form.is_fixo} onChange={e=>setForm({...form, is_fixo: e.target.checked})} />
                          <div className={`p-3 rounded-xl border-2 font-black text-[9px] text-center transition-all ${form.is_fixo ? 'border-orange-500 bg-orange-500/10' : 'opacity-20'}`}>DESPESA FIXA</div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input type="checkbox" className="hidden" checked={!form.is_fixo} onChange={e=>setForm({...form, is_fixo: !e.target.checked})} />
                          <div className={`p-3 rounded-xl border-2 font-black text-[9px] text-center transition-all ${!form.is_fixo ? 'border-blue-500 bg-blue-500/10' : 'opacity-20'}`}>VARIÁVEL</div>
                        </label>
                      </div>
                    )}
                 </div>
                 <button type="submit" className="btn-fire w-full py-6">EFETUAR LANÇAMENTO</button>
              </motion.form>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};
