import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Wallet, X, Trash2, Search, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { storage, notificar } from '../lib/storage';
import { LancamentoFinanceiro, FiltroData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Finance: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [entries, setEntries] = useState<LancamentoFinanceiro[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'historico' | 'agenda'>('historico');
  
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

  const fmt = (v: number) => isOlheiro ? 'R$ ****' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totals = useMemo(() => {
    const pagoReceita = entries.filter(e => e.status === 'Pago' && e.tipo === 'Receita').reduce((a, b) => a + b.valor, 0);
    const pagoDespesa = entries.filter(e => e.status === 'Pago' && e.tipo === 'Despesa').reduce((a, b) => a + b.valor, 0);
    const pendReceita = entries.filter(e => e.status === 'Pendente' && e.tipo === 'Receita').reduce((a, b) => a + b.valor, 0);
    const pendDespesa = entries.filter(e => e.status === 'Pendente' && e.tipo === 'Despesa').reduce((a, b) => a + b.valor, 0);
    return { saldo: pagoReceita - pagoDespesa, pendReceita, pendDespesa };
  }, [entries]);

  return (
    <div className="flex flex-col gap-6 md:gap-10 text-left w-full pb-40 px-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
         <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Cofre e Fluxo</h2>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mt-1">Gestão de Tesouraria</p>
         </div>
         <button onClick={() => setFormOpen(true)} className="btn-fire !w-full md:!w-64 h-14">
            <Plus size={20} /> NOVO LANÇAMENTO
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
         <div className="nu-card p-8 border-l-8 border-l-[var(--nu-purple)]">
            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">DISPONÍVEL</p>
            <h4 className="text-2xl font-black italic text-[var(--text-main)]">{fmt(totals.saldo)}</h4>
         </div>
         <div className="nu-card p-8 border-l-8 border-l-[var(--nu-success)]">
            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">A RECEBER (TOTAL)</p>
            <h4 className="text-2xl font-black italic text-[var(--text-main)]">{fmt(totals.pendReceita)}</h4>
         </div>
         <div className="nu-card p-8 border-l-8 border-l-red-500">
            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest">A PAGAR (TOTAL)</p>
            <h4 className="text-2xl font-black italic text-[var(--text-main)]">{fmt(totals.pendDespesa)}</h4>
         </div>
      </div>

      <div className="nu-card mx-1 overflow-hidden">
         <div className="p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
               <input className="nu-input !pl-12 h-12" placeholder="Pesquisar..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            </div>
            <div className="flex bg-[var(--bg-input)] p-1 rounded-xl w-fit">
               {['historico', 'agenda'].map(t => (
                 <button key={t} onClick={() => setTab(t as any)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${tab === t ? 'bg-[var(--nu-purple)] text-white' : 'text-[var(--text-muted)]'}`}>{t}</button>
               ))}
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
               <thead>
                  <tr className="bg-[var(--bg-input)] text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                     <th className="px-8 py-4">Data</th>
                     <th className="px-8 py-4">Descrição</th>
                     <th className="px-8 py-4 text-right">Valor</th>
                     <th className="px-8 py-4 text-center">Status</th>
                     <th className="px-8 py-4 text-center">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--border-color)]">
                  {entries.filter(e => e.descricao.toLowerCase().includes(searchTerm.toLowerCase())).map(e => (
                    <tr key={e.id} className="hover:bg-[var(--nu-purple)]/5 transition-all group">
                       <td className="px-8 py-5 text-[11px] font-bold text-[var(--text-muted)]">{new Date(e.data).toLocaleDateString()}</td>
                       <td className="px-8 py-5 text-sm font-black uppercase italic text-[var(--text-main)]">{e.descricao}</td>
                       <td className={`px-8 py-5 text-right font-black italic ${e.tipo === 'Receita' ? 'text-[var(--nu-success)]' : 'text-red-400'}`}>
                          {e.tipo === 'Receita' ? <ArrowUpRight size={14} className="inline mr-1" /> : <ArrowDownLeft size={14} className="inline mr-1" />}
                          {fmt(e.valor)}
                       </td>
                       <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${e.status === 'Pago' ? 'bg-[var(--nu-success)]/10 text-[var(--nu-success)]' : 'bg-yellow-500/10 text-yellow-500'}`}>{e.status}</span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <button onClick={() => storage.financeiro.excluir(e.id)} className="p-2 text-red-500/30 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <AnimatePresence>
         {formOpen && (
           <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
              <motion.form initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onSubmit={(ev) => { ev.preventDefault(); storage.financeiro.salvar(form); setFormOpen(false); notificar("Protocolo Registrado"); }}
                className="nu-card w-full max-w-xl p-6 md:p-10 space-y-8 my-8"
              >
                 <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-6">
                    <h3 className="text-2xl font-black uppercase italic">Nova Movimentação</h3>
                    <button type="button" onClick={() => setFormOpen(false)} className="text-[var(--text-muted)] hover:text-white"><X size={28}/></button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={()=>setForm({...form, tipo:'Receita'})} className={`p-5 rounded-2xl border-2 font-black transition-all ${form.tipo==='Receita' ? 'bg-[var(--nu-success)]/10 border-[var(--nu-success)] text-[var(--nu-success)]' : 'opacity-20 border-transparent bg-[var(--bg-input)]'}`}>ENTRADA</button>
                    <button type="button" onClick={()=>setForm({...form, tipo:'Despesa'})} className={`p-5 rounded-2xl border-2 font-black transition-all ${form.tipo==='Despesa' ? 'bg-red-500/10 border-red-500 text-red-500' : 'opacity-20 border-transparent bg-[var(--bg-input)]'}`}>SAÍDA</button>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-2">Descrição</label>
                       <input required className="nu-input font-bold uppercase" value={form.descricao} onChange={e=>setForm({...form, descricao:e.target.value})} placeholder="EX: SERVIDOR VPS" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-2">Valor (R$)</label>
                          <input type="number" step="0.01" required className="nu-input font-black" value={form.valor || ''} onChange={e=>setForm({...form, valor:Number(e.target.value)})} placeholder="0,00" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-2">Data</label>
                          <input type="date" required className="nu-input font-bold" value={form.data} onChange={e=>setForm({...form, data:e.target.value})} />
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button type="submit" className="btn-fire !w-full h-16 text-lg">EFETIVAR LANÇAMENTO</button>
                 </div>
              </motion.form>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
};