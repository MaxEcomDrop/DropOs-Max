
import React, { useState, useEffect } from 'react';
import { Plus, Package, Users, Trash2 } from 'lucide-react';
import { Product, Supplier } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

export const Products: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeTab, setActiveTab] = useState<'lista' | 'fornecedor' | 'produto'>('lista');

  const [supForm, setSupForm] = useState({ nome: '', contato: '', saldo_haver: 0 });
  const [prodForm, setProdForm] = useState({ sku: '', nome: '', tipo: 'Físico' as any, fornecedor: '', custo: 0, preco_venda: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    if (!supabase) return;
    const { data: p } = await supabase.from('produtos').select('*').order('nome');
    const { data: s } = await supabase.from('fornecedores').select('*').order('nome');
    setProducts(p || []);
    setSuppliers(s || []);
  };

  const saveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('fornecedores').insert([supForm]);
    if (!handleSupabaseError(error)) {
      alert("Sucesso!");
      setSupForm({ nome: '', contato: '', saldo_haver: 0 });
      fetchData();
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('produtos').insert([prodForm]);
    if (!handleSupabaseError(error)) {
      alert("Sucesso!");
      setProdForm({ sku: '', nome: '', tipo: 'Físico', fornecedor: '', custo: 0, preco_venda: 0 });
      fetchData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[var(--bg-card)] p-2 rounded-3xl border border-[var(--border-color)] flex gap-2">
        <button onClick={() => setActiveTab('lista')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'lista' ? 'bg-[#820AD1] text-white' : ''}`}>Estoque</button>
        <button onClick={() => setActiveTab('fornecedor')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'fornecedor' ? 'bg-[#820AD1] text-white' : ''}`}>+ Parceiro</button>
        <button onClick={() => setActiveTab('produto')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === 'produto' ? 'bg-[#820AD1] text-white' : ''}`}>+ SKU</button>
      </div>

      {activeTab === 'fornecedor' && (
        <form onSubmit={saveSupplier} className="nu-card space-y-4 max-w-xl mx-auto border-t-4 border-[#820AD1]">
          <h2 className="text-sm font-black uppercase flex items-center gap-2"><Users className="text-[#820AD1]" /> Novo Fornecedor</h2>
          <input required placeholder="Nome Empresa" className="nu-input" value={supForm.nome} onChange={e=>setSupForm({...supForm, nome: e.target.value})} />
          <input placeholder="WhatsApp" className="nu-input" value={supForm.contato} onChange={e=>setSupForm({...supForm, contato: e.target.value})} />
          <input type="number" placeholder="Saldo Haver" className="nu-input" value={supForm.saldo_haver || ''} onChange={e=>setSupForm({...supForm, saldo_haver: Number(e.target.value)})} />
          <button type="submit" className="nu-button-primary w-full">Salvar</button>
        </form>
      )}

      {activeTab === 'produto' && (
        <form onSubmit={saveProduct} className="nu-card space-y-4 max-w-xl mx-auto border-t-4 border-[#820AD1]">
          <h2 className="text-sm font-black uppercase flex items-center gap-2"><Package className="text-[#820AD1]" /> Novo Produto</h2>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="SKU" className="nu-input" value={prodForm.sku} onChange={e=>setProdForm({...prodForm, sku: e.target.value})} />
            <input required placeholder="Nome" className="nu-input" value={prodForm.nome} onChange={e=>setProdForm({...prodForm, nome: e.target.value})} />
          </div>
          <select className="nu-input" value={prodForm.fornecedor} onChange={e=>setProdForm({...prodForm, fornecedor: e.target.value})}>
            <option value="">Selecione o Fornecedor...</option>
            {suppliers.map(s => <option key={s.nome} value={s.nome}>{s.nome}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" step="0.01" placeholder="Custo R$" className="nu-input" value={prodForm.custo || ''} onChange={e=>setProdForm({...prodForm, custo: Number(e.target.value)})} />
            <input required type="number" step="0.01" placeholder="Venda R$" className="nu-input" value={prodForm.preco_venda || ''} onChange={e=>setProdForm({...prodForm, preco_venda: Number(e.target.value)})} />
          </div>
          <button type="submit" className="nu-button-primary w-full">Salvar Produto</button>
        </form>
      )}

      {activeTab === 'lista' && (
        <div className="nu-card !p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] text-[10px] uppercase text-[var(--text-muted)]">
              <tr>
                <th className="p-6">Nome / SKU</th>
                <th className="p-6">Fornecedor</th>
                <th className="p-6">Preço</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {products.map(p => (
                <tr key={p.id}>
                  <td className="p-6 font-bold text-sm">{p.nome}<br/><span className="text-[10px] font-normal text-[var(--text-muted)]">{p.sku}</span></td>
                  <td className="p-6 text-xs">{p.fornecedor}</td>
                  <td className="p-6 font-black text-[#03D56F]">{isOlheiro ? '****' : `R$ ${p.preco_venda.toFixed(2)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
