import { useState, useEffect } from "react";
import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import {
  Building2,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");
      setIsLoggedIn(!!token);
      setUsername(storedUsername || "");
    };

    checkLoginStatus();

    // Listen untuk perubahan di localStorage
    window.addEventListener("storage", checkLoginStatus);
    // Listen untuk custom events saat login/logout
    window.addEventListener("userLogin", checkLoginStatus);
    window.addEventListener("userLogout", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("userLogin", checkLoginStatus);
      window.removeEventListener("userLogout", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // hapus token, role, dll
    window.dispatchEvent(new Event("userLogout"));
    window.location.href = "/login";
  };

  return (
    <>
      <nav className="bg-[#121212] border-b border-zinc-800 text-white w-full sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 rounded-lg text-black">
                <Building2 size={20} />
              </div>
              <h5 className="font-black tracking-wide text-sm hidden sm:block">
                STAYCATION
                <span className="text-amber-500">SPACE</span>
              </h5>
            </div>

            <div className="flex items-center gap-6 relative">
              {isLoggedIn && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-black" />
                  </div>
                  <span className="text-sm text-zinc-300 hidden sm:block">{username}</span>
                </button>
              )}

              {isLoggedIn && isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-12 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1.5 z-50">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.location.href = "/settings";
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 text-left"
                    >
                      <Settings size={16} />
                      Pengaturan
                    </button>

                    <div className="border-t border-zinc-800 my-1" />

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MODAL KONFIRMASI LOGOUT */}
      {isLoggedIn && showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-zinc-900">
              Konfirmasi Logout
            </h2>

            <p className="text-zinc-600 mt-2">
              Apakah Anda yakin ingin keluar dari akun ini?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
      <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
        {!isLoginPage && <Navbar />}
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    );
  },
});