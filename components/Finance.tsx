
import React, { useState, useEffect } from 'react';
import { Wallet, Plus, CheckCircle, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { FinancialEntry } from '../types';
import { supabase, handleSupabaseError } from '../lib/supabase';

export const Finance: React.FC<{ isOlheiro: boolean }> = ({ isOlheiro }) => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<FinancialEntry>>({ 
    descricao: '', tipo: 'Saída', valor: 0, data_vencimento: new Date().toISOString().split('T')[0], status: 'Pendente' 
  });

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    if (!supabase) return setLoading(false);
    setLoading(true);
    const { data } = await supabase.from('financeiro').select('*').order('data_vencimento', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from('financeiro').insert([form]);
    if (!handleSupabaseError(error)) {
      alert("Sucesso: Lançamento Salvo!");
      setShowForm(false);
      fetchEntries();
    }
  };

  const markAsPaid = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('financeiro').update({ status: 'Pago' }).eq('id', id);
    if (!handleSupabaseError(error)) fetchEntries();
  };

  const totalEntradas = entries.filter(e => e.tipo === 'Entrada').reduce((acc, e) => acc + e.valor, 0);
  const totalSaidas = entries.filter(e => e.tipo === 'Saída').reduce((acc, e) => acc + e.valor, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="nu-card bg-[#820AD1] text-white">
          <p className="text-[10px] font-black uppercase opacity-60">Saldo Previsto</p>
          <p className="text-2xl font-bold">{isOlheiro ? '****' : (totalEntradas - totalSaidas).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
        </div>
        <div className="nu-card">
          <p className="text-[10px] font-black uppercase text-[#03D56F]">Entradas Total</p>
          <p className="text-2xl font-bold text-[#03D56F]">{isOlheiro ? '****' : totalEntradas.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
        </div>
        <div className="nu-card">
          <p className="text-[10px] font-black uppercase text-red-500">Saídas Total</p>
          <p className="text-2xl font-bold text-red-500">{isOlheiro ? '****' : totalSaidas.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[var(--bg-card)] p-4 rounded-3xl border border-[var(--border-color)]">
        <h2 className="text-xl font-bold flex items-center gap-2 px-2"><DollarSign className="text-[#820AD1]" /> Fluxo de Caixa</h2>
        <button onClick={() => setShowForm(!showForm)} className="nu-button-primary flex items-center gap-2">
          {showForm ? 'Cancelar' : <><Plus size={16}/> Novo Lançamento</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveEntry} className="nu-card space-y-6 max-w-xl mx-auto animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Descrição (Ex: Conta de Luz)" className="nu-input md:col-span-2" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
            <select className="nu-input" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as any})}>
              <option value="Saída">Saída (-)</option>
              <option value="Entrada">Entrada (+)</option>
            </select>
            <input required type="number" step="0.01" placeholder="Valor (R$)" className="nu-input" onChange={e => setForm({...form, valor: Number(e.target.value)})} />
            <input required type="date" className="nu-input" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
            <select className="nu-input" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago / Recebido</option>
            </select>
          </div>
          <button type="submit" className="nu-button-primary w-full py-4 uppercase font-black">Registrar no Supabase</button>
        </form>
      )}

      <div className="nu-card !p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
            <tr className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <th className="p-6">Vencimento</th>
              <th className="p-6">Descrição</th>
              <th className="p-6">Valor</th>
              <th className="p-6">Status</th>
              <th className="p-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-black/5 transition-colors">
                <td className="p-6 text-xs font-bold">{new Date(e.data_vencimento).toLocaleDateString()}</td>
                <td className="p-6">
                  <p className="font-bold text-sm">{e.descricao}</p>
                  <p className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm w-fit ${e.tipo === 'Entrada' ? 'bg-[#03D56F]/20 text-[#03D56F]' : 'bg-red-500/20 text-red-500'}`}>{e.tipo}</p>
                </td>
                <td className={`p-6 font-bold text-sm ${e.tipo === 'Entrada' ? 'text-[#03D56F]' : 'text-red-500'}`}>
                  {isOlheiro ? '****' : e.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                </td>
                <td className="p-6">
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${e.status === 'Pago' ? 'bg-[#03D56F]/20 text-[#03D56F]' : 'bg-orange-500/20 text-orange-500'}`}>{e.status}</span>
                </td>
                <td className="p-6 flex gap-2">
                  {e.status === 'Pendente' && <button onClick={() => markAsPaid(e.id)} className="p-2 text-[#03D56F] hover:bg-[#03D56F]/10 rounded-lg"><CheckCircle size={16}/></button>}
                  <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center italic text-[var(--text-muted)]">Nenhuma conta lançada até agora.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
