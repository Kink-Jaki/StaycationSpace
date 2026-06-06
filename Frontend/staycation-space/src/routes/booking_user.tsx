import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { 
  MapPin, Building2, Phone, Mail, Check, ShieldCheck, X, Calendar, Clock, User as UserIcon, Star, ArrowLeft
} from 'lucide-react';

// Mock Data untuk tampilan
const BOOKINGS = [
  {
    id: "STC-2094",
    spaceName: "The Golden Hours Studio",
    status: "MENUNGGU PEMBAYARAN",
    statusType: "pending",
    date: "10 Juni 2026",
    time: "14:00 - 17:00",
    name: "Amanda Putri",
    price: "586.000",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=300&h=200&auto=format&fit=crop",
  },
];


export const Route = createFileRoute('/booking_user')({
    component: BookingUser,
});



export default function BookingUser() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-800 flex flex-col">
      
      <main className="max-w-6xl mx-auto px-4 py-12 flex-grow w-full">
        
        {}
        <button 
          onClick={() => window.history.back()}
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
          {BOOKINGS.map((booking) => (
            <div key={booking.id} className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 flex flex-col lg:flex-row gap-6">
              
              {/* Image & Main Info */}
              <div className="flex gap-4">
                <img src={booking.image} alt={booking.spaceName} className="w-32 h-24 object-cover rounded-2xl bg-gray-100" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{booking.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      booking.statusType === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900">{booking.spaceName}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1"><Calendar size={13} /> {booking.date}</div>
                    <div className="flex items-center gap-1"><Clock size={13} /> Slot: {booking.time}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <UserIcon size={13} /> Nama Tamu: {booking.name}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="lg:ml-auto flex flex-col items-start lg:items-end justify-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total Bayar</p>
                  <p className="font-black text-xl text-gray-950">Rp {booking.price}</p>
                  <p className="text-[10px] text-gray-400">(Termasuk Jaminan Deposit)</p>
                </div>
                
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  {booking.statusType === 'pending' ? (
                    <>
                      <button className="flex-1 lg:flex-none bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors">
                        <Check size={16} /> BAYAR SEKARANG
                      </button>
                      <button className="p-3 rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <button className="w-full lg:w-auto bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors">
                      <Star size={16} fill="white" /> BERI ULASAN & RATING
                    </button>
                  )}
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