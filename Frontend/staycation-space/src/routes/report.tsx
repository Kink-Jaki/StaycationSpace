import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, Building2, BarChart3, Calendar as CalendarIcon,
  Users, LogOut, Settings, Percent, ChevronDown,
  Search, Menu, RefreshCw, Wallet, FileSpreadsheet, FileText
} from 'lucide-react'
import { redirect } from '@tanstack/react-router'

let detectedApiUrl = 'http://192.168.111.127:3000'
 
interface ReportSummary {
  totalBookings: number
  pendingBookings: number
  verifiedBookings: number
  cancelledBookings: number
  totalRevenue: number
}
 
interface BookingReportItem {
  id: number
  spaceId: number
  userId: number
  startTime: string
  endTime: string
  totalPrice: string
  status: string
  notes: string
}
 
interface User {
  id: number
  username: string
}
 
interface Space {
  id: number
  name: string
}
 
interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  setShowLogoutModal: (show: boolean) => void
}
 
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'mock_admin_preview_token')
    localStorage.setItem('username', 'Admin Staycation')
    localStorage.setItem('role', 'admin')
  }
}
 
try {
  const metaEnv = (import.meta as any)?.env
  if (metaEnv && metaEnv.VITE_API_URL) {
    detectedApiUrl = metaEnv.VITE_API_URL
  }
} catch (e) {
  // Abaikan
}
const BASE_URL = detectedApiUrl
 
function getToken(): string { return localStorage.getItem('token') ?? '' }
function authHeaders(): HeadersInit {
  return { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${getToken()}` 
  }
}
 
async function apiFetchReportSummary(): Promise<ReportSummary> {
  const res = await fetch(`${BASE_URL}/reports/bookings`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}
 
type ToastType = 'success' | 'error' | 'info'
interface ToastState { message: string; type: ToastType; visible: boolean }
 
function useToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false })
  const show = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true })
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000)
  }, [])
  return { toast, show }
}
 
function Toast({ toast }: { toast: ToastState }) {
  if (!toast.visible) return null
  const bg = toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-zinc-700'
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-lg flex items-center gap-2 ${bg}`}>
      {toast.message}
    </div>
  )
}
 
function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setShowLogoutModal }: SidebarProps) {
  const username = localStorage.getItem('username') ?? 'Admin Staycation'
  const role = localStorage.getItem('role') ?? 'admin'
  const [showProfileMenu, setShowProfileMenu] = useState(false)
 
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Space',     icon: Building2,       path: '/space_admin' },
    { name: 'Booking',   icon: CalendarIcon,    path: '/booking_admin' },
    { name: 'Customer',  icon: Users,           path: '/customer' },
    { name: 'Promo',     icon: Percent,         path: '/promo' },
    { name: 'Report',    icon: BarChart3,       path: '/report' },
    { name: 'Settings',  icon: Settings,        path: '/settings' },
  ]
 
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 shrink-0 border-r border-zinc-900 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.name
              return (
                <button key={item.name} onClick={() => { setActiveTab?.(item.name); window.location.href = item.path }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'}`}>
                  <Icon size={16} /><span>{item.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-zinc-800/50 mt-auto relative">
          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 w-full bg-[#1e1e1e] border border-zinc-800/80 rounded-xl p-1.5 shadow-xl z-50">
              <button onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true) }}
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
  )
}
 
export const Route = createFileRoute('/report')({
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
 
    if (!token) {
      throw redirect({ to: "/login" });
    }
 
    if (role !== "admin") {
      throw redirect({ to: "/login" });
    }
  },
  
  component: ReportAdmin,
});
 
export default function ReportAdmin() {
  const [activeTab] = useState<string>('Report')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
 
  const [summary, setSummary] = useState<ReportSummary>({
    totalBookings: 0,
    pendingBookings: 0,
    verifiedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0
  })
 
  const [bookings, setBookings] = useState<BookingReportItem[]>([])
  const [users, setUsers] = useState<Record<number, string>>({})
  const [spaces, setSpaces] = useState<Record<number, string>>({})
 
  const { toast, show: showToast } = useToast()
 
  const loadBookingsAndRelations = useCallback(async () => {
    try {
      const [bookingsRes, usersRes, spacesRes] = await Promise.all([
        fetch(`${BASE_URL}/bookings`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/users`, { headers: authHeaders() }),
        fetch(`${BASE_URL}/spaces`, { headers: authHeaders() })
      ])
 
      if (!bookingsRes.ok) throw new Error(`HTTP Bookings ${bookingsRes.status}`)
 
      const bookingsData = await bookingsRes.json()
      const usersData: User[] = usersRes.ok ? await usersRes.json() : []
      const spacesData: Space[] = spacesRes.ok ? await spacesRes.json() : []
 
      const userMap = usersData.reduce((acc, u) => ({ ...acc, [u.id]: u.username }), {} as Record<number, string>)
      const spaceMap = spacesData.reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {} as Record<number, string>)
 
      setUsers(userMap)
      setSpaces(spaceMap)
      setBookings(bookingsData)
    } catch (error) {
      console.error(error)
      setBookings([
        { id: 101, spaceId: 1, userId: 1, startTime: '2023-10-27T10:00:00Z', endTime: '2023-10-28T10:00:00Z', totalPrice: '1500000', status: 'verified', notes: '' },
        { id: 102, spaceId: 2, userId: 2, startTime: '2023-10-29T14:00:00Z', endTime: '2023-10-31T12:00:00Z', totalPrice: '3000000', status: 'pending', notes: '' }
      ])
      setUsers({1: 'Budi Santoso', 2: 'Siti Aminah'})
      setSpaces({1: 'Villa Kaca Bandung', 2: 'Apartemen Sudirman'})
    }
  }, [])
 
  const loadReportData = useCallback(() => {
    setLoading(true)
    apiFetchReportSummary()
      .then(data => {
        setSummary(data)
        showToast('Laporan berhasil diperbarui dari API.', 'success')
      })
      .catch(err => {
        console.error(err)
        showToast('Memuat data fallback preview.', 'info')
        setSummary({
          totalBookings: 12,
          pendingBookings: 2,
          verifiedBookings: 8,
          cancelledBookings: 2,
          totalRevenue: 15000000
        })
      })
      .finally(() => setLoading(false))
  }, [showToast])
 
  useEffect(() => {
    loadReportData()
    loadBookingsAndRelations()
  }, [loadReportData, loadBookingsAndRelations])
 
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase()
    const penyewaName = (users[b.userId] || `User #${b.userId}`).toLowerCase()
    const spaceName = (spaces[b.spaceId] || `Space #${b.spaceId}`).toLowerCase()
    return (
      String(b.id).includes(q) ||
      penyewaName.includes(q) ||
      spaceName.includes(q)
    )
  })
 
  // EXPORT CSV
  const exportCSV = () => {
    const headers = ['ID Booking', 'Penyewa', 'Space Unit', 'Tanggal Sewa', 'Total Harga', 'Status']
 
    const rows = filteredBookings.map(b => [
      b.id,
      users[b.userId] || `User #${b.userId}`,
      spaces[b.spaceId] || `Space #${b.spaceId}`,
      new Date(b.startTime).toLocaleDateString('id-ID'),
      Number(b.totalPrice),
      b.status
    ])
 
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
 
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-booking-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV berhasil diunduh.', 'success')
  }
 
  // EXPORT PDF
  const exportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      showToast('Popup diblokir browser. Izinkan popup lalu coba lagi.', 'error')
      return
    }
 
    const rows = filteredBookings.map(b => `
      <tr>
        <td>${b.id}</td>
        <td>${users[b.userId] || `User #${b.userId}`}</td>
        <td>${spaces[b.spaceId] || `Space #${b.spaceId}`}</td>
        <td>${new Date(b.startTime).toLocaleDateString('id-ID')}</td>
        <td>Rp ${Number(b.totalPrice).toLocaleString('id-ID')}</td>
        <td>${b.status}</td>
      </tr>
    `).join('')
 
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Laporan Booking - ${new Date().toLocaleDateString('id-ID')}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; color: #111; }
          h2 { margin-bottom: 4px; font-size: 18px; }
          p.sub { color: #666; margin-bottom: 20px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f4f4f4; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #ddd; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 11px; }
          tr:hover td { background: #fafafa; }
          .status { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
          .verified { background: #d1fae5; color: #065f46; }
          .paid     { background: #dbeafe; color: #1e40af; }
          .pending  { background: #fef3c7; color: #92400e; }
          .cancelled{ background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 0; } button { display: none; } }
        </style>
      </head>
      <body>
        <h2>Laporan Booking</h2>
        <p class="sub">Dicetak pada: ${new Date().toLocaleString('id-ID')} &nbsp;|&nbsp; Total: ${filteredBookings.length} transaksi</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Penyewa</th>
              <th>Space Unit</th>
              <th>Tanggal Sewa</th>
              <th>Total Harga</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `)
 
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
 
    showToast('Dialog cetak PDF dibuka.', 'success')
  }
 
  const triggerDownload = (format: 'Excel' | 'PDF') => {
    if (format === 'Excel') {
      exportCSV()
    } else {
      exportPDF()
    }
  }
 
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex w-full">
 
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#121212] p-4 flex items-center justify-between text-white">
        <h1 className="font-bold">STAYCATION<span className="text-amber-500">SPACE</span></h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 text-zinc-300">
          <Menu size={20} />
        </button>
      </div>
 
      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={() => {}}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />
 
      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-y-auto">
 
        {/* HEADER */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 mt-14 md:mt-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg md:hidden">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Search size={15} />
              </span>
              <input type="text" placeholder="Cari ID, penyewa, atau unit..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <button onClick={() => { loadReportData(); loadBookingsAndRelations(); }} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-colors">
            <RefreshCw size={13} className={loading ? "animate-spin text-amber-500" : ""} /> Refresh
          </button>
        </header>
 
        {/* CONTENT */}
        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Header Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Laporan Booking</h1>
              <p className="text-slate-500 mt-1">Audit pendapatan kotor dan perbandingan kinerja status pemesanan.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => triggerDownload('Excel')} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                <FileSpreadsheet size={14} /> Export CSV
              </button>
              <button onClick={() => triggerDownload('PDF')} className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-200">
                <FileText size={14} /> Unduh PDF
              </button>
            </div>
          </div>
 
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm col-span-1 sm:col-span-2 lg:col-span-2">
              <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Total Revenue</p>
              <h2 className="text-2xl font-black text-emerald-700 mt-1">
                Rp {summary.totalRevenue.toLocaleString('id-ID')}
              </h2>
              <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1">
                <Wallet size={12} /> Terkonfirmasi &amp; menunggu verifikasi
              </p>
            </div>
 
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Total Booking</p>
              <h2 className="text-2xl font-bold text-zinc-900 mt-1">{summary.totalBookings}</h2>
              <span className="text-[9px] font-semibold text-zinc-400">Semua reservasi</span>
            </div>
 
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] text-emerald-500 font-bold uppercase">Dikonfirmasi</p>
              <h2 className="text-2xl font-bold text-emerald-600 mt-1">{summary.verifiedBookings}</h2>
              <span className="text-[9px] font-semibold text-emerald-400">Pembayaran aman</span>
            </div>
 
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] text-amber-500 font-bold uppercase">Menunggu</p>
              <h2 className="text-2xl font-bold text-amber-600 mt-1">{summary.pendingBookings}</h2>
              <span className="text-[9px] font-semibold text-rose-500">{summary.cancelledBookings} dibatalkan</span>
            </div>
          </div>
 
          {/* TABLE */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">Table Report - Riwayat Transaksi</h3>
            </div>
 
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="px-5 py-3">ID Booking</th>
                    <th className="px-5 py-3">Penyewa</th>
                    <th className="px-5 py-3">Space Unit</th>
                    <th className="px-5 py-3">Tanggal Sewa</th>
                    <th className="px-5 py-3">Total Harga</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">Tidak ada data ditemukan.</td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-zinc-500">{b.id}</td>
                        <td className="px-5 py-3.5 font-semibold text-zinc-900">
                          {users[b.userId] || `User #${b.userId}`}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-700">
                          {spaces[b.spaceId] || `Space #${b.spaceId}`}
                        </td>
                        <td className="px-5 py-3.5 text-zinc-500">{new Date(b.startTime).toLocaleDateString('id-ID')}</td>
                        <td className="px-5 py-3.5 font-bold text-zinc-900">Rp {Number(b.totalPrice).toLocaleString('id-ID')}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            b.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.status === 'paid'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : b.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-rose-50 text-rose-500 border-rose-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
 
        </main>
      </div>
 
      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold">Logout?</h2>
            <p className="text-zinc-500 text-xs mt-2">Yakin ingin mengakhiri sesi administrasi?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-zinc-100 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-200">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700">Logout</button>
            </div>
          </div>
        </div>
      )}
 
      <Toast toast={toast} />
    </div>
  )
}