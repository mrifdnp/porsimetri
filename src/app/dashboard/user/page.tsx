"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
    Home, ClipboardList, BarChart3, LogOut, User,
    Heart, PlusCircle, CheckCircle2, Clock, ImageIcon, X, Search, SlidersHorizontal
} from "lucide-react";
import type { FoodRecord, MakananInduk, UserFavorite } from "@/lib/types";
import Image from "next/image";
import UserSidebar from "@/components/UserSidebar";

const HARI_LABEL = ["Hari 1", "Hari 2", "Hari 3", "Hari 4", "Hari 5", "Hari 6", "Hari 7"];

export default function UserDashboard() {
    const { data: session } = useSession();
    const [records, setRecords] = useState<FoodRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [makananInduk, setMakananInduk] = useState<MakananInduk[]>([]);
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [searchMakanan, setSearchMakanan] = useState("");
    const [selectedKategori, setSelectedKategori] = useState("Semua");
    const [zoomedMakanan, setZoomedMakanan] = useState<MakananInduk | null>(null);

    useEffect(() => {
        // Fetch food records
        fetch("/api/food-record")
            .then(r => r.json())
            .then(recData => {
                setRecords(Array.isArray(recData) ? recData : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch master makanan
        fetch("/api/makanan")
            .then(r => r.json())
            .then(data => setMakananInduk(Array.isArray(data) ? data : []));
        
        // Fetch favorites
        fetch("/api/user/favorit")
            .then(r => r.json())
            .then(data => setFavorites(Array.isArray(data) ? data : []));
    }, []);

    const toggleFavorite = async (e: React.MouseEvent, makananId: number) => {
        e.stopPropagation();
        const isFav = favorites.some(f => f.makananId === makananId);
        
        try {
            const res = await fetch("/api/user/favorit", {
                method: isFav ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ makananId })
            });

            if (res.ok) {
                if (isFav) {
                    setFavorites(prev => prev.filter(f => f.makananId !== makananId));
                } else {
                    const newFav = await res.json();
                    setFavorites(prev => [...prev, newFav]);
                }
            }
        } catch (err) {
            console.error("Gagal toggle favorite:", err);
        }
    };

    const kategoriList = Array.from(new Set(makananInduk.map(m => m.kategori?.nama).filter(Boolean))) as string[];

    const filteredMakanan = makananInduk.filter(m => {
        const matchesSearch = m.nama.toLowerCase().includes(searchMakanan.toLowerCase());
        if (selectedKategori === "Semua") return matchesSearch;
        if (selectedKategori === "Favorit") {
            return matchesSearch && favorites.some(f => f.makananId === m.id);
        }
        return matchesSearch && m.kategori?.nama === selectedKategori;
    });

    const hariDiisi = new Set(records.map(r => r.hari)).size;
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = records.filter(r => r.tanggal === today);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-20 md:pb-0">
            <UserSidebar />

            {/* Mobile Topbar */}
            <nav className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 relative shrink-0">
                        <Image 
                            src="/logo-kemenkes-color.png" 
                            alt="Logo Kemenkes"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="font-bold text-xl tracking-tighter">
                        <span className="text-[#60C0D0]">Porsi</span>
                        <span className="text-[#74D58C] -ml-0.5">Metri</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/profile" className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-primary font-semibold group transition-all">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={16} className="text-primary" />
                        </div>
                        {session?.user?.name}
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50">
                        <LogOut size={15} /> <span className="hidden md:block">Keluar</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 min-w-0 px-4 md:px-8 py-8 w-full max-w-5xl mx-auto space-y-8">
                {/* Salam */}
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        Halo, {session?.user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Pantau asupan gizi harianmu di sini</p>
                </div>

                {/* Progress 7 Hari */}
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-6 mb-6 shadow-lg shadow-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-white/80 text-sm font-medium mb-0.5">Progress Pencatatan</div>
                            <div className="text-2xl font-extrabold">{hariDiisi} / 7 Hari</div>
                        </div>
                        <div className="w-14 h-14 rounded-full border-4 border-white/30 flex items-center justify-center">
                            <span className="text-xl font-extrabold">{Math.round((hariDiisi / 7) * 100)}%</span>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        {HARI_LABEL.map((_, i) => {
                            const filled = records.some(r => r.hari === i + 1);
                            return (
                                <div key={i} className={`flex-1 h-2.5 rounded-full transition-all
                  ${filled ? "bg-white" : "bg-white/25"}`} />
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-1.5">
                        {HARI_LABEL.map((l, i) => (
                            <span key={i} className="text-[9px] text-white/70 font-semibold">{i + 1}</span>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Link href="/dashboard/user/food-record"
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all">
                            <PlusCircle size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">Tambah Catatan</div>
                            <div className="text-xs text-gray-500 mt-0.5">Input makanan yang dikonsumsi</div>
                        </div>
                    </Link>
                    <Link href="/dashboard/user/hasil"
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">Lihat Hasil</div>
                            <div className="text-xs text-gray-500 mt-0.5">Grafik & analisis asupan gizi</div>
                        </div>
                    </Link>
                </div>

                {/* Galeri Menu / Porsi */}
                <div className="mb-6" id="galeri">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-gray-900">Galeri Porsi Makanan</h2>
                        <span className="text-[11px] text-gray-500 font-semibold">{filteredMakanan.length} menu</span>
                    </div>
                    <div className="mb-3 flex gap-2">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchMakanan}
                                onChange={(e) => setSearchMakanan(e.target.value)}
                                placeholder="Cari makanan..."
                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-sm"
                            />
                        </div>
                        <button className="w-10 h-10 shrink-0 bg-[#CDD729] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#CDD729]/20 hover:scale-105 active:scale-95 transition-all">
                            <Search size={18} />
                        </button>
                    </div>
                    {/* List Kategori Makanan - Bisa distroll horizontal */}
                    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x">
                        <button
                            onClick={() => setSelectedKategori("Semua")}
                            className={`px-4 py-2 shrink-0 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm snap-start ${
                                   selectedKategori === "Semua"
                                    ? "bg-primary text-white ring-2 ring-primary/10"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-slate-300"
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setSelectedKategori("Favorit")}
                            className={`px-4 py-2 shrink-0 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm snap-start flex items-center gap-1.5 ${
                                selectedKategori === "Favorit"
                                    ? "bg-red-500 text-white ring-2 ring-red-500/20"
                                    : "bg-white text-red-500 border border-gray-100 hover:border-red-200 hover:bg-red-50"
                            }`}
                        >
                            <Heart size={14} fill={selectedKategori === "Favorit" ? "currentColor" : "none"} /> Favorit
                        </button>
                        {kategoriList.map(kat => (
                            <button
                                key={kat}
                                onClick={() => setSelectedKategori(kat)}
                                className={`px-4 py-2 shrink-0 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm snap-start ${
                                    kat === selectedKategori 
                                        ? "bg-primary text-white ring-2 ring-primary/20" 
                                        : "bg-white text-gray-600 border border-gray-100 hover:border-primary/40 hover:bg-primary/5"
                                }`}
                            >
                                {kat}
                            </button>
                        ))}
                    </div>

                    {/* Grid Daftar Gambar Makanan */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                        {loading ? (
                            <div className="col-span-full py-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                Memuat galeri...
                            </div>
                        ) : filteredMakanan.length > 0 ? (
                            filteredMakanan.map(m => (
                                <div
                                    key={m.id}
                                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group relative cursor-pointer hover:border-primary/50 transition-all"
                                    onClick={() => setZoomedMakanan(m)}
                                >
                                    <div className="h-28 w-full bg-gray-50 flex items-center justify-center relative overflow-hidden">
                                        {m.foto ? (
                                            <img src={m.foto} alt={m.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <ImageIcon size={24} className="text-gray-300" />
                                        )}
                                        <button
                                            onClick={(e) => toggleFavorite(e, m.id)}
                                            className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition-all z-10 ${
                                                favorites.some(f => f.makananId === m.id)
                                                    ? "bg-red-500/10 text-red-500"
                                                    : "bg-white/60 text-gray-400 hover:text-red-500 hover:bg-white"
                                            }`}
                                        >
                                            <Heart size={16} fill={favorites.some(f => f.makananId === m.id) ? "currentColor" : "none"} />
                                        </button>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div className="p-3">
                                        <div className="font-bold text-gray-900 text-xs truncate" title={m.nama}>{m.nama}</div>
                                        <div className="text-[10px] text-gray-500 mt-1 truncate" title={m.porsi?.map(p => p.nama_porsi).join(", ") || "-"}>
                                            {m.porsi?.map(p => p.nama_porsi).join(", ") || "-"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                                Tidak ada menu yang cocok dengan filter/pencarian.
                            </div>
                        )}
                    </div>
                </div>

                {/* Catatan Hari Ini */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-gray-900">Catatan Hari Ini</h2>
                        <Link href="/dashboard/user/food-record" className="text-xs text-primary font-semibold hover:underline">Lihat Semua</Link>
                    </div>
                    {loading ? (
                        <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center text-gray-400 text-sm">Memuat...</div>
                    ) : todayRecords.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center">
                            <Clock size={32} className="text-gray-200 mx-auto mb-3" />
                            <div className="text-sm text-gray-500 font-medium">Belum ada catatan hari ini</div>
                            <Link href="/dashboard/user/food-record"
                                className="inline-block mt-4 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm">
                                + Tambah Sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {todayRecords.map(r => (
                                <div key={r.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-gray-900 truncate">{r.namaMakanan}</div>
                                        <div className="text-xs text-gray-500">{r.waktuMakan} · {r.jamMakan} · {r.urt}</div>
                                    </div>
                                    <span className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-500 font-medium shrink-0">{r.caraPengolahan}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>



            {/* Modal Detail Porsi */}
            {zoomedMakanan && (
                <div
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center sm:p-4 animate-in fade-in"
                    onClick={() => setZoomedMakanan(null)}
                >
                    <div
                        className="bg-white w-full max-w-lg md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-64 md:h-72 w-full bg-gray-100 shrink-0">
                            {zoomedMakanan.foto ? (
                                <img src={zoomedMakanan.foto} alt={zoomedMakanan.nama} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={48} className="text-gray-300" />
                                </div>
                            )}
                            <button
                                onClick={(e) => toggleFavorite(e as any, zoomedMakanan.id)}
                                className={`absolute top-4 left-4 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all z-10 ${
                                    favorites.some(f => f.makananId === zoomedMakanan.id)
                                        ? "bg-red-500 text-white"
                                        : "bg-white/70 text-gray-400 hover:text-red-500 hover:bg-white"
                                }`}
                            >
                                <Heart size={20} fill={favorites.some(f => f.makananId === zoomedMakanan.id) ? "currentColor" : "none"} />
                            </button>
                            <button
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md z-10"
                                onClick={() => setZoomedMakanan(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-6">
                                <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{zoomedMakanan.nama}</h3>
                                {zoomedMakanan.kategori && (
                                    <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">
                                        {zoomedMakanan.kategori.nama}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pilihan Porsi</h4>
                                {zoomedMakanan.porsi?.map((porsi) => (
                                    <div key={porsi.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="font-bold text-gray-900 text-sm">{porsi.nama_porsi}</div>
                                            <div className="text-xs text-gray-500">{porsi.berat_gram}g</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded">Energi: {porsi.energi} kkal</span>
                                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">Karbo: {porsi.karbohidrat}g</span>
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Protein: {porsi.protein}g</span>
                                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-1 rounded">Lemak: {porsi.lemak}g</span>
                                            <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Serat: {porsi.serat}g</span>
                                        </div>
                                    </div>
                                ))}

                                {(!zoomedMakanan.porsi || zoomedMakanan.porsi.length === 0) && (
                                    <div className="text-sm text-gray-400 italic">Data porsi belum tersedia.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
