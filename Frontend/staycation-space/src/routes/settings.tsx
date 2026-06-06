import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import {
  Save, User, ArrowLeft
} from 'lucide-react';

const BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL ||
  'http://192.168.111.189:3000'


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

    // Belum login
    if (!token) {
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
      <main className="flex-1 flex flex-col overflow-y-auto items-center justify-center">
        <div className="p-8 max-w-2xl w-full">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-amber-100 rounded-full text-amber-600">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900">{profile.username || 'Profil Pengguna'}</h2>
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
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center bg-amber-500 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    <Save size={18} className="mr-2" />
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const role = localStorage.getItem('role');
                      const destination = role === 'admin' ? '/dashboard' : '/beranda';
                      window.location.href = destination;
                    }}
                    className="flex items-center bg-zinc-300 text-zinc-900 font-bold px-6 py-2.5 rounded-xl hover:bg-zinc-400 transition-colors"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Kembali
                  </button>
                </div>
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