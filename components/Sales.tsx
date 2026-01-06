
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calculator, AlertTriangle, Info, TrendingUp, TrendingDown, RefreshCcw, CreditCard, Box, Zap } from 'lucide-react';
import { Channel, CNPJ, Product } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface SalesProps { isOlheiro: boolean; }

export const Sales: React.FC<SalesProps> = ({ isOlheiro }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    data: new Date().toISOString().split('T')[0], 
    canal: 'Mercado Livre' as Channel, 
    cnpj: 'Loja A' as CNPJ, 
    productId: '', 
    qtd: 1,
    valorBruto: 0, 
    valorLiquido: 0,
    isServico: false,
    isDevolucao: false
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [profit, setProfit] = useState<number | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('produtos').select('*');
    if (!handleSupabaseError(error)) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const p = products.find(item => item.id === form.productId);
    setSelectedProduct(p || null);
  }, [form.productId, products]);

  useEffect(() => {
    if (selectedProduct && form.valorLiquido > 0) {
      const totalCusto = selectedProduct.custo * form.qtd;
      setProfit(form.valorLiquido - totalCusto);
    } else { setProfit(null); }
  }, [selectedProduct, form.valorLiquido, form.qtd]);

  const registrarVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert("Erro: Banco de dados não configurado.");
    if (!form.productId) return alert("Selecione um produto.");
    if (profit !== null && profit < 0 && !confirm("ATENÇÃO: Venda com PREJUÍZO detectado! Deseja continuar?")) return;

    const { error } = await supabase.from('vendas').insert([form]);
    if (!handleSupabaseError(error)) {
        if (!form.isServico && selectedProduct) {
            const newQty = form.isDevolucao ? selectedProduct.quantidade + form.qtd : selectedProduct.quantidade - form.qtd;
            await supabase.from('produtos').update({ quantidade: newQty, last_sold_at: new Date().toISOString() }).eq('id', selectedProduct.id);
        }
        alert("Operação Registrada!");
        setForm({ ...form, valorBruto: 0, valorLiquido: 0, productId: '' });
        fetchProducts();
    }
  };

  const formatCurrency = (val: number) => isOlheiro ? 'R$ ****' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Form Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="nu-card space-y-8">
           <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-6">
              <Zap className="text-[#820AD1]" />
              <h2 className="text-xl font-bold uppercase tracking-widest">Lançamento Rápido</h2>
           </div>
           <form onSubmit={registrarVenda} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <select className="nu-input font-bold" value={form.cnpj} onChange={e=>setForm({...form, cnpj: e.target.value as any})}>
                    <option value="Loja A">Loja A (CNPJ Principal)</option>
                    <option value="Loja B">Loja B (Secundário)</option>
                 </select>
                 <select className="nu-input font-bold" value={form.canal} onChange={e=>setForm({...form, canal: e.target.value as any})}>
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="Shopee">Shopee</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Balcão">Venda Balcão</option>
                 </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <select required className="nu-input md:col-span-3 font-bold" value={form.productId} onChange={e=>setForm({...form, productId: e.target.value})}>
                    <option value="">Buscar Produto / SKU...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.sku} | {p.nome} ({p.quantidade} un)</option>)}
                 </select>
                 <input type="number" min="1" className="nu-input font-bold" value={form.qtd} onChange={e=>setForm({...form, qtd: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input required type="number" step="0.01" placeholder="Valor Bruto (Cliente)" className="nu-input" onChange={e=>setForm({...form, valorBruto: Number(e.target.value)})} />
                 <input required type="number" step="0.01" placeholder="Líquido na Conta" className="nu-input border-[#820AD1] bg-[#820AD1]/5 font-black" onChange={e=>setForm({...form, valorLiquido: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4">
                 <label className="flex-1 p-4 rounded-2xl border border-[var(--border-color)] flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" onChange={e=>setForm({...form, isServico: e.target.checked})} className="accent-[#820AD1]" />
                    <span className="text-[10px] font-black uppercase">Serviço (Sem Estoque)</span>
                 </label>
                 <label className="flex-1 p-4 rounded-2xl border border-red-500/30 bg-red-500/5 flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" onChange={e=>setForm({...form, isDevolucao: e.target.checked})} className="accent-red-500" />
                    <span className="text-[10px] font-black uppercase text-red-500">Devolução / Estorno</span>
                 </label>
              </div>
              <button type="submit" disabled={!supabase} className="nu-button-primary w-full py-6 text-base tracking-[0.2em] uppercase disabled:opacity-50">
                {supabase ? 'Registrar Operação' : 'Offline'}
              </button>
           </form>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="space-y-6">
        <div className={`nu-card text-center p-8 transition-all ${profit!==null && profit < 0 ? 'bg-red-500/10 border-red-500' : ''}`}>
           <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">Simulador de Margem Líquida</p>
           {profit !== null ? (
              <div className="space-y-4">
                 <div className={`text-5xl font-bold tracking-tighter ${profit < 0 ? 'text-red-500' : 'text-[#03D56F]'}`}>{formatCurrency(profit)}</div>
                 <div className="flex justify-center gap-2">
                    {profit < 0 ? <TrendingDown className="text-red-500"/> : <TrendingUp className="text-[#03D56F]"/>}
                    <span className={`text-[10px] font-black uppercase px-4 py-1 rounded-full ${profit < 0 ? 'bg-red-500 text-white' : 'bg-[#03D56F]/20 text-[#03D56F]'}`}>
                       {profit < 0 ? 'Prejuízo' : 'Lucrativo'}
                    </span>
                 </div>
              </div>
           ) : <p className="text-xs italic text-[var(--text-muted)] p-10">Selecione um produto e digite o valor líquido para simular.</p>}
        </div>

        <div className="nu-card bg-[var(--bg-primary)] p-6 space-y-4">
           <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[#820AD1]"><Calculator size={14}/> Worth it? (DAS 6%)</h4>
           <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-bold">Imposto Estimado:</span>
              <span className="font-bold text-red-500">{formatCurrency(form.valorBruto * 0.06)}</span>
           </div>
           <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-bold">Custo Mercadoria:</span>
              <span className="font-bold">{formatCurrency((selectedProduct?.custo || 0) * form.qtd)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
