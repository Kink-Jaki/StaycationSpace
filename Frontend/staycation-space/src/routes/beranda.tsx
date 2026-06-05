import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { 
  Search, MapPin, ArrowRight, Building2, Ticket, CalendarCheck, Phone, Mail
} from 'lucide-react';

const API_BASE_URL = "http://192.168.111.189:3000";

interface Space {
  id: number;
  name: string;
  type: string;
  description: string;
  pricePerHour: string;
  deposit: string;
  capacity: number;
  address: string;
  status: string;
}

export const Route = createFileRoute('/beranda')({
    component: Beranda,
  });

export default function Beranda() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/spaces`);
    const data: Space[] = await response.json();

    setProperties(data);

    const imgs: Record<number, string> = {};

    await Promise.all(
      data.map(async (space) => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/spaces/${space.id}/images`
          );

          const imageData = await res.json();

          if (
            Array.isArray(imageData) &&
            imageData.length > 0
          ) {
            imgs[space.id] =
              `${API_BASE_URL}${imageData[0].imageUrl}`;
          }
        } catch (err) {
          console.error(err);
        }
      })
    );

    setImageMap(imgs);
  } catch (error) {
    console.error(error);
  }
};

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
              Temukan Studio, Villa &<br />Coworking Impianmu!
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-8 max-w-lg">
              Gunakan kode promo <span className="text-[#F59E0B] font-bold">STAYNEW</span> untuk potongan 10% pada transaksi pertama Anda.
            </p>
            <button className="bg-white text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors">
              Jelajahi Villa Eksklusif
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all">
                <CalendarCheck size={18} className="text-[#F59E0B]" />
                Booking Saya
             </button>
             <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all">
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
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                      <span className="text-zinc-400 text-sm">
                        Belum ada foto
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="text-[#F59E0B]">✨</span> {getCategoryLabel(property.type)}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">
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
                        Rp {Number(property.pricePerHour).toLocaleString("id-ID")} <span className="text-xs font-normal text-gray-500">/ jam</span>
                      </p>
                    </div>
                    <button className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors">
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
                <li><a href="#" className="hover:text-[#F59E0B] transition-colors">Studi</a></li>
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

    </div>
  );
}