
import React, { useState, useEffect } from 'react';
import { Plus, Package, Users, Trash2 } from 'lucide-react';
import { Product, Supplier } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

export const Products: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<'lista' | 'fornecedor' | 'produto'>('lista');
  const [loading, setLoading] = useState(false);

  // Estados dos formulários com nomes internos para o UI, mas mapeados no INSERT
  const [supForm, setSupForm] = useState({ 
    nome: '', 
    contato: '', 
    saldo_haver: 0 
  });
  
  const [prodForm, setProdForm] = useState({ 
    sku: '', 
    nome: '', 
    tipo: 'Físico' as any, 
    fornecedor: '', 
    custo: 0, 
    preco_venda: 0
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data: p } = await supabase.from('produtos').select('*').order('created_at', { ascending: false });
    const { data: s } = await supabase.from('fornecedores').select('*').order('nome');
    setProducts(p || []);
    setSuppliers(s || []);
    setLoading(false);
  };

  const onSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    // Mapeamento exato para a tabela 'fornecedores' do Supabase
    const { error } = await supabase.from('fornecedores').insert([{
      nome: supForm.nome,
      contato: supForm.contato,
      saldo_haver: supForm.saldo_haver
    }]);

    if (!handleSupabaseError(error)) {
      alert("Fornecedor cadastrado com sucesso!");
      setSupForm({ nome: '', contato: '', saldo_haver: 0 });
      setActiveTab('lista');
      fetchData();
    }
  };

  const onSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!prodForm.fornecedor) return alert("Selecione um fornecedor!");
    if (products.some(p => p.sku === prodForm.sku)) return alert("Erro: SKU já cadastrado!");
    
    // Mapeamento exato para a tabela 'produtos' do Supabase
    const { error } = await supabase.from('produtos').insert([{
      sku: prodForm.sku,
      nome: prodForm.nome,
      tipo: prodForm.tipo,
      fornecedor: prodForm.fornecedor,
      custo: prodForm.custo,
      preco_venda: prodForm.preco_venda
    }]);

    if (!handleSupabaseError(error)) {
      alert("Produto cadastrado com sucesso!");
      setProdForm({ sku: '', nome: '', tipo: 'Físico', fornecedor: '', custo: 0, preco_venda: 0 });
      setActiveTab('lista');
      fetchData();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!supabase || !confirm("Deseja realmente excluir?")) return;
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (!handleSupabaseError(error)) fetchData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[var(--bg-card)] p-2 rounded-3xl border border-[var(--border-color)] flex gap-2">
        <button onClick={() => setActiveTab('lista')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'lista' ? 'bg-[#820AD1] text-white' : 'text-[var(--text-muted)]'}`}>Inventário</button>
        <button onClick={() => setActiveTab('fornecedor')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'fornecedor' ? 'bg-[#820AD1] text-white' : 'text-[var(--text-muted)]'}`}>+ Fornecedor</button>
        <button onClick={() => setActiveTab('produto')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'produto' ? 'bg-[#820AD1] text-white' : 'text-[var(--text-muted)]'}`}>+ Produto</button>
      </div>

      {activeTab === 'fornecedor' && (
        <form onSubmit={onSaveSupplier} className="nu-card space-y-6 max-w-xl mx-auto border-t-4 border-[#820AD1]">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Users className="text-[#820AD1]" /> Novo Parceiro</h2>
          <div className="grid grid-cols-1 gap-4">
            <input required placeholder="Nome Fantasia / Empresa" className="nu-input" value={supForm.nome} onChange={e => setSupForm({...supForm, nome: e.target.value})} />
            <input placeholder="WhatsApp de Contato" className="nu-input" value={supForm.contato} onChange={e => setSupForm({...supForm, contato: e.target.value})} />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] ml-2">Saldo Haver (R$)</span>
              <input type="number" step="0.01" className="nu-input" value={supForm.saldo_haver} onChange={e => setSupForm({...supForm, saldo_haver: Number(e.target.value)})} />
            </div>
          </div>
          <button type="submit" className="nu-button-primary w-full py-4 uppercase font-black tracking-widest shadow-lg shadow-[#820AD1]/20">Salvar Fornecedor</button>
        </form>
      )}

      {activeTab === 'produto' && (
        <form onSubmit={onSaveProduct} className="nu-card space-y-6 max-w-xl mx-auto border-t-4 border-[#820AD1]">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Package className="text-[#820AD1]" /> Novo SKU</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="SKU (Ex: MOD-01)" className="nu-input" value={prodForm.sku} onChange={e => setProdForm({...prodForm, sku: e.target.value})} />
            <input required placeholder="Nome do Produto" className="nu-input" value={prodForm.nome} onChange={e => setProdForm({...prodForm, nome: e.target.value})} />
            <select className="nu-input" value={prodForm.tipo} onChange={e => setProdForm({...prodForm, tipo: e.target.value as any})}>
              <option value="Físico">Estoque Físico</option>
              <option value="Virtual">Virtual (Dropshipping)</option>
            </select>
            <select required className="nu-input font-bold" value={prodForm.fornecedor} onChange={e => setProdForm({...prodForm, fornecedor: e.target.value})}>
              <option value="">Selecionar Fornecedor...</option>
              {suppliers.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
            </select>
            <div className="space-y-1">
               <span className="text-[10px] font-bold text-[var(--text-muted)] ml-2">Custo (R$)</span>
               <input required type="number" step="0.01" className="nu-input" value={prodForm.custo} onChange={e => setProdForm({...prodForm, custo: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
               <span className="text-[10px] font-bold text-[var(--text-muted)] ml-2">Venda (R$)</span>
               <input required type="number" step="0.01" className="nu-input" value={prodForm.preco_venda} onChange={e => setProdForm({...prodForm, preco_venda: Number(e.target.value)})} />
            </div>
          </div>
          <button type="submit" className="nu-button-primary w-full py-4 uppercase font-black tracking-widest shadow-lg shadow-[#820AD1]/20">Registrar Produto</button>
        </form>
      )}

      {activeTab === 'lista' && (
        <div className="nu-card !p-0 overflow-hidden">
          <div className="p-6 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#820AD1]">Base de Dados Supabase</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <tr className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  <th className="p-6">Identificação</th>
                  <th className="p-6">Fornecedor</th>
                  <th className="p-6">Preços</th>
                  <th className="p-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-sm">{p.nome}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter">{p.sku}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-[10px] font-bold bg-[var(--bg-primary)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                        {p.fornecedor}
                      </span>
                    </td>
                    <td className="p-6">
                       <p className={`text-xs font-bold ${isOlheiro ? 'blur-sm' : 'text-red-500'}`}>Custo: R$ {p.custo.toFixed(2)}</p>
                       <p className={`text-sm font-black ${isOlheiro ? 'blur-sm' : 'text-[#03D56F]'}`}>Venda: R$ {p.preco_venda.toFixed(2)}</p>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && !loading && (
                  <tr><td colSpan={4} className="p-16 text-center italic text-[var(--text-muted)] text-sm">Nenhum registro encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
