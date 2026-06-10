import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  ArrowLeft, Copy, CheckCircle2, AlertCircle, Calendar, Percent, DollarSign, Loader2
} from 'lucide-react'

const API_BASE_URL = "http://192.168.111.17:3000";

interface Promo {
  id: number
  code: string
  type: 'percent' | 'fixed'
  value: number | string
  maxUsage: number
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt?: string
}

export const Route = createFileRoute('/promo_user')({
  component: PromoUserPage,
})

export default function PromoUserPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch active promos
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/promos`)
        
        if (!res.ok) {
          throw new Error('Gagal mengambil data promo')
        }

        const data: Promo[] = await res.json()
        
        // Filter hanya promo aktif dan belum expired
        const activePromos = data.filter(promo => {
          if (!promo.isActive) return false
          
          // Check expired
          if (promo.expiresAt) {
            const expireDate = new Date(promo.expiresAt)
            if (expireDate < new Date()) return false
          }
          
          // Check usage limit
          if (promo.usedCount >= promo.maxUsage) return false
          
          return true
        })

        setPromos(activePromos)
        setError(null)
      } catch (err) {
        console.error('Error fetching promos:', err)
        setError('Gagal memuat data promo. Silakan coba lagi.')
        setPromos([])
      } finally {
        setLoading(false)
      }
    }

    fetchPromos()
  }, [])

  // Copy to clipboard handler
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    }).catch(() => {
      alert('Gagal menyalin kode')
    })
  }

  // Format currency
  const formatRupiah = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate remaining usage
  const getRemainingUsage = (promo: Promo) => {
    return promo.maxUsage - promo.usedCount
  }

  // Check if promo is running out
  const isRunningOut = (promo: Promo) => {
    const remaining = getRemainingUsage(promo)
    return remaining <= 5
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </button>
        {/* Page Title */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-3">
            Promo Tersedia
          </h2>
          <p className="text-zinc-600 text-base md:text-lg max-w-2xl text-center mx-auto">
            Temukan dan gunakan kode promo eksklusif untuk mendapatkan diskon terbaik saat melakukan pemesanan.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-amber-500 animate-spin mb-4" />
            <p className="text-zinc-600">Memuat promo tersedia...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 flex items-center gap-4">
            <AlertCircle className="text-rose-500 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-rose-900">Gagal Memuat Promo</h3>
              <p className="text-rose-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && promos.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto text-zinc-400 mb-4" />
            <p className="text-zinc-600 text-lg font-medium mb-2">Tidak Ada Promo Aktif</p>
            <p className="text-zinc-500">Promo akan segera tersedia. Silakan kembali lagi nanti.</p>
          </div>
        )}

        {/* Promo Grid */}
        {!loading && promos.length > 0 && (
          <div>
            <p className="text-sm text-zinc-600 mb-6">
              Ditemukan <span className="font-bold text-zinc-900">{promos.length}</span> promo aktif
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promos.map((promo) => {
                const isRunning = isRunningOut(promo)
                const remaining = getRemainingUsage(promo)

                return (
                  <div
                    key={promo.id}
                    className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Card Header - Color based on type */}
                    <div className={`p-6 text-white ${
                      promo.type === 'percent' 
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                        : 'bg-gradient-to-br from-sky-500 to-sky-600'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {promo.type === 'percent' ? (
                            <Percent size={28} className="text-white" />
                          ) : (
                            <DollarSign size={28} className="text-white" />
                          )}
                          <div>
                            <p className="text-xs font-semibold opacity-90">
                              {promo.type === 'percent' ? 'Diskon Persentase' : 'Diskon Nominal'}
                            </p>
                            <p className="text-2xl font-bold">
                              {promo.type === 'percent' ? `${promo.value}%` : formatRupiah(promo.value)}
                            </p>
                          </div>
                        </div>

                        {/* Running out badge */}
                        {isRunning && (
                          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Terbatas!
                          </span>
                        )}
                      </div>

                      {/* Promo Code */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-xs opacity-80 mb-1">Kode Promo</p>
                        <p className="text-lg font-bold tracking-wider">{promo.code}</p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Expiry Date */}
                      {promo.expiresAt && (
                        <div className="flex items-center gap-2 mb-4 text-sm text-zinc-600">
                          <Calendar size={16} className="text-amber-500" />
                          <span>Berlaku hingga {formatDate(promo.expiresAt)}</span>
                        </div>
                      )}

                      {/* Usage Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-zinc-700">Kuota Tersisa</p>
                          <p className="text-xs font-bold text-zinc-900">
                            {remaining} dari {promo.maxUsage}
                          </p>
                        </div>
                        <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isRunning ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${(promo.usedCount / promo.maxUsage) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                          copiedCode === promo.code
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg hover:shadow-amber-500/30 active:scale-95'
                        }`}
                      >
                        {copiedCode === promo.code ? (
                          <>
                            <CheckCircle2 size={18} />
                            <span>Kode Disalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={18} />
                            <span>Salin Kode Promo</span>
                          </>
                        )}
                      </button>

                      {/* Usage Info */}
                      <p className="text-xs text-zinc-500 text-center mt-3">
                        {isRunning && `Hanya ${remaining} kuota tersisa - segera gunakan!`}
                        {!isRunning && 'Gunakan kode ini saat melakukan pemesanan'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer Spacing */}
      <div className="h-8"></div>
    </div>
  )
}
