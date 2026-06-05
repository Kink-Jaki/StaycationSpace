import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard, Building2, BarChart3, Calendar as CalendarIcon,
  Users, LogOut, Settings, Percent, ChevronDown,
  Search, Menu, XCircle, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  Tag, Loader2, X, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react'
 
// ─────────────────────────────────────────────
// Types — disesuaikan dengan schema backend
// ─────────────────────────────────────────────
 
interface Promo {
  id: number
  code: string
  type: 'percent' | 'fixed'
  value: number
  maxUsage: number
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt?: string
}
 
interface PromoForm {
  code: string
  type: 'percent' | 'fixed'
  value: string
  maxUsage: string
  expiresAt: string
  isActive: boolean
}
 
interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  setShowLogoutModal: (show: boolean) => void
}
 
const EMPTY_FORM: PromoForm = {
  code: '',
  type: 'percent',
  value: '',
  maxUsage: '',
  expiresAt: '',
  isActive: true,
}
 
// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
 
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://192.168.111.189:3000'
 
function getToken(): string { return localStorage.getItem('token') ?? '' }
function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }
}
 
// ─────────────────────────────────────────────
// API — disesuaikan dengan endpoint backend
// ─────────────────────────────────────────────
 
async function apiFetchPromos(): Promise<Promo[]> {
  const res = await fetch(`${BASE_URL}/promos`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : (data.data ?? [])
}
 
async function apiCreatePromo(body: object): Promise<Promo> {
  const res = await fetch(`${BASE_URL}/promos`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
  })
  if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? `HTTP ${res.status}`) }
  return res.json()
}
 
async function apiUpdatePromo(id: number, body: object): Promise<Promo> {
  const res = await fetch(`${BASE_URL}/promos/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(body),
  })
  if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? `HTTP ${res.status}`) }
  return res.json()
}
 
async function apiTogglePromo(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/promos/${id}/toggle`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
 
async function apiDeletePromo(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/promos/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
 
// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
 
function formatRupiah(n: number): string { return 'Rp ' + n.toLocaleString('id-ID') }
 
function formatDate(iso: string | null): string {
  if (!iso) return 'Tidak ada batas'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
 
function toInputDate(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}
 
function promoStatus(p: Promo): 'active' | 'inactive' | 'expired' | 'full' {
  if (!p.isActive) return 'inactive'
  if (p.expiresAt && new Date(p.expiresAt) < new Date()) return 'expired'
  if (p.maxUsage > 0 && p.usedCount >= p.maxUsage) return 'full'
  return 'active'
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
// Status Badge
// ─────────────────────────────────────────────
 
function PromoBadge({ status }: { status: 'active' | 'inactive' | 'expired' | 'full' }) {
  const map = {
    active:   { cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 size={10} className="text-emerald-500" />, label: 'Aktif' },
    inactive: { cls: 'bg-zinc-50 text-zinc-500 border-zinc-200',          icon: <Clock size={10} className="text-zinc-400" />,          label: 'Nonaktif' },
    expired:  { cls: 'bg-rose-50 text-rose-600 border-rose-100',          icon: <AlertCircle size={10} className="text-rose-400" />,    label: 'Kedaluwarsa' },
    full:     { cls: 'bg-orange-50 text-orange-600 border-orange-100',    icon: <XCircle size={10} className="text-orange-400" />,      label: 'Habis' },
  }
  const { cls, icon, label } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${cls}`}>
      {icon}{label}
    </span>
  )
}
 
// ─────────────────────────────────────────────
// Promo Form Modal
// ─────────────────────────────────────────────
 
function PromoModal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'
  initial: PromoForm
  onClose: () => void
  onSave: (form: PromoForm) => Promise<void>
}) {
  const [form, setForm] = useState<PromoForm>(initial)
  const [loading, setLoading] = useState(false)
 
  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }
 
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try { await onSave(form) }
    finally { setLoading(false) }
  }
 
  const labelCls = 'block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1'
  const inputCls = 'block w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400'
 
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl w-full max-w-lg border border-zinc-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-amber-500" />
            <span className="text-sm font-bold text-zinc-900">
              {mode === 'create' ? 'Tambah Promo Baru' : 'Edit Promo'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100">
            <X size={15} />
          </button>
        </div>
 
        <form onSubmit={submit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Kode & Tipe */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kode Promo</label>
              <input name="code" value={form.code} onChange={handle} required
                placeholder="SUMMER25"
                className={inputCls + ' uppercase font-mono font-bold tracking-widest'} />
            </div>
            <div>
              <label className={labelCls}>Tipe Diskon</label>
              <select name="type" value={form.type} onChange={handle} className={inputCls}>
                <option value="percent">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
          </div>
 
          {/* Nilai & Max Usage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                Nilai {form.type === 'percent' ? '(%)' : '(Rp)'}
              </label>
              <input name="value" value={form.value} onChange={handle}
                type="number" min="0" required
                placeholder={form.type === 'percent' ? '10' : '50000'}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Maks Penggunaan</label>
              <input name="maxUsage" value={form.maxUsage} onChange={handle}
                type="number" min="0" required placeholder="100"
                className={inputCls} />
            </div>
          </div>
 
          {/* Tanggal Kedaluwarsa */}
          <div>
            <label className={labelCls}>Tanggal Kedaluwarsa</label>
            <input name="expiresAt" value={form.expiresAt} onChange={handle}
              type="date" className={inputCls} />
            <p className="text-[10px] text-zinc-400 mt-1">Kosongkan jika tidak ada batas waktu.</p>
          </div>
 
          {/* Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-amber-500" />
              <span className="text-xs font-semibold text-zinc-700">Aktifkan promo</span>
            </label>
          </div>
 
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              {mode === 'create' ? 'Buat Promo' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
 
// ─────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────
 
function DeleteModal({ promo, onClose, onConfirm }: { promo: Promo; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [loading, setLoading] = useState(false)
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
            <h3 className="text-sm font-bold text-zinc-900">Hapus Promo</h3>
            <p className="text-[11px] text-zinc-400">Tindakan ini tidak bisa dibatalkan.</p>
          </div>
        </div>
        <p className="text-xs text-zinc-600 mb-5 bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100">
          Promo <span className="font-mono font-bold text-zinc-900">{promo.code}</span> akan dihapus permanen.
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
// Promo Card
// ─────────────────────────────────────────────
 
function PromoCard({ promo, onEdit, onDelete, onToggle }: {
  promo: Promo
  onEdit: () => void
  onDelete: () => void
  onToggle: () => Promise<void>
}) {
  const [toggling, setToggling] = useState(false)
  const status = promoStatus(promo)
  const usagePercent = promo.maxUsage > 0 ? Math.round((promo.usedCount / promo.maxUsage) * 100) : 0
 
  async function handleToggle() {
    setToggling(true)
    try { await onToggle() } finally { setToggling(false) }
  }
 
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Tag size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-mono font-black text-zinc-900 tracking-widest">{promo.code}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {promo.type === 'percent' ? 'Diskon Persentase' : 'Diskon Nominal'}
            </p>
          </div>
        </div>
        <PromoBadge status={status} />
      </div>
 
      {/* Discount highlight */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Nilai Diskon</p>
        <p className="text-xl font-black text-amber-700 leading-tight">
          {promo.type === 'percent' ? `${promo.value}%` : formatRupiah(promo.value)}
        </p>
      </div>
 
      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-zinc-50 rounded-lg px-2.5 py-2 border border-zinc-100">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Kedaluwarsa</p>
          <p className="text-[11px] font-semibold text-zinc-700 mt-0.5">{formatDate(promo.expiresAt)}</p>
        </div>
        <div className="bg-zinc-50 rounded-lg px-2.5 py-2 border border-zinc-100">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Sisa Kuota</p>
          <p className="text-[11px] font-semibold text-zinc-700 mt-0.5">
            {Math.max(0, promo.maxUsage - promo.usedCount)} / {promo.maxUsage}
          </p>
        </div>
      </div>
 
      {/* Usage bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Penggunaan</p>
          <p className="text-[10px] font-bold text-zinc-600">{promo.usedCount} terpakai</p>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-rose-400' : usagePercent >= 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>
 
      {/* Actions */}
      <div className="flex items-center gap-1.5 border-t border-zinc-100 pt-3">
        <button onClick={handleToggle} disabled={toggling}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50 flex-1 justify-center ${
            promo.isActive
              ? 'bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
          }`}>
          {toggling ? <Loader2 size={11} className="animate-spin" /> : promo.isActive ? <ToggleRight size={11} /> : <ToggleLeft size={11} />}
          {promo.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100 transition-colors">
          <Edit2 size={11} /> Edit
        </button>
        <button onClick={onDelete}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors">
          <Trash2 size={11} /> Hapus
        </button>
      </div>
    </div>
  )
}
 
// ─────────────────────────────────────────────
// Sidebar — dari dashboard.tsx
// ─────────────────────────────────────────────
 
function Sidebar({ activeTab, isSidebarOpen, setShowLogoutModal }: SidebarProps) {
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
                <button key={item.name} onClick={() => { window.location.href = item.path }}
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
 
export const Route = createFileRoute('/promo')({
  component: PromoAdmin,
})
 
export function PromoAdmin() {
  const [activeTab, setActiveTab] = useState<string>('Promo')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired' | 'full'>('all')
  const [modal, setModal] = useState<{ type: 'create' | 'edit'; promo?: Promo } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Promo | null>(null)
  const { toast, show: showToast } = useToast()
 
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }
    apiFetchPromos()
      .then(setPromos)
      .catch(() => showToast('Gagal memuat data promo.', 'error'))
      .finally(() => setLoading(false))
  }, [])
 
  async function handleSave(form: PromoForm) {
    // Payload sesuai field backend: code, type, value, maxUsage, expiresAt, isActive
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      maxUsage: parseInt(form.maxUsage),
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    }
    if (modal?.type === 'create') {
      const created = await apiCreatePromo(body)
      setPromos(p => [created, ...p])
      showToast(`Promo ${created.code} berhasil dibuat.`, 'success')
    } else if (modal?.promo) {
      const updated = await apiUpdatePromo(modal.promo.id, body)
      setPromos(p => p.map(x => x.id === updated.id ? updated : x))
      showToast(`Promo ${updated.code} berhasil diperbarui.`, 'success')
    }
    setModal(null)
  }
 
  async function handleToggle(promo: Promo) {
    await apiTogglePromo(promo.id)
    setPromos(p => p.map(x => x.id === promo.id ? { ...x, isActive: !x.isActive } : x))
    showToast(`Promo ${promo.code} ${promo.isActive ? 'dinonaktifkan' : 'diaktifkan'}.`, 'info')
  }
 
  async function handleDelete() {
    if (!deleteTarget) return
    await apiDeletePromo(deleteTarget.id)
    setPromos(p => p.filter(x => x.id !== deleteTarget.id))
    showToast(`Promo ${deleteTarget.code} dihapus.`, 'error')
    setDeleteTarget(null)
  }
 
  const filtered = promos.filter(p => {
    const q = searchQuery.toLowerCase()
    const matchSearch = p.code.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || promoStatus(p) === filterStatus
    return matchSearch && matchStatus
  })
 
  const counts = {
    total:    promos.length,
    active:   promos.filter(p => promoStatus(p) === 'active').length,
    inactive: promos.filter(p => promoStatus(p) === 'inactive').length,
    expired:  promos.filter(p => promoStatus(p) === 'expired').length,
    full:     promos.filter(p => promoStatus(p) === 'full').length,
  }
 
  const editForm = (p: Promo): PromoForm => ({
    code: p.code,
    type: p.type,
    value: String(p.value),
    maxUsage: String(p.maxUsage),
    expiresAt: toInputDate(p.expiresAt),
    isActive: p.isActive,
  })
 
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
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setShowLogoutModal={setShowLogoutModal}
      />
 
      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-y-auto">
 
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg md:hidden"><Menu size={20} /></button>
            <div className="relative hidden sm:block w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400"><Search size={15} /></span>
              <input type="text" placeholder="Cari kode promo..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <button onClick={() => setModal({ type: 'create' })}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-colors">
            <Plus size={14} /> Tambah Promo
          </button>
        </header>
 
        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Kelola Promo & Diskon</h1>
            <p className="text-slate-500 mt-2">Buat, edit, dan kelola kode promo untuk penyewa.</p>
          </div>
 
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: 'Total Promo',  value: counts.total,    color: 'text-zinc-900',    filter: 'all' },
              { label: 'Aktif',        value: counts.active,   color: 'text-emerald-600', filter: 'active' },
              { label: 'Nonaktif',     value: counts.inactive, color: 'text-zinc-500',    filter: 'inactive' },
              { label: 'Kedaluwarsa',  value: counts.expired,  color: 'text-rose-600',    filter: 'expired' },
            ].map(s => (
              <button key={s.label} onClick={() => setFilterStatus(s.filter as any)}
                className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all ${filterStatus === s.filter ? 'border-amber-300 ring-2 ring-amber-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
                <p className="text-xs text-slate-400 uppercase font-bold">{s.label}</p>
                <h2 className={`text-3xl font-bold mt-3 ${s.color}`}>{s.value}</h2>
              </button>
            ))}
          </div>
 
          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2 bg-white border rounded-2xl">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-xs">Memuat data promo...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2 bg-white border rounded-2xl">
              <Tag size={28} />
              <span className="text-xs">Tidak ada promo ditemukan.</span>
              <button onClick={() => setModal({ type: 'create' })}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl hover:bg-amber-400 transition-colors">
                <Plus size={12} /> Buat Promo Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => (
                <PromoCard key={p.id} promo={p}
                  onEdit={() => setModal({ type: 'edit', promo: p })}
                  onDelete={() => setDeleteTarget(p)}
                  onToggle={() => handleToggle(p)} />
              ))}
            </div>
          )}
        </main>
      </div>
 
      {/* Modals */}
      {modal && (
        <PromoModal
          mode={modal.type}
          initial={modal.promo ? editForm(modal.promo) : EMPTY_FORM}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
 
      {deleteTarget && (
        <DeleteModal promo={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
 
      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold">Logout?</h2>
            <p className="text-slate-500 mt-2">Yakin mau logout?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="px-4 py-2 bg-red-500 text-white rounded-lg">Logout</button>
            </div>
          </div>
        </div>
      )}
 
      <Toast toast={toast} />
    </div>
  )
}
 
export default function PromoRoute() {
  return <PromoAdmin />
}
 