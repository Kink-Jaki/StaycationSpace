import { useState } from 'react' // 1. Import useState untuk mengontrol modal
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Building2, Bell, User, Settings, LogOut } from 'lucide-react' // Tambah icon Settings dan LogOut

const Navbar = () => {
  // 2. State untuk membuka/menutup modal/dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#121212] border-b border-zinc-800 text-white w-full sticky top-0 z-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-lg text-black">
              <Building2 size={20} />
            </div>
            <h5 className="font-black tracking-wide text-sm hidden sm:block">
              STAYCATION<span className="text-amber-500">SPACE</span>
            </h5>
          </div>

          {/* Pastikan parent memiliki class 'relative' agar posisi modal pas */}
          <div className="flex items-center gap-6 relative">
            
            {/* 3. Mengubah div menjadi button dengan fungsi toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 hover:border-zinc-500 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              aria-label="User menu"
            >
              <User size={16} className="text-zinc-400" />
            </button>

            {/* 4. Modal / Dropdown Menu Konten */}
            {isMenuOpen && (
              <>
                {/* Backdrop transparan untuk menutup menu saat klik di luar luar area */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                
                {/* Kotak Modal Menu */}
                <div className="absolute right-0 top-12 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1.5 z-50 origin-top-right transition-all">
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Tambahkan aksi navigasi ke pengaturan di sini
                      console.log("Navigasi ke Pengaturan");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left"
                  >
                    <Settings size={16} className="text-zinc-400" />
                    Pengaturan
                  </button>
                  
                  <div className="border-t border-zinc-800 my-1" />
                  
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Tambahkan aksi logout di sini
                      console.log("Proses Logout");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors text-left"
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
  );
};

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  ),
})