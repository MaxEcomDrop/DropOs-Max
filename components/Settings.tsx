import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Moon, User, ShieldCheck, Landmark, 
  Target, Ghost, Layout, Sunrise, Zap, Crown
} from 'lucide-react';
import { storage, notificar } from '../lib/storage';
import { ModoVisual, TemaSistema, RegimeTributario } from '../types';

interface SettingsProps {
  isOlheiro: boolean;
  setIsOlheiro: (val: boolean) => void;
  theme: string;
  setTheme: (theme: any) => void;
  onConfigChange: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOlheiro, setIsOlheiro, theme, setTheme, onConfigChange }) => {
  const [config, setConfig] = useState(storage.configuracoes.obter());

  const update = (newConf: any) => {
    setConfig(newConf);
    storage.configuracoes.salvar(newConf);
    onConfigChange();
    notificar(`Protocolo Atualizado`);
  };

  const updateSection = (section: string, key: string, val: any) => {
    const newConfig = { ...config, [section]: { ...(config as any)[section], [key]: val } };
    update(newConfig);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-24">
      
      <div className="nu-card p-8 bg-gradient-to-r from-[var(--nu-purple)]/20 to-transparent flex flex-col md:flex-row items-center justify-between gap-8 border-none shadow-2xl">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-[var(--nu-purple)] rounded-2xl flex items-center justify-center text-white shadow-xl">
              <ShieldCheck size={32} />
           </div>
           <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-main)]">Centro de Comando</h2>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mt-1">SISTEMA ATIVO • {config.codename}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-1">
        
        {/* FINANCEIRO */}
        <section className="nu-card p-8 space-y-8">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-[var(--nu-purple)]">
             <Landmark size={18} /> PARÂMETROS FINANCEIROS
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-[var(--text-muted)] uppercase">Regime Fiscal</label>
                 <select className="nu-input font-bold" value={config.financeiro.regime} onChange={e => updateSection('financeiro', 'regime', e.target.value as RegimeTributario)}>
                    <option className="text-black">CPF</option><option className="text-black">MEI</option><option className="text-black">Simples Nacional</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-[var(--text-muted)] uppercase">Comissão (%)</label>
                 <input type="number" className="nu-input font-black" value={config.financeiro.porcentagemFuncionario} onChange={e => updateSection('financeiro', 'porcentagemFuncionario', Number(e.target.value))} />
              </div>
           </div>
        </section>

        {/* INTERFACE & TEMAS */}
        <section className="nu-card p-8 space-y-8">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-[var(--nu-purple)]">
             <Layout size={18} /> AMBIENTE VISUAL
           </h4>
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setTheme('light'); update({...config, tema: 'light'}); }} className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-[var(--nu-purple)] bg-[var(--nu-purple)]/10 text-[var(--nu-purple)]' : 'border-[var(--border-color)] bg-[var(--bg-input)] opacity-50'}`}>
                 <Sunrise size={20} /> <span className="text-[11px] font-black uppercase">ALVORADA</span>
              </button>
              <button onClick={() => { setTheme('dark'); update({...config, tema: 'dark'}); }} className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-[var(--nu-purple)] bg-[var(--nu-purple)]/10 text-[var(--nu-purple)]' : 'border-[var(--border-color)] bg-[var(--bg-input)] opacity-50'}`}>
                 <Moon size={20} /> <span className="text-[11px] font-black uppercase">NOTURNO</span>
              </button>
           </div>
        </section>

        {/* MODOS OPERACIONAIS */}
        <section className="nu-card p-8 space-y-8">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-[var(--nu-purple)]">
             <Zap size={18} /> MODO DE SIMULAÇÃO
           </h4>
           <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'normal', label: 'REAL', icon: <Target size={16}/> },
                { id: 'rico', label: 'RICO', icon: <Crown size={16}/> },
                { id: 'milionario', label: 'MILLION', icon: <Ghost size={16}/> }
              ].map(m => (
                <button key={m.id} onClick={() => update({ ...config, modoVisual: m.id as ModoVisual })} className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${config.modoVisual === m.id ? 'border-[var(--nu-purple)] bg-[var(--nu-purple)] text-white shadow-lg' : 'border-[var(--border-color)] bg-[var(--bg-input)] opacity-50 text-[var(--text-muted)]'}`}>
                   {m.icon} <span className="text-[9px] font-black">{m.label}</span>
                </button>
              ))}
           </div>
        </section>

        {/* IDENTIDADE */}
        <section className="nu-card p-8 space-y-8">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-[var(--nu-purple)]">
             <User size={18} /> IDENTIDADE
           </h4>
           <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-2">Codinome</label>
                 <input className="nu-input font-black uppercase" value={config.codename} onChange={e => update({ ...config, codename: e.target.value })} />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-[var(--text-muted)] uppercase ml-2">Nome da Unidade</label>
                 <input className="nu-input font-black uppercase" value={config.storeName} onChange={e => update({ ...config, storeName: e.target.value })} />
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};