"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft, Search, Plus, Trash2, CheckCircle2,
  ChevronDown, Loader2
} from "lucide-react";
import type { FoodRecord, MakananItem, WaktuMakan, AsalMakanan, CaraPengolahan } from "@/lib/types";
import makananData from "../../../../../data/makanan.json";

const makanan: MakananItem[] = makananData as MakananItem[];

const WAKTU_OPTIONS: WaktuMakan[] = ["Pagi", "Snack Pagi", "Siang", "Snack Siang", "Malam", "Snack Malam"];
const CARA_OPTIONS: CaraPengolahan[] = ["Goreng", "Kukus", "Rebus (air)", "Rebus (santan)", "Bakar", "Pan", "Panggang", "Tumis", "Air Fryer", "Tidak diolah"];
const ASAL_OPTIONS: AsalMakanan[] = ["Memasak sendiri", "Membeli"];

export default function FoodRecordPage() {
  const [records, setRecords] = useState<FoodRecord[]>([]);
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
  const [selectedMakanan, setSelectedMakanan] = useState<MakananItem | null>(null);
  const [selectedUrt, setSelectedUrt] = useState("");
  const [jumlahUrt, setJumlahUrt] = useState(1);
  const [showMakananList, setShowMakananList] = useState(false);

  useEffect(() => {
    fetch("/api/food-record")
      .then(r => r.json())
      .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredMakanan = useMemo(() => {
    if (!searchMakanan.trim()) return makanan.slice(0, 15);
    const q = searchMakanan.toLowerCase();
    return makanan.filter(m => m.nama.toLowerCase().includes(q)).slice(0, 20);
  }, [searchMakanan]);

  const recordsByHari = records.filter(r => r.hari === hari);

  async function handleTambah() {
    if (!selectedMakanan || !selectedUrt) return;
    setSaving(true);
    const body = {
      tanggal,
      hari,
      waktuMakan,
      jamMakan,
      asalMakanan,
      makananId: selectedMakanan.id,
      namaMakanan: selectedMakanan.nama,
      urt: `${jumlahUrt}x ${selectedUrt}`,
      jumlahUrt,
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
      setSelectedUrt("");
      setSearchMakanan("");
      setJumlahUrt(1);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/food-record/${id}`, { method: "DELETE" });
    if (res.ok) setRecords(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 shadow-sm">
        <Link href="/dashboard/user" className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-bold text-gray-900 text-base">Estimated Food Record</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Pilih Hari */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-3">Pilih Hari Pencatatan</label>
          <div className="flex gap-2 flex-wrap">
            {[1,2,3,4,5,6,7].map(h => (
              <button key={h} onClick={() => setHari(h)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all
                  ${hari === h ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"}`}>
                {h}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tanggal</label>
            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
        </div>

        {/* Form Input Makanan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Tambah Item Makanan — Hari {hari}</h2>

          {/* Waktu Makan */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Waktu Makan</label>
            <div className="flex flex-wrap gap-2">
              {WAKTU_OPTIONS.map(w => (
                <button key={w} onClick={() => setWaktuMakan(w)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                    ${waktuMakan === w ? "bg-primary text-white" : "bg-gray-50 text-gray-600 border border-gray-100 hover:border-primary/30"}`}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Jam */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Jam Makan</label>
              <input type="time" value={jamMakan} onChange={e => setJamMakan(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Asal Makanan</label>
              <div className="relative">
                <select value={asalMakanan} onChange={e => setAsalMakanan(e.target.value as AsalMakanan)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none bg-white">
                  {ASAL_OPTIONS.map(a => <option key={a}>{a}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Pilih Makanan */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cari Makanan</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchMakanan}
                onChange={e => { setSearchMakanan(e.target.value); setShowMakananList(true); }}
                onFocus={() => setShowMakananList(true)}
                placeholder="Cth: Nasi, Ayam, Tempe..."
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>
            {showMakananList && (
              <div className="mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredMakanan.map(m => (
                  <button key={m.id} onClick={() => {
                    setSelectedMakanan(m);
                    setSearchMakanan(m.nama);
                    setSelectedUrt(m.urt[0] ?? "");
                    setShowMakananList(false);
                  }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{m.nama}</div>
                      <div className="text-xs text-gray-400">{m.kategori} · {m.energi} kkal/100g</div>
                    </div>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 font-semibold transition-opacity">Pilih</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pilih URT */}
          {selectedMakanan && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Porsi (URT)</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {selectedMakanan.urt.map(u => (
                  <button key={u} onClick={() => setSelectedUrt(u)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                      ${selectedUrt === u ? "bg-primary text-white" : "bg-gray-50 text-gray-600 border border-gray-100 hover:border-primary/30"}`}>
                    {u}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <label className="text-xs font-semibold text-gray-500">Jumlah:</label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100 px-3 py-1.5">
                  <button onClick={() => setJumlahUrt(j => Math.max(0.5, j - 0.5))} className="text-gray-500 hover:text-primary font-bold text-lg leading-none">−</button>
                  <span className="text-sm font-bold text-gray-900 min-w-8 text-center">{jumlahUrt}</span>
                  <button onClick={() => setJumlahUrt(j => j + 0.5)} className="text-gray-500 hover:text-primary font-bold text-lg leading-none">+</button>
                </div>
              </div>
            </div>
          )}

          {/* Cara Pengolahan */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cara Pengolahan</label>
            <div className="flex flex-wrap gap-2">
              {CARA_OPTIONS.map(c => (
                <button key={c} onClick={() => setCaraPengolahan(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                    ${caraPengolahan === c ? "bg-primary text-white" : "bg-gray-50 text-gray-600 border border-gray-100 hover:border-primary/30"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tambah */}
          <button onClick={handleTambah} disabled={!selectedMakanan || !selectedUrt || saving}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={18} /> Tambahkan</>}
          </button>
        </div>

        {/* List Record Hari Ini */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Catatan Hari {hari} ({recordsByHari.length} item)</h3>
          {loading ? (
            <div className="text-center text-gray-400 py-8 text-sm">Memuat...</div>
          ) : recordsByHari.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center text-sm text-gray-400">
              Belum ada catatan untuk Hari {hari}
            </div>
          ) : (
            <div className="space-y-2">
              {recordsByHari.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{r.namaMakanan}</div>
                    <div className="text-xs text-gray-500">{r.waktuMakan} · {r.jamMakan} · {r.urt} · {r.caraPengolahan}</div>
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0 p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
