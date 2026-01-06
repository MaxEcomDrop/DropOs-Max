
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { Sales } from './components/Sales';
import { Finance } from './components/Finance';
import { BottomNav } from './components/BottomNav';
import { Settings, Moon, Sun, EyeOff, Eye } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOlheiro, setIsOlheiro] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showConfigMobile, setShowConfigMobile] = useState(false);

  useEffect(() => {
    const savedOlheiro = localStorage.getItem('olheiro_mode');
    if (savedOlheiro) setIsOlheiro(JSON.parse(savedOlheiro));
    
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) setTheme(savedTheme as 'light' | 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleOlheiro = (val: boolean) => {
    setIsOlheiro(val);
    localStorage.setItem('olheiro_mode', JSON.stringify(val));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard isOlheiro={isOlheiro} theme={theme} />;
      case 'produtos': return <Products isOlheiro={isOlheiro} />;
      case 'vendas': return <Sales isOlheiro={isOlheiro} />;
      case 'financeiro': return <Finance isOlheiro={isOlheiro} />;
      default: return <Dashboard isOlheiro={isOlheiro} theme={theme} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar 
        isOlheiro={isOlheiro} 
        setIsOlheiro={toggleOlheiro}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8 lg:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex justify-between w-full md:w-auto items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                DropOS <span className="text-[#820AD1]">Max</span>
              </h1>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold uppercase tracking-widest">Nu Edition - {activeTab.toUpperCase()}</p>
            </div>
            
            {/* Mobile-only settings toggle */}
            <button 
              onClick={() => setShowConfigMobile(!showConfigMobile)}
              className="lg:hidden p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[#820AD1]"
            >
              <Settings size={20} />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-color)] transition-colors">
             <div className="px-3 py-1 rounded-xl bg-[#820AD1]/10 text-[10px] font-bold text-[#820AD1] uppercase tracking-tighter">
              Acesso Profissional
            </div>
            <div className="flex items-center gap-2 pr-2">
                <div className="w-2 h-2 rounded-full bg-[#03D56F]"></div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Status: Ativo</span>
            </div>
          </div>
        </header>

        {/* Mobile quick config overlay */}
        {showConfigMobile && (
          <div className="lg:hidden fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200" onClick={() => setShowConfigMobile(false)}>
            <div className="nu-card w-full max-w-xs space-y-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-center font-bold uppercase text-[10px] tracking-widest border-b border-[var(--border-color)] pb-4">Personalização</h2>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
                >
                  <span className="text-xs font-bold uppercase">{theme === 'light' ? 'Ativar Modo Noite' : 'Ativar Modo Dia'}</span>
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <button 
                  onClick={() => toggleOlheiro(!isOlheiro)}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]"
                >
                  <span className="text-xs font-bold uppercase">Modo Olheiro</span>
                  {isOlheiro ? <EyeOff size={18} className="text-[#820AD1]" /> : <Eye size={18} />}
                </button>
              </div>
              <button onClick={() => setShowConfigMobile(false)} className="nu-button-primary w-full text-xs">Concluir</button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {renderContent()}
          
          {/* TRUQUE DO ESPAÇADOR: Calço de segurança para garantir que o rodapé não cubra nada */}
          <div style={{ height: '100px', paddingBottom: '50px' }}></div>
        </div>
      </main>

      {/* Native-like Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
