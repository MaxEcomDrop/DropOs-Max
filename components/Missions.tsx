
import React, { useState, useEffect } from 'react';
import { Trophy, Zap, CheckCircle2, Plus, Trash2, Target } from 'lucide-react';
import { storage, notificar } from '../lib/storage';
import { Missao } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Missions: React.FC = () => {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ titulo: '', recompensa: 500, objetivo: 1 });

  useEffect(() => {
    setMissoes(storage.missoes.obterTodas());
    window.addEventListener('storage-update', () => setMissoes(storage.missoes.obterTodas()));
  }, []);

  const addMission = (e: React.FormEvent) => {
    e.preventDefault();
    storage.missoes.salvar({ ...form, progresso: 0, frequencia: 'Livre', categoria: 'Geral', isCustom: true });
    notificar("Nova Missão Tática Designada");
    setShowAdd(false);
    setForm({ titulo: '', recompensa: 500, objetivo: 1 });
  };

  return (
    <div className="flex flex-col gap-10 pb-40 text-left">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Objetivos do Comando</h2>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Gerencie suas metas e ganhe recompensa em XP</p>
         </div>
         <button onClick={() => setShowAdd(true)} className="btn-fire !py-3 !px-8 flex items-center gap-3">
            <Plus size={18} /> NOVA META
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <AnimatePresence>
            {missoes.map((m, i) => (
              <motion.div 
                key={m.id} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0}}
                className={`nu-card p-8 flex flex-col gap-6 relative overflow-hidden transition-all ${m.completa ? 'border-[var(--nu-success)] bg-[var(--nu-success)]/5' : 'hover:border-[var(--nu-purple)]'}`}
              >
                 <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl ${m.completa ? 'bg-[var(--nu-success)]' : 'bg-[var(--nu-purple)]'} text-white`}>
                       <Trophy size={24} />
                    </div>
                    {!m.completa ? (
                      <button onClick={() => storage.missoes.concluir(m.id)} className="text-[9px] font-black uppercase text-[var(--nu-purple)] bg-[var(--nu-purple)]/10 px-4 py-2 rounded-full hover:bg-[var(--nu-purple)] hover:text-white transition-all">CONCLUIR</button>
                    ) : (
                      <CheckCircle2 size={24} className="text-[var(--nu-success)]" />
                    )}
                 </div>

                 <div>
                    <h4 className="text-lg font-black uppercase italic tracking-tight">{m.titulo}</h4>
                    <span className="text-[9px] font-black text-[var(--nu-purple)] uppercase mt-1">+{m.recompensa} XP</span>
                 </div>

                 <button onClick={() => storage.missoes.excluir(m.id)} className="absolute bottom-4 right-4 text-[var(--nu-error)] opacity-20 hover:opacity-100 transition-all p-2">
                    <Trash2 size={16} />
                 </button>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <motion.form 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onSubmit={addMission} className="nu-card w-full max-w-lg p-10 space-y-8"
           >
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Cadastrar Nova Meta</h3>
              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Título da Missão / Objetivo</label>
                    <input required className="nu-input w-full font-bold" value={form.titulo} onChange={e=>setForm({...form, titulo: e.target.value})} placeholder="Ex: Finalizar estoque de Inverno" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">XP de Recompensa</label>
                    <input type="number" required className="nu-input w-full font-black text-center" value={form.recompensa} onChange={e=>setForm({...form, recompensa: Number(e.target.value)})} />
                 </div>
              </div>
              <div className="flex gap-4">
                 <button type="submit" className="btn-fire flex-1">DESIGNAR MISSÃO</button>
                 <button type="button" onClick={() => setShowAdd(false)} className="px-8 py-3 bg-[var(--bg-input)] text-[var(--text-muted)] font-black uppercase rounded-2xl">CANCELAR</button>
              </div>
           </motion.form>
        </div>
      )}
    </div>
  );
};
