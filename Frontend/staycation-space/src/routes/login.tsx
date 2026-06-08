import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  User,
  Building,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserPlus,
  Lock,
  Loader2,
} from "lucide-react";

const API_BASE_URL = "http://192.168.111.127:3000";

// Definisi tipe data untuk Notifikasi agar aman dari error TypeScript
interface AppNotification {
  message: string;
  type: "success" | "error";
}

// Simulasi navigasi fallback yang aman jika TanStack Router tidak tersedia di lingkungan kompilasi
const useMockNavigate = () => {
  return (options: { to: string }) => {
    console.log(`Menavigasi secara aman ke: ${options.to}`);
    // Menggunakan window.location sebagai fallback cadangan yang aman
    window.location.href = options.to;
  };
};

export const Route = createFileRoute("/login")({
  component: Home,
});

export default function Home() {
  // Menggunakan fallback navigasi agar terhindar dari error kompilasi eksternal
  const navigate = useMockNavigate();

  // State utama dengan tipe data literal 'login' atau 'register'
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // State form login dengan tipe data string
  const [loginEmail, setLoginEmail] = useState<string>(
    "admin@staycation.space",
  );
  const [loginPassword, setLoginPassword] = useState<string>("password123");

  // State form register dengan tipe data string
  const [registerUsername, setRegisterUsername] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [registerConfirmPassword, setRegisterConfirmPassword] =
    useState<string>("");

  // State untuk visibilitas kata sandi
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // State Integrasi Backend (Status Loading)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State untuk notifikasi kustom dengan tipe data AppNotification atau null
  const [notification, setNotification] = useState<AppNotification | null>(
    null,
  );

  // Fungsi memunculkan notifikasi kustom dengan tipe parameter yang jelas
  const showNotification = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((current) =>
        current?.message === message ? null : current,
      );
    }, 6000);
  };

  // Fungsi Submit Form dengan penanganan JSON secara aman
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        // --- PROSES LOGIN ---
        const response = await window.fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        });

        // Membaca respon sebagai teks mentah terlebih dahulu demi keamanan data
        const responseText = await response.text();
        let data: any = {};

        try {
          // Hanya parsing jika respon tidak kosong dan berformat JSON
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          // Jika respon bukan JSON (misal halaman error HTML 404/500)
          data = {
            message: `Layanan login tidak merespon dengan benar. (Status: ${response.status})`,
          };
        }

        if (!response.ok) {
          // Deteksi otomatis jika email belum pernah didaftarkan di database backend
          if (
            response.status === 404 ||
            data.message?.toLowerCase().includes("not found") ||
            data.message?.toLowerCase().includes("tidak ditemukan") ||
            data.message?.toLowerCase().includes("belum terdaftar")
          ) {
            throw new Error(
              'Email belum terdaftar! Silakan pilih tab "Register" untuk membuat akun baru.',
            );
          }
          throw new Error(
            data.message ||
              "Gagal masuk. Periksa kembali email dan kata sandi Anda.",
          );
        }

        if (data.token) {
          // simpan token
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.role);

          // simpan semua data user
          localStorage.setItem(
            "user_info",
            JSON.stringify(data.user),
          );

          // simpan username
          localStorage.setItem(
            "username",
            data.user?.username || data.user?.name || "User",
          );

          // simpan role
          localStorage.setItem(
            "role",
            data.user?.role || "user",
          );
        }

        showNotification(
          `Berhasil masuk! Selamat datang kembali, ${data.user?.name || loginEmail}.`,
          "success",
        );

        // Dispatch custom event untuk notify navbar bahwa user sudah login
        window.dispatchEvent(new Event("userLogin"));

        // Melakukan navigasi otomatis setelah login sukses berbasis Role
        setTimeout(() => {
          // Ambil data role dari response backend (data.user.role atau data.role)
          const userRole = data.user?.role || data.role || "user";
          console.log(`Redirecting... Role detected: ${userRole}`);

          if (userRole === "admin") {
            navigate({ to: "/dashboard" });
          } else {
            navigate({ to: "/beranda" });
          }
        }, 1500);
      } else {
        // --- PROSES REGISTER ---
        if (registerPassword !== registerConfirmPassword) {
          throw new Error("Konfirmasi kata sandi tidak cocok!");
        }

        // Mengarah ke http://192.168.111.191:3000/auth/register
        const response = await window.fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            username: registerUsername,
            email: registerEmail,
            password: registerPassword,
          }),
        });

        // Membaca respon sebagai teks mentah terlebih dahulu demi keamanan data
        const responseText = await response.text();
        let data: any = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          data = {
            message: `Layanan pendaftaran tidak ditemukan atau belum aktif. (Status: ${response.status})`,
          };
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Pendaftaran gagal. Silakan hubungi admin atau coba lagi.",
          );
        }

        showNotification(
          "Registrasi Berhasil! Akun Anda kini aktif. Silakan masuk menggunakan form login.",
          "success",
        );

        // Salin email otomatis & alihkan ke form login
        setLoginEmail(registerEmail);
        setLoginPassword("");
        setActiveTab("login");
      }
    } catch (error: any) {
      // Menampilkan pesan error ramah pengguna tanpa merusak konsol dengan error tidak terduga
      showNotification(
        error.message || "Terjadi kesalahan koneksi ke server.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100/60 lg:bg-neutral-100 flex items-center justify-center p-0 md:p-6 lg:p-8 xl:p-12 antialiased font-sans">
      {/* Container Utama */}
      <div className="w-full max-w-[1180px] mx-auto bg-white md:rounded-2xl lg:rounded-3xl lg:shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-screen md:min-h-[700px] lg:min-h-[680px]">
        {/* Toast Notification Container */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 w-full max-w-sm bg-white rounded-xl shadow-lg border border-neutral-100 p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-3">
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold text-neutral-900">
                  {notification.type === "success"
                    ? "Sistem Staycation"
                    : "Akses Ditolak"}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {notification.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-bold px-2 py-1 hover:bg-neutral-100 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* --- PANEL KIRI (Banner Promosi & Branding) --- */}
        <div className="hidden lg:flex bg-gradient-to-tr from-stone-900 to-[#22170c] relative overflow-hidden flex-col justify-between p-10 xl:p-12 text-white">
          <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center mix-blend-overlay"></div>

          {/* Logo Kiri */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <Building className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-wider uppercase block leading-none">
                Staycation
                <span className="text-amber-400 font-light">Space</span>
              </span>
            </div>
          </div>

          {/* Tagline Kreatif */}
          <div className="relative z-10 my-auto pr-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] text-amber-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Akses Cepat & Aman</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-serif font-semibold leading-tight text-stone-100">
              Temukan Kenyamanan dalam{" "}
              <span className="text-amber-400 italic font-normal">
                Satu Portal Utama.
              </span>
            </h1>
            <p className="mt-4 text-stone-300 text-xs xl:text-sm leading-relaxed font-light">
              Selamat datang di gerbang masuk Staycation Space. Masuk ke akun
              Anda untuk mulai mengelola atau memesan studio foto, villa, dan
              sesi pemotretan estetis.
            </p>
          </div>

          {/* Footer Kiri */}
          <div className="relative z-10 flex justify-between items-center text-[11px] text-stone-400 border-t border-white/10 pt-6">
            <span>© 2026 Staycation Space System v2.5</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> SSL Secured
            </span>
          </div>
        </div>

        {/* --- PANEL KANAN (Form Log Masuk & Daftar) --- */}
        <div className="flex flex-col justify-between items-center p-6 sm:p-10 xl:p-12 bg-white w-full">
          {/* Logo khusus perangkat mobile */}
          <div className="lg:hidden w-full flex items-center gap-2 mb-6 border-b border-neutral-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-[#1a1816] flex items-center justify-center shadow">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="text-md font-bold tracking-wider uppercase text-neutral-800">
              Staycation<span className="text-amber-500 font-light">Space</span>
            </span>
          </div>

          {/* Card Utama */}
          <div className="w-full max-w-[380px] my-auto space-y-5">
            {/* Header Form */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight font-serif mb-1">
                Portal Akses
              </h2>
              <p className="text-neutral-500 text-xs sm:text-sm">
                {activeTab === "login"
                  ? "Gunakan email terdaftar Anda untuk masuk ke sistem."
                  : "Buat akun baru untuk mulai mendaftarkan pemesanan Anda."}
              </p>
            </div>

            {/* Tab Selektor (Pills) */}
            <div className="grid grid-cols-2 gap-1.5 bg-neutral-100/70 p-1 rounded-xl border border-neutral-200/30">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setActiveTab("login");
                  setShowPassword(false);
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === "login"
                    ? "bg-[#1a1816] text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 disabled:opacity-50"
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Login
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setActiveTab("register");
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeTab === "register"
                    ? "bg-[#1a1816] text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 disabled:opacity-50"
                }`}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                Register
              </button>
            </div>

            {/* Form Input Dinamis */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* INPUT REGISTER ONLY: Nama Pengguna */}
              {activeTab === "register" && (
                <div className="space-y-1 transition-all duration-200">
                  <label className="block text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
                    NAMA PENGGUNA
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      placeholder="Masukkan username baru"
                      value={registerUsername}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRegisterUsername(e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs sm:text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/5 focus:border-neutral-500 transition-all duration-200 disabled:opacity-75"
                    />
                  </div>
                </div>
              )}

              {/* ALAMAT EMAIL */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
                  ALAMAT EMAIL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    placeholder={
                      activeTab === "login"
                        ? "admin@staycation.space"
                        : "contoh@staycation.space"
                    }
                    value={activeTab === "login" ? loginEmail : registerEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      activeTab === "login"
                        ? setLoginEmail(e.target.value)
                        : setRegisterEmail(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs sm:text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/5 focus:border-neutral-500 transition-all duration-200 disabled:opacity-75"
                  />
                </div>
              </div>

              {/* KATA SANDI */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
                  KATA SANDI
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    value={
                      activeTab === "login" ? loginPassword : registerPassword
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      activeTab === "login"
                        ? setLoginPassword(e.target.value)
                        : setRegisterPassword(e.target.value)
                    }
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs sm:text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/5 focus:border-neutral-500 transition-all duration-200 disabled:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* INPUT REGISTER ONLY: Konfirmasi Kata Sandi */}
              {activeTab === "register" && (
                <div className="space-y-1 transition-all duration-200">
                  <label className="block text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
                    KONFIRMASI KATA SANDI
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs sm:text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800/5 focus:border-neutral-500 transition-all duration-200 disabled:opacity-75"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tombol Submit Utama */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-1 bg-[#1a1816] hover:bg-[#2c2824] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-2 disabled:bg-neutral-600 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeTab === "login"
                        ? "Masuk Sekarang"
                        : "Daftar Sekarang"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-300" />
                  </>
                )}
              </button>
            </form>

            {/* Tautan Navigasi Cepat Tambahan di Bawah Form */}
            <div className="text-center pt-2">
              {activeTab === "login" ? (
                <p className="text-xs text-neutral-500">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-amber-600 hover:text-amber-700 font-semibold underline focus:outline-none"
                  >
                    Daftar di Sini
                  </button>
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Sudah memiliki akun?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-amber-600 hover:text-amber-700 font-semibold underline focus:outline-none"
                  >
                    Login di Sini
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Footer Panel Kanan */}
          <footer className="text-[11px] text-neutral-400 text-center mt-6 pt-4 border-t border-neutral-100 w-full max-w-[380px]">
            Staycation Space © 2026. Dibuat dengan{" "}
            <span className="text-rose-400">❤️</span>.
          </footer>
        </div>
      </div>
    </div>
  );
}
