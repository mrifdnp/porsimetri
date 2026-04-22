"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search, Plus, Trash2, CheckCircle2,
  ChevronDown, Loader2, ClipboardList, ImageIcon, Heart
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import type { FoodRecord, MakananInduk, MakananPorsi, WaktuMakan, AsalMakanan, CaraPengolahan, UserFavorite } from "@/lib/types";

const WAKTU_OPTIONS: WaktuMakan[] = ["Pagi", "Snack Pagi", "Siang", "Snack Siang", "Malam", "Snack Malam"];
const CARA_OPTIONS: CaraPengolahan[] = ["Goreng", "Kukus", "Rebus (air)", "Rebus (santan)", "Bakar", "Pan", "Panggang", "Tumis", "Air Fryer", "Tidak diolah"];  
const ASAL_OPTIONS: AsalMakanan[] = ["Memasak sendiri", "Membeli"];

export default function FoodRecordPage() {
  const [makananList, setMakananList] = useState<MakananInduk[]>([]);
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [hari, setHari] = useState(1);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [waktuMakan, setWaktuMakan] = useState<WaktuMakan>("Pagi");
  const [jamMakan, setJamMakan] = useState("07:00");
  const [asalMakanan, setAsalMakanan] = useState<AsalMakanan>("Memasak sendiri");
  const [caraPengolahan, setCaraPengolahan] = useState<CaraPengolahan>("Tidak diolah");
  const [searchMakanan, setSearchMakanan] = useState("");
  const [selectedMakanan, setSelectedMakanan] = useState<MakananInduk | null>(null);
  const [selectedPorsi, setSelectedPorsi] = useState<MakananPorsi | null>(null);
  const [showPilihMakanan, setShowPilihMakanan] = useState(false);
  const [kategoriFilter, setKategoriFilter] = useState<string | number>("Semua");

  useEffect(() => {
    Promise.all([
      fetch("/api/food-record").then(r => r.json()),
      fetch("/api/makanan").then(r => r.json()),
      fetch("/api/user/favorit").then(r => r.json())
    ])
      .then(([dbRecords, dbMakanan, dbFavorites]) => {
        setRecords(Array.isArray(dbRecords) ? dbRecords : []);
        setMakananList(Array.isArray(dbMakanan) ? dbMakanan : []);
        setFavorites(Array.isArray(dbFavorites) ? dbFavorites : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const unique = new Map<number, string>();
    makananList.forEach(m => {
        if (m.kategori) unique.set(m.kategori.id, m.kategori.nama);
    });
    return Array.from(unique.entries()).map(([id, nama]) => ({ id, nama }));
  }, [makananList]);

  const filteredMakanan = useMemo(() => {
    let filtered = makananList;
    
    if (kategoriFilter === "Favorit") {
      const favIds = favorites.map(f => f.makananId);
      filtered = filtered.filter(m => favIds.includes(m.id));
    } else if (kategoriFilter !== "Semua") {
      filtered = filtered.filter(m => m.kategori_id === kategoriFilter as number);
    }

    if (searchMakanan.trim()) {
      const q = searchMakanan.toLowerCase();
      filtered = filtered.filter(m => m.nama.toLowerCase().includes(q));
    }

    return filtered;
  }, [searchMakanan, makananList, kategoriFilter, favorites]);

  const recordsByHari = records.filter(r => r.hari === hari);

  async function handleTambah() {
    if (!selectedMakanan || !selectedPorsi) return;
    setSaving(true);
    const body = {
      tanggal,
      hari,
      waktuMakan,
      jamMakan,
      asalMakanan,
      makananId: selectedMakanan.id,
      porsiId: selectedPorsi.id,
      namaMakanan: selectedMakanan.nama,
      namaPorsi: selectedPorsi.nama_porsi,
      caraPengolahan,
    };
    const res = await fetch("/api/food-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const newRecord = await res.json();
      setRecords(prev => [...prev, newRecord]);
      setSelectedMakanan(null);
      setSelectedPorsi(null);
      setSearchMakanan("");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/food-record/${id}`, { method: "DELETE" });
    if (res.ok) setRecords(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <UserSidebar />

      <main className="flex-1 min-w-0 p-10 max-w-5xl">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Estimated Food Record</h1>
          <p className="text-slate-400 font-medium">Catat makanan harian selama 7 hari pencatatan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Pilih Hari */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pilih Hari Pencatatan</h2>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7].map(h => (
                  <button key={h} onClick={() => setHari(h)}
                    className={`w-12 h-12 rounded-2xl font-black text-sm transition-all
                      ${hari === h ? "bg-[#00B9AD] text-white shadow-lg shadow-[#00B9AD]/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"}`}>
                    {h}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tanggal</label>
                <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                  className="border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] transition-all" />
              </div>
            </div>

            {/* Form Input Makanan */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Tambah Item — Hari {hari}</h2>

              {/* Waktu Makan */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Waktu Makan</label>
                <div className="flex flex-wrap gap-2">
                  {WAKTU_OPTIONS.map(w => (
                    <button key={w} onClick={() => setWaktuMakan(w)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
                        ${waktuMakan === w ? "bg-[#00B9AD] text-white shadow-lg shadow-[#00B9AD]/20" : "bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100"}`}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jam & Asal */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Jam Makan</label>
                  <input type="time" value={jamMakan} onChange={e => setJamMakan(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] transition-all" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Asal Makanan</label>
                  <div className="relative">
                    <select value={asalMakanan} onChange={e => setAsalMakanan(e.target.value as AsalMakanan)}
                      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] transition-all appearance-none bg-white">
                      {ASAL_OPTIONS.map(a => <option key={a}>{a}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Cari Makanan */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Pilih Makanan</label>
                <div 
                  className="flex items-center justify-between w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 cursor-pointer hover:bg-slate-50 transition-all"
                  onClick={() => setShowPilihMakanan(!showPilihMakanan)}
                >
                  <span className={selectedMakanan ? "text-slate-900" : "text-slate-400"}>
                    {selectedMakanan ? selectedMakanan.nama : "Cari dan pilih makanan..."}
                  </span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${showPilihMakanan ? "rotate-180" : ""}`} />
                </div>

                {showPilihMakanan && (
                  <div className="mt-3 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    {/* Kategori Makanan */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto scrollbar-hide">
                      <button 
                        onClick={() => setKategoriFilter("Semua")}
                        className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${kategoriFilter === "Semua" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                      >
                        Semua
                      </button>
                      <button 
                        onClick={() => setKategoriFilter("Favorit")}
                        className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${kategoriFilter === "Favorit" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                      >
                        <Heart size={12} className={kategoriFilter === "Favorit" ? "fill-white" : "text-rose-500"} /> Favorit
                      </button>
                      {categories.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setKategoriFilter(c.id)}
                          className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${kategoriFilter === c.id as number ? "bg-[#00B9AD] text-white shadow-md shadow-[#00B9AD]/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                        >
                          {c.nama}
                        </button>
                      ))}
                    </div>

                    {/* Input Pencarian */}
                    <div className="p-4 border-b border-slate-100 relative">
                      <Search size={15} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchMakanan}
                        onChange={e => setSearchMakanan(e.target.value)}
                        placeholder="Cari makanan yang dipilih..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] transition-all placeholder:text-slate-400" 
                      />
                    </div>

                    {/* Hasil Pencarian */}
                    <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-1 gap-2">
                      {filteredMakanan.slice(0, 30).map(m => (
                        <button key={m.id} onClick={() => {
                          setSelectedMakanan(m);
                          setSearchMakanan("");
                          setSelectedPorsi(m.porsi && m.porsi.length > 0 ? m.porsi[0] : null);
                          setShowPilihMakanan(false);
                        }} className="w-full text-left px-3 py-3 rounded-xl border border-slate-100 hover:border-[#00B9AD]/50 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {m.foto ? <img src={m.foto} alt={m.nama} className="w-full h-full object-cover" /> : <div className="text-[8px] text-slate-400 font-black uppercase tracking-wider text-center leading-tight">NO<br/>PIC</div>}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 group-hover:text-[#00B9AD] transition-colors">{m.kode ? m.kode + " - " : ""}{m.nama}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{m.kategori?.nama || "Tanpa kategori"} · {m.porsi?.length || 0} Porsi Variant</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#00B9AD] opacity-0 group-hover:opacity-100 font-black uppercase tracking-widest transition-opacity px-3 py-1 bg-[#00B9AD]/10 rounded-lg">Pilih</span>
                        </button>
                      ))}
                      {filteredMakanan.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-sm font-medium">Makanan tidak ditemukan</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Makanan & Pilih URT / Porsi */}
              {selectedMakanan && (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Foto Makanan */}
                  <div className="w-full md:w-32 xl:w-40 aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {selectedMakanan.foto ? (
                      <img src={selectedMakanan.foto} alt={selectedMakanan.nama} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center opacity-50">
                        <ImageIcon size={24} className="text-slate-400 mb-2" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Varian Porsi */}
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Varian Porsi</label>
                    {selectedMakanan.porsi && selectedMakanan.porsi.length > 0 ? (
                      <div className="flex gap-2 flex-wrap mb-3">
                        {selectedMakanan.porsi.map(p => (
                          <button key={p.id} onClick={() => setSelectedPorsi(p)}
                            className={`px-4 py-3 rounded-2xl text-[11px] font-bold transition-all text-left flex-1 min-w-[140px]
                              ${selectedPorsi?.id === p.id ? "bg-[#00B9AD] text-white shadow-lg shadow-[#00B9AD]/20 border-2 border-[#00B9AD]" : "bg-slate-50 text-slate-600 border-2 border-slate-100 hover:border-[#00B9AD] hover:bg-white"}`}>
                            <span className="block">{p.nama_porsi}</span>
                            <span className={`block mt-1 text-[9px] ${selectedPorsi?.id === p.id ? "text-white/80" : "text-slate-400"}`}>{p.berat_gram}g · {p.energi} kkal</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] font-medium text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">Makanan ini belum memiliki data porsi. Hubungi admin.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Cara Pengolahan */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Cara Pengolahan</label>
                <div className="flex flex-wrap gap-2">
                  {CARA_OPTIONS.map(c => (
                    <button key={c} onClick={() => setCaraPengolahan(c)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
                        ${caraPengolahan === c ? "bg-[#00B9AD] text-white shadow-lg shadow-[#00B9AD]/20" : "bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tambah Button */}
              <button onClick={handleTambah} disabled={!selectedMakanan || !selectedPorsi || saving}
                className="w-full bg-[#00B9AD] text-white font-black py-4 rounded-2xl hover:bg-[#00a69b] disabled:opacity-50 transition-all shadow-lg shadow-[#00B9AD]/20 flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={18} /> Tambahkan</>}
              </button>
            </div>
          </div>

          {/* Records List - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#00B9AD] flex items-center justify-center text-white shadow-lg shadow-[#00B9AD]/20">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">Hari {hari}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{recordsByHari.length} item tercatat</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-10"><Loader2 className="animate-spin inline text-slate-200" /></div>
              ) : recordsByHari.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400 italic border-2 border-dashed border-slate-100 rounded-2xl">
                  Belum ada catatan untuk Hari {hari}
                </div>
              ) : (
                <div className="space-y-3">
                  {recordsByHari.map(r => {
                    const foto = makananList.find(m => m.id === r.makananId)?.foto;
                    return (
                    <div key={r.id} className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3 group hover:border-[#00B9AD]/30 transition-all">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center">
                          {foto ? <img src={foto} alt={r.namaMakanan} className="w-full h-full object-cover" /> : <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider text-center leading-tight">NO<br/>PIC</div>}
                        </div>
                        <CheckCircle2 size={16} className="text-[#00B9AD] absolute -bottom-1 -right-1 bg-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate group-hover:text-[#00B9AD] transition-colors">{r.namaMakanan}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{r.waktuMakan} · {r.jamMakan} · {r.namaPorsi || r.urt || "-"} · {r.caraPengolahan}</div>
                      </div>
                      <button onClick={() => handleDelete(r.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-2 rounded-xl hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
