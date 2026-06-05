import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Building2, BarChart3, Calendar as CalendarIcon,
  Users, LogOut, Settings as SettingsIcon, Percent, ChevronDown,
  Save, User
} from 'lucide-react';

const BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL ||
  'http://192.168.111.189:3000'

// Komponen Sidebar yang disamakan dengan Report.tsx
function Sidebar({ activeTab, isSidebarOpen, setShowLogoutModal }: any) {
  const username = localStorage.getItem('username') ?? 'Admin Staycation';
  const role = localStorage.getItem('role') ?? 'admin';
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Space',     icon: Building2,       path: '/space_admin' },
    { name: 'Booking',   icon: CalendarIcon,    path: '/booking_admin' },
    { name: 'Customer',  icon: Users,           path: '/customer' },
    { name: 'Promo',     icon: Percent,         path: '/promo' },
    { name: 'Report',    icon: BarChart3,       path: '/report' },
    { name: 'Settings',  icon: SettingsIcon,    path: '/settings' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 shrink-0 border-r border-zinc-900 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button key={item.name} onClick={() => { window.location.href = item.path }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'}`}>
                  <Icon size={16} /><span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-zinc-800/50 mt-auto relative">
          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 w-full bg-[#1e1e1e] border border-zinc-800/80 rounded-xl p-1.5 shadow-xl z-50">
              <button onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors text-sm font-medium">
                <LogOut size={16} className="text-zinc-500 shrink-0" /><span>Logout</span>
              </button>
            </div>
          )}
          <button onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-800/40 transition-all rounded-xl border border-zinc-800/30 text-left">
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
}

function getToken() {
  return localStorage.getItem('token') ?? ''
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  }
}

export const Route = createFileRoute('/settings')({

  beforeLoad: () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Belum login
    if (!token) {
      throw redirect({
        to: "/login",
      });
    }

    // Bukan admin
    if (role !== "admin") {
      throw redirect({
        to: "/login",
      });
    }
  },
  
    component: Settings,
});

export default function Settings() {
  const [profile, setProfile] = useState({ username: '', email: '', phone: '', address: ''});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/profile`, {
          headers: authHeaders()
        });
        const data = await response.json();
        setProfile({
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        })
      } catch (err) {
        console.error("Gagal mengambil data profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(profile),
      })

      if (!res.ok) {
    const errorText = await res.text()
      console.log("ERROR BACKEND:", errorText)
      throw new Error(errorText)
    }

      const updateUser = await res.json()

      localStorage.setItem(
        'username', 
        profile.username
      )
      localStorage.setItem(
        'email', 
        profile.email
      )
      localStorage.setItem(
        'phone', 
        profile.phone
      )
      localStorage.setItem(
        'address', 
        profile.address
      )
      alert('Profile berhasil diperbarui!')
    } catch (err) {
      console.error('Gagal memperbarui profile', err)
      alert('Gagal memperbarui profile. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex w-full">
      <Sidebar
        activeTab="Settings"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-xl font-bold text-zinc-900">Pengaturan Profil</h1>
        </header>

        <div className="p-8 max-w-2xl w-full">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-amber-100 rounded-full text-amber-600">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Administrasi Profil</h2>
                <p className="text-sm text-zinc-500">Perbarui detail akun personal Anda.</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-zinc-400">Memuat data...</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={profile.username} 
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Alamat Email</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Nomor Telepon</label>
                  <input 
                    type="text" 
                    value={profile.phone} 
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Alamat</label>
                  <input 
                    type="text" 
                    value={profile.address} 
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center bg-amber-500 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  <Save size={18} className="mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold">Logout?</h2>
            <p className="text-zinc-500 text-xs mt-2">Yakin ingin mengakhiri sesi administrasi?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-200">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}