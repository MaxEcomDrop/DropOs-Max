import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, ShoppingCart, Zap, Award, Crosshair, ArrowDown, ArrowUp, Calendar
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
    valor_liquido_recebido: 0, qtd: 1, ads_cost: 0, data: new Date().toISOString().split('T')[0]
  });

  const config = storage.configuracoes.obter();

  useEffect(() => {
    const load = () => {
      setProducts(storage.produtos.obterTodos());
      setSales(storage.vendas.obterTodas());
    };
    load();
    window.addEventListener('storage-update', load);
    return () => window.removeEventListener('storage-update', load);
  }, []);

  const selectedProd = products.find(p => p.id === form.produto_id);
  
  const stats = useMemo(() => {
    const bruto = Math.max(0, (form.valor_venda_un || 0) * (form.qtd || 1));
    const recebido = Math.max(0, form.valor_liquido_recebido || 0);
    const custoProd = Math.max(0, (selectedProd?.custo_fornecedor || 0) * (form.qtd || 1));
    const lucroOp = Math.max(0, recebido - custoProd - (form.ads_cost || 0));
    const comissao = (lucroOp * (config.financeiro.porcentagemFuncionario || 0)) / 100;
    const lucroReal = Math.max(0, lucroOp - comissao);
    return { bruto, custoProd, comissao, lucroReal };
  }, [form, selectedProd, config]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.produto_id) return notificar("Erro: Selecione um item");
    storage.vendas.salvar({
      data_venda: form.data,
      canal: form.canal,
      cliente: 'Operação Local',
      produto_id: form.produto_id,
      produto_nome: selectedProd?.nome || '',
      quantidade: form.qtd,
      valor_venda_un: form.valor_venda_un,
      valor_liquido_recebido: form.valor_liquido_recebido,
      custo_mercadoria_total: stats.custoProd,
      custo_ads: form.ads_cost,
      status: 'Entregue'
    });
    setSuccessOverlay(true);
    setTimeout(() => { setSuccessOverlay(false); setActiveTab('historico'); }, 1500);
    setForm({ produto_id: '', canal: 'TikTok', valor_venda_un: 0, valor_liquido_recebido: 0, qtd: 1, ads_cost: 0, data: new Date().toISOString().split('T')[0] });
  };

  const fmt = (v?: number | null) => isOlheiro ? 'R$ ****' : Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full pb-24">
      <AnimatePresence>
        {successOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
             <div className="flex flex-col items-center p-10 rounded-3xl bg-[var(--bg-card)] border-4 border-[var(--nu-success)] shadow-2xl">
                <Crosshair className="w-12 h-12 text-[var(--nu-success)] animate-pulse mb-4" />
                <h2 className="text-xl font-black uppercase text-[var(--nu-success)]">OPERAÇÃO CONCLUÍDA</h2>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex bg-[var(--bg-input)] p-1.5 rounded-2xl w-fit mx-1 border border-[var(--border-color)]">
        {['nova', 'historico'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === t ? 'bg-[var(--nu-purple)] text-white shadow-md' : 'text-[var(--text-muted)]'}`}>
            {t === 'nova' ? 'REGISTRAR' : 'HISTÓRICO'}
          </button>
        ))}
      </div>

      {activeTab === 'nova' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1">
          <form onSubmit={save} className="lg:col-span-2 nu-card p-6 md:p-8 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase ml-1">Equipamento</label>
                  <select required className="nu-input font-bold" value={form.produto_id} onChange={e=>setForm({...form, produto_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {products.map(p => <option key={p.id} value={p.id} className="text-black">{isOlheiro ? 'HIDDEN' : p.nome}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase ml-1">Cadeia Logística</label>
                  <select className="nu-input font-bold" value={form.canal} onChange={e=>setForm({...form, canal: e.target.value as any})}>
                    <option className="text-black">TikTok</option><option className="text-black">Mercado Livre</option><option className="text-black">Shopee</option><option className="text-black">Site Próprio</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2"><label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Qtd</label>
                   <input type="number" min="1" className="nu-input font-black" value={form.qtd} onChange={e=>setForm({...form, qtd: Number(e.target.value)})} />
                </div>
                <div className="space-y-2"><label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Venda R$</label>
                   <input type="number" step="0.01" className="nu-input font-black" value={form.valor_venda_un || ''} onChange={e=>setForm({...form, valor_venda_un: Number(e.target.value)})} />
                </div>
                <div className="space-y-2"><label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-1">Líquido R$</label>
                   <input type="number" step="0.01" className="nu-input font-black" value={form.valor_liquido_recebido || ''} onChange={e=>setForm({...form, valor_liquido_recebido: Number(e.target.value)})} />
                </div>
             </div>
             <button type="submit" className="btn-fire !w-full !h-14 text-sm">FINALIZAR LANÇAMENTO</button>
          </form>

          <div className="nu-card p-8 bg-gradient-to-br from-[var(--bg-input)] to-[var(--bg-card)] border-2 border-[var(--nu-purple)]/20 flex flex-col justify-center text-center">
             <p className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-4 tracking-widest opacity-60">RESULTADO LÍQUIDO</p>
             <h4 className={`text-4xl md:text-5xl font-black italic tracking-tighter ${stats.lucroReal > 0 ? 'text-[var(--nu-success)]' : 'text-red-500'}`}>
               {fmt(stats.lucroReal)}
             </h4>
             <div className="mt-8 pt-8 border-t border-[var(--border-color)] space-y-3 text-[10px] font-black uppercase text-left">
                <div className="flex justify-between text-[var(--text-muted)]"><span>Bruto</span><span>{fmt(stats.bruto)}</span></div>
                <div className="flex justify-between text-red-500/70"><span>Custo Item</span><span>-{fmt(stats.custoProd)}</span></div>
                <div className="flex justify-between text-[var(--nu-purple)]"><span>Comissão</span><span>-{fmt(stats.comissao)}</span></div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="nu-card overflow-hidden mx-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-[var(--bg-input)] text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest border-b border-[var(--border-color)]">
                <tr><th className="px-6 py-4">Item / Canal</th><th className="px-6 py-4 text-right">Bruto</th><th className="px-6 py-4 text-right">Líquido</th><th className="px-6 py-4 text-right">Lucro Real</th><th className="px-6 py-4 text-center">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {[...sales].reverse().map(s => (
                  <tr key={s.id} className="hover:bg-[var(--nu-purple)]/5 transition-all text-xs">
                    <td className="px-6 py-5 font-bold text-[var(--text-main)]">
                      {isOlheiro ? 'HIDDEN' : s.produto_nome}
                      <span className="block text-[9px] text-[var(--nu-purple)] uppercase tracking-tighter mt-1">{s.canal}</span>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-[var(--text-main)]">{fmt(s.faturamento_bruto)}</td>
                    <td className="px-6 py-5 text-right font-medium text-[var(--text-main)]">{fmt(s.valor_liquido_recebido)}</td>
                    <td className={`px-6 py-5 text-right font-black italic ${s.lucro_real > 0 ? 'text-[var(--nu-success)]' : 'text-red-400'}`}>{fmt(s.lucro_real)}</td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => storage.vendas.excluir(s.id)} className="p-2 text-red-500/30 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
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