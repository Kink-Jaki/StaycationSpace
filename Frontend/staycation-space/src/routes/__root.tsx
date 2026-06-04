import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Building2, Search, Bell, User } from 'lucide-react'

const Navbar = () => (
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

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Cari properti..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-zinc-400 hover:text-amber-500 transition-colors relative">
            <Bell size={18} />
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <User size={16} className="text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  </nav>
);

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