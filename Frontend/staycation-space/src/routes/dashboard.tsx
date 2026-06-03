import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3,
  Calendar, 
  CreditCard,
  Users, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  X, 
  Settings,
  Star, 
  Percent,
  Menu,
} from 'lucide-react';

// Konfigurasi URL Backend Utama
const API_BASE_URL = "http://192.168.111.152:3000";

interface Stats {
  totalTempat: number;
  bookingTerverifikasi: number;
  menungguPembayaran: number;
  estimasiOmset: number;
}

interface ChartData {
  bulan: string;
  nilai: number;
}

interface Review {
  id: number;
  nama: string;
  rating: number;
  komentar: string;
}

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

// Komponen Sidebar Terpisah
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
    if (item.name === 'Dashboard') {
      setActiveTab('Dashboard');
      setIsSidebarOpen(false);
    } else {
      window.location.href = item.path;
    }
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300
      md:relative md:translate-x-0 shrink-0 border-r border-zinc-900
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Brand Logo Container */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 bg-amber-500 rounded-lg text-black shrink-0">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <h5 className="font-black tracking-wide text-sm text-white truncate">
                STAYCATION<span className="text-amber-500">SPACE</span>
              </h5>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase -mt-0.5">CONSOLES ADMIN</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-500 text-black' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profile Card with Clickable Popover */}
        <div className="pt-4 border-t border-zinc-800/50 mt-auto relative">
          {/* Popover Logout Menu (Disesuaikan persis seperti image_9d3abd.png) */}
          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 w-full bg-[#1e1e1e] border border-zinc-800/80 rounded-xl p-1.5 shadow-xl animate-fade-in z-50">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors text-sm font-medium"
              >
                <LogOut size={16} className="text-zinc-500 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Clickable Profile Card */}
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-800/40 active:scale-[0.98] transition-all rounded-xl border border-zinc-800/30 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black overflow-hidden text-xs shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{username}</h4>
                <p className="text-[9px] text-amber-500 font-extrabold tracking-wider uppercase">{role.toUpperCase()}</p>
              </div>
            </div>
            {/* Chevron Indicator */}
            <div className="text-zinc-500 shrink-0">
              <svg 
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export const Route = createFileRoute('/dashboard')({
  component: Home,
});

export function Home() {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [showToast, setShowToast] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Status koneksi ke backend asli
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  // State untuk data statistik dashboard - Mulai dari 0 (tidak manual)
  const [stats, setStats] = useState<Stats>({
    totalTempat: 0,
    bookingTerverifikasi: 0,
    menungguPembayaran: 0,
    estimasiOmset: 0
  });

  // State untuk data grafik - Mulai dari kosong (tidak manual)
  const [chartData, setStatsChartData] = useState<ChartData[]>([]);

  // State untuk daftar ulasan terbaru
  const [reviews, setReviews] = useState<Review[]>([
    { 
      id: 1, 
      nama: 'Ahmad Faisal - Great lighting!', 
      rating: 5, 
      komentar: 'Tempat sangat nyaman dan pencahayaan studio luar biasa!' 
    },
    { 
      id: 2, 
      nama: 'Dewi Lestari', 
      rating: 4, 
      komentar: 'Villa sunset view memiliki panorama sore yang indah.' 
    }
  ]);

  // State untuk input formulir ulasan baru
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);

  // Fungsi pengecekan apakah backend aktif/bisa diakses sebelum melakukan request utama
  const checkBackendStatus = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Batasi waktu tunggu 2 detik

      const response = await fetch(`${API_BASE_URL}/analytics/overview`, { 
        method: "GET",
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (e) {
      return false;
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/overview`);
      if (!response.ok) throw new Error("Gagal memuat statistik");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.warn("Gagal mengambil statistik dari backend:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/chart`);
      if (!response.ok) throw new Error("Gagal memuat grafik");
      const data = await response.json();
      setStatsChartData(data);
    } catch (error) {
      console.warn("Gagal mengambil grafik dari backend:", error);
    }
  };

  // Efek samping untuk inisialisasi data secara aman dan dinamis
  useEffect(() => {
    const initializeData = async () => {
      const online = await checkBackendStatus();
      setIsBackendOnline(online);

      if (online) {
        // Jika server terdeteksi aktif, ambil data dinamis dari backend asli Anda
        await fetchDashboardStats();
        await fetchChartData();
      } else {
        console.log(`Backend pada ${API_BASE_URL} sedang offline. Menampilkan data kosong/default.`);
      }
    };

    initializeData();
  }, []);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newRev: Review = {
      id: Date.now(),
      nama: 'Simulasi Pengguna',
      rating: newReviewRating,
      komentar: newReviewText.trim()
    };

    setReviews([newRev, ...reviews]);
    setNewReviewText('');
    setNewReviewRating(5);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={12} 
        className={i < rating ? "fill-amber-500 text-amber-500" : "text-gray-300"} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 font-sans flex flex-col md:flex-row relative overflow-x-hidden select-none">
      
      {/* MOBILE RESPONSIVE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#121212] text-white w-full sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 rounded-lg text-black shrink-0">
            <Building2 size={16} />
          </div>
          <div>
            <span className="font-bold tracking-wider text-xs block text-white">STAYCATION<span className="text-amber-500">SPACE</span></span>
            <span className="text-[9px] text-gray-400 block -mt-0.5">CONSOLES ADMIN</span>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 hover:bg-zinc-800 rounded text-amber-500 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* COMPACT & ELEGANT DESKTOP SIDEBAR (KOMPONEN TERPISAH) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        setShowLogoutModal={setShowLogoutModal} 
      />

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full">
        <div className="max-w-[1300px] mx-auto space-y-6 lg:space-y-8">
          
          {/* HEADER STATUS BAR */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                Status: 
                {isBackendOnline === null ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></span> Mendeteksi Server...
                  </span>
                ) : isBackendOnline ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Terhubung ke Backend Lokal
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Gagal Terhubung ke Backend ({API_BASE_URL})
                  </span>
                )}
              </div>
              <div className="text-gray-400 font-medium">
                {isBackendOnline ? "Sesi Aktif: Live Data" : "Sesi Aktif: Terputus"}
              </div>
            </div>

            {/* WELCOME TOAST */}
            {showToast && (
              <div className="bg-white border border-amber-100 rounded-xl p-3.5 shadow-sm flex items-start justify-between gap-3 transition-all duration-200">
                <div className="flex gap-2.5">
                  <div className="p-1 bg-amber-50 rounded-full text-amber-500 mt-0.5 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs lg:text-sm text-slate-800">Selamat Datang di Admin Panel Staycation Space!</h4>
                    <p className="text-[11px] lg:text-xs text-slate-500 mt-0.5 leading-relaxed">Pantau seluruh operasional villa, ruang studio, dan pesanan secara instan dalam satu layar kontrol.</p>
                  </div>
                </div>
                <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg shrink-0">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* TAB CONTENT: HOME DASHBOARD */}
          {activeTab === 'Dashboard' ? (
            <div className="space-y-6 lg:space-y-8">
              
              {/* TITLE */}
              <header>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900 tracking-tight">Ringkasan Aktivitas</h2>
                <p className="text-xs text-slate-500 mt-1">Kelola operasional dan simulasikan alur kerja dengan kontrol penuh.</p>
              </header>

              {/* STATS ROW */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                
                {/* Total Tempat */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase truncate">Total Tempat (Space)</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-800 mt-1">{stats.totalTempat}</p>
                  </div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Building2 size={18} />
                  </div>
                </div>

                {/* Booking Terverifikasi */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase truncate">Booking Terverifikasi</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-800 mt-1">{stats.bookingTerverifikasi}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                </div>

                {/* Menunggu Pembayaran */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase truncate">Menunggu Pembayaran</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-800 mt-1">{stats.menungguPembayaran}</p>
                  </div>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                    <Clock size={18} />
                  </div>
                </div>

                {/* Estimasi Omset */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase truncate">Total Estimasi Omset</p>
                    <p className="text-xl lg:text-2xl font-bold text-slate-800 mt-1">
                      {stats.estimasiOmset >= 1000000 ? `Rp ${(stats.estimasiOmset / 1000000).toFixed(0)} jt` : `Rp ${stats.estimasiOmset} jt`}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                    <DollarSign size={18} />
                  </div>
                </div>

              </div>

              {/* MAIN METRICS GRID (Graph & Ratings Panel) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* GRAPH PANEL */}
                <div className="lg:col-span-2 bg-white p-5 lg:p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-sm lg:text-base text-slate-800">Tren Pemesanan & Okupansi <span className="text-[11px] font-medium text-slate-400">(Live Data)</span></h3>
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-semibold">Periode Semester 1</span>
                    </div>

                    <div className="h-48 lg:h-56 flex items-end justify-between gap-2.5 pt-4 border-b border-slate-100 px-1">
                    {chartData.length > 0 ? (
                      chartData.map((data, index) => (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center h-full justify-end group"
                        >
                          <span className="opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded mb-1 transition-opacity shrink-0">
                            {data.nilai}%
                          </span>

                          <div
                            style={{ height: `${data.nilai}%` }}
                            className="w-full rounded-t-md bg-gradient-to-t from-zinc-950 via-amber-600 to-amber-500 shadow-sm transition-all"
                          />

                          <span className="text-[10px] text-slate-500 font-semibold mt-2">
                            {data.bulan}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs py-10 italic">
                        {isBackendOnline === false ? "Koneksi backend terputus, data grafik kosong." : "Memuat data grafik dari backend..."}
                      </div>
                    )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3">💡 Tip: Arahkan kursor pada grafik untuk melihat okupansi detail.</p>
                </div>

                {/* RATINGS & REVIEW PANEL */}
                <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm lg:text-base text-slate-800 mb-3">Rating & Ulasan Terakhir</h3>
                    
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {reviews.map((rev: Review) => (
                        <div key={rev.id} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="text-[10px] font-bold text-slate-800 truncate">{rev.nama}</h4>
                            <div className="flex gap-0.5 shrink-0">{renderStars(rev.rating)}</div>
                          </div>
                          <p className="text-[10px] text-slate-600 italic mt-1 leading-relaxed">"{rev.komentar}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MINI INTERACTIVE REVIEW FORM */}
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Simulasikan Ulasan Baru</h4>
                    <form onSubmit={handleAddReview} className="space-y-1.5">
                      <div className="grid grid-cols-3 gap-1.5">
                        <input 
                          type="text" 
                          placeholder="Tulis ulasan contoh..."
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          className="col-span-2 text-[10px] px-2.5 py-1 bg-slate-50/80 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="text-[10px] px-1.5 py-1 bg-slate-50/80 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-slate-700"
                        >
                          <option value="5">5 ⭐</option>
                          <option value="4">4 ⭐</option>
                          <option value="3">3 ⭐</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10px] rounded-md transition-colors uppercase tracking-wider">
                        Kirim Ulasan
                      </button>
                    </form>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* PLACEHOLDER VIEWS FOR OTHER TABS */
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center py-20">
              <div className="inline-flex p-4 bg-amber-50 text-amber-500 rounded-full mb-4">
                <Building2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Halaman {activeTab}</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                Bagian ini siap dihubungkan dengan logic backend teman Anda. Saat ini mari kita fokus meninjau tab "Home Dashboard".
              </p>
              <button 
                onClick={() => setActiveTab('Dashboard')}
                className="mt-6 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-lg hover:bg-amber-600 transition-colors"
              >
                Kembali ke Dashboard
              </button>
            </div>
          )}

        </div>
      </main>

      {/* --- CUSTOM LOGOUT MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <LogOut size={24} />
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Keluar</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi admin saat ini? Anda harus login kembali untuk mengelola Staycation Space.
            </p>
            <div className="flex justify-end gap-2.5 mt-6">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;