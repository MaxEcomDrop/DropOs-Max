
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet 
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={22} /> },
    { id: 'vendas', label: 'Vendas', icon: <ShoppingCart size={22} /> },
    { id: 'produtos', label: 'Estoque', icon: <Package size={22} /> },
    { id: 'financeiro', label: 'Dinheiro', icon: <Wallet size={22} /> },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`nav-item-mobile ${activeTab === item.id ? 'active' : ''}`}
        >
          <div className="icon-container">
            {item.icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
