import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileImage,
  Loader2,
  MapPin,
  Phone,
  QrCode,
  Receipt,
  ShieldCheck,
  UploadCloud,
  Wallet,
} from 'lucide-react'

const API_BASE_URL = "http://192.168.111.17:3000";

type PaymentMethod = 'transfer' | 'qris' | 'cash' | 'other'

interface Booking {
  id: number
  spaceId: number
  userId: number
  startTime: string
  endTime: string
  totalPrice: string
  status: string
  notes?: string | null
}

interface Payment {
  id: number
  bookingId: number
  amount: string
  method: PaymentMethod
  proofUrl?: string | null
  status: string
  createdAt?: string
}

interface Space {
  id: number
  name: string
  type: string
  address: string
  deposit?: string
  pricePerHour?: string
}

export const Route = createFileRoute('/payment_user')({
  component: PaymentUser,
})

function getToken() {
  return localStorage.getItem('token') ?? ''
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

function formatRupiah(value: string | number) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusCopy(status?: string) {
  switch (status) {
    case 'uploaded':
      return {
        label: 'Menunggu verifikasi admin',
        className: 'bg-amber-50 text-amber-700 border-amber-100',
      }
    case 'verified':
      return {
        label: 'Pembayaran terverifikasi',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      }
    case 'rejected':
      return {
        label: 'Bukti pembayaran ditolak',
        className: 'bg-red-50 text-red-700 border-red-100',
      }
    default:
      return {
        label: 'Belum upload bukti',
        className: 'bg-zinc-50 text-zinc-600 border-zinc-200',
      }
  }
}

export default function PaymentUser() {
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [space, setSpace] = useState<Space | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('transfer')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const bookingId = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return Number(params.get('bookingId'))
  }, [])

  useEffect(() => {
    if (!bookingId) {
      setLoading(false)
      setError('Booking tidak ditemukan. Silakan pilih booking dari halaman Booking Saya.')
      return
    }

    const fetchPaymentData = async () => {
      try {
        setLoading(true)
        setError(null)

        const bookingRes = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
          headers: authHeaders(),
        })

        if (!bookingRes.ok) {
          throw new Error('Gagal memuat detail booking.')
        }

        const bookingData: Booking = await bookingRes.json()
        setBooking(bookingData)

        const [spaceRes, paymentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/spaces/${bookingData.spaceId}`),
          fetch(`${API_BASE_URL}/payments`, { headers: authHeaders() }),
        ])

        if (spaceRes.ok) {
          setSpace(await spaceRes.json())
        }

        if (paymentsRes.ok) {
          const paymentsData: Payment[] = await paymentsRes.json()
          const existing = paymentsData.find((item) => Number(item.bookingId) === bookingData.id)
          if (existing) {
            setPayment(existing)
            setMethod(existing.method)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat halaman payment.')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [bookingId])

  useEffect(() => {
    if (!proofFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(proofFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [proofFile])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!booking) return
    if (!proofFile) {
      setError('Silakan unggah bukti pembayaran terlebih dahulu.')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      let activePayment = payment

      if (!activePayment) {
        const createRes = await fetch(`${API_BASE_URL}/payments`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            bookingId: booking.id,
            amount: booking.totalPrice,
            method,
          }),
        })

        if (!createRes.ok) {
          const data = await createRes.json().catch(() => ({}))
          throw new Error(data.message || 'Gagal membuat data payment.')
        }

        activePayment = await createRes.json()
        setPayment(activePayment)
      }

      if (!activePayment) {
        throw new Error('Data payment belum tersedia.')
      }

      const formData = new FormData()
      formData.append('file', proofFile)

      const uploadRes = await fetch(`${API_BASE_URL}/payments/${activePayment.id}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      })

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}))
        throw new Error(data.message || 'Gagal mengunggah bukti pembayaran.')
      }

      const updatedPayment = await uploadRes.json()
      setPayment(updatedPayment)
      setProofFile(null)
      setSuccess('Bukti pembayaran berhasil dikirim. Admin akan melakukan verifikasi.')
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim pembayaran.')
    } finally {
      setSubmitting(false)
    }
  }

  const methodOptions: Array<{
    value: PaymentMethod
    label: string
    description: string
    icon: typeof CreditCard
  }> = [
    {
      value: 'transfer',
      label: 'Transfer Bank',
      description: 'BCA 1234567890 a.n. StaycationSpace',
      icon: CreditCard,
    },
    {
      value: 'qris',
      label: 'QRIS',
      description: 'Scan QR dan unggah bukti pembayaran',
      icon: QrCode,
    },
    {
      value: 'cash',
      label: 'Cash',
      description: 'Konfirmasi pembayaran tunai ke admin',
      icon: Banknote,
    },
    {
      value: 'other',
      label: 'Lainnya',
      description: 'E-wallet atau metode lain yang disetujui',
      icon: Wallet,
    },
  ]

  const currentStatus = statusCopy(payment?.status)
  const alreadyUploaded = payment?.status === 'uploaded' || payment?.status === 'verified'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] text-zinc-500">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 size={18} className="animate-spin text-[#F59E0B]" />
          Memuat detail pembayaran...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-zinc-900 flex flex-col">
      <main className="max-w-6xl mx-auto px-4 py-10 md:py-12 flex-grow w-full">
        <button
          onClick={() => navigate({ to: '/booking_user' })}
          className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali ke Booking Saya
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-[#121212] text-white rounded-[28px] p-6 md:p-8 overflow-hidden relative">
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 bg-[#F59E0B] text-black text-xs font-black px-3 py-1.5 rounded-full mb-5">
                  <ShieldCheck size={14} />
                  Pembayaran Aman
                </span>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                  Selesaikan Pembayaran
                </h1>
                <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
                  Pilih metode pembayaran, unggah bukti transaksi, lalu tunggu verifikasi admin untuk mengaktifkan booking.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 flex items-start gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-4 flex items-start gap-3 text-sm">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {!booking ? (
              <div className="bg-white border border-zinc-100 rounded-[24px] p-8 text-center text-zinc-500">
                Data booking tidak tersedia.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-zinc-100 rounded-[24px] p-5 md:p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="font-black text-lg mb-1">Metode Pembayaran</h2>
                  <p className="text-sm text-zinc-500">Pilih kanal pembayaran yang ingin digunakan.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {methodOptions.map((item) => {
                    const Icon = item.icon
                    const active = method === item.value
                    return (
                      <button
                        key={item.value}
                        type="button"
                        disabled={alreadyUploaded}
                        onClick={() => setMethod(item.value)}
                        className={`text-left rounded-2xl border p-4 transition-all disabled:cursor-not-allowed ${
                          active
                            ? 'border-[#F59E0B] bg-amber-50 ring-2 ring-amber-100'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            active ? 'bg-[#F59E0B] text-white' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            <Icon size={19} />
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-zinc-900">{item.label}</p>
                            <p className="text-xs text-zinc-500 leading-relaxed mt-1">{item.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h2 className="font-black text-lg">Upload Bukti</h2>
                      <p className="text-sm text-zinc-500">Gunakan gambar JPG, PNG, atau bukti transfer digital.</p>
                    </div>
                    {payment && (
                      <span className={`shrink-0 text-[11px] font-black px-3 py-1.5 rounded-full border ${currentStatus.className}`}>
                        {currentStatus.label}
                      </span>
                    )}
                  </div>

                  <label className={`block rounded-[24px] border-2 border-dashed p-5 transition-colors ${
                    alreadyUploaded ? 'border-zinc-200 bg-zinc-50' : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50 cursor-pointer'
                  }`}>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={alreadyUploaded}
                      onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-amber-100 flex items-center justify-center text-[#F59E0B] shrink-0">
                        {previewUrl ? <FileImage size={26} /> : <UploadCloud size={26} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-zinc-900">
                          {proofFile ? proofFile.name : alreadyUploaded ? 'Bukti pembayaran sudah terkirim' : 'Pilih file bukti pembayaran'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {alreadyUploaded
                            ? 'Anda dapat menunggu admin melakukan verifikasi.'
                            : 'Pastikan nominal, tanggal, dan tujuan pembayaran terlihat jelas.'}
                        </p>
                      </div>
                      {previewUrl && (
                        <img src={previewUrl} alt="Preview bukti pembayaran" className="w-24 h-24 rounded-2xl object-cover border border-white shadow-sm" />
                      )}
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || alreadyUploaded}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-black py-3.5 rounded-full text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Mengirim Bukti...
                    </>
                  ) : alreadyUploaded ? (
                    'Bukti Sudah Dikirim'
                  ) : (
                    <>
                      <UploadCloud size={17} />
                      Kirim Bukti Pembayaran
                    </>
                  )}
                </button>
              </form>
            )}
          </section>

          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-zinc-100 rounded-[24px] p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-zinc-950 text-white rounded-2xl flex items-center justify-center">
                  <Receipt size={20} />
                </div>
                <div>
                  <h2 className="font-black text-lg">Ringkasan Booking</h2>
                  <p className="text-xs text-zinc-500">ID Booking #{booking?.id ?? '-'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-1">Space</p>
                  <p className="font-extrabold text-zinc-900 flex items-center gap-2">
                    <Building2 size={16} className="text-[#F59E0B]" />
                    {space?.name ?? (booking ? `Space #${booking.spaceId}` : '-')}
                  </p>
                  <p className="text-xs text-zinc-500 flex items-start gap-2 mt-2 leading-relaxed">
                    <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                    {space?.address ?? 'Alamat belum tersedia'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-1">Tanggal</p>
                    <p className="font-bold text-sm flex items-center gap-2">
                      <Calendar size={15} className="text-[#F59E0B]" />
                      {booking ? formatDate(booking.startTime) : '-'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-1">Jam</p>
                    <p className="font-bold text-sm flex items-center gap-2">
                      <Clock size={15} className="text-[#F59E0B]" />
                      {booking ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}` : '-'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#121212] text-white p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Total Bayar</p>
                      <p className="text-3xl font-black mt-1">{booking ? formatRupiah(booking.totalPrice) : '-'}</p>
                    </div>
                    <CreditCard className="text-[#F59E0B]" size={24} />
                  </div>
                  <div className="border-t border-white/10 pt-3 text-xs text-zinc-400 leading-relaxed">
                    Transfer sesuai nominal agar proses verifikasi lebih cepat.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-[24px] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck size={22} className="text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-amber-950">Instruksi Pembayaran</h3>
                  <ul className="text-sm text-amber-900/80 mt-2 space-y-2 leading-relaxed">
                    <li>Bayar sesuai total booking yang tertera.</li>
                    <li>Upload bukti pembayaran yang jelas.</li>
                    <li>Status booking berubah setelah admin memverifikasi bukti.</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#FAF8F5] border-t border-gray-200/60 w-full mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center text-white">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-gray-800">STAYCATION<span className="text-[#F59E0B]">SPACE</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-[#F59E0B]" />
            <span>Butuh bantuan? +62 811 2345 6789</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
