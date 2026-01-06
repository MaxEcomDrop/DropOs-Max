
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calculator, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Channel, Product } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface SalesProps { isOlheiro: boolean; }

export const Sales: React.FC<SalesProps> = ({ isOlheiro }) => {
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
    if (!supabase) return alert("Erro: Supabase não conectado.");
    if (!form.produto_id || !selectedProduct) return alert("Selecione um produto.");
    
    const custo_total = selectedProduct.custo * form.qtd;
    const lucro_real = form.valor_liquido - custo_total;

    if (lucro_real < 0 && !confirm("ATENÇÃO: Venda com PREJUÍZO! Continuar?")) return;

    // INSERT respeitando o schema fornecido
    const { error } = await supabase.from('vendas').insert([{
      data_venda: form.data_venda,
      canal: form.canal,
      loja: form.loja,
      produto: selectedProduct.nome, // Salvando o nome do produto conforme sugerido no schema
      qtd: form.qtd,
      valor_bruto: form.valor_bruto,
      valor_liquido: form.valor_liquido,
      custo_produto: custo_total,
      lucro_real: lucro_real
    }]);

    if (!handleSupabaseError(error)) {
        alert("Venda registrada com sucesso!");
        setForm({ ...form, valor_bruto: 0, valor_liquido: 0, produto_id: '' });
        fetchProducts();
    }
  };

  const formatCurrency = (val: number) => isOlheiro ? 'R$ ****' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        <div className="nu-card space-y-8">
           <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-6">
              <Zap className="text-[#820AD1]" />
              <h2 className="text-xl font-bold uppercase tracking-widest">Registrar Venda Real</h2>
           </div>
           <form onSubmit={registrarVenda} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <select className="nu-input font-bold" value={form.loja} onChange={e=>setForm({...form, loja: e.target.value})}>
                    <option value="Loja A">Loja A (Principal)</option>
                    <option value="Loja B">Loja B (Secundário)</option>
                 </select>
                 <select className="nu-input font-bold" value={form.canal} onChange={e=>setForm({...form, canal: e.target.value as any})}>
                    <option value="Mercado Livre">Mercado Livre</option>
                    <option value="Shopee">Shopee</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Balcão">Balcão</option>
                 </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <select required className="nu-input md:col-span-3 font-bold" value={form.produto_id} onChange={e=>setForm({...form, produto_id: e.target.value})}>
                    <option value="">Buscar Produto do Banco...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.sku} | {p.nome}</option>)}
                 </select>
                 <input type="number" min="1" className="nu-input font-bold" value={form.qtd} onChange={e=>setForm({...form, qtd: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] ml-2">Venda Bruta (R$)</span>
                    <input required type="number" step="0.01" value={form.valor_bruto || ''} className="nu-input" onChange={e=>setForm({...form, valor_bruto: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#820AD1] ml-2">Líquido na Conta (R$)</span>
                    <input required type="number" step="0.01" value={form.valor_liquido || ''} className="nu-input border-[#820AD1] bg-[#820AD1]/5 font-black" onChange={e=>setForm({...form, valor_liquido: Number(e.target.value)})} />
                 </div>
              </div>
              <button type="submit" className="nu-button-primary w-full py-6 text-base tracking-[0.2em] uppercase">
                Enviar para Supabase
              </button>
           </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className={`nu-card text-center p-8 transition-all ${profit!==null && profit < 0 ? 'bg-red-500/10 border-red-500' : ''}`}>
           <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2">Simulador de Lucro Real</p>
           {profit !== null ? (
              <div className="space-y-4">
                 <div className={`text-5xl font-bold tracking-tighter ${profit < 0 ? 'text-red-500' : 'text-[#03D56F]'}`}>{formatCurrency(profit)}</div>
                 <div className="flex justify-center gap-2">
                    {profit < 0 ? <TrendingDown className="text-red-500"/> : <TrendingUp className="text-[#03D56F]"/>}
                    <span className={`text-[10px] font-black uppercase px-4 py-1 rounded-full ${profit < 0 ? 'bg-red-500 text-white' : 'bg-[#03D56F]/20 text-[#03D56F]'}`}>
                       {profit < 0 ? 'Prejuízo' : 'Lucro OK'}
                    </span>
                 </div>
              </div>
           ) : <p className="text-xs italic text-[var(--text-muted)] p-10 text-center">Aguardando dados da venda...</p>}
        </div>

        <div className="nu-card bg-[var(--bg-primary)] p-6 space-y-4">
           <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[#820AD1]"><Calculator size={14}/> Detalhamento</h4>
           <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-bold">Taxas Plataforma:</span>
              <span className="font-bold text-red-500">{formatCurrency(form.valor_bruto - form.valor_liquido)}</span>
           </div>
           <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-bold">Custo de Compra:</span>
              <span className="font-bold">{formatCurrency((selectedProduct?.custo || 0) * form.qtd)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
