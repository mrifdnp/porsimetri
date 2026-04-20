"use client";

import { useEffect, useState, useMemo } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  Search, Plus, Trash2, X, Loader2, 
  UtensilsCrossed, Zap, ChevronDown, Filter, ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MakananItem } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function AdminMakananPage() {
  const [makanan, setMakanan] = useState<MakananItem[]>([]);
  const [kategoriList, setKategoriList] = useState<{id: number, nama: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama: "", kategori: "1", jenis: "Bahan Makanan",
    energi: "", protein: "", karbohidrat: "", lemak: "", serat: "",
    urt: "", satuanGram: "100"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoFile(e.target.files[0]);
      setPreviewURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async () => {
    if (!form.nama) return alert("Nama makanan wajib diisi");
    
    setSaving(true);
    let fotoUrl = null;

    if (fotoFile) {
      const ext = fotoFile.name.split(".").pop();
      const fileName = `makanan_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("makanan_images")
        .upload(fileName, fotoFile);

      if (uploadError) {
        alert("Gagal upload foto: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("makanan_images")
        .getPublicUrl(uploadData.path);
        
      fotoUrl = urlData.publicUrl;
    }

    const payload = {
      nama: form.nama,
      kategori_id: Number(form.kategori),
      jenis: form.jenis,
      energi: Number(form.energi) || 0,
      protein: Number(form.protein) || 0,
      karbohidrat: Number(form.karbohidrat) || 0,
      lemak: Number(form.lemak) || 0,
      serat: Number(form.serat) || 0,
      satuanGram: Number(form.satuanGram) || 100,
      urt: form.urt.split("\n").filter(Boolean),
      foto: fotoUrl
    };

    try {
      const res = await fetch("/api/makanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");
      
      const newItem = await res.json();
      setMakanan(prev => [...prev, newItem]);
      setShowForm(false);
      setForm({ nama: "", kategori: kategoriList.length > 0 ? kategoriList[0].id.toString() : "1", jenis: "Bahan Makanan", energi: "", protein: "", karbohidrat: "", lemak: "", serat: "", urt: "", satuanGram: "100" });
      setFotoFile(null);
      setPreviewURL(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/makanan").then(r => r.json()),
      supabase.from("kategori_makanan").select("*").order("id", { ascending: true })
    ]).then(([dbMakanan, { data: dbKategori }]) => {
      setMakanan(Array.isArray(dbMakanan) ? dbMakanan : []);
      setKategoriList(dbKategori || []);
      if (dbKategori && dbKategori.length > 0) {
        setForm(prev => ({ ...prev, kategori: dbKategori[0].id.toString() }));
      }
      }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return makanan.filter(m => m.nama.toLowerCase().includes(q));
  }, [makanan, search]);

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-[#00B9AD]/20 font-sans">
      <AdminSidebar />

      <main className="flex-1 min-w-0">
        {/* Top Header Section */}
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Master Makanan</h1>
            <p className="text-sm text-slate-400 font-medium">Data Terpusat TKPI & Nilai Gizi Makro</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00B9AD] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari item..."
                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#00B9AD]/10 focus:border-[#00B9AD] w-64 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                showForm ? "bg-slate-900 text-white shadow-slate-900/20" : "bg-[#00B9AD] text-white shadow-[#00B9AD]/30 hover:scale-105 active:scale-95"
              }`}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Batal" : "Tambah Item"}
            </button>
          </div>
        </header>

        <div className="p-10">
          {/* Form Section */}
          <AnimatePresence>
            {showForm && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 mb-10 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Makanan</label>
                        <input name="nama" value={form.nama} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00B9AD] focus:bg-white rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kategori</label>
                        <select name="kategori" value={form.kategori} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00B9AD] rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all">
                            <option value="">Pilih Kategori</option>
                              {kategoriList.map((k: any) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    {/* Input Foto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Foto Makanan</label>
                        <label className="flex items-center gap-3 cursor-pointer w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#00B9AD] hover:bg-[#00B9AD]/5 rounded-2xl px-5 py-3 text-sm font-bold transition-all">
                          <ImageIcon size={18} className="text-slate-400" />
                          <span className="text-slate-500">{fotoFile ? fotoFile.name : "Pilih gambar..."}</span>
                          <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                        </label>
                      </div>
                      <div className="space-y-1.5 flex items-end">
                        {previewURL && (
                          <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200">
                            <img src={previewURL} alt="Preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      {[ 
                        { k: "energi", l: "Energi" }, 
                        { k: "protein", l: "Prot" }, 
                        { k: "karbohidrat", l: "Carb" }, 
                        { k: "lemak", l: "Fat" }, 
                        { k: "serat", l: "Fiber" }
                      ].map(field => (
                        <div key={field.k} className="space-y-1.5 text-center">
                          <label className="text-[9px] font-black uppercase text-slate-400">{field.l}</label>
                          <input type="number" name={field.k} value={form[field.k as keyof typeof form]} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00B9AD] text-center rounded-xl py-3 text-sm font-bold outline-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-6 flex flex-col justify-between border border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 text-center block">Saji (URT)</label>
                      <textarea name="urt" value={form.urt} onChange={handleChange} rows={3} placeholder="1 Piring (200g)&#10;1 Centong (100g)" className="w-full bg-white border-2 border-transparent focus:border-[#00B9AD] rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all" />
                    </div>
                    <button 
                      onClick={handleSubmit} 
                      disabled={saving}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4 hover:bg-[#00B9AD] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
                    >
                      {saving ? <><Loader2 size={14} className="animate-spin" /> MENGUNGGAH...</> : "SIMPAN DATA"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Area */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Informasi Dasar</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 text-center">Energi</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 text-center">Makro Gizi</th>
                  <th className="px-8 py-5 border-b border-slate-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-300 uppercase text-[10px] font-black tracking-widest animate-pulse">Sinkronisasi Data...</td></tr>
                ) : filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#00B9AD] border border-slate-100 group-hover:scale-110 transition-transform shadow-inner overflow-hidden">
                          {m.foto ? <img src={m.foto} alt={m.nama} className="w-full h-full object-cover" /> : <UtensilsCrossed size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#00B9AD] transition-colors">{m.nama}</p>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded mt-1 inline-block tracking-tighter">
                            {m.kategori?.nama || m.kategori_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <p className="text-xl font-black text-slate-900 leading-none">{m.energi}</p>
                      <span className="text-[8px] font-black text-slate-400 uppercase">Kkal</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center gap-6">
                        {[{v: m.protein, l: 'P'}, {v: m.karbohidrat, l: 'C'}, {v: m.lemak, l: 'F'}].map((g, i) => (
                          <div key={i} className="text-center">
                            <p className="text-sm font-bold text-slate-900">{g.v}g</p>
                            <p className="text-[7px] font-black text-slate-400 uppercase leading-none">{g.l}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}