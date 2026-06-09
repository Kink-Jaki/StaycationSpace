import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import {
  Search, MapPin, ArrowRight, Building2, Ticket, CalendarCheck, Phone, Mail, X, Check, Calendar, Clock, AlertCircle, Sparkles
} from 'lucide-react';

const API_BASE_URL = "http://192.168.111.127:3000";

interface Space {
  id: number;
  name: string;
  type: string;
  description: string;
  pricePerHour: number;
  deposit: number;
  capacity: number;
  address: string;
  status: string;
}

export const Route = createFileRoute('/beranda')({

    beforeLoad: async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        throw redirect({ to: "/login" });
      }

      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        throw redirect({ to: "/login" });
      }
    },
    component: BerandaUser,
  });

export default function BerandaUser() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [promoData, setPromoData] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const validatePromo = async (code: string) => {
  if (!code.trim()) {
    setPromoData(null);
    return;
  }

  try {
    setPromoLoading(true);

    const res = await fetch(
      `${API_BASE_URL}/promos/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      }
    );

    const text = await res.text();

    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (res.ok) {
      setPromoData(data.promo);
      setBookingError(null);
    } else {
      setPromoData(null);
      setBookingError(data.message || "Promo tidak valid");
    }
  } catch (error) {
    console.error(error);
    setPromoData(null);
  } finally {
    setPromoLoading(false);
  }
};

  // Definisi kategori disesuaikan dengan enum backend: ["studio", "villa", "hall", "other"]
  const categories = [
    { key: 'all', label: 'SEMUA' },
    { key: 'studio', label: 'STUDIO' },
    { key: 'villa', label: 'VILLA' },
    { key: 'hall', label: 'HALL' },
    { key: 'other', label: 'LAINNYA' }
  ];

  // Data properti yang disesuaikan tipe (type) nya dengan backend enum
  const [properties, setProperties] = useState<Space[]>([]);
  const [imageMap, setImageMap] = useState<Record<number, string>>({});

  // State baru untuk penanganan modal "Pesan Sekarang"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Space | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form Booking State yang diselaraskan dengan Schema POST /bookings
  const [bookingForm, setBookingForm] = useState({
    startTimeDate: '', // Input tanggal mulai
    startTimeHour: '09:00', // Input jam mulai
    duration: 1, // Durasi dalam jam
    promoCode: '', // Pilihan Promo Code secara string
    notes: '' // Catatan khusus pemesanan
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      validatePromo(bookingForm.promoCode);
    }, 500);

    return () => clearTimeout(timeout);
  }, [bookingForm.promoCode]);

  const fetchSpaces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/spaces`);
      if (!response.ok) {
        throw new Error("Gagal mengambil data dari API, beralih ke data cadangan.");
      }
      const data: Space[] = await response.json();
      setProperties(data);

      const imgs: Record<number, string> = {};
      await Promise.all(
        data.map(async (space) => {
          try {
            const res = await fetch(`${API_BASE_URL}/spaces/${space.id}/images`);
            if (res.ok) {
              const imageData = await res.json();
              if (Array.isArray(imageData) && imageData.length > 0) {
                imgs[space.id] = `${API_BASE_URL}${imageData[0].imageUrl}`;
              }
            }
          } catch (err) {
            console.error("Gagal memuat gambar untuk space " + space.id, err);
          }
        })
      );
      setImageMap(imgs);
    } catch (error) {
      console.warn("Menggunakan data cadangan karena kendala koneksi API:", error);
      setProperties([]);
      setImageMap({});
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  // Mendapatkan label teks yang ramah pengguna dari kunci enum
  const getCategoryLabel = (typeKey: string) => {
    const matched = categories.find(cat => cat.key === typeKey);
    return matched ? matched.label : 'LAINNYA';
  };

  // Logika penyaringan dinamis berdasarkan kategori aktif dan query pencarian
  const filteredProperties = properties.filter(property => {
    if (property.status !== "active") return false;

    const matchesCategory =
      activeCategory === "all" ||
      property.type === activeCategory;

    const matchesSearch =
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Handler membuka modal pemesanan
  const handleOpenBooking = (property: Space) => {
    setSelectedProperty(property);
    setBookingForm({
      startTimeDate: new Date().toISOString().split('T')[0],
      startTimeHour: '09:00',
      duration: 1,
      promoCode: '',
      notes: ''
    });
    setBookingSuccess(false);
    setBookingError(null);
    setIsModalOpen(true);
  };

  // Menghitung Estimasi Harga di Sisi Klien (termasuk promo)
  const calculatePrice = () => {
    if (!selectedProperty) {
      return {
        subtotal: 0,
        discount: 0,
        total: 0,
      };
    }

    const subtotal =
      Number(selectedProperty.pricePerHour) *
      bookingForm.duration;

    let discount = 0;

    if (promoData) {
      if (promoData.type === "percent") {
        discount =
          (subtotal *
            Number(promoData.value)) /
          100;
      }

      if (promoData.type === "fixed") {
        discount =
          Number(promoData.value);
      }
    }

    const total = Math.max(
      0,
      subtotal - discount
    );

    return {
      subtotal,
      discount,
      total,
    };
  };

  const priceInfo = calculatePrice();

  // Handler submit pemesanan ke POST /bookings di Backend Hono
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    setIsLoading(true);
    setBookingError(null);

    // Hitung waktu mulai & selesai berdasarkan durasi jam pilihan
    const startDateTimeStr = `${bookingForm.startTimeDate}T${bookingForm.startTimeHour}:00`;
    const startTimeDateObj = new Date(startDateTimeStr);
    
    const endTimeDateObj = new Date(startTimeDateObj.getTime() + (bookingForm.duration * 60 * 60 * 1000));

    // Cari ID promo jika ada
    const activePromo = promoData;

    console.log("bookingForm =", bookingForm);
    console.log("duration =", bookingForm.duration);
    console.log("start =", startTimeDateObj);
    console.log("end =", endTimeDateObj);

    // userId diambil backend dari JWT
    const payload = {
      spaceId: selectedProperty.id,
      promoId: activePromo ? activePromo.id : null,
      startTime: startTimeDateObj.toISOString(),
      endTime: endTimeDateObj.toISOString(),
      notes: bookingForm.notes
    };

    try {
      const token = localStorage.getItem("token");
      
      console.log("TOKEN:", token);
      console.log("PAYLOAD:", payload);
      console.log("PAYLOAD =", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const rawText = await response.text();

      console.log("STATUS:", response.status);
      console.log("RESPONSE:", rawText);

      let result: any;

      try {
        result = JSON.parse(rawText);
      } catch {
        result = { message: rawText };
      }

      if (!response.ok) {
        throw new Error(
          result?.message || "Gagal membuat reservasi."
        );
      }

      setBookingSuccess(true);

      setTimeout(() => {
        navigate({
          to: "/booking_user",
        });
      }, 2000); 

    } catch (err: any) {
      console.error(err);
      setBookingError(err.message || "Terjadi kesalahan koneksi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-800 flex flex-col">
      
      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full mt-4">
        
        {/* Hero Section with Quick Actions */}
        <section className="bg-[#121212] rounded-[32px] p-8 md:p-12 mb-10 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-[#F59E0B] text-black text-xs font-bold px-3 py-1 rounded-full mb-6">
              WEEKEND SPECIAL DEALS
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Temukan Studio, Villa, <br />Hall & Ruangan Terbaik dengan Mudah!
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-8 max-w-lg">
              Temukan dan gunakan kode promo yang tersedia untuk menikmati berbagai potongan harga.
            </p>
            <button className="bg-white text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors">
              Jelajahi Villa Eksklusif
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <button onClick={() => navigate({ to: "/booking_user" })} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all">
                <CalendarCheck size={18} className="text-[#F59E0B]" />
                Booking Saya
             </button>
             <button onClick={() => navigate({ to: "/promo_user" })} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all">
                <Ticket size={18} className="text-[#F59E0B]" />
                Kupon Promo
             </button>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-full border border-gray-200 shadow-sm">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-4 py-2 w-full md:w-auto flex-1 border-b md:border-b-0 md:border-r border-gray-100">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Cari properti, studio, atau lokasi..."
                className="outline-none w-full text-sm bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters (Sesuai dengan Enum Backend) */}
            <div className="flex items-center gap-1 px-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    activeCategory === category.key
                      ? 'bg-[#1A1A1A] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Property Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-[24px] border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  {imageMap[property.id] ? (
                    <img
                      src={imageMap[property.id]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <Building2 size={48} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-[#F59E0B]">✨</span> {getCategoryLabel(property.type)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full font-bold">
                      {property.capacity} Orang
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-xl">{property.name}</h3>
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                      <MapPin size={12} className="mr-1" />
                      {property.address}
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  {/* Footer / Pricing */}
                  <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-400 font-bold mb-1">TARIF MULAI</p>
                      <p className="font-extrabold text-lg">
                          Rp {Number(property.pricePerHour).toLocaleString("id-ID")}{" "}
                          <span className="text-xs font-normal text-gray-500">/ jam</span>
                        </p>

                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Deposit jaminan: Rp {Number(property.deposit).toLocaleString("id-ID")}
                        </p>
                    </div>
                    <button
                      onClick={() => handleOpenBooking(property)}
                      className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      PESAN SEKARANG
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-[24px]">
              Tidak ada properti dengan kategori ini yang ditemukan.
            </div>
          )}
        </section>

      </main>

      {/* Footer - Panjang & Membentang Penuh (Full Width) */}
      <footer className="bg-[#FAF8F5] border-t border-gray-200/60 w-full mt-16">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Footer Column 1: Brand */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center text-white">
                  <Building2 size={18} />
                </div>
                <h1 className="font-bold text-lg leading-tight tracking-tight">STAYCATION<span className="text-[#F59E0B]">SPACE</span></h1>
              </div>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Platform reservasi properti terpercaya untuk kebutuhan studio, villa, dan ruang kerja Anda.
              </p>
            </div>

            {/* Footer Column 2: Links */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm tracking-wide">JELAJAHI</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Studio</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Villa</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Hall</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Lainnya</a></li>
              </ul>
            </div>

            {/* Footer Column 3: Support */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm tracking-wide">BANTUAN</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Cara Pemesanan</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Kebijakan Pembatalan</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </div>

            {/* Footer Column 4: Contact */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm tracking-wide">HUBUNGI KAMI</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Phone size={15} className="text-[#F59E0B] shrink-0" />
                  <span>+62 811 2345 6789</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={15} className="text-[#F59E0B] shrink-0" />
                  <span>hello@staycationspace.id</span>
                </li>
                <li className="flex items-start gap-2 mt-2">
                   <MapPin size={15} className="text-[#F59E0B] shrink-0 mt-0.5" />
                   <span className="leading-relaxed">Jl. Ir. H. Juanda No. 123<br/>Bandung, Jawa Barat</span>
                </li>
              </ul>
            </div>

          </div>
          
          {/* Footer Copyright */}
          <div className="mt-12 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
            <p>&copy; 2026 StaycationSpace. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL: PESAN SEKARANG (FORMULIR RESERVASI) */}
      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-6 bg-[#121212] text-white flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#F59E0B] tracking-wider uppercase">{selectedProperty.type}</span>
                <h3 className="font-bold text-lg mt-0.5 leading-snug">Konfirmasi Reservasi</h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setSelectedProperty(null); }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info Singkat Tempat */}
            <div className="bg-amber-50/50 px-6 py-4 border-b border-amber-100/60 flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-gray-900">{selectedProperty.name}</p>
                <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-gray-400" /> {selectedProperty.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400">HARGA SEWA</p>
                <p className="font-extrabold text-amber-700">
                  Rp {Number(selectedProperty.pricePerHour).toLocaleString("id-ID")} <span className="text-xs font-normal text-gray-500">/ jam</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Deposit jaminan: Rp {Number(selectedProperty.deposit).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Konten Formulir */}
            {bookingSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h4 className="font-bold text-xl text-gray-900 mb-2">Booking Berhasil!</h4>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Terima kasih, formulir reservasi Anda berhasil terdaftar ke database backend.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 overflow-y-auto">
                
                {/* Tampilan Pesan Error jika jadwal bentrok */}
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-600">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-wide mb-1.5 uppercase">Tanggal Sewa</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all bg-gray-50/50"
                        value={bookingForm.startTimeDate}
                        onChange={(e) => setBookingForm({ ...bookingForm, startTimeDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-wide mb-1.5 uppercase">Waktu Mulai</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="time"
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all bg-gray-50/50"
                        value={bookingForm.startTimeHour}
                        onChange={(e) => setBookingForm({ ...bookingForm, startTimeHour: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-wide mb-1.5 uppercase">Durasi Sewa</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min={1}
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all bg-gray-50/50"
                        value={bookingForm.duration}
                        onChange={(e) => setBookingForm({ ...bookingForm, duration: parseInt(e.target.value) || 1 })}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        Jam
                      </span>
                    </div>
                  </div>

                  {/* Input Pilihan Kupon Diskon Aktif - DIUBAH JADI STRING INPUT */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-wide mb-1.5 uppercase">Kupon Promo (Pilihan)</label>
                    <div className="relative">
                      <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="KODE PROMO"
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all bg-gray-50/50 uppercase"
                        value={bookingForm.promoCode}
                       onChange={(e) => {
                        const code = e.target.value.toUpperCase();

                        setBookingForm({
                          ...bookingForm,
                          promoCode: code,
                        });
                      }}
                      />
                    </div>
                    {/* Tampilkan indikator saat kode promo sedang divalidasi */}
                    {bookingForm.promoCode && promoLoading && (
                      <p className="text-[10px] text-gray-500 mt-1.5 ml-1">
                        Memeriksa kode promo...
                      </p>
                    )}

                    {/* Tampilkan indikator jika kode promo cocok dengan data */}
                    {bookingForm.promoCode && promoData && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1.5 ml-1 flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Kode berhasil diterapkan
                      </p>
                    )}
                  </div>
                </div>

                {/* Input Catatan (Notes) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 tracking-wide mb-1.5 uppercase">Catatan Tambahan (Notes)</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Kebutuhan tambahan meja, stand mic, dll."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all bg-gray-50/50 resize-none"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  />
                </div>

                {/* Total Bayar Preview */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-amber-100">
                  <div className="space-y-2 text-sm">

                    <div className="flex justify-between">
                      <span>Harga Sewa</span>
                      <span>
                        Rp {priceInfo.subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {priceInfo.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Diskon Promo</span>
                        <span>
                          - Rp {priceInfo.discount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total Bayar</span>
                      <span>
                        Rp {priceInfo.total.toLocaleString("id-ID")}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => { setIsModalOpen(false); setSelectedProperty(null); }}
                    className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-full text-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-55"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3 rounded-full text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-55"
                  >
                    {isLoading ? "Mengirim..." : "Kirim Reservasi"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
