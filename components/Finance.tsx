
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Wallet, X, Trash2, ArrowUpRight, ArrowDownLeft, FileText, 
  Search, Receipt, Calendar, Tag
} from 'lucide-react';
import { storage, notificar } from '../lib/storage';
import { LancamentoFinanceiro, Venda, ModoVisual, CategoriaFinanceira } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Finance: React.FC<{ isOlheiro: boolean, visualMode: ModoVisual }> = ({ isOlheiro, visualMode }) => {
  const [entries, setEntries] = useState<LancamentoFinanceiro[]>([]);
  const [sales, setSales] = useState<Venda[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState<Partial<LancamentoFinanceiro>>({ 
    descricao: '', valor: 0, tipo: 'Despesa', categoria: 'Operacional', 
    status: 'Pago', data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const load = () => {
      setEntries(storage.financeiro.obterTodos());
      setSales(storage.vendas.obterTodas());
    };
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, []);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [entries, searchTerm]);

  return (
    <div className="flex flex-col gap-10 pb-40 text-left">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Cofre de Operações</h2>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Controle de Receitas e Despesas Offline</p>
         </div>
         <button onClick={() => setFormOpen(true)} className="btn-fire !py-3 !px-8 flex items-center gap-3">
            <Plus size={18} /> MOVIMENTAÇÃO
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="nu-card p-8 border-l-4 border-l-[var(--nu-purple)]">
            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-2">Total Receitas</p>
            <h4 className="text-2xl font-black italic text-[var(--nu-success)]">{fmt(entries.filter(e=>e.tipo==='Receita').reduce((a,b)=>a+b.valor,0))}</h4>
         </div>
         <div className="nu-card p-8 border-l-4 border-l-red-500">
            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-2">Total Despesas</p>
            <h4 className="text-2xl font-black italic text-[var(--nu-error)]">{fmt(entries.filter(e=>e.tipo==='Despesa').reduce((a,b)=>a+b.valor,0))}</h4>
         </div>
      </div>

      <div className="nu-card overflow-hidden">
         <div className="p-8 border-b border-[var(--border-color)]">
            <div className="relative w-full max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
               <input className="nu-input !pl-12 w-full" placeholder="Buscar no Cofre..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-[var(--bg-input)] text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                     <th className="px-8 py-4">Data</th>
                     <th className="px-8 py-4">Identificação</th>
                     <th className="px-8 py-4">Categoria</th>
                     <th className="px-8 py-4 text-right">Magnitude</th>
                     <th className="px-8 py-4 text-center">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredEntries.map(e => (
                    <tr key={e.id} className="hover:bg-[var(--bg-input)] transition-all group">
                       <td className="px-8 py-5 text-[10px] font-bold text-[var(--text-muted)]">{new Date(e.data).toLocaleDateString()}</td>
                       <td className="px-8 py-5 text-xs font-black uppercase italic">{e.descricao}</td>
                       <td className="px-8 py-5 text-[9px] font-black text-[var(--nu-purple)] uppercase">{e.categoria}</td>
                       <td className={`px-8 py-5 text-right font-black italic ${e.tipo === 'Receita' ? 'text-[var(--nu-success)]' : 'text-[var(--nu-error)]'}`}>
                          {e.tipo === 'Receita' ? '+' : '-'}{fmt(e.valor)}
                       </td>
                       <td className="px-8 py-5 text-center">
                          <button onClick={() => storage.financeiro.excluir(e.id)} className="p-2 text-[var(--nu-error)] opacity-20 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <AnimatePresence>
         {formOpen && (
           <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
              <motion.form 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onSubmit={(ev) => {
                  ev.preventDefault();
                  storage.financeiro.salvar(form);
                  setFormOpen(false);
                  notificar("Lançamento Efetivado no Cofre");
                }}
                className="nu-card w-full max-w-xl p-10 space-y-8"
              >
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Nova Movimentação</h3>
                    <button type="button" onClick={() => setFormOpen(false)}><X size={24}/></button>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={()=>setForm({...form, tipo:'Receita'})} className={`p-4 rounded-2xl border-2 font-black text-[10px] tracking-widest ${form.tipo==='Receita' ? 'bg-[var(--nu-success)]/10 border-[var(--nu-success)] text-[var(--nu-success)]' : 'border-[var(--border-color)] opacity-40'}`}>RECEITA</button>
                    <button type="button" onClick={()=>setForm({...form, tipo:'Despesa'})} className={`p-4 rounded-2xl border-2 font-black text-[10px] tracking-widest ${form.tipo==='Despesa' ? 'bg-[var(--nu-error)]/10 border-[var(--nu-error)] text-[var(--nu-error)]' : 'border-[var(--border-color)] opacity-40'}`}>DESPESA</button>
                 </div>

                 <div className="space-y-4">
                    <input required className="nu-input w-full font-bold" value={form.descricao} onChange={e=>setForm({...form, descricao:e.target.value})} placeholder="DESCRIÇÃO" />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="number" required className="nu-input w-full font-black text-center" value={form.valor || ''} onChange={e=>setForm({...form, valor:Number(e.target.value)})} placeholder="VALOR (R$)" />
                       <select className="nu-input w-full font-bold" value={form.categoria} onChange={e=>setForm({...form, categoria: e.target.value as any})}>
                          <option>Operacional</option><option>Software</option><option>Marketing</option><option>Reserva</option><option>Vendas</option>
                       </select>
                    </div>
                 </div>

                 <button type="submit" className="btn-fire w-full !py-6">SINCRONIZAR COFRE</button>
              </motion.form>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};
