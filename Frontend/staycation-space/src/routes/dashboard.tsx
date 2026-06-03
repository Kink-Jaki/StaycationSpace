
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

// ========================================
// CONFIG
// ========================================
const API_BASE_URL = "http://192.168.111.152:3000";

// ========================================
// TYPES
// ========================================
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

// ========================================
// AUTH HELPER
// ========================================
const getToken = () => {
  return localStorage.getItem("token");
};

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};

// ========================================
// API FETCH
// ========================================
const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    logout();
    throw new Error("Unauthorized");
  }

  return response;
};

// ========================================
// SIDEBAR
// ========================================
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

    if (item.name === "Dashboard") {
      setActiveTab("Dashboard");
      setIsSidebarOpen(false);
    } else {
      window.location.href = item.path;
    }
  };

  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300
      md:relative md:translate-x-0 shrink-0 border-r border-zinc-900
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}
    >
      <div className="flex flex-col h-full justify-between">

        <div>

          {/* LOGO */}
          <div className="flex items-center gap-2.5 mb-6">

            <div className="p-2 bg-amber-500 rounded-lg text-black shrink-0">
              <Building2 size={20} />
            </div>

            <div className="min-w-0">
              <h5 className="font-black tracking-wide text-sm text-white truncate">
                STAYCATION
                <span className="text-amber-500">SPACE</span>
              </h5>

              <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase -mt-0.5">
                CONSOLES ADMIN
              </p>
            </div>

          </div>

          {/* MENU */}
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

        {/* PROFILE */}
        <div className="pt-4 border-t border-zinc-800/50 mt-auto relative">

          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 w-full bg-[#1e1e1e] border border-zinc-800/80 rounded-xl p-1.5 shadow-xl z-50">

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>

            </div>
          )}

          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-800/40 rounded-xl border border-zinc-800/30 text-left"
          >

            <div className="flex items-center gap-3 min-w-0">

              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black overflow-hidden text-xs shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">

                <h4 className="text-xs font-bold text-white truncate">
                  {username}
                </h4>

                <p className="text-[9px] text-amber-500 font-extrabold tracking-wider uppercase">
                  {role.toUpperCase()}
                </p>

              </div>

            </div>

          </button>

        </div>

      </div>
    </aside>
  );
};

// ========================================
// ROUTE
// ========================================
export const Route = createFileRoute('/dashboard')({
  component: Home,
});

// ========================================
// MAIN
// ========================================
export function Home() {

  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  const [showToast, setShowToast] = useState<boolean>(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  const [stats, setStats] = useState<Stats>({
    totalTempat: 0,
    bookingTerverifikasi: 0,
    menungguPembayaran: 0,
    estimasiOmset: 0
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);

  const [reviews, setReviews] = useState<Review[]>([]);

  const [newReviewText, setNewReviewText] = useState<string>('');

  const [newReviewRating, setNewReviewRating] = useState<number>(5);

  // ========================================
  // CHECK BACKEND
  // ========================================
  const checkBackendStatus = async (): Promise<boolean> => {

    try {

      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 3000);

      await apiFetch("/analytics/overview", {
        method: "GET",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      return true;

    } catch (error) {

      console.log("Backend offline:", error);

      return false;
    }
  };

  // ========================================
  // FETCH STATS
  // ========================================
  const fetchDashboardStats = async () => {

  try {

    const response = await apiFetch(
      "/analytics/overview"
    );

    if (!response.ok) {
      throw new Error(
        "Gagal memuat statistik"
      );
    }

    const data = await response.json();

    console.log("Analytics:", data);

    setStats({
      totalTempat: Number(
        data.totalSpaces || 0
      ),

      bookingTerverifikasi: Number(
        data.verifiedBookings || 0
      ),

      menungguPembayaran: Number(
        data.pendingPayments || 0
      ),

      estimasiOmset: Number(
        data.totalRevenue || 0
      ),
    });

    // latest reviews
    if (data.latestReviews) {

      setReviews(
        data.latestReviews.map(
          (review: any) => ({
            id: review.id,
            nama: "Customer",
            rating: review.rating,
            komentar: review.comment,
          })
        )
      );

    }

  } catch (error) {

    console.warn(
      "Gagal mengambil statistik:",
      error
    );

  }

};

  // ========================================
  // FETCH CHART
  // ========================================
  const fetchChartData = async () => {

    try {

      const response = await apiFetch("/analytics/chart");

      if (!response.ok) {
        throw new Error("Gagal memuat grafik");
      }

      const data = await response.json();

      setChartData(data);

    } catch (error) {

      console.warn(error);

    }
  };

  // ========================================
  // INIT
  // ========================================
  useEffect(() => {

    const init = async () => {

      const token = getToken();

      if (!token) {
        logout();
        return;
      }

      const online = await checkBackendStatus();

      setIsBackendOnline(online);

      if (online) {

        await Promise.all([
          fetchDashboardStats(),
          fetchChartData()
        ]);

      }
    };

    init();

  }, []);

  // ========================================
  // REVIEW
  // ========================================
  const handleAddReview = (e: React.FormEvent) => {

    e.preventDefault();

    if (!newReviewText.trim()) return;

    const newReview: Review = {
      id: Date.now(),
      nama: "Simulasi Pengguna",
      rating: newReviewRating,
      komentar: newReviewText.trim()
    };

    setReviews([newReview, ...reviews]);

    setNewReviewText('');

    setNewReviewRating(5);
  };

  // ========================================
  // STARS
  // ========================================
  const renderStars = (rating: number) => {

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={
          i < rating
            ? "fill-amber-500 text-amber-500"
            : "text-gray-300"
        }
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 font-sans flex flex-col md:flex-row relative overflow-x-hidden">

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#121212] text-white w-full sticky top-0 z-50 shadow-md">

        <div className="flex items-center gap-2">

          <div className="p-1.5 bg-amber-500 rounded-lg text-black">
            <Building2 size={16} />
          </div>

          <div>
            <span className="font-bold tracking-wider text-xs block text-white">
              STAYCATION
              <span className="text-amber-500">SPACE</span>
            </span>

            <span className="text-[9px] text-gray-400 block -mt-0.5">
              CONSOLES ADMIN
            </span>
          </div>

        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 hover:bg-zinc-800 rounded text-amber-500 transition-colors"
        >
          <Menu size={20} />
        </button>

      </div>

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full">

        <div className="max-w-[1300px] mx-auto space-y-6 lg:space-y-8">

          {/* STATUS */}
          <div className="flex items-center justify-between text-xs">

            <div className="flex items-center gap-2">

              <span>Status:</span>

              {isBackendOnline ? (
                <span className="text-emerald-600 font-bold">
                  Backend Connected
                </span>
              ) : (
                <span className="text-red-500 font-bold">
                  Backend Offline
                </span>
              )}

            </div>

            <div className="text-slate-500">
              {isBackendOnline ? "Live Data" : "Disconnected"}
            </div>

          </div>

          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-bold">
              Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Ringkasan aktivitas admin
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-bold">
                Total Tempat
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {stats.totalTempat}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-bold">
                Booking Terverifikasi
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {stats.bookingTerverifikasi}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-bold">
                Menunggu Pembayaran
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {stats.menungguPembayaran}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-slate-400 uppercase font-bold">
                Estimasi Omset
              </p>

              <h2 className="text-3xl font-bold mt-2">
                Rp {stats.estimasiOmset}
              </h2>
            </div>

          </div>

        </div>

      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border">

            <h3 className="font-bold text-lg">
              Logout?
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Yakin ingin logout?
            </p>

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100"
              >
                Batal
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
              >
                Logout
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Home;
