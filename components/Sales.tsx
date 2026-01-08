
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
    const taxasPlataforma = Math.max(0, bruto - (form.valor_liquido_recebido || 0));
    const custoProd = Math.max(0, (selectedProd?.custo_fornecedor || 0) * (form.qtd || 1));
    const lucroOp = Math.max(0, (form.valor_liquido_recebido || 0) - custoProd - (form.ads_cost || 0));
    const comissao = (lucroOp * (config.financeiro.porcentagemFuncionario || 0)) / 100;
    const lucroReal = Math.max(0, lucroOp - comissao);
    
    return { bruto, taxasPlataforma, custoProd, comissao, lucroReal };
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
    setTimeout(() => setSuccessOverlay(false), 2000);
    setActiveTab('historico');
    setForm({ produto_id: '', canal: 'TikTok', valor_venda_un: 0, valor_liquido_recebido: 0, qtd: 1, ads_cost: 0, data: new Date().toISOString().split('T')[0] });
  };

  const fmt = (v?: number | null) => {
    if (isOlheiro) return 'R$ ****';
    const val = Number(v ?? 0);
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col gap-10 pb-32 text-left">
      <AnimatePresence>
        {successOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md pointer-events-none">
             <div className="flex flex-col items-center p-16 rounded-[60px] bg-[var(--bg-card)] border-8 border-[var(--nu-success)] shadow-[0_0_100px_rgba(0,255,156,0.4)]">
                <Crosshair strokeWidth={3} className="animate-spin-slow w-20 h-20 text-[var(--nu-success)] mb-8" />
                <h2 className="text-4xl font-black italic uppercase text-[var(--nu-success)] tracking-tighter">OPERADO COM SUCESSO</h2>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex bg-[var(--bg-input)] p-2 rounded-[24px] w-fit border border-[var(--border-color)] shadow-sm">
        {['nova', 'historico'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`px-12 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === t ? 'bg-[var(--nu-purple)] text-white shadow-xl scale-105' : 'text-[var(--text-muted)] hover:bg-[var(--nu-purple)]/5'}`}>
            {t === 'nova' ? 'REGISTRAR OPERAÇÃO' : 'VER HISTÓRICO'}
          </button>
        ))}
      </div>

      {activeTab === 'nova' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <form onSubmit={save} className="lg:col-span-2 nu-card p-12 space-y-12 shadow-2xl">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2">Arsenal (Equipamento)</label>
                  <select required className="nu-input w-full font-bold text-base" value={form.produto_id} onChange={e=>setForm({...form, produto_id: e.target.value})}>
                    <option value="">AGUARDANDO SELEÇÃO...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{isOlheiro ? 'PRODUTO OFUSCADO' : p.nome} ({fmt(p.custo_fornecedor)})</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2">Cadeia Logística</label>
                  <select className="nu-input w-full font-bold text-base" value={form.canal} onChange={e=>setForm({...form, canal: e.target.value as any})}>
                    <option>TikTok</option><option>Mercado Livre</option><option>Shopee</option><option>WhatsApp</option><option>Site Próprio</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Qtd Operada</label>
                   <input type="number" min="1" className="nu-input w-full font-black text-center text-lg" value={form.qtd} onChange={e=>setForm({...form, qtd: Math.max(1, Number(e.target.value))})} />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Venda Unitária</label>
                   <input type="number" step="0.01" min="0" className="nu-input w-full font-bold text-lg" value={form.valor_venda_un || ''} onChange={e=>setForm({...form, valor_venda_un: Number(e.target.value)})} placeholder="0,00" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Saldo Líquido</label>
                   <input type="number" step="0.01" min="0" className="nu-input w-full font-bold text-lg" value={form.valor_liquido_recebido || ''} onChange={e=>setForm({...form, valor_liquido_recebido: Number(e.target.value)})} placeholder="0,00" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Invest. Marketing</label>
                   <input type="number" step="0.01" min="0" className="nu-input w-full font-bold text-lg" value={form.ads_cost || ''} onChange={e=>setForm({...form, ads_cost: Number(e.target.value)})} placeholder="0,00" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Data da Ordem</label>
                   <input type="date" className="nu-input w-full font-black text-center" value={form.data} onChange={e=>setForm({...form, data: e.target.value})} />
                </div>
             </div>
             <button type="submit" className="btn-fire w-full py-8 text-lg">FINALIZAR LANÇAMENTO NO COFRE</button>
          </form>

          {/* CARD DE LUCRO REAL - REESTRUTURADO E MELHORADO PARA DAY MODE */}
          <div className="nu-card p-12 bg-gradient-to-br from-[var(--bg-input)] to-[var(--bg-card)] border-2 border-[var(--nu-purple)]/20 text-center shadow-2xl relative overflow-hidden flex flex-col justify-between">
             <div className="absolute top-0 left-0 w-full h-2 bg-[var(--nu-purple)]"></div>
             
             <div>
                <p className="text-[12px] font-black uppercase text-[var(--text-muted)] mb-4 tracking-[0.4em] opacity-80">RESULTADO LÍQUIDO DA ORDEM</p>
                <motion.h4 
                  key={stats.lucroReal} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className={`text-6xl font-black italic tracking-tighter ${stats.lucroReal > 0 ? 'text-[var(--nu-success)]' : 'text-red-500'}`}
                >
                  {fmt(stats.lucroReal)}
                </motion.h4>
             </div>
             
             <div className="mt-16 space-y-5 text-[12px] font-black uppercase tracking-[0.2em]">
                <div className="flex justify-between pb-4 border-b border-[var(--border-color)] text-[var(--text-main)]"><span className="opacity-50">FATURAMENTO</span><span>{fmt(stats.bruto)}</span></div>
                <div className="flex justify-between pb-4 border-b border-[var(--border-color)] text-red-500/90"><span className="opacity-50">CUSTO ITEM</span><span>-{fmt(stats.custoProd)}</span></div>
                <div className="flex justify-between pb-4 border-b border-[var(--border-color)] text-orange-500/90"><span className="opacity-50">TAXAS PLAT.</span><span>-{fmt(stats.taxasPlataforma)}</span></div>
                <div className="flex justify-between pb-4 border-b border-[var(--border-color)] text-blue-500/90"><span className="opacity-50">COMISSÕES</span><span>-{fmt(stats.comissao)}</span></div>
             </div>

             <div className="mt-10 p-4 bg-[var(--nu-purple)]/10 rounded-2xl border border-[var(--nu-purple)]/20">
                <p className="text-[9px] font-bold text-[var(--nu-purple)] uppercase tracking-[0.3em]">Eficiência da Operação: {stats.bruto > 0 ? ((stats.lucroReal / stats.bruto) * 100).toFixed(1) : 0}%</p>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="nu-card overflow-hidden shadow-2xl border-[var(--border-color)]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-input)] text-[11px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                <th className="px-10 py-8">OPERADOR / ITEM</th>
                <th className="px-10 py-8 text-right">FATM. BRUTO</th>
                <th className="px-10 py-8 text-right">LÍQUIDO CONTA</th>
                <th className="px-10 py-8 text-right">LUCRO REAL</th>
                <th className="px-10 py-8 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {sales.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-[13px] font-black uppercase opacity-20 italic tracking-[0.5em]">Aguardando transmissão de dados operacional...</td></tr>
              ) : [...sales].reverse().map(s => (
                <tr key={s.id} className="hover:bg-[var(--nu-purple)]/5 transition-all group">
                  <td className="px-10 py-8">
                    <p className="text-sm font-black italic uppercase text-[var(--text-main)] tracking-tighter">{isOlheiro ? 'HIDDEN-PROD' : s.produto_nome}</p>
                    <p className="text-[10px] font-bold text-[var(--nu-purple)] mt-2 uppercase tracking-widest">{s.canal} • {new Date(s.data_venda).toLocaleDateString()}</p>
                  </td>
                  <td className="px-10 py-8 text-right text-sm font-bold text-[var(--text-muted)]">{fmt(s.faturamento_bruto)}</td>
                  <td className="px-10 py-8 text-right text-sm font-bold text-[var(--text-muted)]/80">{fmt(s.valor_liquido_recebido)}</td>
                  <td className={`px-10 py-8 text-right font-black italic text-lg ${s.lucro_real > 0 ? 'text-[var(--nu-success)]' : 'text-red-400'}`}>{fmt(s.lucro_real)}</td>
                  <td className="px-10 py-8 text-center">
                    <button onClick={() => { if(confirm('Eliminar registro permanentemente?')) storage.vendas.excluir(s.id); }} className="p-3 text-red-500/20 group-hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><Trash2 size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
