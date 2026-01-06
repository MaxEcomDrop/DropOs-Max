
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, CheckCircle, Trash2 } from 'lucide-react';
import { FinancialEntry } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

export const Finance: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    descricao: '', tipo: 'Saída' as any, valor: 0, vencimento: new Date().toISOString().split('T')[0], status: 'Pendente' as any
  });

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('financeiro').select('*').order('vencimento', { ascending: false });
    setEntries(data || []);
  };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    // Mapeamento para o schema 'financeiro' do banco
    const { error } = await supabase.from('financeiro').insert([{
      descricao: form.descricao,
      tipo: form.tipo,
      valor: form.valor,
      vencimento: form.vencimento,
      status: form.status
    }]);

    if (!handleSupabaseError(error)) {
      alert("Lançamento efetuado!");
      setShowForm(false);
      setForm({ descricao: '', tipo: 'Saída', valor: 0, vencimento: new Date().toISOString().split('T')[0], status: 'Pendente' });
      fetchEntries();
    }
  };

  const markPaid = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('financeiro').update({ status: 'Pago' }).eq('id', id);
    if (!handleSupabaseError(error)) fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    if (!supabase || !confirm("Remover lançamento?")) return;
    const { error } = await supabase.from('financeiro').delete().eq('id', id);
    if (!handleSupabaseError(error)) fetchEntries();
  };

  const entradas = entries.filter(e => e.tipo === 'Entrada').reduce((acc, e) => acc + e.valor, 0);
  const saidas = entries.filter(e => e.tipo === 'Saída').reduce((acc, e) => acc + e.valor, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="nu-card bg-[#820AD1] text-white border-none shadow-xl">
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Saldo Atual</p>
          <p className={`text-2xl font-black ${isOlheiro ? 'blur-md' : ''}`}>{(entradas - saidas).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
        </div>
        <div className="nu-card border-[#03D56F]/20 bg-[#03D56F]/5">
          <p className="text-[10px] font-black uppercase text-[#03D56F] tracking-widest">Entradas (+)</p>
          <p className={`text-2xl font-black text-[#03D56F] ${isOlheiro ? 'blur-md' : ''}`}>{entradas.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
        </div>
        <div className="nu-card border-red-500/20 bg-red-500/5">
          <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Saídas (-)</p>
          <p className={`text-2xl font-black text-red-500 ${isOlheiro ? 'blur-md' : ''}`}>{saidas.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-3xl border border-[var(--border-color)]">
        <h2 className="text-xl font-bold flex items-center gap-2 px-2 tracking-tighter"><DollarSign className="text-[#820AD1]" /> Fluxo de Caixa</h2>
        <button onClick={() => setShowForm(!showForm)} className="nu-button-primary flex items-center gap-2 text-xs uppercase font-black">
          {showForm ? 'Fechar' : 'Novo Lançamento'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveEntry} className="nu-card space-y-6 max-w-xl mx-auto border-t-4 border-[#820AD1]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Descrição" className="nu-input md:col-span-2" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
            <select className="nu-input font-bold" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}>
              <option value="Saída">Saída (-)</option>
              <option value="Entrada">Entrada (+)</option>
            </select>
            <input required type="number" step="0.01" value={form.valor || ''} placeholder="Valor R$" className="nu-input" onChange={e => setForm({...form, valor: Number(e.target.value)})} />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[var(--text-muted)] ml-2">Data Vencimento</span>
              <input required type="date" className="nu-input" value={form.vencimento} onChange={e => setForm({...form, vencimento: e.target.value})} />
            </div>
            <select className="nu-input font-bold" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Confirmado / Pago</option>
            </select>
          </div>
          <button type="submit" className="nu-button-primary w-full py-4 uppercase font-black tracking-widest">Registrar no Banco</button>
        </form>
      )}

      <div className="nu-card !p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
            <tr className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <th className="p-6">Data</th>
              <th className="p-6">Descrição</th>
              <th className="p-6">Valor</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-black/5 transition-colors">
                <td className="p-6 text-xs font-bold text-[var(--text-muted)]">{new Date(e.vencimento).toLocaleDateString()}</td>
                <td className="p-6">
                  <p className="font-bold text-sm">{e.descricao}</p>
                  <p className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm w-fit ${e.tipo === 'Entrada' ? 'bg-[#03D56F]/20 text-[#03D56F]' : 'bg-red-500/20 text-red-500'}`}>{e.tipo}</p>
                </td>
                <td className={`p-6 font-black text-sm ${e.tipo === 'Entrada' ? 'text-[#03D56F]' : 'text-red-500'}`}>
                  {isOlheiro ? '****' : e.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                </td>
                <td className="p-6">
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${e.status === 'Pago' ? 'bg-[#03D56F]/20 text-[#03D56F]' : 'bg-orange-500/20 text-orange-500'}`}>{e.status}</span>
                </td>
                <td className="p-6 text-right flex justify-end gap-2">
                  {e.status === 'Pendente' && <button onClick={() => markPaid(e.id)} className="p-2 text-[#03D56F] hover:bg-[#03D56F]/10 rounded-xl transition-all"><CheckCircle size={16}/></button>}
                  <button onClick={() => deleteEntry(e.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
