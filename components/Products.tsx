
import React, { useState, useEffect } from 'react';
import { Package, Trash2, Search, X, Shield, Zap } from 'lucide-react';
import { Produto, ModoVisual } from '../types';
import { storage, notificar } from '../lib/storage';
import { motion } from 'framer-motion';

export const Products: React.FC<{ isOlheiro: boolean, visualMode: ModoVisual }> = ({ isOlheiro, visualMode }) => {
  const [products, setProducts] = useState<Produto[]>([]);
  const [activeTab, setActiveTab] = useState<'catalogo' | 'form'>('catalogo');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Partial<Produto>>({ sku: '', nome: '', custo_fornecedor: 0, preco_venda_alvo: 0, raridade: 'Comum' });

  useEffect(() => {
    const load = () => setProducts(storage.produtos.obterTodos());
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, []);

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    storage.produtos.salvar(form);
    notificar(form.id ? "Arsenal Atualizado" : "Novo Item Catalogado");
    setActiveTab('catalogo');
    setForm({ sku: '', nome: '', custo_fornecedor: 0, preco_venda_alvo: 0, raridade: 'Comum' });
  };

  const fmt = (v?: number | null) => {
    if (isOlheiro) return 'R$ ****';
    const val = v ?? 0;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10 page-container">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
         <div className="flex bg-[var(--bg-input)] p-1.5 rounded-2xl border border-[var(--border-color)]">
            <button onClick={() => setActiveTab('catalogo')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'catalogo' ? 'bg-[var(--nu-purple)] text-white' : 'text-[var(--text-muted)]'}`}>CATÁLOGO</button>
            <button onClick={() => setActiveTab('form')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'form' ? 'bg-[var(--nu-purple)] text-white' : 'text-[var(--text-muted)]'}`}>CADASTRAR</button>
         </div>
         <div className="relative w-full lg:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input className="nu-input !pl-14 w-full" placeholder="Buscar no Arsenal..." value={search} onChange={e=>setSearch(e.target.value)} />
         </div>
      </div>

      {activeTab === 'catalogo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
           {products.filter(p => p.nome.toLowerCase().includes(search.toLowerCase())).map(p => (
             <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nu-card p-8 text-left group overflow-hidden">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{isOlheiro ? 'HIDDEN-SKU' : p.sku}</p>
                      <h4 className="text-lg font-black uppercase italic text-[var(--text-main)] truncate mt-1 group-hover:text-[var(--nu-purple)] transition-colors">
                        {isOlheiro ? 'PRODUTO OFUSCADO' : p.nome}
                      </h4>
                   </div>
                   <span className="text-[8px] font-black px-3 py-1 border-2 border-[var(--border-color)] rounded-lg uppercase tracking-widest">{p.raridade}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-color)]">
                      <p className="text-[8px] font-black text-[var(--text-muted)] uppercase">Custo Fornec.</p>
                      <p className="text-sm font-black tabular-nums">{fmt(p.custo_fornecedor)}</p>
                   </div>
                   <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-color)]">
                      <p className="text-[8px] font-black text-[var(--text-muted)] uppercase">Margem Alvo</p>
                      <p className="text-sm font-black tabular-nums">{fmt(p.preco_venda_alvo)}</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={() => { setForm(p); setActiveTab('form'); }} className="flex-1 py-3 bg-[var(--bg-input)] hover:bg-[var(--nu-purple)] hover:text-white rounded-xl text-[9px] font-black uppercase transition-all">EDITAR</button>
                   <button onClick={() => { if(confirm('Remover permanentemente?')) storage.produtos.excluir(p.id); }} className="p-3 text-red-500/30 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
             </motion.div>
           ))}
        </div>
      )}

      {activeTab === 'form' && (
        <div className="flex justify-center pt-10">
          <form onSubmit={salvar} className="nu-card w-full max-w-2xl p-12 space-y-12 text-left">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-4">
              <Package size={28} className="text-[var(--nu-purple)]" /> {form.id ? 'EDITAR ITEM' : 'CATALOGAR NO ARSENAL'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Nome do Produto</label>
                  <input required className="nu-input w-full font-bold" value={form.nome || ''} onChange={e=>setForm({...form, nome: e.target.value})} placeholder="Ex: Headset Gamer Pro" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">SKU Operacional</label>
                  <input required className="nu-input w-full font-bold" value={form.sku || ''} onChange={e=>setForm({...form, sku: e.target.value})} placeholder="SKU-XXX-001" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Custo Fornecedor (R$)</label>
                  <input type="number" step="0.01" min="0" required className="nu-input w-full font-black" value={form.custo_fornecedor || ''} onChange={e=>setForm({...form, custo_fornecedor: Number(e.target.value)})} />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Preço Sugerido (R$)</label>
                  <input type="number" step="0.01" min="0" required className="nu-input w-full font-black" value={form.preco_venda_alvo || ''} onChange={e=>setForm({...form, preco_venda_alvo: Number(e.target.value)})} />
               </div>
            </div>
            <button type="submit" className="btn-fire w-full py-6">EFETIVAR CATALOGAÇÃO</button>
          </form>
        </div>
      )}
    </div>
  );
};
