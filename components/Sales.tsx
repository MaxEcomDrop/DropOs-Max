import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, ShoppingCart, Zap, Award, Crosshair
} from 'lucide-react';
import { storage, notificar } from '../lib/storage';
import { Produto, Venda, CanalVenda } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Sales: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [products, setProducts] = useState<Produto[]>([]);
  const [sales, setSales] = useState<Venda[]>([]);
  const [activeTab, setActiveTab] = useState<'nova' | 'historico'>('nova');
  const [successOverlay, setSuccessOverlay] = useState(false);
  const [form, setForm] = useState({ 
    produto_id: '', canal: 'TikTok' as CanalVenda, valor_venda_un: 0, 
    valor_liquido_recebido: 0, qtd: 1, ads_cost: 0
  });

  useEffect(() => {
    // Fix: Removed unused arguments to match storage.produtos.obterTodos and storage.vendas.obterTodas signatures
    setProducts(storage.produtos.obterTodos());
    setSales(storage.vendas.obterTodas());
  }, []);

  const selectedProd = products.find(p => p.id === form.produto_id);
  
  const stats = useMemo(() => {
    const bruto = form.valor_venda_un * form.qtd;
    const custo = (selectedProd?.custo_fornecedor || 0) * form.qtd;
    const lucro = form.valor_liquido_recebido - custo - form.ads_cost;
    const margem = bruto > 0 ? (lucro / bruto) * 100 : 0;
    return { bruto, custo, margem, lucro };
  }, [form, selectedProd]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.produto_id) return notificar("Produto não selecionado");
    
    storage.vendas.salvar({
      data_venda: new Date().toISOString(),
      canal: form.canal,
      cliente: 'Cliente Ecommerce',
      produto_id: form.produto_id,
      produto_nome: selectedProd?.nome || '',
      quantidade: form.qtd,
      valor_venda_un: form.valor_venda_un,
      faturamento_bruto: stats.bruto,
      valor_liquido_recebido: form.valor_liquido_recebido,
      custo_mercadoria_total: stats.custo,
      lucro_real: stats.lucro,
      custo_ads: form.ads_cost,
      status: 'Entregue'
    });

    setSuccessOverlay(true);
    setTimeout(() => setSuccessOverlay(false), 2500);

    notificar("Pedido Confirmado [+250 XP]");
    setSales(storage.vendas.obterTodas());
    setActiveTab('historico');
    setForm({ produto_id: '', canal: 'TikTok', valor_venda_un: 0, valor_liquido_recebido: 0, qtd: 1, ads_cost: 0 });
    window.dispatchEvent(new Event('storage-update'));
  };

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-20 page-container">
      <AnimatePresence>
        {successOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none"
          >
             <motion.div 
               initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
               className="flex flex-col items-center p-10 md:p-20 rounded-[30px] md:rounded-[50px] bg-[var(--bg-card)] border-4 border-[var(--nu-success)] shadow-[0_0_100px_rgba(0,255,156,0.2)]"
             >
                <div className="p-6 md:p-10 bg-[var(--nu-success)]/10 text-[var(--nu-success)] rounded-full mb-6 md:mb-10">
                   <Crosshair strokeWidth={3} className="animate-spin-slow w-[60px] h-[60px] md:w-[100px] md:h-[100px]" />
                </div>
                <h2 className="text-3xl md:text-7xl font-black italic uppercase text-[var(--nu-success)] tracking-tighter text-center">PEDIDO CONFIRMADO</h2>
                <p className="text-sm md:text-2xl font-black text-[var(--text-muted)] uppercase tracking-[0.3em] md:tracking-[0.5em] mt-4 md:mt-8">+250 XP COLETADO</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex bg-[var(--bg-input)] p-1.5 rounded-2xl w-full md:w-fit border border-[var(--border-color)]">
        {['nova', 'historico'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 md:flex-none px-6 md:px-12 py-3 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === t ? 'bg-[var(--nu-purple)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
            {t === 'nova' ? 'NOVO PEDIDO' : 'HISTÓRICO DE VENDAS'}
          </button>
        ))}
      </div>

      {activeTab === 'nova' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 text-left">
          <motion.form 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            onSubmit={save} 
            className="lg:col-span-2 nu-card p-6 md:p-12 space-y-8 md:space-y-12"
          >
             <div className="flex flex-col">
                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter flex items-center gap-5">
                  <ShoppingCart size={28} className="text-[var(--nu-purple)]" /> REGISTRO DE VENDAS
                </h3>
                <span className="text-[8px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase mt-2 tracking-[0.4em]">Entrada Manual de Pedidos Offline</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                <div className="space-y-3 md:space-y-4 text-left">
                  <label className="text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2">Escolha o Produto</label>
                  <select required className="nu-input w-full font-bold" value={form.produto_id} onChange={e=>setForm({...form, produto_id: e.target.value})}>
                    <option value="">SELECIONE NO ARSENAL...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-3 md:space-y-4 text-left">
                  <label className="text-[9px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2">Canal de Venda</label>
                  <select className="nu-input w-full font-bold" value={form.canal} onChange={e=>setForm({...form, canal: e.target.value as any})}>
                    <option>TikTok</option><option>Mercado Livre</option><option>Shopee</option><option>WhatsApp</option><option>Instagram</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <div className="space-y-2 md:space-y-3">
                   <label className="text-[8px] md:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">QTD</label>
                   <input type="number" className="nu-input w-full font-black text-center" value={form.qtd} onChange={e=>setForm({...form, qtd: Number(e.target.value)})} />
                </div>
                <div className="space-y-2 md:space-y-3">
                   <label className="text-[8px] md:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">VALOR UN.</label>
                   <input type="number" step="0.01" className="nu-input w-full font-bold" value={form.valor_venda_un || ''} onChange={e=>setForm({...form, valor_venda_un: Number(e.target.value)})} />
                </div>
                <div className="space-y-2 md:space-y-3">
                   <label className="text-[8px] md:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">RECEBIDO</label>
                   <input type="number" step="0.01" className="nu-input w-full font-bold" value={form.valor_liquido_recebido || ''} onChange={e=>setForm({...form, valor_liquido_recebido: Number(e.target.value)})} />
                </div>
                <div className="space-y-2 md:space-y-3">
                   <label className="text-[8px] md:text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">CUSTO ADS</label>
                   <input type="number" step="0.01" className="nu-input w-full font-bold" value={form.ads_cost || ''} onChange={e=>setForm({...form, ads_cost: Number(e.target.value)})} />
                </div>
             </div>

             <button type="submit" className="btn-fire w-full italic text-xs md:text-sm">
               CONFIRMAR VENDA E PEDIDO
             </button>
          </motion.form>

          <div className="flex flex-col gap-6 md:gap-8">
            <div className="nu-card p-6 md:p-10 flex flex-col justify-between min-h-[350px] md:h-[460px] relative overflow-hidden bg-gradient-to-br from-[var(--nu-purple)] to-[#4B0082]">
               <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
                  <Crosshair size={140} />
               </div>
               
               <div className="text-center z-10 pt-4">
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] mb-6 md:mb-10 opacity-60 italic text-white">LUCRO DA OPERAÇÃO</p>
                  <h4 className={`text-4xl md:text-6xl font-black italic tracking-tighter mb-6 md:mb-10 text-white ${isOlheiro ? 'blur-md' : ''}`}>
                    {fmt(stats.lucro)}
                  </h4>
                  <div className={`inline-flex items-center gap-3 md:gap-4 px-6 md:px-8 py-2 md:py-3 rounded-full border-2 border-white/40 bg-white/10 text-white`}>
                    <Zap size={18} className="fill-current" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{stats.margem.toFixed(1)}% MARGEM</span>
                  </div>
               </div>
               
               <div className="space-y-4 md:space-y-6 pb-4 z-10 text-white/80">
                  <div className="flex justify-between items-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2">
                    <span className="italic">Total do Pedido</span>
                    <span className="font-bold">{fmt(stats.bruto)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2">
                    <span className="italic">Custo de Produto</span>
                    <span className="font-bold text-red-300">-{fmt(stats.custo)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] border-b border-white/10 pb-2">
                    <span className="italic">Investimento Ads</span>
                    <span className="font-bold text-blue-300">-{fmt(form.ads_cost)}</span>
                  </div>
               </div>
            </div>

            <div className="nu-card p-6 md:p-8 bg-[var(--nu-purple)]/5 border-2 border-[var(--nu-purple)]/20 text-left">
               <div className="flex items-center gap-4 md:gap-5">
                  <Award size={32} className="text-[var(--nu-purple)]" />
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.3em]">RECOMPENSA DE OPERADOR</p>
                    <p className="text-[8px] md:text-[9px] font-bold text-[var(--text-muted)] uppercase mt-1">Vendas confirmadas geram +250 EXP no sistema.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="nu-card overflow-hidden">
          <div className="overflow-x-auto nu-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] md:text-[10px] font-black uppercase bg-[var(--highlight-bg)] text-[var(--highlight-text)]">
                  <th className="px-6 md:px-10 py-5 md:py-7">PEDIDO / PRODUTO</th>
                  <th className="px-6 md:px-10 py-5 md:py-7 text-right">VALOR RECEBIDO</th>
                  <th className="px-6 md:px-10 py-5 md:py-7 text-right">LUCRO LÍQUIDO</th>
                  <th className="px-6 md:px-10 py-5 md:py-7 text-center">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {sales.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 md:py-40 text-center text-[10px] md:text-[11px] font-black uppercase opacity-20 italic tracking-[0.5em]">Sem pedidos no momento</td></tr>
                ) : [...sales].reverse().map(s => (
                  <tr key={s.id} className="hover:bg-[var(--bg-input)] transition-all">
                    <td className="px-6 md:px-10 py-6 md:py-8 text-left">
                       <p className="text-xs md:text-sm font-black text-[var(--text-main)] uppercase italic">{s.produto_nome}</p>
                       <p className="text-[8px] md:text-[9px] font-black text-[var(--nu-purple)] uppercase tracking-widest mt-1">{s.canal}</p>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-8 text-right text-[10px] md:text-xs font-bold text-[var(--text-muted)] tabular-nums">
                      {isOlheiro ? '******' : fmt(s.valor_liquido_recebido)}
                    </td>
                    <td className={`px-6 md:px-10 py-6 md:py-8 text-right font-black italic text-base md:text-lg tabular-nums ${s.lucro_real >= 0 ? 'text-[var(--nu-success)]' : 'text-[var(--nu-error)]'}`}>
                      {isOlheiro ? '******' : fmt(s.lucro_real)}
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                      <button onClick={() => { if(confirm('Remover registro de venda?')) storage.vendas.excluir(s.id); }} className="p-3 md:p-4 text-[var(--nu-error)]/40 hover:text-[var(--nu-error)] hover:bg-[var(--nu-error)]/10 rounded-2xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
