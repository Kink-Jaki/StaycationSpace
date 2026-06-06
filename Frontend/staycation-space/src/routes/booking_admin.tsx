import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Calendar as CalendarIcon,
  Users,
  LogOut,
  Settings,
  Percent,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  Receipt,
  X,
  ImageOff,
  Loader2,
  FileText,
} from 'lucide-react';
 
// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
 
type BookingStatus = 'Dikonfirmasi' | 'Menunggu' | 'Dibatalkan';
 
interface Booking {
  id: number;
  spaceId: number;
  userId: number;
  spaceName: string;       // diisi dari lookup /spaces/:id (jika tersedia)
  customerName: string;    // diisi dari lookup /users/:id (jika tersedia)
  date: string;            // YYYY-MM-DD dari startTime
  timeSlot: string;        // "HH:MM - HH:MM" dari startTime + endTime
  amount: number;
  status: BookingStatus;
  rawStatus: string;       // status asli API: verified | pending | cancelled
  notes: string;
  paymentId: string | null;
  createdAt: string;
}
 
interface Payment {
  id: string | number;
  status: string;
  proofUrl?: string;
  proof_url?: string;
  imageUrl?: string;
  image_url?: string;
  amount?: number | string;
  bookingId?: number;
}
 
// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
 
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://192.168.111.189:3000';
 
function getToken(): string {
  return localStorage.getItem('token') ?? '';
}
 
function authHeaders(): HeadersInit {         
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}
 
// ─────────────────────────────────────────────
// Normalisasi response API
// ─────────────────────────────────────────────
 
/**
 * Mapping status English dari API → label Indonesia untuk UI
 */
function mapStatus(raw: string): BookingStatus {
  switch ((raw ?? '').toLowerCase()) {
    case 'verified':
    case 'confirmed':
    case 'dikonfirmasi':
      return 'Dikonfirmasi';
    case 'cancelled':
    case 'canceled':
    case 'dibatalkan':
    case 'rejected':
      return 'Dibatalkan';
    default:
      return 'Menunggu'; // pending, uploaded, dll
  }
}
 
/**
 * Konversi ISO datetime → "HH:MM"
 * contoh: "2026-06-03T03:00:00.000Z" → "10:00" (UTC+7)
 */
function isoToLocalTime(iso: string): string {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
 
/**
 * Konversi ISO datetime → "YYYY-MM-DD" di timezone lokal
 */
function isoToLocalDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
 
function normalizeBooking(raw: any): Booking {
  const timeSlot =
    raw.startTime && raw.endTime
      ? `${isoToLocalTime(raw.startTime)} - ${isoToLocalTime(raw.endTime)}`
      : '-';
 
  return {
    id: raw.id,
    spaceId: raw.spaceId ?? raw.space_id ?? 0,
    userId: raw.userId ?? raw.user_id ?? 0,
    // Fallback: tampilkan ID sampai data enrichment selesai
    spaceName: raw.space?.name ?? raw.spaceName ?? `Space #${raw.spaceId ?? '?'}`,
    customerName:
      raw.user?.name ??
      raw.user?.fullName ??
      raw.customer?.name ??
      raw.customerName ??
      `User #${raw.userId ?? '?'}`,
    date: isoToLocalDate(raw.startTime ?? raw.date ?? ''),
    timeSlot,
    amount: parseFloat(raw.totalPrice ?? raw.amount ?? '0'),
    status: mapStatus(raw.status),
    rawStatus: raw.status ?? 'pending',
    notes: raw.notes ?? '',
    paymentId: raw.paymentId ?? raw.payment_id ?? raw.payment?.id ?? null,
    createdAt: raw.createdAt ?? '',
  };
}
 
// ─────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────
 
async function apiFetchBookings(): Promise<Booking[]> {
  const res = await fetch(`${BASE_URL}/bookings`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // Response bisa: array langsung [] atau { data: [] } atau { bookings: [] }
  const raw: any[] = Array.isArray(data)
    ? data
    : (data.data ?? data.bookings ?? []);
  return raw.map(normalizeBooking);
}
 
/**
 * PATCH /bookings/:id/status
 * Mengirim status dalam format yang diterima backend (English lowercase)
 */
async function apiPatchBookingStatus(id: number, uiStatus: BookingStatus): Promise<void> {
  // Konversi balik UI label → nilai yang diterima backend
  const statusMap: Record<BookingStatus, string> = {
    Dikonfirmasi: 'verified',
    Dibatalkan: 'cancelled',
    Menunggu: 'pending',
  };
  const res = await fetch(`${BASE_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status: statusMap[uiStatus] }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
 
/**
 * PATCH /payments/:id/status
 */
async function apiPatchPaymentStatus(paymentId: string, status: 'verified' | 'rejected'): Promise<void> {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
 
/**
 * GET /payments/:id
 * Dipanggil saat klik "Lihat Bukti Transfer"
 */
async function apiFetchPayment(paymentId: string): Promise<Payment> {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.data ?? data;
}
 
/**
 * GET /payments?bookingId=:id
 * Fallback: cari payment berdasarkan bookingId kalau paymentId tidak ada di booking
 */
async function apiFetchPaymentByBookingId(bookingId: number): Promise<Payment | null> {
  try {
    const res = await fetch(`${BASE_URL}/payments?bookingId=${bookingId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list: any[] = Array.isArray(data) ? data : (data.data ?? []);
    return list.length > 0 ? list[0] : null;
  } catch {
    return null;
  }
}
 
function proofImageUrl(payment: Payment): string | null {
  const path =
    payment.proofUrl ??
    payment.proof_url ??
    payment.imageUrl ??
    payment.image_url ??
    null;
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}
 
// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
 
const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];
 
function formatDate(isoDate: string): string {
  if (!isoDate) return '-';
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
 
function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}
 
function initials(name: string): string {
  return (name ?? '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
 
function buildDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
 
// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
 
type ToastType = 'success' | 'error' | 'info';
interface ToastState { message: string; type: ToastType; visible: boolean; }
 
function useToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });
  const show = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);
  return { toast, show };
}
 
function Toast({ toast }: { toast: ToastState }) {
  if (!toast.visible) return null;
  const bg = toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-zinc-700';
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-lg ${bg}`}>
      {toast.message}
    </div>
  );
}
 
// ─────────────────────────────────────────────
// Proof Modal
// ─────────────────────────────────────────────
 
interface ProofTarget {
  bookingId: number;
  paymentId: string | null;
  customerName: string;
  amount: number;
  date: string;
}
 
function ProofModal({ target, onClose }: { target: ProofTarget | null; onClose: () => void }) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
 
  useEffect(() => {
    if (!target) return;
    setPayment(null);
    setError(false);
    setLoading(true);
 
    const fetchPayment = async () => {
      try {
        let p: Payment | null = null;
        if (target.paymentId) {
          // Jalur utama: paymentId sudah ada di data booking
          p = await apiFetchPayment(target.paymentId);
        } else {
          // Fallback: cari via bookingId
          p = await apiFetchPaymentByBookingId(target.bookingId);
        }
        if (p) setPayment(p);
        else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
 
    fetchPayment();
  }, [target]);
 
  if (!target) return null;
 
  const imgUrl = payment ? proofImageUrl(payment) : null;
 
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md border border-zinc-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-amber-500" />
            <span className="text-sm font-bold text-zinc-900">Bukti Transfer</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100" aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
 
        <div className="bg-zinc-50 min-h-48 flex items-center justify-center border-b border-zinc-100">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-xs">Memuat bukti...</span>
            </div>
          )}
          {!loading && (error || !payment) && (
            <div className="flex flex-col items-center gap-2 text-zinc-400 py-8">
              <ImageOff size={32} />
              <span className="text-xs">{error ? 'Gagal memuat data payment.' : 'Data payment tidak ditemukan.'}</span>
            </div>
          )}
          {!loading && payment && !imgUrl && (
            <div className="flex flex-col items-center gap-2 text-zinc-400 py-8">
              <FileText size={32} />
              <span className="text-xs">Bukti transfer belum diunggah.</span>
            </div>
          )}
          {!loading && imgUrl && (
            <img src={imgUrl} alt={`Bukti transfer dari ${target.customerName}`} className="max-w-full max-h-72 object-contain" />
          )}
        </div>
 
        <div className="grid grid-cols-2 gap-3 p-5">
          {[
            { label: 'Penyewa', value: target.customerName },
            { label: 'ID Booking', value: `#${target.bookingId}` },
            { label: 'Nominal', value: formatRupiah(target.amount) },
            { label: 'Status Payment', value: payment?.status ?? '-' },
          ].map(item => (
            <div key={item.label} className="bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.label}</div>
              <div className="text-xs font-semibold text-zinc-800 mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 
// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
 
function StatusBadge({ status }: { status: BookingStatus }) {
  const map = {
    Dikonfirmasi: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 size={11} className="text-emerald-500" /> },
    Menunggu:     { cls: 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse', icon: <Clock size={11} className="text-amber-500" /> },
    Dibatalkan:   { cls: 'bg-rose-50 text-rose-700 border-rose-100', icon: <XCircle size={11} className="text-rose-500" /> },
  };
  const { cls, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${cls}`}>
      {icon}{status}
    </span>
  );
}
 
// ─────────────────────────────────────────────
// Booking Card
// ─────────────────────────────────────────────
 
interface BookingCardProps {
  booking: Booking;
  onApprove: (b: Booking) => Promise<void>;
  onReject: (b: Booking) => Promise<void>;
  onViewProof: (b: Booking) => void;
}
 
function BookingCard({ booking: b, onApprove, onReject, onViewProof }: BookingCardProps) {
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | null>(null);
  const isSettled = b.status !== 'Menunggu';
 
  async function handleAction(action: 'approve' | 'reject') {
    setLoadingAction(action);
    try {
      if (action === 'approve') await onApprove(b);
      else await onReject(b);
    } finally {
      setLoadingAction(null);
    }
  }
 
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
            {initials(b.customerName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900 truncate">{b.customerName}</p>
            <p className="text-[11px] text-zinc-500 truncate">{b.spaceName}</p>
          </div>
        </div>
        <StatusBadge status={b.status} />
      </div>
 
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
        {[
          { label: 'ID Booking', value: `#${b.id}` },
          { label: 'Tanggal', value: formatDate(b.date) },
          { label: 'Slot Waktu', value: b.timeSlot },
          { label: 'Tarif Sewa', value: formatRupiah(b.amount) },
          { label: 'Space ID', value: `#${b.spaceId}` },
          { label: 'User ID', value: `#${b.userId}` },
        ].map(item => (
          <div key={item.label}>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-xs font-semibold text-zinc-800 mt-0.5">{item.value}</p>
          </div>
        ))}
        {b.notes && (
          <div className="col-span-2 sm:col-span-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Catatan</p>
            <p className="text-xs font-semibold text-zinc-800 mt-0.5 italic">"{b.notes}"</p>
          </div>
        )}
      </div>
 
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-100">
        <button
          onClick={() => handleAction('approve')}
          disabled={isSettled || loadingAction !== null}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loadingAction === 'approve' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          Approve
        </button>
 
        <button
          onClick={() => handleAction('reject')}
          disabled={isSettled || loadingAction !== null}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loadingAction === 'reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
          Reject
        </button>
 
        <button
          onClick={() => onViewProof(b)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-zinc-50 text-zinc-700 border border-zinc-200 hover:bg-zinc-100 transition-colors ml-auto"
        >
          <Receipt size={13} />
          Lihat Bukti Transfer
        </button>
      </div>
    </div>
  );
}
 
// ─────────────────────────────────────────────
// Calendar
// ─────────────────────────────────────────────
 
function BookingCalendar({
  bookings, selectedDate, onSelectDate,
}: {
  bookings: Booking[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
 
  function changeMonth(dir: number) {
    let m = calMonth + dir, y = calYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalMonth(m); setCalYear(y);
  }
 
  const daysCount = new Date(calYear, calMonth + 1, 0).getDate();
  const rawFirst = new Date(calYear, calMonth, 1).getDay();
  const offset = rawFirst === 0 ? 6 : rawFirst - 1;
  const selectedBookings = bookings.filter(b => b.date === selectedDate);
 
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <CalendarIcon size={15} className="text-amber-500" /> Jadwal Tersedia
        </h2>
        <p className="text-[11px] text-zinc-400 mt-0.5">Pilih tanggal untuk melihat slot terisi.</p>
      </div>
 
      <div className="flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors" aria-label="Bulan sebelumnya">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-bold text-zinc-700">{MONTH_NAMES[calMonth]} {calYear}</span>
        <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors" aria-label="Bulan berikutnya">
          <ChevronRight size={14} />
        </button>
      </div>
 
      <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
        {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map((d, i) => (
          <span key={d} className={i >= 5 ? 'text-rose-400' : ''}>{d}</span>
        ))}
      </div>
 
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysCount }, (_, i) => i + 1).map(day => {
          const dateStr = buildDateKey(calYear, calMonth, day);
          const dayBkgs = bookings.filter(b => b.date === dateStr);
          const hasConfirmed = dayBkgs.some(b => b.status === 'Dikonfirmasi');
          const hasPending = dayBkgs.some(b => b.status === 'Menunggu');
          const isSelected = selectedDate === dateStr;
 
          let cls = 'hover:bg-zinc-100 text-zinc-600 bg-zinc-50/60';
          if (isSelected) cls = 'bg-amber-500 text-black font-extrabold ring-2 ring-amber-400/50 shadow-sm';
          else if (hasConfirmed) cls = 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 hover:bg-emerald-100';
          else if (hasPending) cls = 'bg-amber-50 text-amber-800 font-bold border border-amber-100 hover:bg-amber-100';
 
          return (
            <button key={dateStr} onClick={() => onSelectDate(dateStr)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] transition-all ${cls}`}
            >
              <span>{day}</span>
              {dayBkgs.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayBkgs.slice(0, 3).map((bk, idx) => (
                    <span key={idx} className={`w-1.5 h-1.5 rounded-full ${
                      bk.status === 'Dikonfirmasi' ? 'bg-emerald-500' :
                      bk.status === 'Menunggu' ? 'bg-amber-500' : 'bg-rose-400'
                    }`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
 
      <div className="pt-3 border-t border-zinc-100">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          {selectedDate ? `Jadwal ${formatDate(selectedDate)}` : 'Pilih tanggal'}
        </p>
        {selectedBookings.length === 0 ? (
          <p className="text-[11px] text-zinc-400 italic">Tidak ada sewa aktif di tanggal ini.</p>
        ) : (
          <div className="space-y-2">
            {selectedBookings.map(b => (
              <div key={b.id} className="flex justify-between items-center bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-100">
                <div>
                  <p className="text-[11px] font-bold text-zinc-800">{b.customerName}</p>
                  <p className="text-[10px] text-zinc-500">{b.spaceName} · {b.timeSlot}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
 
function Sidebar({ isSidebarOpen, setIsSidebarOpen: _setIsSidebarOpen, setShowLogoutModal }: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  setShowLogoutModal: (v: boolean) => void;
}) {
  const username = localStorage.getItem('username') ?? 'Admin Staycation';
  const role = localStorage.getItem('role') ?? 'admin';
  const [showProfileMenu, setShowProfileMenu] = useState(false);
 
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Space',     icon: Building2,      path: '/space_admin' },
    { name: 'Booking',   icon: CalendarIcon,   path: '/booking_admin' },
    { name: 'Customer',  icon: Users,          path: '/customer' },
    { name: 'Promo',     icon: Percent,        path: '/promo' },
    { name: 'Report',    icon: BarChart3,      path: '/report' },
    { name: 'Settings',  icon: Settings,       path: '/settings' },
  ];
 
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-72 bg-[#121212] text-zinc-300 p-4 lg:p-5 flex flex-col justify-between transition-transform duration-300 md:relative md:translate-x-0 shrink-0 border-r border-zinc-900 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="flex flex-col h-full justify-between">
        <div>
          
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = item.name === 'Booking';
              return (
                <button key={item.name} onClick={() => { window.location.href = item.path; }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 font-bold' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'}`}
                >
                  <Icon size={16} /><span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-zinc-800/50 mt-auto relative">
          {showProfileMenu && (
            <div className="absolute bottom-16 left-0 w-full bg-[#1e1e1e] border border-zinc-800/80 rounded-xl p-1.5 shadow-xl z-50">
              <button onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }}
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
  );
}
 
// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
 
export const Route = createFileRoute('/booking_admin')({

  beforeLoad: () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Belum login
    if (!token) {
      throw redirect({
        to: "/login",
      });
    }

    // Bukan admin
    if (role !== "admin") {
      throw redirect({
        to: "/login",
      });
    }
  },
  
  component: BookingAdmin,
});
 
export function BookingAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    buildDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const [proofTarget, setProofTarget] = useState<ProofTarget | null>(null);
  const { toast, show: showToast } = useToast();
 
  useEffect(() => {
    apiFetchBookings()
      .then(data => setBookings(data))
      .catch(() => showToast('Gagal memuat data booking.', 'error'))
      .finally(() => setLoading(false));
  }, []);
 
  async function handleApprove(b: Booking) {
    await Promise.all([
      apiPatchBookingStatus(b.id, 'Dikonfirmasi'),
      b.paymentId ? apiPatchPaymentStatus(b.paymentId, 'verified') : Promise.resolve(),
    ]);
    setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, status: 'Dikonfirmasi' as BookingStatus } : bk));
    showToast(`Booking #${b.id} berhasil disetujui.`, 'success');
  }
 
  async function handleReject(b: Booking) {
    await Promise.all([
      apiPatchBookingStatus(b.id, 'Dibatalkan'),
      b.paymentId ? apiPatchPaymentStatus(b.paymentId, 'rejected') : Promise.resolve(),
    ]);
    setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, status: 'Dibatalkan' as BookingStatus } : bk));
    showToast(`Booking #${b.id} berhasil ditolak.`, 'error');
  }
 
  function handleViewProof(b: Booking) {
    setProofTarget({
      bookingId: b.id,
      paymentId: b.paymentId,
      customerName: b.customerName,
      amount: b.amount,
      date: b.date,
    });
  }
 
  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      String(b.id).includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.spaceName.toLowerCase().includes(q) ||
      b.notes.toLowerCase().includes(q)
    );
  });
 
  const counts = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'Dikonfirmasi').length,
    pending: bookings.filter(b => b.status === 'Menunggu').length,
    cancelled: bookings.filter(b => b.status === 'Dibatalkan').length,
  };
 
  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-950">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} setShowLogoutModal={setShowLogoutModal} />
 
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg md:hidden" aria-label="Buka menu">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400"><Search size={16} /></span>
              <input type="text" placeholder="Cari ID, penyewa, space, atau catatan..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-zinc-200" />
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-zinc-800">{MONTH_NAMES[today.getMonth()]} {today.getFullYear()}</p>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase">Konsol Booking</p>
            </div>
          </div>
        </header>
 
        <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Kelola Reservasi & Booking</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Pantau jadwal sewa, setujui pembayaran, dan kelola status reservasi penyewa.</p>
          </div>
 
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Booking', value: counts.total,     color: 'text-zinc-900' },
              { label: 'Dikonfirmasi',  value: counts.confirmed, color: 'text-emerald-600' },
              { label: 'Menunggu',      value: counts.pending,   color: 'text-amber-600' },
              { label: 'Dibatalkan',    value: counts.cancelled, color: 'text-rose-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-zinc-200 px-5 py-4 shadow-sm">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
 
          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <BookingCalendar bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </div>
 
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Status Booking</h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Kartu reservasi dengan aksi approve, reject, dan bukti transfer.</p>
                </div>
              </div>
 
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2">
                  <Loader2 size={28} className="animate-spin" />
                  <span className="text-xs">Memuat data booking...</span>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2 bg-white rounded-2xl border border-zinc-200">
                  <CalendarIcon size={28} />
                  <span className="text-xs">Data booking tidak ditemukan.</span>
                </div>
              ) : (
                filteredBookings.map(b => (
                  <BookingCard key={b.id} booking={b} onApprove={handleApprove} onReject={handleReject} onViewProof={handleViewProof} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
 
      <ProofModal target={proofTarget} onClose={() => setProofTarget(null)} />
 
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-2xl max-w-sm w-full p-6 shadow-xl border border-zinc-800 text-white">
            <h3 className="font-bold text-lg mb-4">Konfirmasi Keluar</h3>
            <p className="text-sm text-zinc-400 mb-6">Apakah Anda yakin ingin keluar dari konsol admin?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-700 transition-colors">Batal</button>
              <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="px-4 py-2 bg-red-500 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">Keluar</button>
            </div>
          </div>
        </div>
      )}
 
      <Toast toast={toast} />
    </div>
  );
}
 
export default function BookingAdminRoute() {
  return <BookingAdmin />;
}
 