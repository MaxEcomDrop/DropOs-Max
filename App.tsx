
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
import { Bell, Shield, Award, Sun, Moon, Clock, Calendar as CalendarIcon, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EstatisticasUsuario } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('painel');
  const [isOlheiro, setIsOlheiro] = useState(false);
  const [appConfig, setAppConfig] = useState(storage.configuracoes.obter());
  const [theme, setTheme] = useState(appConfig.tema || 'dark');
  const [userStats, setUserStats] = useState<EstatisticasUsuario>(storage.usuario.obterEstats());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [floatingXP, setFloatingXP] = useState<{id: number, amount: number}[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleXP = (e: any) => {
      const id = Date.now();
      setFloatingXP(prev => [...prev, { id, amount: e.detail.amount }]);
      setTimeout(() => setFloatingXP(prev => prev.filter(x => x.id !== id)), 2000);
    };
    
    const updateAll = () => {
      const config = storage.configuracoes.obter();
      setAppConfig(config);
      setUserStats(storage.usuario.obterEstats());
      if (config.modoGhost) document.body.classList.add('ghost-active');
      else document.body.classList.remove('ghost-active');
    };

    window.addEventListener('storage-update', updateAll);
    window.addEventListener('xp-gained', handleXP);
    updateAll();
    return () => {
      window.removeEventListener('storage-update', updateAll);
      window.removeEventListener('xp-gained', handleXP);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storage.configuracoes.salvar({ ...appConfig, tema: theme as any });
  }, [theme]);

  const Content = useMemo(() => {
    const props = { isOlheiro, visualMode: appConfig.modoVisual };
    switch (activeTab) {
      case 'painel': return <Dashboard {...props} isOlheiro={isOlheiro} visualMode={appConfig.modoVisual} />;
      case 'produtos': return <Products {...props} isOlheiro={isOlheiro} visualMode={appConfig.modoVisual} />;
      case 'vendas': return <Sales isOlheiro={isOlheiro} />;
      case 'financeiro': return <Finance isOlheiro={isOlheiro} />;
      case 'missoes': return <Missions />;
      case 'ajustes': return <SettingsView isOlheiro={isOlheiro} setIsOlheiro={setIsOlheiro} theme={theme} setTheme={setTheme} onConfigChange={() => setAppConfig(storage.configuracoes.obter())} />;
      default: return <Dashboard {...props} isOlheiro={isOlheiro} visualMode={appConfig.modoVisual} />;
    }
  }, [activeTab, isOlheiro, theme, appConfig.modoVisual]);

  const progressoExp = (userStats.experiencia / userStats.proxNivelExp) * 100;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-500">
      
      {/* XP Floating Layer */}
      <div className="fixed inset-0 pointer-events-none z-[11000]">
        <AnimatePresence>
          {floatingXP.map(xp => (
            <motion.div
              key={xp.id}
              initial={{ opacity: 0, y: window.innerHeight / 2, x: window.innerWidth / 2 }}
              animate={{ opacity: 1, y: window.innerHeight / 2 - 200, scale: 1.5 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute text-[var(--nu-purple)] font-black text-4xl italic flex items-center gap-2 drop-shadow-lg"
            >
              <Zap size={32} fill="currentColor" /> +{xp.amount} XP
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] relative h-full">
        {appConfig.mostrarXP && (
          <div className="h-1.5 bg-[var(--bg-input)] w-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${progressoExp}%` }} 
              className="h-full xp-bar-fire z-10 shadow-[0_0_20px_var(--nu-purple)]" 
            />
          </div>
        )}

        <header className="h-24 shrink-0 px-8 md:px-12 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between z-50">
           <div className="flex items-center gap-10">
              <div className="hidden sm:flex flex-col">
                 <h1 className="text-lg font-black tracking-tighter italic uppercase truncate max-w-[200px]">
                   {appConfig.storeName}
                 </h1>
                 <span className="text-[10px] font-black text-[var(--nu-purple)] uppercase tracking-[0.4em] mt-1">{appConfig.codename || 'COMANDO ALPHA'}</span>
              </div>
              
              <div className="flex items-center gap-6 px-6 py-3 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-color)]">
                 <div className="flex items-center gap-3 text-[11px] font-black uppercase text-[var(--text-muted)]">
                    <Clock size={16} className="text-[var(--nu-purple)]" />
                    <span>{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 <div className="hidden md:flex items-center gap-3 text-[11px] font-black uppercase text-[var(--text-muted)] border-l border-[var(--border-color)] pl-6">
                    <CalendarIcon size={16} className="text-[var(--nu-purple)]" />
                    <span>{currentTime.toLocaleDateString('pt-BR')}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                className="p-4 bg-[var(--bg-input)] text-[var(--text-muted)] rounded-2xl border border-[var(--border-color)] hover:text-[var(--nu-purple)] hover:border-[var(--nu-purple)] transition-all loading-pulse"
              >
                 {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              
              <div className="flex items-center gap-4 px-6 py-3 bg-[var(--nu-purple)]/10 rounded-2xl border border-[var(--nu-purple)]/20">
                 <Award size={18} className="text-[var(--nu-purple)]" />
                 <span className="text-[12px] font-black uppercase tracking-widest italic">LVL {userStats.nivel}</span>
              </div>

              <button 
                onClick={() => setIsOlheiro(!isOlheiro)} 
                className={`p-4 rounded-2xl transition-all border-2 ${isOlheiro ? 'border-[var(--nu-error)] text-[var(--nu-error)] bg-[var(--nu-error)]/10 shadow-[0_0_20px_rgba(255,49,49,0.2)]' : 'bg-[var(--bg-input)] border-transparent text-[var(--text-muted)]'}`}
              >
                 <Shield size={24} />
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto nu-scrollbar overscroll-contain relative">
           <div className="p-8 md:p-16 max-w-[1800px] mx-auto safe-bottom-padding">
             <AnimatePresence mode="wait">
               <motion.div 
                 key={activeTab} 
                 initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }} 
                 animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} 
                 exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }} 
                 transition={{ duration: 0.4, ease: "circOut" }}
               >
                 {Content}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] p-4 bg-gradient-to-t from-[var(--bg-primary)] to-transparent">
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
      <Celebration />
    </div>
  );
};

export default App;
