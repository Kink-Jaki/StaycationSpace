import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Calendar,
  Users,
  LogOut,
  Settings,
  Percent,
  ArrowLeft,
  ChevronDown,
  Image as PhotoIcon,
} from "lucide-react";

const API_BASE_URL = "http://192.168.111.127:3000";

interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
}

const Sidebar = ({
  activeTab,
  isSidebarOpen,
  setShowLogoutModal,
}: any) => {
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "user";

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Space",
      icon: Building2,
      path: "/space_admin",
    },
    {
      name: "Booking",
      icon: Calendar,
      path: "/booking_admin",
    },
    {
      name: "Customer",
      icon: Users,
      path: "/customer",
    },
    {
      name: "Promo",
      icon: Percent,
      path: "/promo",
    },
    {
      name: "Report",
      icon: BarChart3,
      path: "/report",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 shrink-0 border-r border-zinc-900 ${
        isSidebarOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
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

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => (window.location.href = item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500 text-black"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
                <LogOut
                  size={16}
                  className="text-zinc-500 shrink-0"
                />

                <span>Logout</span>
              </button>
            </div>
          )}

          <button
            onClick={() =>
              setShowProfileMenu(!showProfileMenu)
            }
            className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-800/40 transition-all rounded-xl border border-zinc-800/30 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-black text-xs shrink-0">
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

            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                showProfileMenu ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const Route = createFileRoute("/tambah")({
  component: TambahSpace,
});

export function TambahSpace() {
  const [isSidebarOpen] = useState(false);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [preview, setPreview] = useState<string | null>(
    null
  );

  const [imageFile, setImageFile] = useState<File | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    kapasitas: "",
    deskripsi: "",
    alamat: "",
    hargaDasar: "",
    depositJaminan: "",
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Silakan login terlebih dahulu");

        window.location.href = "/login";

        return;
      }

      // =========================
      // CREATE SPACE
      // =========================

      const payload = new FormData();

      payload.append("name", formData.nama);

      payload.append(
        "type",
        formData.kategori === "studio"
          ? "studio"
          : formData.kategori === "hall"
          ? "hall"
          : formData.kategori === "villa"
          ? "villa"
          : formData.kategori === "other"
          ? "other" 
          : "other"  
      );

      payload.append(
        "description",
        formData.deskripsi
      );

      payload.append("address", formData.alamat);

      payload.append("pricePerHour", String(parseFloat(formData.hargaDasar)));
      payload.append("deposit", String(parseFloat(formData.depositJaminan)));
      payload.append("capacity", String(parseInt(formData.kapasitas)));

      const response = await fetch(
        `${API_BASE_URL}/spaces`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      console.log("SPACE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal membuat space"
        );
      }

      // =========================
      // UPLOAD IMAGE
      // =========================

      if (imageFile) {
        const imageForm = new FormData();

        imageForm.append("files", imageFile);

        const imageResponse = await fetch(
          `${API_BASE_URL}/spaces/${data.id}/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageForm,
          }
        );

        const imageText =
          await imageResponse.text();

        let imageData;

        try {
          imageData = JSON.parse(imageText);
        } catch {
          imageData = { message: imageText };
        }

        console.log("IMAGE:", imageData);

        if (!imageResponse.ok) {
          throw new Error("Upload gambar gagal");
        }
      }

      alert("Space berhasil dibuat");

      window.location.href = "/space_admin";
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar
        activeTab="Space"
        isSidebarOpen={isSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() =>
              (window.location.href = "/space_admin")
            }
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali ke daftar
          </button>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">
              Tambah Properti Baru
            </h1>
          </div>

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <h1 className="text-lg font-bold text-zinc-900">
                1. Informasi Utama
              </h1>
              <p className="text-sm text-black/60">Nama, Kategori, Kapasitas, deskripsi dan alamat isi dengan benar</p>

              <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-zinc-900">
                    NAMA TEMPAT
                  </label>

                  <div className="mt-2">
                    <input
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      type="text"
                      required
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      placeholder="Contoh: Na Studio"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-zinc-900">
                    KATEGORI TEMPAT
                  </label>

                  <div className="mt-2">
                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="">
                        Pilih kategori
                      </option>

                      <option value="studio">
                        Studio 
                      </option>

                      <option value="hall">
                        hall
                      </option>

                      <option value="villa">
                        Villa
                      </option>

                      <option value="other">
                        Lainnya
                      </option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-zinc-900">
                    KAPASITAS
                  </label>

                  <div className="mt-2">
                    <input
                      name="kapasitas"
                      value={formData.kapasitas}
                      onChange={handleChange}
                      type="number"
                      min="1"
                      required
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      placeholder="Contoh: 10"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-zinc-900">
                    DESKRIPSI
                  </label>

                  <div className="mt-2">
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      rows={4}
                      required
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      placeholder="Contoh: Dilengkapi fasilitas lengkap yang membuat Anda lebih fokus dan betah bekerja. Cocok untuk freelancer, pelajar, maupun pekerja yang membutuhkan ruang kerja fleksibel."
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-zinc-900">
                    ALAMAT
                  </label>

                  <div className="mt-2">
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      rows={4}
                      required
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      placeholder="Contoh: Jl Ahmad Yani No.16 Kota Blitar"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900">
                2. Upload Foto
              </h2>
              <p className="text-sm text-black/60">Upload foto tempat agar menambah kesan menari pelanggan</p>

              <div className="mt-8">
                <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                  <div className="text-center flex flex-col items-center">
                    <PhotoIcon className="size-12 text-gray-300 mb-2" />

                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-indigo-600 font-semibold"
                    >
                      Upload gambar
                    </label>

                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      required
                      className="sr-only"
                      onChange={(e) => {
                        const file =
                          e.target.files?.[0];

                        if (file) {
                          setImageFile(file);

                          setPreview(
                            URL.createObjectURL(file)
                          );
                        }
                      }}
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, WEBP
                    </p>

                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="mt-5 w-72 h-44 object-cover rounded-xl border"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900">
                3. Harga & Deposit
              </h2>
              <p className="text-sm text-black/60">Atur tarif sewa per jam dan deposit jaminan</p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-900">
                    HARGA DASAR (IDR)
                  </label>

                  <input
                    name="hargaDasar"
                    value={formData.hargaDasar}
                    onChange={handleChange}
                    type="number"
                    required
                    className="mt-2 block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="Contoh: 50000"
                  />
                  <p className="text-sm text-black/60">Harga berdasarkan hitungan per jam</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900">
                    DEPOSIT (IDR)
                  </label>

                  <input
                    name="depositJaminan"
                    value={formData.depositJaminan}
                    onChange={handleChange}
                    type="number"
                    required
                    className="mt-2 block w-full rounded-xl bg-zinc-50 px-4 py-2 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="Contoh 65000"
                  />
                  <p className="text-sm text-black/60">Dikembalikan setelah masa sewa selesai</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Menyimpan..."
                  : "Simpan Space"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-2xl max-w-sm w-full p-6 shadow-xl border border-zinc-800">
            <h3 className="font-bold text-lg mb-4 text-white">
              Konfirmasi Keluar
            </h3>

            <p className="text-sm text-zinc-400 mb-6">
              Apakah Anda yakin ingin keluar?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowLogoutModal(false)
                }
                className="px-4 py-2 bg-zinc-800 rounded-lg text-sm font-bold text-white"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold"
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

export default function Tambah() {
  return <TambahSpace />;
}