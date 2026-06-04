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
  ArrowLeft,
  ChevronDown,
  Image as PhotoIcon
} from 'lucide-react';

interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
}

const Sidebar = ({ activeTab, isSidebarOpen, setShowLogoutModal }: any) => {
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
                <button key={item.name} onClick={() => window.location.href = item.path} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
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

export const Route = createFileRoute('/edit')({
  component: EditSpace,
});

export function EditSpace() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Berhasil menyimpan, langsung arahkan ke halaman Space
    window.location.href = '/space';
  };

  return (
    <div className="flex h-screen bg-zinc-50"> 
      <Sidebar 
        activeTab="Space" 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        setShowLogoutModal={setShowLogoutModal} 
      />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Tombol kembali diarahkan langsung ke halaman /space */}
          <button onClick={() => window.location.href = '/space'} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-6 font-medium transition-colors">
            <ArrowLeft size={20} /> Kembali ke daftar
          </button>
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Edit Properti</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Card 1: Informasi Utama */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <h1 className="text-lg font-bold text-zinc-900">1. Informasi Utama</h1>
              <p className="mt-1 text-sm text-zinc-500">Berikan deskripsi yang menarik minat penyewa mengenal studio atau villa anda.</p>
              <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="nama_tempat" className="block text-sm font-medium text-zinc-900">NAMA TEMPAT</label>
                  <div className="mt-2">
                    <input id="nama_tempat" type="text" className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Contoh: Studio Foto Minimalis" required />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="kategori" className="block text-sm font-medium text-zinc-900">KATEGORI TEMPAT</label>
                  <div className="mt-2">
                    <select id="kategori" className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required>
                      <option value="">Pilih Kategori Tempat</option>
                      <option value="perjam">Studio Foto</option>
                      <option value="perhari">Studio Musik</option>
                      <option value="perhari">Villa</option>
                      <option value="perhari">Coworking Space</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="kapasitas" className="block text-sm font-medium text-zinc-900">KAPASITAS MAKSIMAL</label>
                  <div className="mt-2">
                    <input id="kapasitas" type="number" min="1" className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Contoh: 5 orang" required/>
                  </div>
                </div>
                <div className="col-span-full">
                  <label htmlFor="deskripsi" className="block text-sm font-medium text-zinc-900">DESKRIPSI</label>
                  <div className="mt-2">
                    <textarea id="deskripsi" rows={3} className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Ceritakan kelebihan, alat, dan fasilitas yang tersedia." required/>
                  </div>
                </div>
                <div className="col-span-full">
                  <label htmlFor="alamat" className="block text-sm font-medium text-zinc-900">ALAMAT LENGKAP</label>
                  <div className="mt-2">
                    <textarea id="alamat" rows={3} className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Masukkan alamat lengkap properti Anda." required/>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Galeri Photo */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900">2. Upload Galeri Foto Tempat</h2>  
              <p className="mt-1 text-sm text-zinc-600">Unggah visual berkualitas tinggi untuk menarik calon pelanggan. Format yang didukung: .jpg, .png, .webp.</p>
              
              <div className="mt-8">
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-900">Cover photo</label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center flex flex-col items-center">
                      <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-300 mb-2" />
                      <div className="flex text-sm/6 text-gray-600 justify-center items-center gap-1">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            accept="image/*" 
                            required 
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>

                      {/* Preview Image diletakkan dengan aman di sini */}
                      {preview && (
                        <div className="mt-4 flex justify-center">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-64 h-40 object-cover rounded-lg border border-zinc-200 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Atur Harga */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900">3. Atur harga Booking & Tarif Sewa</h2>  
              <p className="mt-1 text-sm text-zinc-600">konfigurasi nilai penawaran, jaminan, serta sistem perhitungan waktu secara detail</p>
              <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="sewa" className="block text-sm font-medium text-zinc-900">SISTEM SEWA DASAR</label>
                  <div className="mt-2">
                    <select id="sewa" className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required>
                      <option value="">Pilih Sistem Sewa</option>
                      <option value="perjam">Per Jam (Cocok untuk Studio)</option>
                      <option value="perhari">Per Hari (Cocok untuk Villa)</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="harga_dasar" className="block text-sm font-medium text-zinc-900">HARGA DASAR (IDR)</label>
                  <div className="mt-2">
                    <input id="harga_dasar" type="number" className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Contoh: 150000" required />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Tarif standar yang berlaku pada hari kerja (Senin - Jumat)</p>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="harga_akhir_pekan" className="block text-sm font-medium text-zinc-900">HARGA AKHIR PEKAN (IDR)</label>
                  <div className="mt-2">
                    <input id="harga_akhir_pekan" type="number" className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Contoh: 200000" required />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Tarif standar yang berlaku pada hari Sabtu - Minggu dan hari libur nasional</p>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="deposit_jaminan" className="block text-sm font-medium text-zinc-900">DEPOSIT JAMINAN (IDR)</label>
                  <div className="mt-2">
                    <input id="deposit_jaminan" type="number" className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Contoh: 250000" required />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Biaya jaminan yang dikembalikan setelah masa sewa selesai (Dianjurkan untuk villa)</p>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex items-center justify-end gap-x-4 pt-4">
              <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">Simpan</button>
            </div>
          </form>
        </div>
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-2xl max-w-sm w-full p-6 shadow-xl border border-zinc-800">
            <h3 className="font-bold text-lg mb-4 text-white">Konfirmasi Keluar</h3>
            <p className="text-sm text-zinc-400 mb-6">Apakah Anda yakin ingin keluar?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-zinc-800 rounded-lg text-sm font-bold text-white">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Menjadikan App sebagai default export agar sesuai dengan standar React Single-File Preview
export default function Edit() {
  return <EditSpace />;
}