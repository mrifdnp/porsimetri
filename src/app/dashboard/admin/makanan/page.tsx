"use client";

import { useEffect, useState, useMemo } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  Search, Plus, Trash2, X, Loader2, 
  UtensilsCrossed, ImageIcon, Pencil, ListPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MakananInduk, MakananPorsi } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export default function AdminMakananPage() {
  const [makanan, setMakanan] = useState<MakananInduk[]>([]);
  const [kategoriList, setKategoriList] = useState<{id: number, nama: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  
  const defaultForm = {
    kode: "", nama: "", kategori: "1", keterangan: ""
  };
  const [form, setForm] = useState(defaultForm);
  const [porsiList, setPorsiList] = useState<Partial<MakananPorsi>[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePorsiChange = (index: number, field: string, value: string) => {
    const list = [...porsiList];
    (list[index] as any)[field] = value;
    setPorsiList(list);
  };

  const addPorsiRow = () => {
    setPorsiList(prev => [...prev, {
      kode_porsi: "", nama_porsi: "", berat_gram: 100, energi: 0, protein: 0, lemak: 0, karbohidrat: 0, serat: 0
    }]);
  };

  const removePorsiRow = (index: number) => {
    setPorsiList(prev => prev.filter((_, i) => i !== index));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoFile(e.target.files[0]);
      setPreviewURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async () => {
    if (!form.nama) return alert("Nama makanan wajib diisi");
    if (porsiList.length === 0) return alert("Minimal harus ada 1 varian porsi");
    
    // Validate porsi
    for (const p of porsiList) {
       if (!p.nama_porsi || !p.berat_gram) return alert("Nama porsi dan gramatur wajib diisi pada setiap varian");
    }

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
      id: editId,
      kode: form.kode || null,
      nama: form.nama,
      kategori_id: Number(form.kategori) || null,
      keterangan: form.keterangan || null,
      foto: fotoUrl || undefined,
      porsi: porsiList.map(p => ({
         id: p.id,
         kode_porsi: p.kode_porsi || null,
         nama_porsi: p.nama_porsi,
         berat_gram: Number(p.berat_gram) || 0,
         energi: Number(p.energi) || 0,
         protein: Number(p.protein) || 0,
         lemak: Number(p.lemak) || 0,
         karbohidrat: Number(p.karbohidrat) || 0,
         serat: Number(p.serat) || 0,
      }))
    };
    
    if (fotoUrl === null && editId) {
       delete (payload as any).foto;
    }

    try {
      const res = await fetch("/api/makanan", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");
      
      // Reload everything to get the full nested object simply
      const resGet = await fetch("/api/makanan");
      const refetched = await resGet.json();
      setMakanan(Array.isArray(refetched) ? refetched : []);
      
      handleCloseForm();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ ...defaultForm, kategori: kategoriList.length > 0 ? kategoriList[0].id.toString() : "1" });
    setPorsiList([]);
    setFotoFile(null);
    setPreviewURL(null);
  };

  const handleEditClick = (m: MakananInduk) => {
    setEditId(m.id);
    setForm({
      kode: m.kode || "",
      nama: m.nama,
      kategori: m.kategori_id?.toString() || "1",
      keterangan: m.keterangan || "",
    });
    setPorsiList(m.porsi ? [...m.porsi] : []);
    setPreviewURL(m.foto || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus item makanan ini? (Akan di Soft-Delete)")) return;
    try {
      const res = await fetch(`/api/makanan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setMakanan(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message);
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
    return makanan.filter(m => m.nama.toLowerCase().includes(q) || (m.kode || "").toLowerCase().includes(q));
  }, [makanan, search]);

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-[#00B9AD]/20 font-sans">
      <AdminSidebar />

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Master Makanan</h1>
            <p className="text-sm text-slate-400 font-medium">Pengelolaan Hirarki Induk - Varian Porsi</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00B9AD] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari makanan..."
                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#00B9AD]/10 focus:border-[#00B9AD] w-64 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => showForm ? handleCloseForm() : setShowForm(true)}
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
          <AnimatePresence>
            {showForm && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 mb-10 overflow-hidden"
              >
                <div className="flex flex-col gap-8">
                  {/* Bagian Induk */}
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest mb-4">Informasi Makanan Induk</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kode</label>
                        <input name="kode" value={form.kode} onChange={handleChange} placeholder="A.1" className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00B9AD] rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Makanan</label>
                        <input name="nama" value={form.nama} onChange={handleChange} placeholder="Nasi Putih" className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00B9AD] rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kategori</label>
                        <select name="kategori" value={form.kategori} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00B9AD] rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all">
                            <option value="">Pilih Kategori</option>
                              {kategoriList.map((k: any) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5 md:col-span-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Keterangan Tambahan / Sumber Rekam Makanan</label>
                        <input name="keterangan" value={form.keterangan} onChange={handleChange} placeholder="Misal: Data DKBM / Sumber Eksternal" className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00B9AD] rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Foto Makanan / Ilustrasi</label>
                        <div className="mt-1 flex items-center justify-center w-full">
                          <label htmlFor="foto-makanan" className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden ${previewURL ? 'border-[#00B9AD] bg-white' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                              {previewURL ? (
                                <img src={previewURL} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center pt-5 pb-6">
                                  <ImageIcon className="w-8 h-8 mb-3 text-slate-400" />
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unggah Gambar</p>
                                </div>
                              )}
                              <input id="foto-makanan" type="file" className="hidden" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFotoFile(file);
                                  const url = URL.createObjectURL(file);
                                  setPreviewURL(url);
                                }
                              }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Bagian Porsi Khusus */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest">Varian Porsi & Gizi</h3>
                      <button type="button" onClick={addPorsiRow} className="text-[#00B9AD] hover:bg-[#00B9AD]/10 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                        <ListPlus size={14} /> Tambah Porsi
                      </button>
                    </div>

                    <div className="space-y-3">
                      {porsiList.length > 0 && (
                        <div className="hidden lg:flex gap-3 px-3 pb-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          <div className="w-28 text-center">Kode Varian</div>
                          <div className="flex-1">Nama Porsi / URT</div>
                          <div className="w-20 text-center text-slate-500">Berat (g)</div>
                          <div className="w-20 text-center text-[#F59E0B]">Energi</div>
                          <div className="w-16 text-center text-red-400">Prot</div>
                          <div className="w-16 text-center text-yellow-400">Lemak</div>
                          <div className="w-16 text-center text-blue-400">Karb</div>
                          <div className="w-16 text-center text-green-400">Serat</div>
                          <div className="w-8"></div>
                        </div>
                      )}
                      {porsiList.map((p, i) => (
                        <div key={i} className="flex flex-wrap lg:flex-nowrap items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl transition-all hover:bg-slate-100/50">
                          <input title="Kode Varian Porsi" placeholder="Kode Porsi (A.1.A)" value={p.kode_porsi} onChange={(e) => handlePorsiChange(i, 'kode_porsi', e.target.value)} className="w-full lg:w-28 text-xs font-bold px-3 py-2.5 rounded-xl border-2 hover:border-[#00B9AD] focus:border-[#00B9AD] outline-none" />
                          <input title="Besaran Porsi (URT)" placeholder="Cth: 1 Porsi Sedang / 1 Centong" value={p.nama_porsi} onChange={(e) => handlePorsiChange(i, 'nama_porsi', e.target.value)} className="w-full lg:flex-1 text-xs font-bold px-3 py-2.5 rounded-xl border-2 hover:border-[#00B9AD] focus:border-[#00B9AD] outline-none" />
                          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                            <input title="Berat Gramatur Baku (g)" type="number" placeholder="Gram" value={p.berat_gram} onChange={(e) => handlePorsiChange(i, 'berat_gram', e.target.value)} className="w-20 min-w-[80px] text-xs font-bold px-3 py-2.5 rounded-xl border-2 hover:border-slate-300 focus:border-slate-400 outline-none" />
                            <input title="Energi Spesifik Varian (kkal)" type="number" placeholder="Kkal" value={p.energi} onChange={(e) => handlePorsiChange(i, 'energi', e.target.value)} className="w-20 min-w-[80px] text-xs font-bold px-3 py-2.5 rounded-xl border-2 hover:border-[#F59E0B] focus:border-[#F59E0B] outline-none" />
                            <input title="Protein Spesifik Varian (g)" type="number" placeholder="Pr(g)" value={p.protein} onChange={(e) => handlePorsiChange(i, 'protein', e.target.value)} className="w-16 min-w-[64px] text-xs font-bold px-3 py-2.5 rounded-xl border-2 hover:border-red-400 focus:border-red-400 outline-none" />
                            <input title="Lemak Spesifik Varian (g)" type="number" placeholder="Lm(g)" value={p.lemak} onChange={(e) => handlePorsiChange(i, 'lemak', e.target.value)} className="w-16 min-w-[64px] text-xs font-bold px-3 py-2.5 rounded-xl border-2 hover:border-yellow-400 focus:border-yellow-400 outline-none" />
                            <input title="Karbohidrat Spesifik Varian (g)" type="number" placeholder="Kh(g)" value={p.karbohidrat} onChange={(e) => handlePorsiChange(i, 'karbohidrat', e.target.value)} className="w-16 min-w-[64px] text-xs font-bold px-3 py-2.5 rounded-xl border-2 hover:border-blue-400 focus:border-blue-400 outline-none" />
                            <input title="Serat Spesifik Varian (g)" type="number" placeholder="Sr(g)" value={p.serat} onChange={(e) => handlePorsiChange(i, 'serat', e.target.value)} className="w-16 min-w-[64px] text-xs font-bold px-3 py-2.5 rounded-xl border-2 hover:border-green-400 focus:border-green-400 outline-none" />
                          </div>
                          <button type="button" title="Hapus Varian Porsi Ini" onClick={() => removePorsiRow(i)} className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-center"><Trash2 size={16} /></button>
                        </div>
                      ))}
                      {porsiList.length === 0 && <p className="text-[10px] text-center text-slate-400 p-4 border-2 border-dashed border-slate-200 rounded-2xl uppercase tracking-widest font-black">Belum ada porsi yang ditambahkan</p>}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex justify-end">
                    <button 
                      onClick={handleSubmit} 
                      disabled={saving}
                      className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00B9AD] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex gap-2"
                    >
                      {saving ? <><Loader2 size={14} className="animate-spin" /> MENGUNGGAH...</> : "SIMPAN DATA MAKANAN & PORSI"}
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Kode & Nama Makanan</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Jumlah Varian</th>
                  <th className="px-8 py-5 border-b border-slate-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={3} className="py-20 text-center text-slate-300 uppercase text-[10px] font-black tracking-widest animate-pulse">Sinkronisasi Data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={3} className="py-20 text-center text-slate-400 uppercase text-xs font-black tracking-widest bg-slate-50/30">Belum ada data Makanan. Klik Tambah Item untuk memulai.</td></tr>
                ) : filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#00B9AD] border border-slate-100 shadow-inner overflow-hidden">
                          {m.foto ? <img src={m.foto} alt={m.nama} className="w-full h-full object-cover" /> : <UtensilsCrossed size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{m.kode ? m.kode + " - " : ""}{m.nama}</p>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded mt-1 inline-block tracking-tighter">
                            {m.kategori?.nama || m.kategori_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="font-bold text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600">{m.porsi?.length || 0} Porsi</span>
                    </td>
                    <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                       <button onClick={() => handleEditClick(m)} className="p-3 text-slate-400 hover:text-[#00B9AD] hover:bg-[#00B9AD]/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
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