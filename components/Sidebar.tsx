
import React, { useState, useEffect } from 'react';
import { 
  Settings, LayoutDashboard, Package, ShoppingCart, Wallet, Store, Shield, Zap, Trophy
} from 'lucide-react';
import { storage } from '../lib/storage';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [config, setConfig] = useState(storage.configuracoes.obter());
  const [pomodoro, setPomodoro] = useState(config.pomodoroTime * 60); 
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const newConfig = storage.configuracoes.obter();
      setConfig(newConfig);
      if (!isActive) setPomodoro(newConfig.pomodoroTime * 60);
    };
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, [isActive]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && pomodoro > 0) {
      interval = setInterval(() => setPomodoro(p => p - 1), 1000);
    } else if (pomodoro === 0) { 
      setIsActive(false); 
      setPomodoro(config.pomodoroTime * 60);
      alert('Sessão de Foco Finalizada!');
    }
    return () => clearInterval(interval);
  }, [isActive, pomodoro, config.pomodoroTime]);

  const navItems = [
    { id: 'painel', label: 'Painel de Controle', icon: <LayoutDashboard size={20} /> },
    { id: 'vendas', label: 'Ordens e Vendas', icon: <ShoppingCart size={20} /> },
    { id: 'produtos', label: 'Estoque do Arsenal', icon: <Package size={20} /> },
    { id: 'financeiro', label: 'Cofre e Fluxo', icon: <Wallet size={20} /> },
    { id: 'missoes', label: 'Missões de Elite', icon: <Trophy size={20} /> },
    { id: 'ajustes', label: 'Centro de Comando', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="hidden lg:flex w-72 bg-[var(--bg-sidebar)] flex-col p-6 h-screen shrink-0 border-r border-[var(--border-color)] z-50 shadow-xl transition-all">
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="w-12 h-12 bg-[var(--nu-purple)] rounded-2xl flex items-center justify-center shadow-lg group overflow-hidden icon-wiggle">
          <Store size={24} className="text-white relative z-10 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex flex-col text-left">
           <h1 className="text-sm font-black tracking-tight text-[var(--text-main)] uppercase leading-none truncate w-40">
             {config.storeName || 'DropOS Max'}
           </h1>
           <span className="text-[9px] font-black uppercase text-[var(--nu-purple)] tracking-widest mt-1 opacity-80">OPERADOR SUPREMO</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-[13px] font-bold tracking-tight relative group icon-wiggle ${
              activeTab === item.id 
              ? 'bg-[var(--nu-purple)] text-white shadow-lg' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--nu-purple)]/10'
            }`}
          >
            <span className={activeTab === item.id ? 'text-white' : 'text-[var(--nu-purple)]'}>{item.icon}</span>
            {item.label}
            {activeTab === item.id && (
              <motion.div layoutId="sidebar-active" className="absolute left-0 w-1.5 h-6 bg-white rounded-full ml-1" />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
             <Shield size={14} className="text-[var(--nu-purple)]" />
             <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Protocolo Foco</span>
          </div>
          <span className={`text-sm font-black tabular-nums italic ${isActive ? 'text-[var(--nu-purple)]' : 'text-[var(--text-muted)]'}`}>
            {Math.floor(pomodoro/60).toString().padStart(2,'0')}:{(pomodoro%60).toString().padStart(2,'0')}
          </span>
        </div>
        <button onClick={() => setIsActive(!isActive)} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all border ${isActive ? 'border-[var(--nu-error)] text-[var(--nu-error)] bg-[var(--nu-error)]/10' : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--nu-purple)]'}`}>
          {isActive ? 'INTERROMPER' : 'ATIVAR MODO FOCO'}
        </button>
      </div>
    </aside>
  );
};
