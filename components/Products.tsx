
import React, { useState, useEffect } from 'react';
import { Plus, Package, Users, Trash2, X, AlertCircle, Save } from 'lucide-react';
import { Product, Supplier } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

export const Products: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lista' | 'fornecedor' | 'produto'>('lista');

  // Form states
  const [supForm, setSupForm] = useState({ nome_empresa: '', contato_whatsapp: '', saldo_haver: 0, prazo_entrega: 0 });
  const [prodForm, setProdForm] = useState({ sku: '', nome: '', estoque_tipo: 'Físico', fornecedor_id: '', custo: 0, preco_venda: 0, quantidade: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    if (!supabase) return setLoading(false);
    setLoading(true);
    const { data: p } = await supabase.from('produtos').select('*');
    const { data: s } = await supabase.from('fornecedores').select('*');
    setProducts(p || []);
    setSuppliers(s || []);
    setLoading(false);
  };

  const saveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert("Supabase não configurado.");
    const { error } = await supabase.from('fornecedores').insert([supForm]);
    if (!handleSupabaseError(error)) {
      alert("Sucesso: Fornecedor Cadastrado!");
      setSupForm({ nome_empresa: '', contato_whatsapp: '', saldo_haver: 0, prazo_entrega: 0 });
      setActiveTab('lista');
      fetchData();
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert("Supabase não configurado.");
    
    // Check SKU duplicate locally first
    if (products.some(p => p.sku === prodForm.sku)) return alert("ERRO: SKU já existe!");

    const { error } = await supabase.from('produtos').insert([prodForm]);
    if (!handleSupabaseError(error)) {
      alert("Sucesso: Produto Cadastrado!");
      setProdForm({ sku: '', nome: '', estoque_tipo: 'Físico', fornecedor_id: '', custo: 0, preco_venda: 0, quantidade: 0 });
      setActiveTab('lista');
      fetchData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-card)] p-4 rounded-3xl border border-[var(--border-color)]">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('lista')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'lista' ? 'bg-[#820AD1] text-white' : 'text-[var(--text-muted)]'}`}>Ver Tudo</button>
          <button onClick={() => setActiveTab('fornecedor')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'fornecedor' ? 'bg-[#820AD1] text-white' : 'text-[var(--text-muted)]'}`}>+ Fornecedor</button>
          <button onClick={() => setActiveTab('produto')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'produto' ? 'bg-[#820AD1] text-white' : 'text-[var(--text-muted)]'}`}>+ Produto</button>
        </div>
      </div>

      {activeTab === 'fornecedor' && (
        <form onSubmit={saveSupplier} className="nu-card space-y-6 max-w-xl mx-auto border-t-4 border-t-[#820AD1]">
          <h2 className="text-xl font-bold flex items-center gap-2"><Users className="text-[#820AD1]" /> Cadastro de Fornecedor</h2>
          <div className="space-y-4">
            <input required placeholder="Nome da Empresa (Obrigatório)" className="nu-input" value={supForm.nome_empresa} onChange={e => setSupForm({...supForm, nome_empresa: e.target.value})} />
            <input placeholder="WhatsApp / Contato" className="nu-input" value={supForm.contato_whatsapp} onChange={e => setSupForm({...supForm, contato_whatsapp: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="0.01" placeholder="Saldo Haver (R$)" className="nu-input" onChange={e => setSupForm({...supForm, saldo_haver: Number(e.target.value)})} />
              <input type="number" placeholder="Prazo Entrega (Dias)" className="nu-input" onChange={e => setSupForm({...supForm, prazo_entrega: Number(e.target.value)})} />
            </div>
          </div>
          <button type="submit" className="nu-button-primary w-full py-4 uppercase tracking-widest font-black">Salvar Fornecedor</button>
        </form>
      )}

      {activeTab === 'produto' && (
        <form onSubmit={saveProduct} className="nu-card space-y-6 max-w-xl mx-auto border-t-4 border-t-[#820AD1]">
          <h2 className="text-xl font-bold flex items-center gap-2"><Package className="text-[#820AD1]" /> Cadastro de Produto (Estoque)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="SKU Único" className="nu-input" value={prodForm.sku} onChange={e => setProdForm({...prodForm, sku: e.target.value})} />
            <input required placeholder="Nome do Produto" className="nu-input" value={prodForm.nome} onChange={e => setProdForm({...prodForm, nome: e.target.value})} />
            <select className="nu-input" value={prodForm.estoque_tipo} onChange={e => setProdForm({...prodForm, estoque_tipo: e.target.value as any})}>
              <option value="Físico">Estoque Físico</option>
              <option value="Virtual">Virtual (Drop)</option>
            </select>
            <select required className="nu-input font-bold" value={prodForm.fornecedor_id} onChange={e => setProdForm({...prodForm, fornecedor_id: e.target.value})}>
              <option value="">Selecionar Fornecedor...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.nome_empresa}</option>)}
            </select>
            <input required type="number" step="0.01" placeholder="Custo (R$)" className="nu-input" onChange={e => setProdForm({...prodForm, custo: Number(e.target.value)})} />
            <input required type="number" step="0.01" placeholder="Venda (R$)" className="nu-input" onChange={e => setProdForm({...prodForm, preco_venda: Number(e.target.value)})} />
          </div>
          <button type="submit" className="nu-button-primary w-full py-4 uppercase tracking-widest font-black">Salvar Produto</button>
        </form>
      )}

      {activeTab === 'lista' && (
        <div className="nu-card !p-0 overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
            <h3 className="text-xs font-black uppercase tracking-widest">Estoque Atual (Supabase Real)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <tr className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  <th className="p-6">Produto / SKU</th>
                  <th className="p-6">Tipo</th>
                  <th className="p-6">Custo</th>
                  <th className="p-6">Venda</th>
                  <th className="p-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-black/5 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-sm">{p.nome}</p>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase">{p.sku}</p>
                    </td>
                    <td className="p-6"><span className="text-[10px] font-black uppercase bg-[var(--bg-primary)] px-2 py-1 rounded-full">{p.estoque_tipo}</span></td>
                    <td className="p-6 font-bold text-red-500">{isOlheiro ? '****' : p.custo.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                    <td className="p-6 font-bold text-[#03D56F]">{isOlheiro ? '****' : p.preco_venda.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                    <td className="p-6"><button className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={5} className="p-10 text-center italic text-[var(--text-muted)]">Nenhum produto encontrado no banco de dados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
