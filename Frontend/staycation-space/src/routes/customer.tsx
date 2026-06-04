import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, Building2, BarChart3, Calendar as CalendarIcon,
   Users, LogOut, Settings, Percent, ChevronDown,
  Search, Menu, XCircle, Loader2, AlertCircle, Mail, Phone,
  UserCheck, UserX, Eye, Trash2, RefreshCw,
} from 'lucide-react'
 
// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
 
interface User {
  id: number
  username?: string // Menyesuaikan dengan kolom Drizzle database
  name?: string     // Fallback jika API mengembalikan 'name'
  email: string
  phone?: string
  role: 'admin' | 'customer' | 'user' // Ditambah 'user' karena Drizzle default-nya 'user'
  createdAt?: string
}
 
interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  setShowLogoutModal: (show: boolean) => void
}
 
// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
 
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://192.168.111.152:3000'
 
function getToken(): string { return localStorage.getItem('token') ?? '' }
function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }
}
 
// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
 
async function apiFetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : (data.data ?? [])
}
 
async function apiDeleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
 
// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
 
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
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-lg ${bg}`}>
      {toast.message}
    </div>
  )
}
 
// ─────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────
 
function DeleteModal({ user, onClose, onConfirm }: { user: User; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const displayName = user.username || user.name || 'Pengguna'

  async function confirm() {
    setLoading(true)
    try { await onConfirm() } finally { setLoading(false) }
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-zinc-200 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <Trash2 size={16} className="text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Hapus Customer</h3>
            <p className="text-[11px] text-zinc-400">Tindakan ini tidak bisa dibatalkan.</p>
          </div>
        </div>
        <p className="text-xs text-zinc-600 mb-5 bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100">
          Akun <span className="font-bold text-zinc-900">{displayName}</span> ({user.email}) akan dihapus permanen.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors">Batal</button>
          <button onClick={confirm} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
 
// ─────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────
 
function DetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const displayName = user.username || user.name || 'Pengguna'
  const displayRole = user.role === 'user' ? 'customer' : user.role

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl max-w-sm w-full border border-zinc-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-amber-500" />
            <span className="text-sm font-bold text-zinc-900">Detail Customer</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100">
            <XCircle size={15} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center font-black text-black text-lg shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">{displayName}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                displayRole === 'admin'
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-zinc-50 text-zinc-500 border-zinc-200'
              }`}>
                {displayRole === 'admin' ? <UserCheck size={9} /> : <Users size={9} />}
                {displayRole}
              </span>
            </div>
          </div>
 
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100">
              <Mail size={13} className="text-zinc-400 shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Email</p>
                <p className="text-xs font-semibold text-zinc-700">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2.5 bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100">
                <Phone size={13} className="text-zinc-400 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Telepon</p>
                  <p className="text-xs font-semibold text-zinc-700">{user.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5 bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100">
              <CalendarIcon size={13} className="text-zinc-400 shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Bergabung</p>
                <p className="text-xs font-semibold text-zinc-700">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
 
// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
 
function Sidebar({ activeTab, isSidebarOpen, setIsSidebarOpen, setShowLogoutModal }: SidebarProps) {
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
                <button key={item.name} onClick={() => { window.location.href = item.path; setIsSidebarOpen(false) }}
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
 
// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
 
export const Route = createFileRoute('/customer')({
  component: CustomerAdmin,
})
 
export function CustomerAdmin() {
  const [activeTab] = useState<string>('Customer')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'customer'>('all')
  const [detailTarget, setDetailTarget] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const { toast, show: showToast } = useToast()
 
  function loadUsers() {
    setLoading(true)
    apiFetchUsers()
      .then(data => {
        setUsers(data)
      })
      .catch(() => showToast('Gagal memuat data customer.', 'error'))
      .finally(() => setLoading(false))
  }
 
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }
    loadUsers()
  }, [])
 
  async function handleDelete() {
    if (!deleteTarget) return
    const displayName = deleteTarget.username || deleteTarget.name || 'Pengguna'
    await apiDeleteUser(deleteTarget.id)
    setUsers(p => p.filter(x => x.id !== deleteTarget.id))
    showToast(`Akun ${displayName} dihapus.`, 'error')
    setDeleteTarget(null)
  }
 
  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase()
    
    // Safely parse name and email (Fixing the toLowerCase crash)
    const displayName = (u.username || u.name || "").toLowerCase()
    const email = (u.email || "").toLowerCase()
    
    const matchSearch = displayName.includes(q) || email.includes(q)
    
    // Normalize role from database ('user' -> 'customer')
    const normalizedRole = u.role === 'user' ? 'customer' : u.role
    const matchRole = filterRole === 'all' || normalizedRole === filterRole
    
    return matchSearch && matchRole
  })
 
  const counts = {
    total:    users.length,
    customer: users.filter(u => u.role === 'customer' || u.role === 'user').length,
    admin:    users.filter(u => u.role === 'admin').length,
  }
 
  function formatDate(iso?: string) {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }
 
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
 
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#121212] p-4 flex items-center justify-between text-white">
        <h1 className="font-bold">STAYCATION<span className="text-amber-500">SPACE</span></h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={20} /></button>
      </div>
 
      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={() => {}}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />
 
      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-y-auto">
 
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 mt-14 md:mt-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg md:hidden"><Menu size={20} /></button>
            <div className="relative hidden sm:block w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400"><Search size={15} /></span>
              <input type="text" placeholder="Cari nama atau email..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <button onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </header>
 
        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Kelola Customer</h1>
            <p className="text-slate-500 mt-2">Lihat dan kelola semua pengguna yang terdaftar.</p>
          </div>
 
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: 'Total Pengguna', value: counts.total,    color: 'text-zinc-900',    filter: 'all',      icon: <Users size={16} className="text-zinc-400" /> },
              { label: 'Customer',       value: counts.customer, color: 'text-amber-600',   filter: 'customer', icon: <UserCheck size={16} className="text-amber-400" /> },
              { label: 'Admin',          value: counts.admin,    color: 'text-violet-600',  filter: 'admin',    icon: <UserX size={16} className="text-violet-400" /> },
            ].map(s => (
              <button key={s.label} onClick={() => setFilterRole(s.filter as any)}
                className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all flex items-center justify-between ${filterRole === s.filter ? 'border-amber-300 ring-2 ring-amber-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">{s.label}</p>
                  <h2 className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  {s.icon}
                </div>
              </button>
            ))}
          </div>
 
          {/* Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {filtered.length} pengguna ditemukan
              </p>
              {/* Role filter pills */}
              <div className="flex items-center gap-1.5">
                {(['all', 'customer', 'admin'] as const).map(r => (
                  <button key={r} onClick={() => setFilterRole(r)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-colors ${filterRole === r ? 'bg-amber-500 text-black' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>
                    {r === 'all' ? 'Semua' : r}
                  </button>
                ))}
              </div>
            </div>
 
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs">Memuat data pengguna...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2">
                <AlertCircle size={28} />
                <span className="text-xs">Tidak ada pengguna ditemukan.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pengguna</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Telepon</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Role</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden xl:table-cell">Bergabung</th>
                      <th className="text-right px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filtered.map(user => {
                      const displayName = user.username || user.name || 'Pengguna'
                      const displayRole = user.role === 'user' ? 'customer' : user.role

                      return (
                        <tr key={user.id} className="hover:bg-zinc-50 transition-colors group">
                          {/* Name + avatar */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center font-black text-black text-xs shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-900">{displayName}</p>
                                <p className="text-[10px] text-zinc-400 md:hidden">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          {/* Email */}
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <p className="text-xs text-zinc-600">{user.email}</p>
                          </td>
                          {/* Phone */}
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            <p className="text-xs text-zinc-500">{user.phone ?? '-'}</p>
                          </td>
                          {/* Role badge */}
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                              displayRole === 'admin'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                            }`}>
                              {displayRole === 'admin' ? <UserCheck size={9} /> : <Users size={9} />}
                              {displayRole}
                            </span>
                          </td>
                          {/* Date */}
                          <td className="px-5 py-3.5 hidden xl:table-cell">
                            <p className="text-xs text-zinc-500">{formatDate(user.createdAt)}</p>
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setDetailTarget(user)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget(user)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
 
      {/* Modals */}
      {detailTarget && (
        <DetailModal user={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
 
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
 
      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold">Logout?</h2>
            <p className="text-slate-500 mt-2">Yakin mau logout?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-200">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-semibold hover:bg-rose-600">Logout</button>
            </div>
          </div>
        </div>
      )}
 
      <Toast toast={toast} />
    </div>
  )
}
 
export default function CustomerRoute() {
  return <CustomerAdmin />
}