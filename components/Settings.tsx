
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Moon, User, ShieldCheck, Landmark, 
  Target, Ghost, Layout, Sunrise, UserPlus, Zap, Crown
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
    notificar(`Protocolo de Ajustes Sincronizado`);
  };

  const updateSection = (section: string, key: string, val: any) => {
    const newConfig = { ...config, [section]: { ...(config as any)[section], [key]: val } };
    update(newConfig);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-44 text-left nu-scrollbar overflow-y-auto">
      
      <div className="nu-card p-10 bg-gradient-to-r from-[var(--nu-purple)]/10 to-transparent border-[var(--nu-purple)]/20 flex items-center justify-between">
        <div className="flex items-center gap-8">
           <div className="w-20 h-20 bg-[var(--nu-purple)] rounded-[24px] flex items-center justify-center text-white shadow-2xl">
              <ShieldCheck size={36} />
           </div>
           <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Centro de Comando Supremo</h2>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] mt-1">{config.codename} • Nível Alpha Gerencial</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* ENGENHARIA FISCAL & GESTÃO DE PESSOAL */}
        <section className="nu-card p-10 space-y-8">
           <h4 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-4 border-b border-[var(--border-color)] pb-6 text-[var(--nu-purple)]">
             <Landmark size={20} /> ENGENHARIA FISCAL & GESTÃO
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Regime Tributário</label>
                 <select className="nu-input w-full font-bold" value={config.financeiro.regime} onChange={e => updateSection('financeiro', 'regime', e.target.value as RegimeTributario)}>
                    <option>CPF</option><option>MEI</option><option>Simples Nacional</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Comissão Funcionário (%)</label>
                 <input type="number" className="nu-input w-full font-black text-center" value={config.financeiro.porcentagemFuncionario} onChange={e => updateSection('financeiro', 'porcentagemFuncionario', Number(e.target.value))} />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Alíquota Federal (%)</label>
                 <input type="number" className="nu-input w-full font-black text-center" value={config.financeiro.aliquotaImposto} onChange={e => updateSection('financeiro', 'aliquotaImposto', Number(e.target.value))} />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Meta Mensal (R$)</label>
                 <input type="number" className="nu-input w-full font-black text-center" value={config.metas.mensal} onChange={e => update({ ...config, metas: { ...config.metas, mensal: Number(e.target.value) } })} />
              </div>
           </div>
        </section>

        {/* MODOS DE VISUALIZAÇÃO (GAMIFICAÇÃO) */}
        <section className="nu-card p-10 space-y-8">
           <h4 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-4 border-b border-[var(--border-color)] pb-6 text-[var(--nu-purple)]">
             <Zap size={20} /> MODO DE VISUALIZAÇÃO & SIMULAÇÃO
           </h4>
           <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'normal', label: 'Real', icon: <Target size={16}/> },
                { id: 'rico', label: 'Rico', icon: <Crown size={16}/> },
                { id: 'milionario', label: 'Milionário', icon: <Ghost size={16}/> }
              ].map(m => (
                <button 
                  key={m.id}
                  onClick={() => update({ ...config, modoVisual: m.id as ModoVisual })}
                  className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                    config.modoVisual === m.id ? 'border-[var(--nu-purple)] bg-[var(--nu-purple)] text-white shadow-xl' : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)]'
                  }`}
                >
                   {m.icon}
                   <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                </button>
              ))}
           </div>
           <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase italic text-center">Nota: Modos Rico e Milionário apenas simulam visualmente o faturamento.</p>
        </section>

        {/* INTERFACE & AMBIENTE */}
        <section className="nu-card p-10 space-y-8">
           <h4 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-4 border-b border-[var(--border-color)] pb-6 text-[var(--nu-purple)]">
             <Layout size={20} /> INTERFACE DE OPERAÇÃO
           </h4>
           <div className="grid grid-cols-2 gap-6">
              {[
                { id: 'dark', label: 'Missão Noturna', icon: <Moon/> },
                { id: 'light', label: 'Protocolo Alvorada', icon: <Sunrise/> }
              ].map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all ${theme === t.id ? 'border-[var(--nu-purple)] bg-[var(--nu-purple)]/10' : 'border-[var(--border-color)] bg-[var(--bg-input)]/40'}`}>
                   <div className={theme === t.id ? 'text-[var(--nu-purple)]' : 'text-[var(--text-muted)]'}>{t.icon}</div>
                   <span className="text-[11px] font-black uppercase italic tracking-tight">{t.label}</span>
                </button>
              ))}
           </div>
        </section>

        <section className="nu-card p-10 space-y-8">
           <h4 className="text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-4 border-b border-[var(--border-color)] pb-6 text-[var(--nu-purple)]">
             <User size={20} /> IDENTIDADE DO COMANDO
           </h4>
           <div className="space-y-4">
              <input className="nu-input w-full font-black uppercase" value={config.storeName} onChange={e => update({ ...config, storeName: e.target.value })} placeholder="NOME DA EMPRESA" />
              <input className="nu-input w-full font-black italic" value={config.codename} onChange={e => update({ ...config, codename: e.target.value })} placeholder="CODINOME DO GESTOR" />
           </div>
        </section>

      </div>
    </div>
  );
};
