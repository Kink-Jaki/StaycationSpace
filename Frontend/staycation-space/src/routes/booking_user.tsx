import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { 
  MapPin, Building2, Phone, Mail, Check, ShieldCheck, X, Calendar, Clock, User as UserIcon, Star, ArrowLeft
} from 'lucide-react';

const API_BASE_URL = "http://192.168.111.189:3000"; 

export const Route = createFileRoute('/booking_user')({
    component: BookingUser,
});

export default function BookingUser() {
  const [imageMap, setImageMap] = useState<Record<number, string>>({});

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [spaceNames, setSpaceNames] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("BOOKINGS =", data);

      setBookings(data);

      const names: Record<number, string> = {};

      await Promise.all(
        data.map(async (booking: any) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/spaces/${booking.spaceId}`
            );

            if (res.ok) {
              const space = await res.json();
              names[booking.spaceId] = space.name;
            }
          } catch (err) {
            console.error(err);
          }
        })
      );

      setSpaceNames(names);

      const imgs: Record<number, string> = {};

      await Promise.all(
        data.map(async (booking: any) => {
          try {
            const imgRes = await fetch(
              `${API_BASE_URL}/spaces/${booking.spaceId}/images`
            );

            if (imgRes.ok) {
              const imgData = await imgRes.json();

              if (imgData.length > 0) {
                imgs[booking.spaceId] =
                  `${API_BASE_URL}${imgData[0].imageUrl}`;
              }
            }
          } catch (err) {
            console.error(err);
          }
        })
      );

      setImageMap(imgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-800 flex flex-col">
      
      <main className="max-w-6xl mx-auto px-4 py-12 flex-grow w-full">
        
        {}
        <button 
          onClick={() => window.location.href = "/beranda"} 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-950 mb-2">Booking Saya</h2>
            <p className="text-gray-500">Pantau status transaksi, lakukan pembayaran, dan beri ulasan di sini.</p>
          </div>
          
          {/* Security Badge */}
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-5 py-3 rounded-2xl">
            <ShieldCheck className="text-amber-600" size={24} />
            <span className="text-sm font-semibold text-amber-900">Sistem reservasi aman 100% dengan garansi uang kembali</span>
          </div>
        </div>

        {/* Booking List */}
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col lg:flex-row gap-6">
              
              {/* Image & Main Info */}
              <div className="flex gap-4">
                <div className="w-32 h-24 rounded-2xl overflow-hidden bg-gray-200">
                  {imageMap[booking.spaceId] ? (
                    <img
                      src={imageMap[booking.spaceId]}
                      alt="Space"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={30} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{booking.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900">{spaceNames[booking.spaceId] || `Space #${booking.spaceId}`}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1"><Calendar size={13} /> {formatDate(booking.startTime)}</div>
                    <div className="flex items-center gap-1"><Clock size={13} />
                    Slot: {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <UserIcon size={13} /> User ID: {booking.userId}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="lg:ml-auto flex flex-col items-start lg:items-end justify-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total Bayar</p>
                  <p className="font-black text-xl text-gray-950">Rp {Number(booking.totalPrice).toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-gray-400">(Termasuk Jaminan Deposit)</p>
                </div>
                
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  {booking.status === "pending" ? (
                    <>
                      <button onClick={() => { window.location.href = `/payment_user?bookingId=${booking.id}`; }} className="flex-1 lg:flex-none bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors">
                        <Check size={16} />
                        BAYAR SEKARANG
                      </button>

                      <button className="p-3 rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                        <X size={18} />
                      </button>
                    </>
                  ) : booking.status === "verified" ? (
                    <button onClick={() => { window.location.href = `/rating_ulasan?bookingId=${booking.id}&spaceId=${booking.spaceId}`; }}
                      className="w-full lg:w-auto bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors">
                      <Star size={16} fill="white" />
                      BERI ULASAN & RATING
                    </button>
                  ) : null}
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer (Matches Beranda design) */}
      <footer className="bg-[#FAF8F5] border-t border-gray-200/60 w-full mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm tracking-wide">JELAJAHI</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Studi</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Villa</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Hall</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Lainnya</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-4 text-sm tracking-wide">BANTUAN</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Cara Pemesanan</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Kebijakan Pembatalan</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </div>
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
          <div className="mt-12 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
            <p>&copy; 2026 StaycationSpace. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
