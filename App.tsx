
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
import { audioOps } from './lib/audio';
import { Bell, History, Shield, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EstatisticasUsuario } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('painel');
  const [isOlheiro, setIsOlheiro] = useState(false);
  const [appConfig, setAppConfig] = useState(storage.configuracoes.obter());
  const [theme, setTheme] = useState(appConfig.tema || 'dark');
  const [userStats, setUserStats] = useState<EstatisticasUsuario>(storage.usuario.obterEstats());
  const [showNotifications, setShowNotifications] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const updateAll = () => {
      const config = storage.configuracoes.obter();
      setAppConfig(config);
      setUserStats(storage.usuario.obterEstats());
      
      const sales = storage.vendas.obterTodas().slice(0, 10);
      const finance = storage.financeiro.obterTodos().slice(0, 10);
      
      const saleLogs = sales.map(s => ({ ...s, logType: 'venda', timestamp: s.data_venda }));
      const financeLogs = finance.map(f => ({ ...f, logType: 'finance', timestamp: f.data }));
      
      setLogs([...saleLogs, ...financeLogs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      if (config.modoGhost) document.body.classList.add('ghost-active');
      else document.body.classList.remove('ghost-active');
    };
    updateAll();
    window.addEventListener('storage-update', updateAll);
    return () => window.removeEventListener('storage-update', updateAll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const newConfig = { ...appConfig, tema: theme };
    storage.configuracoes.salvar(newConfig);
  }, [theme]);

  const toggleOlheiro = (val: boolean) => {
    audioOps.click();
    setIsOlheiro(val);
  };

  const Content = useMemo(() => {
    const props = { isOlheiro, visualMode: appConfig.modoVisual };
    switch (activeTab) {
      case 'painel': return <Dashboard {...props} setIsOlheiro={toggleOlheiro} />;
      case 'produtos': return <Products {...props} />;
      case 'vendas': return <Sales isOlheiro={isOlheiro} />;
      case 'financeiro': return <Finance {...props} />;
      case 'missoes': return <Missions />;
      case 'ajustes': return <SettingsView isOlheiro={isOlheiro} setIsOlheiro={toggleOlheiro} theme={theme} setTheme={setTheme} onConfigChange={() => setAppConfig(storage.configuracoes.obter())} />;
      default: return <Dashboard {...props} setIsOlheiro={toggleOlheiro} />;
    }
  }, [activeTab, isOlheiro, theme, appConfig.modoVisual]);

  const progressoExp = (userStats.experiencia / userStats.proxNivelExp) * 100;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-500">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] relative h-full">
        {appConfig.mostrarXP && (
          <div className="h-1 bg-[var(--border-color)] w-full overflow-hidden relative">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressoExp}%` }} className="h-full xp-bar-fire z-10 shadow-[0_0_15px_rgba(130,10,209,0.4)]" />
          </div>
        )}

        <header className="h-20 shrink-0 px-10 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between z-50">
           <div className="flex items-center gap-8">
              <h1 className="text-lg font-black tracking-tighter italic uppercase">
                {appConfig.storeName} <span className="text-[var(--nu-purple)]">{appConfig.codename || 'COMANDO'}</span>
              </h1>
              {appConfig.mostrarXP && (
                <div className="flex items-center gap-3 px-4 py-1.5 bg-[var(--bg-input)] rounded-full border border-[var(--border-color)]">
                  <Award size={14} className="text-[var(--nu-purple)]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Nível {userStats.nivel} <span className="text-[var(--text-muted)] opacity-50 ml-1">• {userStats.patente}</span></span>
                </div>
              )}
           </div>

           <div className="flex items-center gap-5">
              <button onClick={() => setShowNotifications(!showNotifications)} className={`p-3 rounded-2xl transition-all relative ${showNotifications ? 'bg-[var(--nu-purple)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}>
                 <Bell size={20} />
              </button>
              <button onClick={() => toggleOlheiro(!isOlheiro)} className={`p-3 rounded-2xl transition-all border ${isOlheiro ? 'border-[var(--nu-error)] text-[var(--nu-error)]' : 'bg-[var(--bg-input)] border-transparent text-[var(--text-muted)]'}`}>
                 <Shield size={20} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto nu-scrollbar overscroll-contain relative">
           <div className="p-8 md:p-12 max-w-7xl mx-auto safe-bottom-padding">
             <AnimatePresence mode="wait">
               <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                 {Content}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
      <Celebration />
    </div>
  );
};

export default App;
