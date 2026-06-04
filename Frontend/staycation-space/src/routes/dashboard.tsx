
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  LogOut,
  Settings,
  Percent,
  Menu,
  BarChart3,
  CheckCircle2,
  Clock3,
  DollarSign,
  ChevronDown,
  Star,
} from "lucide-react";

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

interface Review {
  id: number;
  rating: number;
  comment: string;
}

interface RevenueChart {
  month: string;
  revenue: string;
}

interface BookingChart {
  month: string;
  bookings: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  setShowLogoutModal: (show: boolean) => void;
}

// ========================================
// FORMAT
// ========================================
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

// ========================================
// AUTH
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
// API
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

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
 
function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, setShowLogoutModal }: SidebarProps) {
  const username = localStorage.getItem('username') ?? 'Admin Staycation';
  const role = localStorage.getItem('role') ?? 'admin';
  const [showProfileMenu, setShowProfileMenu] = useState(false);
 
  const menuItems = [    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Space", icon: Building2, path: "/space_admin" },
    { name: "Booking", icon: Calendar, path: "/booking_admin" },
    { name: "Customer", icon: Users, path: "/customer" },
    { name: "Promo", icon: Percent, path: "/promo" },
    { name: "Report", icon: BarChart3, path: "/report" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];
 
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 shrink-0 border-r border-zinc-900 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col h-full justify-between">
        <div>
          
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = item.name === activeTab;
              return (
                <button key={item.name} onClick={() => { setActiveTab(item.name); setIsSidebarOpen(false); window.location.href = item.path; }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'}`}
                >
                  <Icon size={16} /><span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-zinc-800/50 mt-auto relative">
          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 w-full bg-[#1e1e1e] border border-zinc-800/80 rounded-xl p-1.5 shadow-xl z-50">
              <button onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }}
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
// ========================================
// ROUTE
// ========================================
export const Route = createFileRoute("/dashboard")({
  component: Home,
});

// ========================================
// MAIN
// ========================================
export function Home() {
  const [activeTab, setActiveTab] =
    useState<string>("Dashboard");

  const [isSidebarOpen, setIsSidebarOpen] =
    useState<boolean>(false);

  const [showLogoutModal, setShowLogoutModal] =
    useState<boolean>(false);

  const [isBackendOnline, setIsBackendOnline] =
    useState<boolean | null>(null);

  const [stats, setStats] = useState<Stats>({
    totalTempat: 0,
    bookingTerverifikasi: 0,
    menungguPembayaran: 0,
    estimasiOmset: 0,
  });

  const [reviews, setReviews] = useState<Review[]>([]);

  const [revenueChart, setRevenueChart] =
    useState<RevenueChart[]>([]);

  const [bookingChart, setBookingChart] =
    useState<BookingChart[]>([]);

  // ========================================
  // FETCH OVERVIEW
  // ========================================
  const fetchOverview = async () => {
    try {
      const response = await apiFetch(
        "/analytics/overview"
      );

      const data = await response.json();

      setStats({
        totalTempat: Number(data.totalSpaces || 0),

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

      setReviews(data.latestReviews || []);

      setIsBackendOnline(true);
    } catch (error) {
      console.log(error);

      setIsBackendOnline(false);
    }
  };

  // ========================================
  // FETCH CHART
  // ========================================
  const fetchChart = async () => {
    try {
      const response = await apiFetch(
        "/analytics/chart"
      );

      const data = await response.json();

      setRevenueChart(data.revenueChart || []);

      setBookingChart(data.bookingChart || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ========================================
  // INIT
  // ========================================
  useEffect(() => {
    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    fetchOverview();
    fetchChart();
  }, []);

  // ========================================
  // STARS
  // ========================================
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < rating
            ? "fill-amber-500 text-amber-500"
            : "text-zinc-300"
        }
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#121212] p-4 flex items-center justify-between text-white">
        <h1 className="font-bold">
          STAYCATION
          <span className="text-amber-500">SPACE</span>
        </h1>

        <button
          onClick={() =>
            setIsSidebarOpen(!isSidebarOpen)
          }
        >
          <Menu />
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

      {/* MAIN */}
      <main className="flex-1 p-6 md:p-8">

        {/* STATUS */}
        <div className="flex justify-between items-center text-sm mb-6">
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

          <span className="text-slate-500">
            {isBackendOnline
              ? "Live Data"
              : "Disconnected"}
          </span>
        </div>

        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Ringkasan aktivitas admin
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Total Tempat
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {stats.totalTempat}
                </h2>
              </div>

              <Building2 className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Booking Verified
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {stats.bookingTerverifikasi}
                </h2>
              </div>

              <CheckCircle2 className="text-emerald-500" />
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Pending Payment
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {stats.menungguPembayaran}
                </h2>
              </div>

              <Clock3 className="text-orange-500" />
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Estimasi Omset
                </p>

                <h2 className="text-2xl font-bold mt-3">
                  {formatRupiah(
                    stats.estimasiOmset
                  )}
                </h2>
              </div>

              <DollarSign className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* CHART + REVIEW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* CHART */}
          <div className="xl:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">

            <h2 className="font-bold text-lg mb-6">
              Revenue Chart
            </h2>

            <div className="space-y-5">

              {revenueChart.map((item, index) => (
                <div key={index}>

                  <div className="flex justify-between mb-2 text-sm">
                    <span>{item.month}</span>

                    <span className="font-semibold">
                      {formatRupiah(
                        Number(item.revenue)
                      )}
                    </span>
                  </div>

                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          Number(item.revenue) / 50000,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              ))}

            </div>

            <div className="mt-8">

              <h2 className="font-bold text-lg mb-6">
                Booking Chart
              </h2>

              <div className="space-y-5">

                {bookingChart.map((item, index) => (
                  <div key={index}>

                    <div className="flex justify-between mb-2 text-sm">
                      <span>{item.month}</span>

                      <span className="font-semibold">
                        {item.bookings} Booking
                      </span>
                    </div>

                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Number(
                            item.bookings
                          ) * 10}%`,
                        }}
                      />

                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>

          {/* REVIEWS */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">

            <h2 className="font-bold text-lg mb-5">
              Latest Reviews
            </h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">

              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start mb-2">

                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>

                    </div>

                    <p className="text-sm text-slate-600">
                      "{review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">
                  Belum ada review
                </p>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">

            <h2 className="text-xl font-bold">
              Logout?
            </h2>

            <p className="text-slate-500 mt-2">
              Yakin mau logout?
            </p>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() =>
                  setShowLogoutModal(false)
                }
                className="px-4 py-2 bg-slate-100 rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
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

