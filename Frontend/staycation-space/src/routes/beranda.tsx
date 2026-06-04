import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Search, 
  ArrowRight, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  FileText,
  Upload,
  Info,
  Star,
  Percent,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

interface Space {
  id: number;
  name: string;
  category: 'Studio Foto' | 'Studio Musik' | 'Villa' | 'Coworking Space';
  description: string;
  priceWeekday: number;
  priceWeekend: number;
  deposit: number;
  capacity: number;
  rating: number;
  location: string;
  imageUrl: string;
  facilities: string[];
  reviewsCount: number;
}

interface UserBooking {
  id: string;
  spaceId: number;
  spaceName: string;
  spaceImage: string;
  date: string;
  timeSlot: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  basePrice: number;
  depositPrice: number;
  discountPrice: number;
  totalPrice: number;
  status: 'Menunggu Pembayaran' | 'Dikonfirmasi' | 'Selesai' | 'Dibatalkan';
  paymentMethod?: string;
  paymentProofUploaded?: boolean;
  reviewed?: boolean;
}

interface PromoCode {
  code: string;
  discountPercentage: number;
  description: string;
}

const SPACES_DATA: Space[] = [
  {
    id: 1,
    name: "The Golden Hours Studio",
    category: "Studio Foto",
    description: "Studio foto premium dengan pencahayaan alami terbaik (golden hour) dan perlengkapan vintage estetik terlengkap.",
    priceWeekday: 180000,
    priceWeekend: 220000,
    deposit: 100000,
    capacity: 8,
    rating: 4.9,
    location: "Dago, Bandung",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
    facilities: ["Natural Light", "Air Conditioner", "Changing Room", "Background System", "Free WiFi"],
    reviewsCount: 24
  },
  {
    id: 2,
    name: "Villa Sunset View & Pool",
    category: "Villa",
    description: "Villa bernuansa tropis modern dengan pemandangan pegunungan dan sunset yang memukau, dilengkapi private pool hangat.",
    priceWeekday: 1500000,
    priceWeekend: 1890000,
    deposit: 500000,
    capacity: 15,
    rating: 4.8,
    location: "Lembang, Bandung",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600",
    facilities: ["Private Heated Pool", "Smart TV & Karaoke", "Fully Equipped Kitchen", "BBQ Grill Area", "Parking for 4 Cars"],
    reviewsCount: 38
  },
  {
    id: 3,
    name: "Coworking Creative Space",
    category: "Coworking Space",
    description: "Ruang kolaborasi modern dengan internet serat optik super cepat, free-flow kopi, teh berkualitas tinggi, dan suasana tenang.",
    priceWeekday: 35000,
    priceWeekend: 45000,
    deposit: 20000,
    capacity: 25,
    rating: 4.7,
    location: "Sudirman, Jakarta",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
    facilities: ["High-Speed Internet", "Ergonomic Chairs", "Free flow Coffee & Tea", "Skype Booth", "Printing Service"],
    reviewsCount: 15
  },
  {
    id: 4,
    name: "RockStar Echo Jam Room",
    category: "Studio Musik",
    description: "Studio latihan musik profesional berperedam penuh dengan instrumen legendaris berkualitas konser dunia.",
    priceWeekday: 120000,
    priceWeekend: 150000,
    deposit: 50000,
    capacity: 6,
    rating: 4.9,
    location: "Sleman, Yogyakarta",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
    facilities: ["Marshall Amps", "Pearl Drums", "Fender Guitars", "Digital Mixer Recording", "Full Soundproofing"],
    reviewsCount: 19
  }
];

const PROMO_CODES: PromoCode[] = [
  { code: "STAYNEW", discountPercentage: 10, description: "Diskon 10% khusus pengguna baru StaycationSpace!" },
  { code: "WEEKENDSERU", discountPercentage: 15, description: "Diskon 15% hemat untuk penyewaan di akhir pekan." },
  { code: "VILLAHOKI", discountPercentage: 20, description: "Diskon spesial 20% khusus sewa villa di Lembang." }
];

// Simulasi tanggal sibuk (booked) di bulan Juni 2026 untuk fitur cek ketersediaan kalender
const BOOKED_DATES_MOCK: Record<number, string[]> = {
  1: ["2026-06-05", "2026-06-06", "2026-06-12"], // The Golden Hours Studio penuh di tgl ini
  2: ["2026-06-06", "2026-06-07", "2026-06-20", "2026-06-21"], // Villa Sunset penuh di weekend
  3: ["2026-06-10", "2026-06-11"],
  4: ["2026-06-15", "2026-06-16", "2026-06-17"]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'mybookings' | 'promos'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States Detail & Engine Booking
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [bookingDate, setBookingDate] = useState<string>('2026-06-03'); // Juni 2026
  const [bookingTime, setBookingTime] = useState<string>('10:00 - 13:00');
  const [totalHours, setTotalHours] = useState<number>(3);
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Form Booking User
  const [custName, setCustName] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');

  // Database Booking User (Client-side State)
  const [userBookings, setUserBookings] = useState<UserBooking[]>([
    {
      id: "STC-2094",
      spaceId: 1,
      spaceName: "The Golden Hours Studio",
      spaceImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
      date: "2026-06-10",
      timeSlot: "14:00 - 17:00",
      guestName: "Amanda Putri",
      guestEmail: "amanda@gmail.com",
      guestPhone: "0812984123",
      basePrice: 540000, // 180k * 3 jam
      depositPrice: 100000,
      discountPrice: 54000, // Diskon STAYNEW 10%
      totalPrice: 586000,
      status: "Menunggu Pembayaran",
      paymentProofUploaded: false
    },
    {
      id: "STC-1029",
      spaceId: 3,
      spaceName: "Coworking Creative Space",
      spaceImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
      date: "2026-05-28",
      timeSlot: "09:00 - 17:00",
      guestName: "Amanda Putri",
      guestEmail: "amanda@gmail.com",
      guestPhone: "0812984123",
      basePrice: 280000, // 35k * 8 jam
      depositPrice: 20000,
      discountPrice: 0,
      totalPrice: 300000,
      status: "Selesai",
      paymentMethod: "QRIS Mandiri",
      paymentProofUploaded: true,
      reviewed: false
    }
  ]);

  // Modal States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<UserBooking | null>(null);
  const [showRatingModal, setShowRatingModal] = useState<UserBooking | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSpaces = useMemo(() => {
    return SPACES_DATA.filter(space => {
      const matchQuery = space.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          space.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'Semua' || space.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  const bookingPricing = useMemo(() => {
    if (!selectedSpace) return { rate: 0, baseTotal: 0, isWeekend: false, discount: 0, finalPrice: 0 };

    const dateObj = new Date(bookingDate);
    const day = dateObj.getDay();
    const isWeekend = day === 0 || day === 6; // Minggu = 0, Sabtu = 6

    const rate = isWeekend ? selectedSpace.priceWeekend : selectedSpace.priceWeekday;
    const baseTotal = rate * (selectedSpace.category === 'Villa' ? 1 : totalHours);
    
    let discount = 0;
    if (appliedPromo) {
      discount = Math.round((baseTotal * appliedPromo.discountPercentage) / 100);
    }

    const finalPrice = baseTotal + selectedSpace.deposit - discount;

    return {
      rate,
      baseTotal,
      isWeekend,
      discount,
      finalPrice
    };
  }, [selectedSpace, bookingDate, totalHours, appliedPromo]);

  const handleOpenBooking = (space: Space) => {
    setSelectedSpace(space);
    setPromoInput('');
    setAppliedPromo(null);
    if (space.category === 'Villa') {
      setTotalHours(1);
    } else {
      setTotalHours(3);
    }
    setShowBookingModal(true);
  };

  const applyPromoCode = () => {
    const found = PROMO_CODES.find(p => p.code.toUpperCase() === promoInput.trim().toUpperCase());
    if (found) {
      setAppliedPromo(found);
      triggerToast(`🎉 Kode promo ${found.code} berhasil digunakan! Diskon ${found.discountPercentage}% diaplikasikan.`);
    } else {
      triggerToast("❌ Kode promo tidak valid atau sudah kedaluwarsa.");
      setAppliedPromo(null);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) return;

    // Cek apakah tanggal yang dipilih tabrakan/penuh (Kalender checking)
    const blockedDates = BOOKED_DATES_MOCK[selectedSpace.id] || [];
    if (blockedDates.includes(bookingDate)) {
      triggerToast("⚠️ Mohon maaf, tanggal tersebut sudah penuh dipesan. Silakan pilih tanggal lain.");
      return;
    }

    const newBooking: UserBooking = {
      id: `STC-${Math.floor(1000 + Math.random() * 9000)}`,
      spaceId: selectedSpace.id,
      spaceName: selectedSpace.name,
      spaceImage: selectedSpace.imageUrl,
      date: bookingDate,
      timeSlot: selectedSpace.category === 'Villa' ? 'Check-in: 14:00, Check-out: 12:00' : bookingTime,
      guestName: custName || "Amanda Putri",
      guestEmail: custEmail || "amanda@gmail.com",
      guestPhone: custPhone || "0812984123",
      basePrice: bookingPricing.baseTotal,
      depositPrice: selectedSpace.deposit,
      discountPrice: bookingPricing.discount,
      totalPrice: bookingPricing.finalPrice,
      status: "Menunggu Pembayaran",
      paymentProofUploaded: false
    };

    setUserBookings([newBooking, ...userBookings]);
    setShowBookingModal(false);
    setActiveTab('mybookings');
    triggerToast("✨ Booking berhasil diajukan! Selesaikan pembayaran Anda.");
    
    // Clear Input
    setCustName('');
    setCustEmail('');
    setCustPhone('');
  };

  const handleConfirmPayment = (bookingId: string, method: string) => {
    setUserBookings(prev => prev.map(item => {
      if (item.id === bookingId) {
        return {
          ...item,
          status: 'Dikonfirmasi',
          paymentMethod: method,
          paymentProofUploaded: true
        };
      }
      return item;
    }));
    setShowPaymentModal(null);
    triggerToast("✅ Bukti transfer diunggah! Status booking Anda berubah menjadi Dikonfirmasi.");
  };

  const submitRatingReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRatingModal) return;

    setUserBookings(prev => prev.map(item => {
      if (item.id === showRatingModal.id) {
        return { ...item, reviewed: true };
      }
      return item;
    }));

    triggerToast(`⭐️ Terima kasih atas penilaian bintang ${ratingStars} Anda!`);
    setShowRatingModal(null);
    setReviewText('');
    setRatingStars(5);
  };

  const renderCalendarDays = (spaceId: number) => {
    const daysInJune = 30;
    const blockedDates = BOOKED_DATES_MOCK[spaceId] || [];
    
    return Array.from({ length: daysInJune }, (_, idx) => {
      const dayNum = idx + 1;
      const dateStr = `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
      const isBlocked = blockedDates.includes(dateStr);
      const isSelected = bookingDate === dateStr;

      return (
        <button
          key={dateStr}
          type="button"
          onClick={() => {
            if (!isBlocked) setBookingDate(dateStr);
          }}
          className={`aspect-square text-xs font-bold rounded-lg flex flex-col items-center justify-between p-1.5 transition-all ${
            isBlocked ? 'bg-red-50 text-red-300 cursor-not-allowed border border-red-100 line-through' :
            isSelected ? 'bg-amber-500 text-black shadow-md scale-105' :
            'bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
          }`}
          disabled={isBlocked}
        >
          <span>{dayNum}</span>
          <span className={`text-[8px] uppercase tracking-tighter ${isBlocked ? 'text-red-400 font-extrabold' : 'text-zinc-400 font-normal'}`}>
            {isBlocked ? 'Full' : 'Slot'}
          </span>
        </button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 font-sans flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-zinc-900 text-white border border-zinc-800 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="text-amber-400 shrink-0 animate-pulse" size={18} />
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}

      {}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 rounded-xl text-black shrink-0 shadow-xs">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wide text-zinc-950 leading-none">STAYCATION<span className="text-amber-500">SPACE</span></h1>
              <p className="text-[10px] text-zinc-400 font-extrabold tracking-widest uppercase mt-0.5">Customer Portal</p>
            </div>
          </div>

          {/* Navigasi User View */}
          <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-xl">
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'catalog' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-950'}`}
            >
              Jelajahi Properti
            </button>
            <button 
              onClick={() => setActiveTab('mybookings')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all relative ${activeTab === 'mybookings' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-950'}`}
            >
              Booking Saya
              {userBookings.filter(b => b.status === 'Menunggu Pembayaran').length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('promos')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'promos' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-950'}`}
            >
              Kupon Promo
            </button>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-bold text-sm flex items-center justify-center">
              A
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-zinc-800 leading-none">Amanda Putri</p>
              <span className="text-[10px] text-zinc-400 font-bold">Gold Member</span>
            </div>
          </div>

        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8">
        
        {}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            
            {/* Banner Promo Spesial */}
            <div className="bg-zinc-950 text-white p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-xl border border-zinc-900">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/20 to-transparent hidden lg:block"></div>
              <div className="relative z-10 max-w-xl space-y-4">
                <span className="inline-flex bg-amber-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Weekend Special Deals
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">Temukan Studio, Villa & Coworking Impianmu!</h2>
                <p className="text-zinc-400 text-sm sm:text-base">Gunakan kode promo <span className="text-amber-400 font-mono font-bold">STAYNEW</span> untuk potongan 10% pada transaksi pertama Anda.</p>
                <div className="pt-2">
                  <button 
                    onClick={() => setSelectedCategory('Villa')} 
                    className="flex items-center gap-2 bg-white text-zinc-950 px-5 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 hover:text-black transition-all"
                  >
                    Jelajahi Villa Eksklusif <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* No 14. Search & Filter UI */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Search size={16} />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari properti, studio, atau lokasi..." 
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Category Filter buttons */}
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                {['Semua', 'Studio Foto', 'Studio Musik', 'Villa', 'Coworking Space'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-black tracking-wider uppercase rounded-xl transition-all ${
                      selectedCategory === cat 
                        ? 'bg-zinc-950 text-white' 
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-950'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredSpaces.map((space) => (
                <div key={space.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                  <div>
                    <div className="h-60 sm:h-72 overflow-hidden relative bg-zinc-100">
                      <img 
                        src={space.imageUrl} 
                        alt={space.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black text-zinc-950 shadow-xs flex items-center gap-1.5">
                        <Sparkles className="text-amber-500" size={14} />
                        {space.category}
                      </div>
                      <div className="absolute top-4 right-4 bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-extrabold text-amber-400 shadow-xs flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" /> {space.rating} <span className="text-[10px] text-zinc-400">({space.reviewsCount})</span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight leading-tight">{space.name}</h3>
                        <span className="shrink-0 text-xs font-extrabold text-zinc-500 flex items-center gap-1 mt-1">
                          <MapPin size={14} className="text-zinc-400" /> {space.location}
                        </span>
                      </div>
                      
                      <p className="text-zinc-500 text-sm leading-relaxed">{space.description}</p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {space.facilities.map((fac, idx) => (
                          <span key={idx} className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 pt-0">
                    <div className="flex justify-between items-center pt-5 border-t border-zinc-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">Tarif Mulai</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-lg font-black text-zinc-950">
                            Rp {space.priceWeekday.toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs text-zinc-400 font-semibold">/ {space.category === 'Villa' ? 'Hari' : 'Jam'}</span>
                        </div>
                        <span className="text-[10px] text-amber-600 font-bold mt-0.5">Weekend: Rp {space.priceWeekend.toLocaleString('id-ID')}</span>
                      </div>

                      <button 
                        onClick={() => handleOpenBooking(space)}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                      >
                        Pesan Sekarang <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {}
        {activeTab === 'mybookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Booking Saya</h2>
                <p className="text-zinc-500 text-sm font-medium">Pantau status transaksi, lakukan pembayaran, dan beri ulasan di sini.</p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                <ShieldCheck className="text-amber-600 shrink-0" size={18} />
                <span className="text-xs font-bold text-amber-800">Sistem reservasi aman 100% dengan garansi uang kembali</span>
              </div>
            </div>

            {/* List Booking Cards */}
            <div className="space-y-4">
              {userBookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs flex flex-col lg:flex-row justify-between gap-6">
                  
                  {/* Bagian Info Utama */}
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                      <img src={b.spaceImage} alt={b.spaceName} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{b.id}</span>
                        
                        {/* No 8. Badge Status Booking */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          b.status === 'Dikonfirmasi' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          b.status === 'Menunggu Pembayaran' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                          b.status === 'Selesai' ? 'bg-zinc-100 text-zinc-700' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-950">{b.spaceName}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-zinc-500">
                        <p className="flex items-center gap-1.5"><CalendarIcon size={14} className="text-zinc-400" /> {new Date(b.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="flex items-center gap-1.5"><Clock size={14} className="text-zinc-400" /> Slot: {b.timeSlot}</p>
                        <p className="flex items-center gap-1.5"><User size={14} className="text-zinc-400" /> Nama Tamu: {b.guestName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bagian Harga, Invoice & Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-end sm:items-center lg:items-end gap-4 min-w-48 pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Total Bayar</span>
                      <span className="text-lg font-black text-zinc-950">Rp {b.totalPrice.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-zinc-400 block">(Termasuk Jaminan Deposit)</span>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end">
                      
                      {/* No 11. Upload Bukti Transfer Button */}
                      {b.status === 'Menunggu Pembayaran' && (
                        <button 
                          onClick={() => setShowPaymentModal(b)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <Upload size={14} /> Bayar Sekarang
                        </button>
                      )}

                      {/* No 12. Rating Tempat Button */}
                      {b.status === 'Selesai' && !b.reviewed && (
                        <button 
                          onClick={() => setShowRatingModal(b)}
                          className="px-4 py-2 bg-zinc-950 text-white hover:bg-amber-500 hover:text-black rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
                        >
                          <Star size={14} className="fill-current" /> Beri Ulasan & Rating
                        </button>
                      )}

                      {b.status === 'Selesai' && b.reviewed && (
                        <span className="text-xs text-zinc-400 italic flex items-center gap-1 font-semibold">
                          <CheckCircle2 size={14} className="text-emerald-500" /> Terima kasih atas ulasan Anda!
                        </span>
                      )}

                      {/* Cancel Booking Simulator */}
                      {b.status === 'Menunggu Pembayaran' && (
                        <button 
                          onClick={() => {
                            setUserBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: 'Dibatalkan' } : item));
                            triggerToast("❌ Booking Anda berhasil dibatalkan.");
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100"
                          title="Batalkan Booking"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {activeTab === 'promos' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Kupon Diskon Staycation</h2>
              <p className="text-zinc-500 text-sm">Salin kode promo di bawah dan tempelkan pada formulir pemesanan properti Anda untuk diskon instan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROMO_CODES.map((promo, idx) => (
                <div key={idx} className="bg-white border-2 border-dashed border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-flex bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Diskon {promo.discountPercentage}%
                    </span>
                    <h3 className="text-xl font-bold font-mono tracking-wider text-zinc-950">{promo.code}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">{promo.description}</p>
                  </div>

                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      triggerToast(`📋 Kode promo ${promo.code} berhasil disalin!`);
                    }}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Salin Kode Promo
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {}
      {showBookingModal && selectedSpace && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Staycation Booking Portal
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-950 mt-1">{selectedSpace.name}</h3>
                <p className="text-xs text-zinc-400 font-semibold">{selectedSpace.location}</p>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-950 bg-zinc-100 rounded-full transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* No 9. Cek Jadwal Tersedia (Calendar Checker Column) - Left */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <CalendarIcon size={14} className="text-amber-500" /> Cek Jadwal Tersedia (Juni 2026)
                  </h4>
                  <p className="text-[10px] text-zinc-500 mb-4">Hari bertanda <span className="text-red-500 font-extrabold">Full / Coret</span> tidak dapat dipilih karena sudah tersewa oleh user lain.</p>
                  
                  {/* Kalender mini */}
                  <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                    {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => (
                      <span key={i} className="text-[10px] font-extrabold text-zinc-400 uppercase">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {renderCalendarDays(selectedSpace.id)}
                  </div>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <Info size={14} /> Tanggal Booking Terpilih:
                  </p>
                  <p className="text-sm font-black text-zinc-900">
                    {new Date(bookingDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* No 7. Form Booking Data Column - Right */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">Form Data Diri Pelanggan</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Nama Sesuai KTP</label>
                    <input 
                      type="text" 
                      value={custName} 
                      onChange={(e) => setCustName(e.target.value)} 
                      placeholder="Amanda Putri" 
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Email Aktif</label>
                    <input 
                      type="email" 
                      value={custEmail} 
                      onChange={(e) => setCustEmail(e.target.value)} 
                      placeholder="amanda@gmail.com" 
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">No. Handphone</label>
                    <input 
                      type="text" 
                      value={custPhone} 
                      onChange={(e) => setCustPhone(e.target.value)} 
                      placeholder="0812984123" 
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  
                  {selectedSpace.category === 'Villa' ? (
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Sistem Sewa</label>
                      <span className="block px-4 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-600">Sewa Harian (Checkin 14:00)</span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Durasi Penyewaan (Jam)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="24"
                        value={totalHours} 
                        onChange={(e) => setTotalHours(Number(e.target.value))} 
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Kode Promo / Diskon */}
                <div className="pt-2 border-t border-zinc-100">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Kode Promo Diskon</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoInput} 
                      onChange={(e) => setPromoInput(e.target.value)} 
                      placeholder="Masukkan kode voucher (Contoh: STAYNEW)" 
                      className="flex-grow px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button 
                      type="button" 
                      onClick={applyPromoCode}
                      className="bg-zinc-950 text-white font-black text-xs px-4 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>

                {/* Kalkulasi Rincian Biaya */}
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-2">
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Harga Dasar ({bookingPricing.isWeekend ? 'Tarif Akhir Pekan' : 'Tarif Hari Kerja'})</span>
                    <span className="font-bold">Rp {bookingPricing.rate.toLocaleString('id-ID')} / {selectedSpace.category === 'Villa' ? 'Hari' : 'Jam'}</span>
                  </div>

                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Subtotal sewa ({selectedSpace.category === 'Villa' ? '1 Hari' : `${totalHours} Jam`})</span>
                    <span className="font-bold">Rp {bookingPricing.baseTotal.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Deposit Jaminan (Dikembalikan setelah selesai)</span>
                    <span className="font-bold">Rp {selectedSpace.deposit.toLocaleString('id-ID')}</span>
                  </div>

                  {bookingPricing.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-bold">
                      <span>Potongan Promo ({appliedPromo?.code})</span>
                      <span>- Rp {bookingPricing.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-black text-zinc-950 pt-2 border-t border-zinc-200">
                    <span>Total Tagihan</span>
                    <span className="text-amber-600">Rp {bookingPricing.finalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Konfirmasi Booking <ArrowRight size={14} />
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 relative">
            
            <button 
              onClick={() => setShowPaymentModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900"
            >
              <XCircle size={20} />
            </button>

            <div className="mb-6">
              <span className="inline-block p-2 bg-amber-50 text-amber-800 text-[10px] font-black rounded-lg uppercase tracking-wider">
                Digital Payment Gateway
              </span>
              <h3 className="text-lg font-black text-zinc-950 mt-1">Gerbang Pembayaran Staycation</h3>
              <p className="text-xs text-zinc-500">Selesaikan pembayaran untuk mengamankan slot sewa Anda secara otomatis.</p>
            </div>

            {/* Rekening Tujuan Transfer */}
            <div className="bg-zinc-950 text-white p-5 rounded-2xl space-y-3.5 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-400">Transfer Manual Bank Mandiri</span>
                <CreditCard size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black leading-none">Nomor Rekening</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-mono font-black tracking-wider text-white">131-00-2819231-1</p>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("131-00-2819231-1");
                      triggerToast("📋 Nomor Rekening berhasil disalin!");
                    }} 
                    className="text-[10px] text-amber-400 font-extrabold hover:underline"
                  >
                    Salin
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-xs pt-3 border-t border-zinc-800">
                <span className="text-zinc-400">Atas Nama:</span>
                <span className="font-bold">PT STAYCATIONSPACE INDONESIA</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Jumlah Tagihan:</span>
                <span className="font-bold text-amber-400">Rp {showPaymentModal.totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* File Upload Simulator */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-2">Unggah Bukti Transfer Resmi</label>
                <div 
                  onClick={() => handleConfirmPayment(showPaymentModal.id, "Bank Mandiri")}
                  className="border border-dashed border-zinc-300 rounded-xl p-6 text-center bg-zinc-50 cursor-pointer hover:bg-zinc-100 hover:border-amber-400 transition-colors group"
                >
                  <Upload size={24} className="mx-auto text-zinc-400 group-hover:text-amber-500 mb-2" />
                  <p className="text-xs font-bold text-zinc-700">Pilih Berkas Bukti Transfer</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Klik di sini untuk menyimulasikan pengunggahan file instan</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 relative">
            
            <button 
              onClick={() => setShowRatingModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-950"
            >
              <XCircle size={20} />
            </button>

            <form onSubmit={submitRatingReview} className="space-y-4">
              <div className="text-center space-y-2">
                <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl inline-block">
                  <Star size={24} className="fill-amber-500 text-amber-500" />
                </div>
                <h3 className="font-black text-lg text-zinc-950">Berikan Penilaian & Ulasan</h3>
                <p className="text-xs text-zinc-500">Beri masukan berharga Anda untuk properti <span className="font-bold text-zinc-900">{showRatingModal.spaceName}</span>.</p>
              </div>

              {/* Komponen Penilaian Bintang */}
              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star 
                      size={32} 
                      className={`${star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} 
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase mb-2">Tulis Ulasan Anda</label>
                <textarea 
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda menyewa properti ini..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Kirim Ulasan Resmi
              </button>
            </form>

          </div>
        </div>
      )}

      {}
      <footer className="bg-zinc-950 text-white border-t border-zinc-900 py-10 px-4 md:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          <div className="space-y-1">
            <h5 className="font-black text-sm tracking-widest text-white uppercase">STAYCATION<span className="text-amber-500">SPACE</span></h5>
            <p className="text-xs text-zinc-500">Penyewaan studio foto, studio musik, villa & coworking space modern se-Indonesia.</p>
          </div>

          <div className="flex gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Bantuan Customer</a>
            <a href="#" className="hover:text-white transition-colors">Syarat Ketentuan</a>
          </div>

          <p className="text-xs text-zinc-600">&copy; 2026 StaycationSpace. All rights reserved.</p>

        </div>
      </footer>

    </div>
  );
}

export const Route = createFileRoute('/beranda')({
  component: App,
});