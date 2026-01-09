
import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Plus, Trash2, ShieldAlert, Calendar } from 'lucide-react';
import { storage, notificar } from '../lib/storage';
import { Missao, PrioridadeMissao } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Missions: React.FC = () => {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ titulo: '', prioridade: 'Média' as PrioridadeMissao, data: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    const load = () => setMissoes(storage.missoes.obterTodas());
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, []);

  const addMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo) return;
    storage.missoes.salvar(form.titulo, form.prioridade, form.data);
    notificar("Nova missão designada");
    setShowAdd(false);
    setForm({ titulo: '', prioridade: 'Média', data: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="flex flex-col gap-10 text-left w-full">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Missões Operacionais</h2>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Evolua seu comando através da execução</p>
         </div>
         <button onClick={() => setShowAdd(true)} className="btn-fire !py-3 !px-8 flex items-center gap-3">
            <Plus size={18} /> NOVA MISSÃO
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <AnimatePresence>
            {missoes.map((m) => (
              <motion.div 
                key={m.id} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}}
                className={`nu-card p-8 flex flex-col gap-6 relative overflow-hidden transition-all ${m.completa ? 'border-[var(--nu-success)] bg-[var(--nu-success)]/5' : 'hover:border-[var(--nu-purple)]'}`}
              >
                 <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl ${m.completa ? 'bg-[var(--nu-success)]' : 'bg-[var(--nu-purple)]'} text-white`}>
                       <Trophy size={20} />
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded bg-black/20`}>{m.prioridade}</span>
                 </div>

                 <div>
                    <h4 className="text-sm font-black uppercase italic leading-tight">{m.titulo}</h4>
                    <div className="flex items-center gap-2 mt-3 text-[9px] font-black text-[var(--text-muted)] uppercase opacity-60">
                       <Calendar size={12} /> Prazo: {new Date(m.data_alvo).toLocaleDateString()}
                    </div>
                    <span className="text-[10px] font-black text-[var(--nu-purple)] uppercase mt-4 block">RECOMPENSA: {m.recompensa} XP</span>
                 </div>

                 <div className="flex gap-4 mt-2">
                    {!m.completa ? (
                      <button onClick={() => storage.missoes.concluir(m.id)} className="flex-1 py-3 bg-[var(--nu-purple)] text-white text-[10px] font-black uppercase rounded-xl">CONCLUIR</button>
                    ) : (
                      <div className="flex-1 py-3 bg-[var(--nu-success)]/10 text-[var(--nu-success)] text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 border border-[var(--nu-success)]/20">
                         <CheckCircle2 size={14} /> FINALIZADA
                      </div>
                    )}
                    <button onClick={() => storage.missoes.excluir(m.id)} className="p-3 bg-white/5 text-red-500/20 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                 </div>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <motion.form 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onSubmit={addMission} className="nu-card w-full max-w-lg p-10 space-y-8"
           >
              <h3 className="text-2xl font-black uppercase italic">Nova Missão</h3>
              <div className="space-y-6">
                 <input required className="nu-input w-full font-bold uppercase" value={form.titulo} onChange={e=>setForm({...form, titulo: e.target.value})} placeholder="TÍTULO DA MISSÃO" />
                 <div className="grid grid-cols-2 gap-4">
                    <select className="nu-input w-full font-black text-[10px]" value={form.prioridade} onChange={e=>setForm({...form, prioridade: e.target.value as any})}>
                       <option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option>
                    </select>
                    <input type="date" required className="nu-input w-full font-black text-[10px]" value={form.data} onChange={e=>setForm({...form, data: e.target.value})} />
                 </div>
              </div>
              <div className="flex gap-4">
                 <button type="submit" className="btn-fire flex-1">DESIGNAR</button>
                 <button type="button" onClick={() => setShowAdd(false)} className="px-8 py-3 bg-white/5 font-black uppercase rounded-xl">CANCELAR</button>
              </div>
           </motion.form>
        </div>
      )}
    </div>
  );
};
