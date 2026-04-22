"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Heart, ImageIcon, X, Search, ChevronLeft,
    LayoutGrid, Cookie, Beef, Leaf, Citrus, GlassWater, Soup, Cake, Utensils
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
    "Semua": LayoutGrid,
    "Favorit": Heart,
    "Karbohidrat": Cookie,
    "Lauk Pauk": Beef,
    "Protein": Beef,
    "Sayuran": Leaf,
    "Buah": Citrus,
    "Minuman": GlassWater,
    "Sup": Soup,
    "Kue": Cake,
    "Snack": Cake,
    "Jajanan": Cake,
};
import type { MakananInduk, UserFavorite } from "@/lib/types";
import UserSidebar from "@/components/UserSidebar";

export default function GaleriMakananPage() {
    const { data: session } = useSession();
    const [makananList, setMakananList] = useState<MakananInduk[]>([]);
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [selectedKategori, setSelectedKategori] = useState<string>("Semua");
    const [searchMakanan, setSearchMakanan] = useState("");
    const [loading, setLoading] = useState(true);
    const [zoomedMakanan, setZoomedMakanan] = useState<MakananInduk | null>(null);

    useEffect(() => {
        Promise.allSettled([
            fetch("/api/makanan").then(r => r.json()),
            fetch("/api/user/favorit").then(r => r.json())
        ]).then(([makResult, favResult]) => {
            const makData = makResult.status === "fulfilled" ? makResult.value : [];
            const favData = favResult.status === "fulfilled" ? favResult.value : [];

            setMakananList(Array.isArray(makData) ? makData : []);
            setFavorites(Array.isArray(favData) ? favData : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const toggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>, makananId: number) => {
        e.stopPropagation();
        const existing = favorites.find(f => f.makananId === makananId);

        if (existing) {
            const res = await fetch(`/api/user/favorit/${existing.id}`, { method: "DELETE" });
            if (res.ok) {
                setFavorites(prev => prev.filter(f => f.id !== existing.id));
            }
            return;
        }

        const res = await fetch("/api/user/favorit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ makananId })
        });

        if (res.ok) {
            const created = await res.json();
            setFavorites(prev => [...prev, created]);
        }
    };

    const kategoriList = Array.from(new Set(makananList.map(m => m.kategori?.nama).filter(Boolean))) as string[];
    const normalizedSearch = searchMakanan.trim().toLowerCase();
    const filteredMakanan = makananList.filter(m => {
        const byKategori = selectedKategori === "Semua"
            ? true
            : selectedKategori === "Favorit"
                ? favorites.some(f => f.makananId === m.id)
                : m.kategori?.nama === selectedKategori;

        const bySearch = normalizedSearch
            ? m.nama.toLowerCase().includes(normalizedSearch)
            : true;

        return byKategori && bySearch;
    });

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <UserSidebar />

            <main className="flex-1 min-w-0 p-4 md:p-10 max-w-5xl space-y-6 pb-20 md:pb-10">
                {/* Header Navbar Khusus Mobile Biar Konsisten */}
                <div className="md:hidden flex items-center gap-3 mb-6">
                    <Link href="/dashboard/user" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 shadow-sm">
                        <ChevronLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Galeri Makanan</h1>
                </div>

                <div className="hidden md:block mb-8">
                    <h1 className="text-2xl font-extrabold text-gray-900">Galeri Porsi Makanan</h1>
                    <p className="text-gray-500 text-sm mt-1">Lihat dan simpan makanan beserta nilai gizinya</p>
                </div>

                {/* Filter & Search */}
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={searchMakanan}
                            onChange={(e) => setSearchMakanan(e.target.value)}
                            placeholder="Cari makanan..."
                            className="w-full bg-gray-50 border border-transparent rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD]/40 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Category Container - Teal Style like Screenshot */}
                    <div className="bg-[#00B9AD] rounded-[2.5rem] pt-6 pb-0 overflow-hidden shadow-lg shadow-[#00B9AD]/20">
                        <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x px-6">
                            {["Semua", "Favorit", ...kategoriList].map(kat => {
                                const isActive = selectedKategori === kat;
                                const IconComp = CATEGORY_ICONS[kat] || ImageIcon;
                                
                                return (
                                    <button
                                        key={kat}
                                        onClick={() => setSelectedKategori(kat)}
                                        className="flex flex-col items-center gap-2 shrink-0 transition-all relative group snap-start min-w-[64px] pt-2"
                                    >
                                        {isActive && (
                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-20 bg-white rounded-t-[2rem] z-0 animate-in slide-in-from-bottom-4 duration-300">
                                            </div>
                                        )}
                                        
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative z-10 shadow-sm ${
                                            isActive 
                                                ? "bg-[#00B9AD] text-white ring-4 ring-white" 
                                                : "bg-white text-[#00B9AD] group-hover:scale-105"
                                        }`}>
                                            <IconComp size={20} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        
                                        <span className={`text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors ${
                                            isActive ? "text-[#00B9AD]" : "text-white opacity-80"
                                        }`}>
                                          {kat}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 font-medium px-2">
                    <span>Menampilkan <strong className="text-gray-900">{filteredMakanan.length}</strong> menu</span>
                </div>

                {/* Grid Daftar Gambar Makanan */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
                    {loading ? (
                        <div className="col-span-full py-12 text-center flex flex-col items-center gap-3">
                             <div className="w-8 h-8 border-4 border-gray-200 border-t-[#00B9AD] rounded-full animate-spin"></div>
                             <span className="text-sm font-semibold text-gray-400">Memuat data galeri...</span>
                        </div>
                    ) : filteredMakanan.length > 0 ? (
                        filteredMakanan.map(m => (
                            <div
                                key={m.id}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group relative cursor-pointer hover:border-[#00B9AD]/50 hover:shadow-md transition-all"
                                onClick={() => setZoomedMakanan(m)}
                            >
                                <div className="h-32 w-full bg-gray-50 flex items-center justify-center relative overflow-hidden">
                                    {m.foto ? (
                                        <img src={m.foto} alt={m.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <ImageIcon size={28} className="text-gray-300" />
                                    )}
                                    <button
                                        onClick={(e) => toggleFavorite(e, m.id)}
                                        className={`absolute top-2 right-2 p-2 rounded-full shadow-md backdrop-blur-md transition-all z-10 ${
                                            favorites.some(f => f.makananId === m.id)
                                                ? "bg-red-500/10 text-red-500"
                                                : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
                                        }`}
                                    >
                                        <Heart size={16} fill={favorites.some(f => f.makananId === m.id) ? "currentColor" : "none"} />
                                    </button>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight" title={m.nama}>{m.nama}</div>
                                    <div className="text-[11px] text-gray-500 mt-2 line-clamp-1 leading-snug" title={m.porsi?.map(p => p.nama_porsi).join(", ") || "-"}>
                                        {m.porsi?.map(p => p.nama_porsi).join(", ") || "Data porsi belum ada"}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
                            <h3 className="text-gray-900 font-bold mb-1">Duh, kosong.</h3>
                            <p className="text-sm text-gray-500">Tidak ada menu yang cocok dengan pencarian atau filter.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Detail Porsi */}
            {zoomedMakanan && (
                <div
                    className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center sm:p-4 animate-in fade-in"
                    onClick={() => setZoomedMakanan(null)}
                >
                    <div
                        className="bg-white w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-64 md:h-80 w-full bg-gray-100 shrink-0">
                            {zoomedMakanan.foto ? (
                                <img src={zoomedMakanan.foto} alt={zoomedMakanan.nama} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={48} className="text-gray-300" />
                                </div>
                            )}
                            <button
                                onClick={(e) => toggleFavorite(e as any, zoomedMakanan.id)}
                                className={`absolute top-4 left-4 p-3 rounded-full shadow-lg backdrop-blur-md transition-all z-10 ${
                                    favorites.some(f => f.makananId === zoomedMakanan.id)
                                        ? "bg-red-500 text-white"
                                        : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
                                }`}
                            >
                                <Heart size={20} fill={favorites.some(f => f.makananId === zoomedMakanan.id) ? "currentColor" : "none"} />
                            </button>
                            <button
                                className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md z-10"
                                onClick={() => setZoomedMakanan(null)}
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                                <h3 className="text-2xl font-extrabold text-white leading-tight drop-shadow-md">{zoomedMakanan.nama}</h3>
                                {zoomedMakanan.kategori && (
                                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10 shadow-sm">
                                        {zoomedMakanan.kategori.nama}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50/50">
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Informasi Gizi per Porsi</h4>
                                {zoomedMakanan.porsi?.map((porsi) => (
                                    <div key={porsi.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-3 hover:border-[#00B9AD]/30 transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="font-extrabold text-gray-900">{porsi.nama_porsi}</div>
                                            <div className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{porsi.berat_gram}g</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded">Energi <span className="opacity-60 font-normal">|</span> {porsi.energi} kkal</span>
                                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">Karbo <span className="opacity-60 font-normal">|</span> {porsi.karbohidrat}g</span>
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Protein <span className="opacity-60 font-normal">|</span> {porsi.protein}g</span>
                                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-1 rounded">Lemak <span className="opacity-60 font-normal">|</span> {porsi.lemak}g</span>
                                            <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Serat <span className="opacity-60 font-normal">|</span> {porsi.serat}g</span>
                                        </div>
                                    </div>
                                ))}

                                {(!zoomedMakanan.porsi || zoomedMakanan.porsi.length === 0) && (
                                    <div className="p-6 text-center text-sm text-gray-400 italic bg-white rounded-2xl border border-dashed border-gray-200">
                                        Belum ada data nilai gizi untuk menu ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}