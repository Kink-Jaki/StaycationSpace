import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3,
  Calendar, 
  CreditCard,
  Users, 
  LogOut, 
  Settings,
  Star, 
  Percent,
  Plus, 
  Edit2, 
  Trash2,
  ChevronDown
} from 'lucide-react';

// Sidebar component (replicated exactly from Dashboard)
interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  setShowLogoutModal: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  setShowLogoutModal 
}) => {
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "user";
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Space', icon: Building2, path: '/space_admin' },
    { name: 'Booking', icon: Calendar, path: '/booking_admin' },
    { name: 'Customer', icon: Users, path: '/customer' },
    { name: 'Payment', icon: CreditCard, path: '/payment' },
    { name: 'Review', icon: Star, path: '/review' },
    { name: 'Promo', icon: Percent, path: '/promo' },
    { name: 'Report', icon: BarChart3, path: '/report' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleNavigation = (item: MenuItem) => {
    if (item.name === 'Space') {
      setActiveTab('Space');
      setIsSidebarOpen(false);
    } else {
      window.location.href = item.path;
    }
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 shrink-0 border-r border-zinc-900 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-amber-500 rounded-lg text-black shrink-0"><Building2 size={20} /></div>
            <div className="min-w-0">
              <h5 className="font-black tracking-wide text-sm text-white truncate">STAYCATION<span className="text-amber-500">SPACE</span></h5>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase -mt-0.5">CONSOLES ADMIN</p>
            </div>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button key={item.name} onClick={() => handleNavigation(item)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
                  <Icon size={16} /> <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-zinc-800/50 mt-auto relative">
          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 w-full bg-[#1e1e1e] border border-zinc-800/80 rounded-xl p-1.5 shadow-xl z-50">
              <button onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors text-sm font-medium">
                <LogOut size={16} className="text-zinc-500 shrink-0" /> <span>Logout</span>
              </button>
            </div>
          )}
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-800/40 transition-all rounded-xl border border-zinc-800/30 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black text-xs shrink-0">{username.charAt(0).toUpperCase()}</div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{username}</h4>
                <p className="text-[9px] text-amber-500 font-extrabold tracking-wider uppercase">{role.toUpperCase()}</p>
              </div>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const Route = createFileRoute('/space_admin')({
    component: Space,
  });

export default function Space() {
  const [activeTab, setActiveTab] = useState('Space');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const properties = [
    { id: 1, name: "The Golden Hours Studio", description: "Studio foto dengan pencahayaan alami terbaik...", price: "Rp 180.000 / jam" },
  ];

  return (
    <div className="flex h-screen bg-[#FAF8F5]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        setShowLogoutModal={setShowLogoutModal} 
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Daftar Properti Anda</h1>
            <p className="text-zinc-500 mt-1">Kelola listing studio dan space Anda.</p>
          </div>
          <button onClick={() => window.location.href = '/tambah'} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            <Plus size={20} /> Tambah
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
              <div className="h-40 bg-zinc-200 rounded-xl mb-4" />
              <h3 className="text-lg font-bold mb-1">{prop.name}</h3>
              <p className="text-sm text-zinc-500 mb-4">{prop.description}</p>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-bold">{prop.price}</span>
                <div className="flex gap-2">
                  <button  onClick={() => window.location.href = '/edit'} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"><Edit2 size={18} /></button>
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="font-bold text-lg mb-4">Konfirmasi Keluar</h3>
            <p className="text-sm text-zinc-600 mb-6">Apakah Anda yakin ingin keluar?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-zinc-100 rounded-lg text-sm font-bold">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}