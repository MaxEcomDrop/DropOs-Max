
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calculator, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Channel, Product } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

export const Sales: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ 
    data_venda: new Date().toISOString().split('T')[0], 
    canal: 'Mercado Livre' as Channel, 
    loja: 'Loja A', 
    produto_id: '', 
    qtd: 1,
    valor_bruto: 0, 
    valor_liquido: 0
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [profit, setProfit] = useState<number | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('produtos').select('*');
    if (!handleSupabaseError(error)) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const p = products.find(item => item.id === form.produto_id);
    setSelectedProduct(p || null);
  }, [form.produto_id, products]);

  useEffect(() => {
    if (selectedProduct && form.valor_liquido > 0) {
      const totalCusto = selectedProduct.custo * form.qtd;
      setProfit(form.valor_liquido - totalCusto);
    } else { setProfit(null); }
  }, [selectedProduct, form.valor_liquido, form.qtd]);

  const registrarVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!form.produto_id || !selectedProduct) return alert("Selecione um produto.");
    
    const custo_total = selectedProduct.custo * form.qtd;
    const lucro_real = form.valor_liquido - custo_total;

    const { error } = await supabase.from('vendas').insert([{
      data_venda: form.data_venda,
      canal: form.canal,
      loja: form.loja,
      produto: selectedProduct.nome,
      qtd: form.qtd,
      valor_bruto: form.valor_bruto,
      valor_liquido: form.valor_liquido,
      custo_produto: custo_total,
      lucro_real: lucro_real
    }]);

    if (!handleSupabaseError(error)) {
        alert("Venda registrada!");
        setForm({ ...form, valor_bruto: 0, valor_liquido: 0, produto_id: '' });
        fetchProducts();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="nu-card space-y-8">
         <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-6 text-[#820AD1]">
            <Zap />
            <h2 className="text-xl font-bold uppercase tracking-widest">Registrar Venda (Supabase Sync)</h2>
         </div>
         <form onSubmit={registrarVenda} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <select className="nu-input font-bold" value={form.loja} onChange={e=>setForm({...form, loja: e.target.value})}>
                  <option value="Loja A">Loja A (CNPJ Principal)</option>
                  <option value="Loja B">Loja B (Secundário)</option>
               </select>
               <select className="nu-input font-bold" value={form.canal} onChange={e=>setForm({...form, canal: e.target.value as any})}>
                  <option value="Mercado Livre">Mercado Livre</option>
                  <option value="Shopee">Shopee</option>
                  <option value="WhatsApp">WhatsApp</option>
               </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <select required className="nu-input md:col-span-3 font-bold" value={form.produto_id} onChange={e=>setForm({...form, produto_id: e.target.value})}>
                  <option value="">Produto...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.sku} | {p.nome}</option>)}
               </select>
               <input type="number" min="1" className="nu-input" value={form.qtd} onChange={e=>setForm({...form, qtd: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <input required type="number" step="0.01" value={form.valor_bruto || ''} placeholder="Valor Bruto R$" className="nu-input" onChange={e=>setForm({...form, valor_bruto: Number(e.target.value)})} />
               <input required type="number" step="0.01" value={form.valor_liquido || ''} placeholder="Líquido R$" className="nu-input border-[#820AD1] bg-[#820AD1]/5" onChange={e=>setForm({...form, valor_liquido: Number(e.target.value)})} />
            </div>
            <button type="submit" className="nu-button-primary w-full py-4 uppercase">Salvar Venda</button>
         </form>
      </div>

      {profit !== null && (
        <div className={`nu-card text-center p-8 ${profit < 0 ? 'border-red-500 bg-red-500/5' : 'border-[#03D56F] bg-[#03D56F]/5'}`}>
           <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Resultado Real Calculado</p>
           <div className={`text-4xl font-bold ${profit < 0 ? 'text-red-500' : 'text-[#03D56F]'}`}>
              {isOlheiro ? 'R$ ****' : profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </div>
        </div>
      )}
    </div>
  );
};
