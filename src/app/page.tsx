"use client";

import { useState, useMemo } from "react";
import {
  Search, SlidersHorizontal, Heart, Home, History,
  Bookmark, User, Wheat, Utensils, Carrot, Cake, CupSoda, Image as ImageIcon
} from "lucide-react";
import makananData from "../../data/makanan.json";

interface Makanan {
  id: number;
  nama: string;
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
  kategori: string;
  jenis: string;
}

const data: Makanan[] = (makananData as Makanan[]);

const CATEGORIES = [
  { name: "Karbohidrat", icon: Wheat },
  { name: "Lauk Hewani", icon: Utensils },
  { name: "Lauk Nabati", icon: Carrot },
  { name: "Sayur", icon: Carrot },
  { name: "Buah", icon: Cake },
  { name: "Snack", icon: CupSoda },
];

export default function PorsiMetriDashboard() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Karbohidrat");
  const [showAllCategories] = useState(false);

  const filtered = useMemo(() => {
    let result = data;
    if (activeCategory) {
      result = result.filter(m => m.kategori === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.nama.toLowerCase().includes(q));
    }
    return result;
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">

      {/* HEADER NAVBAR (Desktop & Mobile Top Nav) */}
      <nav className="sticky top-0 z-50 w-full bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 font-bold text-xl text-primary tracking-wide">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-extrabold shadow-sm">
            P
          </div>
          <span className="hidden sm:block text-gray-800">Porsi</span><span className="-ml-1 text-primary">Metri</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
          <button className="text-primary flex flex-col relative h-16 justify-center">
            Home
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-md"></span>
          </button>
          <button className="hover:text-primary transition-colors flex items-center gap-2">
            <History size={16} /> History
          </button>
          <button className="hover:text-primary transition-colors flex items-center gap-2">
            <Bookmark size={16} /> Favorites
          </button>
          <button className="hover:text-primary transition-colors flex items-center gap-2">
            <User size={16} /> Profile
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white pt-10 pb-20 px-4 md:px-8 relative overflow-hidden shadow-inner">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex-1 w-full text-center md:text-left pt-6 md:pt-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight tracking-tight drop-shadow-sm">
              Temukan Nilai Gizi <br className="hidden md:block" />
              Makanan Favoritmu
            </h1>
            <p className="text-white/90 text-base md:text-lg max-w-xl mx-auto md:mx-0 mb-10 font-medium">
              Cari informasi kalori, protein, lemak, dan karbohidrat secara akurat dari ratusan database makanan lokal.
            </p>

            {/* Search Bar */}
            <div className="relative w-full max-w-xl mx-auto md:mx-0 shadow-2xl rounded-2xl group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Cari makanan (cth: Nasi, Rendang)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white text-gray-900 py-5 pl-14 pr-16 rounded-2xl outline-none focus:ring-4 ring-primary/40 transition-all font-semibold text-base"
              />
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark transition-all text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-md active:scale-95">
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Right Kemenkes Badge / Logo Area */}
          <div className="hidden md:flex flex-col items-center bg-white/10 backdrop-blur-md px-10 py-8 rounded-3xl border border-white/20 shadow-2xl hover:bg-white/15 transition-all w-80">
            <div className="w-16 h-16 rounded-full border-2 border-white/40 flex items-center justify-center mb-4 bg-white/5">
              <Heart size={28} className="text-white drop-shadow-md" fill="currentColor" />
            </div>
            <div className="text-xs uppercase tracking-widest opacity-80 font-bold mb-2">Dipersembahkan Oleh</div>
            <div className="text-xl font-extrabold text-center leading-tight">
              Kemenkes <br /> Poltekkes <br /> Yogyakarta
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 -mt-12 md:-mt-8 relative z-20 flex-1">

        {/* Category Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 md:p-3 mb-10 overflow-hidden">
          <div className="flex justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 md:pb-1 px-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-300 min-w-max outline-none
                    ${isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                      : "bg-transparent text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100"}`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-sm ${isActive ? "font-bold tracking-wide" : "font-semibold"}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Eksplorasi Menu</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Menemukan <strong className="text-primary">{filtered.length}</strong> referensi makanan
            </p>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
            Tampilkan Terpopuler <SlidersHorizontal size={16} />
          </div>
        </div>

        {/* DATA GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-16">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group relative hover:-translate-y-1.5 cursor-pointer">
              <button className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100">
                <Heart size={18} />
              </button>

              <div className="w-full aspect-square rounded-xl bg-gray-50 mb-5 overflow-hidden relative flex items-center justify-center group-hover:bg-gray-100 transition-colors border border-gray-100/60">
                <ImageIcon size={44} className="text-gray-300 transform group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-2 left-0 w-full flex justify-center">
                  <span className="bg-white/90 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full text-primary shadow-sm border border-primary/20 tracking-wide">
                    {item.energi} kkal
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-base leading-snug mb-4 line-clamp-2 min-h-12 group-hover:text-primary transition-colors">{item.nama}</h3>

                <div className="mt-auto space-y-2.5">
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                    <span className="w-9 text-gray-400">Prot</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.min((item.protein / 30) * 100, 100)}%` }}></div>
                    </div>
                    <span className="w-8 text-right bg-green-50 text-green-700 py-0.5 rounded text-[10px]">{item.protein}g</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                    <span className="w-9 text-gray-400">Karb</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min((item.karbohidrat / 50) * 100, 100)}%` }}></div>
                    </div>
                    <span className="w-8 text-right bg-yellow-50 text-yellow-700 py-0.5 rounded text-[10px]">{item.karbohidrat}g</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                    <span className="w-9 text-gray-400">Lemak</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min((item.lemak / 20) * 100, 100)}%` }}></div>
                    </div>
                    <span className="w-8 text-right bg-blue-50 text-blue-700 py-0.5 rounded text-[10px]">{item.lemak}g</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm mb-16">
            <div className="inline-flex w-20 h-20 bg-primary/10 text-primary rounded-full items-center justify-center mb-5">
              <Search size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Makanan Tidak Ditemukan</h3>
            <p className="text-gray-500 text-base max-w-md mx-auto">Maaf, kami tidak dapat menemukan <span className="font-semibold text-gray-700">"{search}"</span> dalam kategori <span className="font-semibold text-primary">{activeCategory || "Semua"}</span>.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory(""); }}
              className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
            >
              Tampilkan Semua Menu
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-10 pb-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          <div className="text-center md:text-left">
            <div className="font-bold text-2xl text-gray-800 flex items-center justify-center md:justify-start gap-2 mb-3 tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-extrabold shadow-sm">P</div>
              Porsi<span className="text-primary -ml-1">Metri</span>
            </div>
            <p className="text-sm text-gray-500 max-w-md font-medium leading-relaxed">
              Data gizi dihitung per 100 gram sajian. <br />
              Disclaimer: nilai nutrisi hanya sebagai referensi dan estimasi pendekatan.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <div className="font-bold text-lg text-gray-800 mb-2 text-center md:text-right">
              Politeknik Kesehatan <br /> Kemenkes Yogyakarta
            </div>
            <div className="text-sm text-gray-400 font-semibold">
              &copy; 2026 Hak Cipta Dilindungi
            </div>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR (Hidden on md+) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] pb-safe-offset-2">
        <button className="flex flex-col items-center gap-1.5 text-primary relative px-2">
          <Home size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">Beranda</span>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-sm"></div>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-primary transition-colors px-2">
          <History size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Riwayat</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-primary transition-colors px-2">
          <Bookmark size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Favorit</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-primary transition-colors px-2">
          <User size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Profil</span>
        </button>
      </nav>

    </div>
  );
}
