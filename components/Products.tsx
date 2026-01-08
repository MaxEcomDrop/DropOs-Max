import React, { useState, useEffect } from 'react';
import { Package, Trash2, Search, X, Link as LinkIcon, Skull, Zap } from 'lucide-react';
import { Produto, ModoVisual } from '../types';
import { storage, notificar } from '../lib/storage';
import { motion } from 'framer-motion';

export const Products: React.FC<{ isOlheiro: boolean, visualMode: ModoVisual }> = ({ isOlheiro, visualMode }) => {
  const [products, setProducts] = useState<Produto[]>([]);
  const [activeTab, setActiveTab] = useState<'catalogo' | 'form'>('catalogo');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Partial<Produto>>({ sku: '', nome: '', custo_fornecedor: 0, preco_venda_alvo: 0, fornecedor_nome: '', raridade: 'Comum' });

  useEffect(() => {
    // Fix: Removed unused visualMode argument to match storage.produtos.obterTodos signature
    setProducts(storage.produtos.obterTodos());
  }, [visualMode]);

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    storage.produtos.salvar(form);
    notificar(form.id ? "Arsenal Sincronizado" : "Novo Item Catalogado");
    // Fix: Removed unused visualMode argument to match storage.produtos.obterTodos signature
    setProducts(storage.produtos.obterTodos());
    setActiveTab('catalogo');
    setForm({ sku: '', nome: '', custo_fornecedor: 0, preco_venda_alvo: 0, fornecedor_nome: '', raridade: 'Comum' });
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex flex-col gap-6 md:gap-10 page-container">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8">
         <div className="flex bg-[var(--bg-input)] p-1.5 rounded-2xl border border-[var(--border-color)] w-full lg:w-auto overflow-x-auto">
            <button onClick={() => setActiveTab('catalogo')} className={`flex-1 lg:flex-none px-6 md:px-10 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'catalogo' ? 'bg-[var(--nu-purple)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>CATÁLOGO DO ARSENAL</button>
            <button onClick={() => setActiveTab('form')} className={`flex-1 lg:flex-none px-6 md:px-10 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'form' ? 'bg-[var(--nu-purple)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>CADASTRAR PRODUTO</button>
         </div>
         <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--nu-purple)] transition-all" size={16} />
            <input className="nu-input !pl-14 w-full" placeholder="Buscar por SKU ou Nome..." value={search} onChange={e=>setSearch(e.target.value)} />
         </div>
      </div>

      {activeTab === 'catalogo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pb-40 lg:pb-0">
           {products.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())).map((p, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
               key={p.id} 
               className={`nu-card group p-6 md:p-8 flex flex-col justify-between transition-all relative overflow-hidden text-left ${
                 p.raridade === 'Lendário' ? 'border-yellow-500/40' : 
                 p.raridade === 'Épico' ? 'border-[var(--nu-purple)]/40' : 'border-[var(--border-color)]'
               }`}
             >
                {p.isZumbi && (
                  <div className="absolute top-0 right-0 p-4">
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--nu-error)]/10 border border-[var(--nu-error)]/30 rounded-full text-[7px] md:text-[8px] font-black text-[var(--nu-error)] uppercase tracking-widest animate-pulse">
                        <Skull size={10} /> ITEM PARADO
                     </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-6 md:mb-10">
                     <div className="max-w-[70%] text-left">
                        <p className="text-[8px] md:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-2">{p.sku}</p>
                        <h4 className="text-base md:text-lg font-black uppercase italic text-[var(--text-main)] truncate leading-tight tracking-tighter group-hover:text-[var(--nu-purple)] transition-all">{p.nome}</h4>
                     </div>
                     <span className={`text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1.5 rounded-lg border-2 uppercase tracking-widest ${
                        p.raridade === 'Lendário' ? 'border-yellow-500/40 text-yellow-500 bg-yellow-500/5' : 
                        p.raridade === 'Épico' ? 'border-purple-500/40 text-purple-500 bg-purple-500/5' :
                        'border-[var(--border-color)] text-[var(--text-muted)]'
                     }`}>{p.raridade}</span>
                  </div>

                  <div className="bg-[var(--bg-input)] p-4 md:p-6 rounded-2xl border border-[var(--border-color)] mb-6 md:mb-8 flex items-center justify-between transition-all">
                      <div className="text-left">
                        <p className="text-[8px] md:text-[9px] font-bold text-[var(--text-muted)] uppercase mb-1 tracking-widest">Custo do Item</p>
                        <span className={`text-lg md:text-xl font-black italic text-[var(--nu-info)] ${isOlheiro ? 'blur-md' : ''}`}>{fmt(p.custo_fornecedor)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] md:text-[9px] font-bold text-[var(--text-muted)] uppercase mb-1 tracking-widest">Preço de Venda</p>
                        <span className={`text-xs md:text-sm font-black italic text-[var(--text-main)] ${isOlheiro ? 'blur-md' : ''}`}>{fmt(p.preco_venda_alvo)}</span>
                      </div>
                  </div>

                  <div className="flex flex-col gap-3 mb-6 md:mb-8">
                     <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase italic">
                        <LinkIcon size={14} className="text-[var(--nu-purple)]" />
                        <span className="truncate">{p.fornecedor_nome || 'FORNECEDOR OCULTO'}</span>
                     </div>
                     <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase italic">
                        <Zap size={14} className="text-[var(--nu-purple)]" />
                        <span>QUALIDADE PREMIUM</span>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 md:pt-8 border-t border-[var(--border-color)]">
                   <button onClick={() => { setForm(p); setActiveTab('form'); }} className="flex-1 py-3 md:py-4 bg-[var(--bg-input)] hover:bg-[var(--nu-purple)] hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-[var(--text-muted)]">EDITAR ITEM</button>
                   {/* Fix: Added missing excluir call and removed visualMode argument from subsequent obterTodos call */}
                   <button onClick={() => { if(confirm('Remover item do arsenal?')) { storage.produtos.excluir(p.id); setProducts(storage.produtos.obterTodos()); } }} className="p-3 md:p-4 text-[var(--nu-error)] hover:bg-[var(--nu-error)]/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
             </motion.div>
           ))}
        </div>
      )}

      {activeTab === 'form' && (
        <div className="flex justify-center items-start pt-4 pb-60">
          <motion.form 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={salvar} 
            className="nu-card w-full max-w-2xl p-6 md:p-12 space-y-8 md:space-y-12"
          >
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-6 md:pb-10">
              <div className="flex flex-col">
                <h2 className="text-xl md:text-2xl font-black uppercase italic flex items-center gap-4">
                  <Package size={28} className="text-[var(--nu-purple)]" /> {form.id ? 'EDITAR PRODUTO' : 'CATALOGAR NO ARSENAL'}
                </h2>
                <span className="text-[8px] md:text-[9px] font-bold text-[var(--text-muted)] uppercase mt-2 tracking-[0.4em]">Cadastro Técnico de Mercadoria</span>
              </div>
              <button type="button" onClick={() => setActiveTab('catalogo')} className="p-2 md:p-3 bg-[var(--bg-input)] rounded-2xl"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
               <div className="space-y-3 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] ml-2">Nome do Produto</label>
                  <input required className="nu-input w-full font-bold" value={form.nome || ''} onChange={e=>setForm({...form, nome: e.target.value})} placeholder="EX: FONE BLUETOOTH GTR" />
               </div>
               <div className="space-y-3 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] ml-2">Identificador (SKU)</label>
                  <input required className="nu-input w-full font-bold" value={form.sku || ''} onChange={e=>setForm({...form, sku: e.target.value})} placeholder="SKU-001" />
               </div>
               <div className="space-y-3 md:space-y-4 md:col-span-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] ml-2">Custo do Fornecedor (R$)</label>
                  <input type="number" step="0.01" required className="nu-input w-full font-black text-xl md:text-2xl" value={form.custo_fornecedor || ''} onChange={e=>setForm({...form, custo_fornecedor: Number(e.target.value)})} />
               </div>
               <div className="space-y-3 md:space-y-4 md:col-span-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.3em] ml-2">Nível de Raridade (Demanda)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {['Comum', 'Raro', 'Épico', 'Lendário'].map(r => (
                      <button 
                        key={r} 
                        type="button" 
                        onClick={() => setForm({...form, raridade: r as any})}
                        className={`py-3 md:py-4 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                          form.raridade === r ? 'bg-[var(--nu-purple)] border-[var(--nu-purple)] text-white' : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        {r === 'Comum' ? 'COMUM' : r === 'Raro' ? 'RARO' : r === 'ÉPICO' ? 'ÉPICO' : 'LENDÁRIO'}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            <button type="submit" className="btn-fire w-full !py-6 md:!py-8 text-xs md:text-[14px] tracking-[0.3em] md:tracking-[0.5em]">
              Sincronizar no Arsenal
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
};
