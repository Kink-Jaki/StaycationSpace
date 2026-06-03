import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3,
  Calendar as CalendarIcon, 
  CreditCard,
  Users, 
  LogOut, 
  Settings,
  Star, 
  Percent,
  ChevronDown,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
}

interface Booking {
  id: string;
  customerName: string;
  spaceName: string;
  date: string; // Format: YYYY-MM-DD
  timeSlot: string;
  amount: number;
  status: 'Dikonfirmasi' | 'Menunggu' | 'Dibatalkan';
}

const Sidebar = ({ activeTab, isSidebarOpen, setIsSidebarOpen, setShowLogoutModal }: any) => {
  const username = localStorage.getItem("username") || "Admin Staycation";
  const role = localStorage.getItem("role") || "admin";
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Space', icon: Building2, path: '/space_admin' },
    { name: 'Booking', icon: CalendarIcon, path: '/booking_admin' },
    { name: 'Customer', icon: Users, path: '/customer' },
    { name: 'Payment', icon: CreditCard, path: '/payment' },
    { name: 'Review', icon: Star, path: '/review' },
    { name: 'Promo', icon: Percent, path: '/promo' },
    { name: 'Report', icon: BarChart3, path: '/report' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 shrink-0 border-r border-zinc-900 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 rounded-lg text-black shrink-0"><Building2 size={20} /></div>
              <div className="min-w-0">
                <h5 className="font-black tracking-wide text-sm text-white truncate">STAYCATION<span className="text-amber-500">SPACE</span></h5>
                <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase -mt-0.5">CONSOLES ADMIN</p>
              </div>
            </div>
            {/* Tombol tutup pada tampilan mobile */}
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-zinc-400 hover:text-white">
              <XCircle size={20} />
            </button>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button 
                  key={item.name} 
                  onClick={() => window.location.href = item.path} 
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'}`}
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
              <button onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-colors text-sm font-medium">
                <LogOut size={16} className="text-zinc-500 shrink-0" /> <span>Logout</span>
              </button>
            </div>
          )}
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-800/40 transition-all rounded-xl border border-zinc-800/30 text-left">
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
};

export const Route = createFileRoute('/booking_admin')({
  component: BookingAdmin,
});

export function BookingAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 5 = Juni (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-03');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];


  // Dummy State Data Booking
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 'BKG-001', customerName: 'Budi Santoso', spaceName: 'Studio Foto Minimalis', date: '2026-06-03', timeSlot: '10:00 - 13:00', amount: 450000, status: 'Dikonfirmasi' },
  ]);

  // Form State
  const [newCustomer, setNewCustomer] = useState('');
  const [newSpace, setNewSpace] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newStatus, setNewStatus] = useState<'Dikonfirmasi' | 'Menunggu' | 'Dibatalkan'>('Menunggu');

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newSpace || !selectedDate || !newTimeSlot || !newAmount) return;

    const newBookingObj: Booking = {
      id: `BKG-00${bookings.length + 1}`,
      customerName: newCustomer,
      spaceName: newSpace,
      date: selectedDate,
      timeSlot: newTimeSlot,
      amount: Number(newAmount),
      status: newStatus
    };

    setBookings([newBookingObj, ...bookings]);
    
    // Reset inputs
    setNewCustomer('');
    setNewSpace('');
    setNewTimeSlot('');
    setNewAmount('');
    setNewStatus('Menunggu');
  };

  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.spaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Mendapatkan hari pertama dalam minggu di bulan terpilih (0: Minggu, 1: Senin, dst)
  const getFirstDayIndex = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    // Konversi agar Senin bernilai 0, Selasa 1, ..., Minggu 6
    return day === 0 ? 6 : day - 1;
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayIndex(currentYear, currentMonth);

  const calendarDays = Array.from({ length: daysCount }, (_, i) => {
    const dayNum = i + 1;
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    return `${currentYear}-${formattedMonth}-${formattedDay}`;
  });

  // Navigasi Bulan
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-950">
      {/* Sidebar dengan state aktif 'Booking' */}
      <Sidebar 
        activeTab="Booking" 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        setShowLogoutModal={setShowLogoutModal} 
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Cari transaksi booking..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-zinc-500 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-xl relative transition-colors">
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-zinc-200"></div>
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-zinc-800">Juni 2026</p>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase">Konsol Booking</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Kelola Reservasi & Booking</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Atur jadwal masuk penyewa, setujui pembayaran, dan pantau ketersediaan slot kosong.</p>
            </div>
          </div>

          {/* Grid Panel Atas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            { }
            {/* 1. Cek Jadwal Tersedia (Calendar Schedule) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <CalendarIcon size={18} className="text-amber-500" />
                      Cek Jadwal Tersedia (Calendar Schedule)
                    </h2>
                    <p className="text-xs text-zinc-400">Pilih tanggal di bawah untuk melihat slot reservasi yang terisi.</p>
                  </div>
                  <span className="bg-zinc-100 px-3 py-1 rounded-full text-xs font-bold text-zinc-700">Juni 2026</span>
                </div>

                {/* Hari dalam seminggu */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-zinc-400 mb-2 uppercase tracking-widest">
                  <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div className="text-rose-500">Sab</div><div className="text-rose-500">Min</div>
                </div>

                {/* Grid Tanggal */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dateStr, idx) => {
                    const dayNum = idx + 1;
                    const isSelected = selectedDate === dateStr;
                    const bookingsOnDate = bookings.filter(b => b.date === dateStr);
                    const hasConfirmed = bookingsOnDate.some(b => b.status === 'Dikonfirmasi');
                    const hasPending = bookingsOnDate.some(b => b.status === 'Menunggu');

                    let cellStyle = "hover:bg-zinc-100 text-zinc-700 bg-zinc-50/50";
                    if (isSelected) {
                      cellStyle = "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/10 ring-2 ring-amber-400/55";
                    } else if (hasConfirmed) {
                      cellStyle = "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 hover:bg-emerald-100";
                    } else if (hasPending) {
                      cellStyle = "bg-amber-50/75 text-amber-800 font-bold border border-amber-100 hover:bg-amber-100";
                    }

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square rounded-xl flex flex-col justify-between p-2 transition-all text-xs ${cellStyle}`}
                      >
                        <span>{dayNum}</span>
                        <div className="flex gap-1 justify-center w-full mt-auto">
                          {bookingsOnDate.map((b, bIdx) => (
                            <span 
                              key={bIdx} 
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.status === 'Dikonfirmasi' ? 'bg-emerald-500' :
                                b.status === 'Menunggu' ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail Hari Terpilih */}
              <div className="mt-6 pt-4 border-t border-zinc-100">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Jadwal sewa tanggal: <span className="text-zinc-800 font-black">{new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                </p>
                <div className="space-y-2 mt-2">
                  {bookings.filter(b => b.date === selectedDate).length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">Tidak ada sewa aktif di tanggal ini. Slot masih kosong!</p>
                  ) : (
                    bookings.filter(b => b.date === selectedDate).map((b) => (
                      <div key={b.id} className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border border-zinc-200/55">
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{b.customerName}</p>
                          <p className="text-[10px] text-zinc-500">{b.spaceName} • <span className="font-semibold">{b.timeSlot}</span></p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                          b.status === 'Dikonfirmasi' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Menunggu' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {}
            {/* 2. Tambah Booking (Booking Form) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <Plus size={18} className="text-indigo-600" />
                    Tambah Booking (Booking Form)
                  </h2>
                  <p className="text-xs text-zinc-400">Buat reservasi sewa langsung ke sistem sebagai administrator.</p>
                </div>

                <form onSubmit={handleAddBooking} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tanggal Terpilih</label>
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)} 
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Nama Penyewa</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Michael Chandra" 
                      value={newCustomer}
                      onChange={(e) => setNewCustomer(e.target.value)}
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Pilih Space</label>
                    <select 
                      value={newSpace}
                      onChange={(e) => setNewSpace(e.target.value)}
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm cursor-pointer"
                      required
                    >
                      <option value="">Pilih Properti</option>
                      <option value="Studio Foto Minimalis">Studio Foto Minimalis</option>
                      <option value="Studio Musik Rock">Studio Musik Rock</option>
                      <option value="Villa Sunset View">Villa Sunset View</option>
                      <option value="Coworking Creative Space">Coworking Creative Space</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Slot Waktu</label>
                      <input 
                        type="text" 
                        placeholder="09:00 - 12:00" 
                        value={newTimeSlot}
                        onChange={(e) => setNewTimeSlot(e.target.value)}
                        className="block w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tarif Sewa (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="450000" 
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="block w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Status Booking</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="block w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-zinc-900 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm cursor-pointer"
                    >
                      <option value="Menunggu">Menunggu Verifikasi</option>
                      <option value="Dikonfirmasi">Dikonfirmasi (Lunas)</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-sm py-3 transition-all shadow-md shadow-amber-500/10 mt-2"
                  >
                    Simpan Reservasi
                  </button>
                </form>
              </div>
            </div>

          </div>

          {}
          {/* 3. Status Booking (Badge Status & Table) */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Status Booking (Badge Status)</h2>
                <p className="text-xs text-zinc-400">Seluruh rincian transaksi masuk dilengkapi tag warna status pembayaran.</p>
              </div>
              
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Search size={14} />
                </span>
                <input 
                  type="text" 
                  placeholder="Cari ID, Penyewa, atau Space..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50/75 text-zinc-400 font-extrabold text-[10px] uppercase tracking-wider border-b border-zinc-200/55">
                    <th className="py-4 px-6">ID Booking</th>
                    <th className="py-4 px-6">Penyewa</th>
                    <th className="py-4 px-6">Space Tersewa</th>
                    <th className="py-4 px-6">Waktu Sewa</th>
                    <th className="py-4 px-6 text-right">Biaya Sewa</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-zinc-950">{b.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-950 font-bold flex items-center justify-center text-[10px]">
                            {b.customerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-zinc-800">{b.customerName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-600 font-medium">{b.spaceName}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-zinc-800 block">
                          {new Date(b.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">{b.timeSlot}</span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-zinc-900">
                        Rp {b.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                          b.status === 'Dikonfirmasi' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          b.status === 'Menunggu' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {b.status === 'Dikonfirmasi' && <CheckCircle2 size={12} className="text-emerald-500" />}
                          {b.status === 'Menunggu' && <Clock size={12} className="text-amber-500" />}
                          {b.status === 'Dibatalkan' && <XCircle size={12} className="text-rose-500" />}
                          <span className="ml-1">{b.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 italic">
                        Data booking tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-2xl max-w-sm w-full p-6 shadow-xl border border-zinc-800 text-white">
            <h3 className="font-bold text-lg mb-4">Konfirmasi Keluar</h3>
            <p className="text-sm text-zinc-400 mb-6">Apakah Anda yakin ingin keluar dari konsol admin?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="px-4 py-2 bg-red-500 rounded-lg text-xs font-bold">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingAdminRoute() {
  return <BookingAdmin />;
}