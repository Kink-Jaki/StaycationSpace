import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Calendar,
  Users,
  LogOut,
  Settings,
  Percent,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  MapPin,
  ImageOff,
  Loader2,
  Search,
} from "lucide-react";
 
const API_BASE_URL = "http://192.168.111.189:3000";
 
interface Space {
  id: number;
  name: string;
  type: string;
  description: string;
  pricePerHour: string;
  deposit: string;
  capacity: number;
  address: string;
  status: string;
}
 
// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  isSidebarOpen,
  setShowLogoutModal,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  setShowLogoutModal: (v: boolean) => void;
}) {
  const username = localStorage.getItem("username") ?? "Admin";
  const role = localStorage.getItem("role") ?? "admin";
  const [showProfileMenu, setShowProfileMenu] = useState(false);
 
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Space",     icon: Building2,       path: "/space_admin" },
    { name: "Booking",   icon: Calendar,        path: "/booking_admin" },
    { name: "Customer",  icon: Users,           path: "/customer" },
    { name: "Promo",     icon: Percent,         path: "/promo" },
    { name: "Report",    icon: BarChart3,       path: "/report" },
    { name: "Settings",  icon: Settings,        path: "/settings" },
  ];
 
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 shrink-0 border-r border-zinc-900 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
 
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Space";
              return (
                <button
                  key={item.name}
                  onClick={() => (window.location.href = item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold"
                      : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
 
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
                <LogOut size={16} className="text-zinc-500 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-800/40 transition-all rounded-xl border border-zinc-800/30 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black text-xs shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{username}</h4>
                <p className="text-[9px] text-amber-500 font-extrabold tracking-wider uppercase">
                  {role.toUpperCase()}
                </p>
              </div>
            </div>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
 
// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/space_admin")({ 

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
  
  component: Space 
});
 
// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Space() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
 
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [imageMap, setImageMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
 
  const [searchTerm, setSearchTerm] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
 
  useEffect(() => {
    fetchSpaces();
  }, []);
 
  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/spaces`);
      const data: Space[] = await res.json();
      setSpaces(data);
 
      const imgs: Record<number, string> = {};
      await Promise.all(
        data.map(async (s) => {
          try {
            const r = await fetch(`${API_BASE_URL}/spaces/${s.id}/images`);
            const imgData = await r.json();
            if (Array.isArray(imgData) && imgData.length > 0) {
              imgs[s.id] = `${API_BASE_URL}${imgData[0].imageUrl}`;
            }
          } catch {}
        })
      );
      setImageMap(imgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
 
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/spaces/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setSpaces((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    } catch {
      alert("Gagal menghapus space.");
    } finally {
      setDeleting(false);
    }
  };
 
  const typeLabel: Record<string, string> = {
    studio: "Studio Foto",
    villa: "Villa",
    hall: "Coworking Space",
    other: "Lainnya",
  };
 
  
  const filtered = spaces.filter((space) =>
  space.name.toLowerCase().includes(searchTerm.toLowerCase())
);
 
  const activeCount = spaces.filter((s) => s.status === "active").length;
  const inactiveCount = spaces.filter((s) => s.status === "inactive").length;
  const totalCap = spaces.reduce((a, s) => a + (s.capacity || 0), 0);
 
  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />
 
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Daftar Properti</h1>
            <p className="text-zinc-400 mt-1 text-sm">Kelola listing studio dan space Anda.</p>
          </div>
          <button
            onClick={() => (window.location.href = "/tambah")}
            className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-zinc-700 transition-colors text-sm shadow-sm"
          >
            <Plus size={18} /> Tambah Space
          </button>
        </div>
 
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Space",     value: spaces.length,                 sub: "properti",           color: "text-zinc-900" },
            { label: "Aktif",           value: activeCount,                   sub: "online",             color: "text-emerald-600" },
            { label: "Tidak Aktif",     value: inactiveCount,                 sub: "offline",            color: "text-red-500" },
            { label: "Kapasitas Total", value: totalCap.toLocaleString("id-ID"), sub: "orang",           color: "text-zinc-900" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-extrabold mt-1.5 ${s.color}`}>
                {loading ? <Loader2 size={20} className="animate-spin text-zinc-300" /> : s.value}
              </p>
              <p className="text-xs text-zinc-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
 
        {/* Search */}
        <div className="mb-6 relative w-full lg:w-96">
  <Search
    size={18}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
  />

  <input
    type="text"
    placeholder="Cari nama space..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
  />
</div>
 
        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-zinc-100" />
                <div className="p-5 space-y-3">
                  <div className="h-2.5 bg-zinc-100 rounded w-1/4" />
                  <div className="h-4 bg-zinc-100 rounded w-3/4" />
                  <div className="h-3 bg-zinc-100 rounded w-full" />
                  <div className="h-3 bg-zinc-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-400">
            <Building2 size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Belum ada space.</p>
            <p className="text-xs text-zinc-300 mt-1">Tambahkan properti pertama Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filtered.map((space) => (
              <div
                key={space.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-zinc-300 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
              >
                {/* Image */}
                <div className="h-44 bg-zinc-100 relative overflow-hidden">
                  {imageMap[space.id] ? (
                    <img
                      src={imageMap[space.id]}
                      alt={space.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-300">
                      <ImageOff size={28} />
                      <span className="text-xs font-medium">Belum ada foto</span>
                    </div>
                  )}
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      space.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {space.status === "active" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
 
                {/* Body */}
                <div className="p-5">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                    {typeLabel[space.type] || space.type}
                  </p>
                  <h3 className="font-bold text-zinc-900 text-sm truncate mb-1">{space.name}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3 min-h-[32px]">
                    {space.description || "—"}
                  </p>
                  <div className="flex items-start gap-1.5 text-xs text-zinc-400 mb-4">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{space.address || "—"}</span>
                  </div>
 
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">
                        Rp {Number(space.pricePerHour).toLocaleString("id-ID")}
                        <span className="text-xs font-normal text-zinc-400">/jam</span>
                      </p>
                      {Number(space.deposit) > 0 && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Deposit Rp {Number(space.deposit).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {/* ✅ FIXED: passing space.id to URL */}
                      <button
                        onClick={() => (window.location.href = `/edit/${space.id}`)}
                        className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                        title="Edit space"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(space.id)}
                        className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                        title="Hapus space"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
 
      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-100">
            <h3 className="font-bold text-lg mb-2 text-zinc-900">Hapus Space?</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Space beserta semua gambarnya akan dihapus secara permanen.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-zinc-100 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? <><Loader2 size={14} className="animate-spin" /> Menghapus...</> : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-100">
            <h3 className="font-bold text-lg mb-2 text-zinc-900">Konfirmasi Keluar</h3>
            <p className="text-sm text-zinc-500 mb-6">Apakah Anda yakin ingin keluar?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-zinc-100 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
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