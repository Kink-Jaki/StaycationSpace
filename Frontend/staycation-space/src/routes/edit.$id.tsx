import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Calendar,
  CreditCard,
  Users,
  LogOut,
  Settings,
  Percent,
  ArrowLeft,
  ChevronDown,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const API_BASE_URL = "http://192.168.111.152:3000";

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ isSidebarOpen, setShowLogoutModal }: any) => {
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "user";
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Space',     icon: Building2,       path: '/space_admin' },
    { name: 'Booking',   icon: Calendar,        path: '/booking_admin' },
    { name: 'Customer',  icon: Users,           path: '/customer' },
    { name: 'Payment',   icon: CreditCard,      path: '/payment' },
    { name: 'Promo',     icon: Percent,         path: '/promo' },
    { name: 'Report',    icon: BarChart3,       path: '/report' },
    { name: 'Settings',  icon: Settings,        path: '/settings' },
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
              const isActive = item.name === 'Space';
              return (
                <button
                  key={item.name}
                  onClick={() => (window.location.href = item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                >
                  <Icon size={16} /> <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-zinc-800/50 mt-auto relative">
          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 w-full bg-[#1e1e1e] border border-zinc-800/80 rounded-xl p-1.5 shadow-xl z-50">
              <button
                onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors text-sm font-medium"
              >
                <LogOut size={16} className="text-zinc-500 shrink-0" /> <span>Logout</span>
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

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold animate-slide-in ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
  </div>
);

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute('/edit/$id')({
  component: EditSpace,
});

// ─── Main Component ───────────────────────────────────────────────────────────
export function EditSpace() {
  const { id } = Route.useParams();
  const token = localStorage.getItem("token");

  const [isSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<{ id: number; imageUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // form
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "studio",
    kapasitas: "",
    deskripsi: "",
    alamat: "",
    hargaDasar: "",
    depositJaminan: "",
  });

  // ui states
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch space data on mount ──
  useEffect(() => {
    const getSpace = async () => {
      try {
        setLoadingData(true);

        // Fetch space detail
        const res = await fetch(`${API_BASE_URL}/spaces/${id}`);
        if (!res.ok) throw new Error("Gagal mengambil data space");
        const data = await res.json();

        setFormData({
          nama:           data.name         ?? "",
          kategori:       data.type         ?? "studio",
          kapasitas:      data.capacity     != null ? String(data.capacity)    : "",
          deskripsi:      data.description  ?? "",
          alamat:         data.address      ?? "",
          hargaDasar:     data.pricePerHour != null ? String(data.pricePerHour) : "",
          depositJaminan: data.deposit      != null ? String(data.deposit)      : "",
        });

        // Fetch existing images
        const imgRes = await fetch(`${API_BASE_URL}/spaces/${id}/images`);
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          setExistingImages(Array.isArray(imgData) ? imgData : []);
        }
      } catch (err) {
        console.error(err);
        showToast('error', 'Gagal memuat data space.');
      } finally {
        setLoadingData(false);
      }
    };

    getSpace();
  }, [id]);

  // ── Handle file select ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Update space — backend pakai c.req.parseBody() jadi kirim FormData, bukan JSON
      const spaceForm = new FormData();
      spaceForm.append("name",         formData.nama);
      spaceForm.append("type",         formData.kategori);
      spaceForm.append("description",  formData.deskripsi);
      spaceForm.append("address",      formData.alamat);
      spaceForm.append("capacity",     formData.kapasitas);
      spaceForm.append("pricePerHour", formData.hargaDasar);
      spaceForm.append("deposit",      formData.depositJaminan);

      const res = await fetch(`${API_BASE_URL}/spaces/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        // Jangan set Content-Type manual — browser isi boundary FormData otomatis
        body: spaceForm,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Update gagal: ${errBody}`);
      }

      // 2. Upload gambar baru jika ada — field name "files" (backend pakai form.getAll("files"))
      if (imageFile) {
        const imgForm = new FormData();
        imgForm.append("files", imageFile);

        const imgRes = await fetch(`${API_BASE_URL}/spaces/${id}/images`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imgForm,
        });

        if (!imgRes.ok) {
          const errBody = await imgRes.text();
          console.error("Upload gambar gagal:", errBody);
          showToast('error', `Data tersimpan, tapi gambar gagal diupload. (${imgRes.status})`);
          setSubmitting(false);
          return;
        }
      }

      showToast('success', 'Space berhasil diperbarui!');
      setTimeout(() => (window.location.href = '/space_admin'), 1500);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Input helper ──
  const field = (id: keyof typeof formData) => ({
    value: formData[id],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFormData(prev => ({ ...prev, [id]: e.target.value })),
  });

  const inputClass = "block w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all";
  const labelClass = "block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="flex h-screen bg-zinc-50 font-sans">
      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <Sidebar isSidebarOpen={isSidebarOpen} setShowLogoutModal={setShowLogoutModal} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* Back + Title */}
          <button
            onClick={() => (window.location.href = '/space_admin')}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 mb-6 font-medium transition-colors text-sm"
          >
            <ArrowLeft size={18} /> Kembali ke daftar
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-zinc-900">Edit Properti</h1>
            <p className="text-zinc-400 text-sm mt-1">Perbarui informasi, foto, dan harga space Anda.</p>
          </div>

          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-400">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm">Memuat data space...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── Card 1: Informasi Utama ── */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                  <h2 className="font-bold text-zinc-900 text-sm">1. Informasi Utama</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Nama, kategori, kapasitas, deskripsi, dan alamat.</p>
                </div>
                <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-6">

                  {/* Nama */}
                  <div className="sm:col-span-6">
                    <label htmlFor="nama" className={labelClass}>Nama Tempat</label>
                    <input id="nama" type="text" className={inputClass} placeholder="Contoh: Studio Foto Minimalis" required {...field('nama')} />
                  </div>

                  {/* Kategori */}
                  <div className="sm:col-span-3">
                    <label htmlFor="kategori" className={labelClass}>Kategori</label>
                    <select id="kategori" className={inputClass} required {...field('kategori')}>
                      <option value="studio">Studio Foto</option>
                      <option value="villa">Villa</option>
                      <option value="hall">Coworking Space</option>
                    </select>
                  </div>

                  {/* Kapasitas */}
                  <div className="sm:col-span-3">
                    <label htmlFor="kapasitas" className={labelClass}>Kapasitas Maksimal (orang)</label>
                    <input id="kapasitas" type="number" min="1" className={inputClass} placeholder="Contoh: 5" required {...field('kapasitas')} />
                  </div>

                  {/* Deskripsi */}
                  <div className="sm:col-span-6">
                    <label htmlFor="deskripsi" className={labelClass}>Deskripsi</label>
                    <textarea
                      id="deskripsi"
                      rows={3}
                      className={inputClass}
                      placeholder="Ceritakan kelebihan, alat, dan fasilitas yang tersedia."
                      required
                      value={formData.deskripsi}
                      onChange={e => setFormData(p => ({ ...p, deskripsi: e.target.value }))}
                    />
                  </div>

                  {/* Alamat */}
                  <div className="sm:col-span-6">
                    <label htmlFor="alamat" className={labelClass}>Alamat Lengkap</label>
                    <textarea
                      id="alamat"
                      rows={2}
                      className={inputClass}
                      placeholder="Masukkan alamat lengkap properti Anda."
                      required
                      value={formData.alamat}
                      onChange={e => setFormData(p => ({ ...p, alamat: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* ── Card 2: Foto ── */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                  <h2 className="font-bold text-zinc-900 text-sm">2. Foto Tempat</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Upload foto baru untuk mengganti foto yang ada (opsional).</p>
                </div>
                <div className="p-6">

                  {/* Existing image preview */}
                  {existingImages.length > 0 && !imagePreview && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Foto Saat Ini</p>
                      <div className="flex gap-3 flex-wrap">
                        {existingImages.map(img => (
                          <img
                            key={img.id}
                            src={`${API_BASE_URL}${img.imageUrl}`}
                            alt="existing"
                            className="w-28 h-20 object-cover rounded-xl border border-zinc-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload area */}
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="preview" className="w-full max-w-xs h-44 object-cover rounded-xl border border-zinc-200 shadow-sm" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md border border-zinc-200 hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <X size={14} className="text-zinc-500 hover:text-red-500" />
                      </button>
                      <p className="text-xs text-zinc-400 mt-2">{imageFile?.name}</p>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-200 rounded-2xl px-6 py-10 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                    >
                      <div className="p-3 bg-zinc-100 rounded-full">
                        <Upload size={22} className="text-zinc-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-zinc-600">Klik atau seret file ke sini</p>
                        <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WEBP — maks 10MB</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Card 3: Harga ── */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                  <h2 className="font-bold text-zinc-900 text-sm">3. Harga & Deposit</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Atur tarif sewa per jam dan deposit jaminan.</p>
                </div>
                <div className="p-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="hargaDasar" className={labelClass}>Harga per Jam (IDR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">Rp</span>
                      <input
                        id="hargaDasar"
                        type="number"
                        min="0"
                        className={`${inputClass} pl-10`}
                        placeholder="150000"
                        required
                        {...field('hargaDasar')}
                      />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5">Tarif standar hari kerja (Senin–Jumat)</p>
                  </div>
                  <div>
                    <label htmlFor="depositJaminan" className={labelClass}>Deposit Jaminan (IDR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">Rp</span>
                      <input
                        id="depositJaminan"
                        type="number"
                        min="0"
                        className={`${inputClass} pl-10`}
                        placeholder="250000"
                        required
                        {...field('depositJaminan')}
                      />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5">Dikembalikan setelah masa sewa selesai</p>
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                <button
                  type="button"
                  onClick={() => (window.location.href = '/space_admin')}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* ── Logout Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-100">
            <h3 className="font-bold text-lg mb-2 text-zinc-900">Konfirmasi Keluar</h3>
            <p className="text-sm text-zinc-500 mb-6">Apakah Anda yakin ingin keluar dari sesi ini?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-zinc-100 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">Keluar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-in { animation: slide-in 0.25s ease; }
      `}</style>
    </div>
  );
}

export default function Edit() {
  return <EditSpace />;
}