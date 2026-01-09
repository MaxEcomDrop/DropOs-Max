import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet,
  Settings,
  ArrowRightLeft
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'painel', label: 'Início', icon: <LayoutDashboard size={20} /> },
    { id: 'vendas', label: 'Vendas', icon: <ArrowRightLeft size={20} /> },
    { id: 'financeiro', label: 'Conta', icon: <Wallet size={20} /> },
    { id: 'produtos', label: 'Arsenal', icon: <Package size={20} /> },
    { id: 'ajustes', label: 'Perfil', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-[var(--bg-card)] border-t border-[var(--border-color)] flex justify-around items-center px-2 pb-safe z-[9999]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 ${
            activeTab === item.id 
            ? 'text-[var(--nu-purple)]' 
            : 'text-[var(--text-muted)]'
          }`}
        >
          <div className={`p-1 rounded-full transition-all ${
            activeTab === item.id ? 'bg-[var(--nu-purple)]/10' : ''
          }`}>
            {item.icon}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter" data-nav-label>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
