
import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Trash2, AlertCircle, Search, Clock, CreditCard, 
  TrendingUp, TrendingDown, Save, X, Ghost, AlertTriangle 
} from 'lucide-react';
import { Product, Supplier } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface ProductsProps { isOlheiro: boolean; }

export const Products: React.FC<ProductsProps> = ({ isOlheiro }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [viewMode, setViewMode] = useState<'produtos' | 'fornecedores'>('produtos');

  const [newProduct, setNewProduct] = useState<Partial<Product>>({ estoque_tipo: 'Físico', quantidade: 0, min_estoque: 5 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: pData, error: pError } = await supabase.from('produtos').select('*');
      const { data: sData, error: sError } = await supabase.from('fornecedores').select('*');
      
      if (!handleSupabaseError(pError)) setProducts(pData || []);
      if (!handleSupabaseError(sError)) setSuppliers(sData || []);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert("Erro: Banco de dados não configurado.");
    
    // VERIFICAÇÃO DE DUPLICIDADE
    const exists = products.find(p => p.sku === newProduct.sku);
    if (exists) return alert("ERRO: Este SKU já está cadastrado no sistema!");

    const { error } = await supabase.from('produtos').insert([newProduct]);
    if (!handleSupabaseError(error)) {
        alert("Produto Cadastrado com Sucesso!");
        setShowProductForm(false);
        fetchData();
    }
  };

  const isZombie = (lastSold?: string) => {
    if (!lastSold) return true;
    const diff = new Date().getTime() - new Date(lastSold).getTime();
    return diff > (60 * 24 * 60 * 60 * 1000);
  };

  const formatCurrency = (val: number) => isOlheiro ? '****' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-8 animate-fade-in">
      {!supabase && (
        <div className="p-4 bg-amber-500/10 border border-amber-500 text-amber-500 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-xs font-bold uppercase tracking-tight">Modo Demonstração: Banco de dados offline. Verifique as credenciais Supabase.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="nu-card flex items-center gap-4 border-red-500/20 bg-red-500/5">
           <div className="p-3 bg-red-500 rounded-xl text-white animate-pulse"><Ghost size={20}/></div>
           <div>
              <p className="text-[10px] font-black uppercase text-red-500">Zumbis (>60d)</p>
              <p className="text-xl font-bold">{products.filter(p => isZombie(p.last_sold_at)).length}</p>
           </div>
        </div>
        <div className="nu-card flex items-center gap-4 border-orange-500/20 bg-orange-500/5">
           <div className="p-3 bg-orange-500 rounded-xl text-white"><AlertTriangle size={20}/></div>
           <div>
              <p className="text-[10px] font-black uppercase text-orange-500">Ruptura (Min)</p>
              <p className="text-xl font-bold">{products.filter(p => p.quantidade <= p.min_estoque).length}</p>
           </div>
        </div>
        <div className="nu-card flex items-center gap-4 border-[#820AD1]/20 bg-[#820AD1]/5">
           <div className="p-3 bg-[#820AD1] rounded-xl text-white"><Clock size={20}/></div>
           <div>
              <p className="text-[10px] font-black uppercase text-[#820AD1]">Atraso Médio</p>
              <p className="text-xl font-bold">12 Dias</p>
           </div>
        </div>
        <div className="nu-card flex items-center gap-4 border-[#03D56F]/20 bg-[#03D56F]/5">
           <div className="p-3 bg-[#03D56F] rounded-xl text-white"><CreditCard size={20}/></div>
           <div>
              <p className="text-[10px] font-black uppercase text-[#03D56F]">Haver Fornecedor</p>
              <p className="text-xl font-bold">{formatCurrency(suppliers.reduce((acc, s) => acc + s.saldo_haver, 0))}</p>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-3xl border border-[var(--border-color)]">
        <div className="flex gap-2">
            <button onClick={() => setViewMode('produtos')} className={`px-6 py-2 rounded-2xl text-xs font-bold transition-all ${viewMode === 'produtos' ? 'bg-[#820AD1] text-white' : 'text-[var(--text-muted)]'}`}>Estoque</button>
            <button onClick={() => setViewMode('fornecedores')} className={`px-6 py-2 rounded-2xl text-xs font-bold transition-all ${viewMode === 'fornecedores' ? 'bg-[#820AD1] text-white' : 'text-[var(--text-muted)]'}`}>Parceiros</button>
        </div>
        <button onClick={() => setShowProductForm(true)} className="nu-button-primary flex items-center gap-2 text-xs">
          <Plus size={16}/> Novo Cadastro
        </button>
      </div>

      {showProductForm && (
        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={createProduct} className="nu-card w-full max-w-lg space-y-6">
            <h3 className="font-bold uppercase tracking-widest text-sm border-b border-[var(--border-color)] pb-4">Cadastro V8</h3>
            <div className="grid grid-cols-2 gap-4">
               <input required placeholder="SKU Único" className="nu-input" onChange={e=>setNewProduct({...newProduct, sku: e.target.value})} />
               <input required placeholder="Nome Comercial" className="nu-input" onChange={e=>setNewProduct({...newProduct, nome: e.target.value})} />
               <select className="nu-input" onChange={e=>setNewProduct({...newProduct, estoque_tipo: e.target.value as any})}>
                  <option value="Físico">Estoque Físico</option>
                  <option value="Virtual">Virtual (Drop)</option>
               </select>
               <input required type="number" placeholder="Estoque Mínimo (Alerta)" className="nu-input" onChange={e=>setNewProduct({...newProduct, min_estoque: Number(e.target.value)})} />
               <input required type="number" step="0.01" placeholder="Custo R$" className="nu-input" onChange={e=>setNewProduct({...newProduct, custo: Number(e.target.value)})} />
               <input required type="number" step="0.01" placeholder="Venda R$" className="nu-input" onChange={e=>setNewProduct({...newProduct, preco_venda: Number(e.target.value)})} />
            </div>
            <button type="submit" className="nu-button-primary w-full">Salvar com Verificação</button>
            <button type="button" onClick={()=>setShowProductForm(false)} className="w-full text-xs font-bold text-[var(--text-muted)]">CANCELAR</button>
          </form>
        </div>
      )}

      <div className="nu-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
              <tr className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <th className="p-6">Identificação / SKU</th>
                <th className="p-6">Estoque / Min</th>
                <th className="p-6">Margem Bruta</th>
                <th className="p-6">Status Inteligente</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {products.map(p => {
                const zombie = isZombie(p.last_sold_at);
                const low = p.quantidade <= p.min_estoque;
                const margem = p.preco_venda > 0 ? ((p.preco_venda - p.custo) / p.preco_venda) * 100 : 0;
                return (
                  <tr key={p.id} className={`hover:bg-[var(--bg-primary)] transition-colors ${zombie ? 'bg-red-500/5' : ''}`}>
                    <td className="p-6">
                      <p className="font-bold text-sm">{p.nome}</p>
                      <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-tighter">{p.sku}</p>
                    </td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${low ? 'bg-orange-500 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'}`}>
                         {p.quantidade} / {p.min_estoque}
                       </span>
                    </td>
                    <td className="p-6">
                       <p className={`text-sm font-bold ${margem < 20 ? 'text-red-500' : 'text-[#03D56F]'}`}>{margem.toFixed(1)}%</p>
                       <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Lucro: {formatCurrency(p.preco_venda - p.custo)}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        {zombie && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-sm uppercase">Zumbi</span>}
                        {low && <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-sm uppercase">Reposição</span>}
                        {!zombie && !low && <span className="bg-[#03D56F]/20 text-[#03D56F] text-[8px] font-black px-2 py-0.5 rounded-sm uppercase">Saudável</span>}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                       <button className="p-2 text-[var(--text-muted)] hover:text-red-500"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center italic text-[var(--text-muted)] text-sm">Nenhum produto cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
