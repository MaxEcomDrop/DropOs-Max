import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet,
  Settings
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'painel', label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { id: 'vendas', label: 'Vendas', icon: <ShoppingCart size={20} /> },
    { id: 'produtos', label: 'Arsenal', icon: <Package size={20} /> },
    { id: 'financeiro', label: 'Cofre', icon: <Wallet size={20} /> },
    { id: 'ajustes', label: 'Centro', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="h-20 bg-[var(--bg-card)] border-t border-[var(--border-color)] flex justify-around items-center px-4 pb-safe transition-all duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-[9999]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 flex-1 relative ${
            activeTab === item.id 
            ? 'text-[var(--nu-purple)]' 
            : 'text-[var(--text-muted)]'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${
            activeTab === item.id ? 'bg-[var(--nu-purple)]/10' : ''
          }`}>
            {item.icon}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
          {activeTab === item.id && (
            <div className="absolute -top-[1px] w-8 h-1 bg-[var(--nu-purple)] rounded-full shadow-[0_0_15px_var(--nu-purple)]"></div>
          )}
        </button>
      ))}
    </nav>
  );
};