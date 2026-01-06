
import React, { useState, useEffect } from 'react';
import { 
  EyeOff, Eye, Timer, CheckCircle2, Moon, Sun, Lightbulb, 
  RefreshCcw, Settings, Database, AlertTriangle, FileJson, Download 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  isOlheiro: boolean;
  setIsOlheiro: (val: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOlheiro, setIsOlheiro, theme, setTheme }) => {
  const [pomodoro, setPomodoro] = useState(1500); 
  const [isActive, setIsActive] = useState(false);
  const [ideas, setIdeas] = useState('');
  const [checklist, setChecklist] = useState({ estoque: false, boletos: false, pix: false });

  useEffect(() => {
    let interval: any = null;
    if (isActive && pomodoro > 0) {
      interval = setInterval(() => setPomodoro(prev => prev - 1), 1000);
    } else if (pomodoro === 0) {
      setIsActive(false);
      setPomodoro(1500);
      alert("Foco Encerrado! Hora de descansar 5 minutos.");
    }
    return () => clearInterval(interval);
  }, [isActive, pomodoro]);

  const exportBackup = async () => {
    const { data: p } = await supabase.from('produtos').select('*');
    const { data: s } = await supabase.from('vendas').select('*');
    const { data: f } = await supabase.from('financeiro').select('*');
    const backup = { produtos: p, vendas: s, financeiro: f, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_dropos_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="hidden lg:flex w-72 bg-[var(--bg-card)] border-r border-[var(--border-color)] p-8 flex-col gap-8 sticky top-0 h-screen overflow-y-auto transition-colors duration-300">
      <div className="flex flex-col gap-4">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold pl-2 flex items-center gap-2"><Settings size={14} /> Sistema</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border border-[var(--border-color)] transition-all ${theme === 'dark' ? 'bg-[#820AD1] text-white' : 'bg-white text-[#262626]'}`}>
            {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-[10px] font-bold uppercase">{theme === 'light' ? 'Dia' : 'Noite'}</span>
          </button>
          <button onClick={() => setIsOlheiro(!isOlheiro)} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border border-[var(--border-color)] transition-all ${isOlheiro ? 'bg-[#820AD1] text-white' : 'bg-[var(--bg-primary)]'}`}>
            {isOlheiro ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="text-[10px] font-bold uppercase">Olheiro</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
         <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold pl-2 flex items-center gap-2"><Timer size={14} /> Pomodoro 25/5</p>
         <div className="bg-[var(--bg-primary)] rounded-3xl p-6 text-center border border-[var(--border-color)] shadow-inner">
            <div className="text-3xl font-black mb-4 tracking-tighter">{formatTime(pomodoro)}</div>
            <button onClick={() => setIsActive(!isActive)} className={`w-full py-2 rounded-full text-[10px] font-black uppercase transition-all ${isActive ? 'bg-red-500 text-white' : 'bg-[#820AD1] text-white'}`}>
               {isActive ? 'Pausar' : 'Focar Agora'}
            </button>
         </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold pl-2 flex items-center gap-2"><CheckCircle2 size={14} /> Zerar o Dia</p>
        <div className="space-y-1 bg-[var(--bg-primary)] p-3 rounded-2xl border border-[var(--border-color)]">
          {[
            { id: 'estoque', label: 'Conferir Zumbis' },
            { id: 'boletos', label: 'DAS e Impostos' },
            { id: 'pix', label: 'Conciliar Pix' }
          ].map(task => (
            <label key={task.id} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-black/5 transition-colors">
              <input type="checkbox" checked={(checklist as any)[task.id]} onChange={() => setChecklist(prev => ({ ...prev, [task.id]: !(prev as any)[task.id] }))} className="w-3 h-3 accent-[#820AD1]" />
              <span className={`text-[11px] font-medium ${ (checklist as any)[task.id] ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'}`}>{task.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-3">
        <button onClick={exportBackup} className="flex items-center justify-center gap-2 w-full p-3 bg-[#03D56F]/10 border border-[#03D56F]/30 text-[#03D56F] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#03D56F] hover:text-white transition-all">
          <Download size={14} /> Backup JSON
        </button>
        <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[#820AD1] transition-colors">
          <RefreshCcw size={12} /> Limpar Cache
        </button>
      </div>
    </aside>
  );
};
