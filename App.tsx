import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Sales } from './components/Sales';
import { Finance } from './components/Finance';
import { Missions } from './components/Missions';
import { Settings as SettingsView } from './components/Settings';
import { BottomNav } from './components/BottomNav';
import { Celebration } from './components/Celebration';
import { storage } from './lib/storage';
import { Shield, Sun, Moon, Clock, Calendar as CalendarIcon, Zap, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EstatisticasUsuario, ModoVisual } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('painel');
  const [isOlheiro, setIsOlheiro] = useState(false);
  const [appConfig, setAppConfig] = useState(storage.configuracoes.obter());
  const [theme, setTheme] = useState(appConfig.tema || 'dark');
  const [userStats, setUserStats] = useState<EstatisticasUsuario>(storage.usuario.obterEstats());

  useEffect(() => {
    const updateAll = () => {
      const config = storage.configuracoes.obter();
      setAppConfig(config);
      setUserStats(storage.usuario.obterEstats());
      if (config.tema !== theme) setTheme(config.tema);
    };
    window.addEventListener('storage-update', updateAll);
    updateAll();
    return () => window.removeEventListener('storage-update', updateAll);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const changeVisualMode = (mode: ModoVisual) => {
    const newConfig = { ...appConfig, modoVisual: mode };
    storage.configuracoes.salvar(newConfig);
  };

  const Content = useMemo(() => {
    const props = { isOlheiro, visualMode: appConfig.modoVisual };
    switch (activeTab) {
      case 'painel': return <Dashboard {...props} onVisualModeChange={changeVisualMode} />;
      case 'produtos': return <Products {...props} />;
      case 'vendas': return <Sales isOlheiro={isOlheiro} />;
      case 'financeiro': return <Finance isOlheiro={isOlheiro} />;
      case 'missoes': return <Missions />;
      case 'ajustes': return <SettingsView isOlheiro={isOlheiro} setIsOlheiro={setIsOlheiro} theme={theme} setTheme={setTheme} onConfigChange={() => setAppConfig(storage.configuracoes.obter())} />;
      default: return <Dashboard {...props} onVisualModeChange={changeVisualMode} />;
    }
  }, [activeTab, isOlheiro, theme, appConfig.modoVisual]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-main)]">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] relative h-full">
        {/* MOBILE TOP BAR */}
        <header className="h-16 shrink-0 px-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between lg:h-20 z-40">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--nu-purple)] rounded-full flex items-center justify-center text-white">
                 <Store size={20} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">DROP OS MAX</span>
                 <span className="text-[11px] font-black uppercase text-[var(--nu-purple)]">{appConfig.codename}</span>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <button onClick={() => {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
                storage.configuracoes.salvar({...appConfig, tema: newTheme});
              }} className="p-2 text-[var(--text-muted)] rounded-lg">
                 {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setIsOlheiro(!isOlheiro)} className={`p-2 rounded-lg transition-colors ${isOlheiro ? 'text-[var(--nu-error)] bg-[var(--nu-error)]/10' : 'text-[var(--text-muted)]'}`}>
                 <Shield size={18} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto nu-scrollbar overscroll-contain relative pb-24 lg:pb-0">
           <div className="p-4 md:p-8 lg:p-12 max-w-[1750px] mx-auto">
              {Content}
           </div>
        </div>

        <div className="lg:hidden">
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
      <Celebration />
    </div>
  );
};

export default App;