"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Search, X, Loader2 } from "lucide-react";
import type { MakananItem } from "@/lib/types";

const KATEGORI_LIST = ["Karbohidrat", "Lauk Hewani", "Lauk Nabati", "Sayur", "Buah", "Lemak", "Serba-serbi", "One Dish Meal", "Snack"] as const;

const emptyForm = () => ({
  nama: "",
  kategori: "Karbohidrat" as MakananItem["kategori"],
  jenis: "Bahan Makanan" as MakananItem["jenis"],
  energi: "",
  protein: "",
  karbohidrat: "",
  lemak: "",
  serat: "",
  urt: "",
  satuanGram: "100",
});

export default function AdminMakananPage() {
  const [makanan, setMakanan] = useState<MakananItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/makanan").then(r => r.json()).then(d => { setMakanan(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return makanan.filter(m => m.nama.toLowerCase().includes(q));
  }, [makanan, search]);

  async function handleSave() {
    setSaving(true);
    const body = {
      nama: form.nama,
      kategori: form.kategori,
      jenis: form.jenis,
      energi: Number(form.energi),
      protein: Number(form.protein),
      karbohidrat: Number(form.karbohidrat),
      lemak: Number(form.lemak),
      serat: Number(form.serat),
      urt: form.urt.split("\n").map(s => s.trim()).filter(Boolean),
      satuanGram: Number(form.satuanGram),
      foto: null,
    };
    const res = await fetch("/api/makanan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const added = await res.json();
      setMakanan(prev => [...prev, added]);
      setForm(emptyForm());
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus item ini?")) return;
    const res = await fetch(`/api/makanan/${id}`, { method: "DELETE" });
    if (res.ok) setMakanan(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 shadow-sm">
        <Link href="/dashboard/admin" className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-bold text-gray-900 flex-1">Database Makanan</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm">
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Batal" : "Tambah"}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Form Tambah */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Tambah Makanan Baru</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Makanan</label>
                <input type="text" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
                <select value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value as MakananItem["kategori"] }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                  {KATEGORI_LIST.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis</label>
                <select value={form.jenis} onChange={e => setForm(p => ({ ...p, jenis: e.target.value as MakananItem["jenis"] }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                  <option>Bahan Makanan</option>
                  <option>Makanan Matang</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Satuan Gram (per sajian)</label>
                <input type="number" value={form.satuanGram} onChange={e => setForm(p => ({ ...p, satuanGram: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {(["energi", "protein", "karbohidrat", "lemak", "serat"] as const).map(k => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 capitalize">{k} {k === "energi" ? "(kkal)" : "(g)"}</label>
                  <input type="number" min="0" step="0.01" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">URT (satu per baris, cth: "1 piring (200g)")</label>
              <textarea rows={3} value={form.urt} onChange={e => setForm(p => ({ ...p, urt: e.target.value }))}
                placeholder={"1 piring sedang (200g)\n1 centong (100g)"}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
            </div>
            <button onClick={handleSave} disabled={saving || !form.nama}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark disabled:opacity-60 transition-all shadow-sm">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : "Simpan Makanan"}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama makanan..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Nama</th>
                  <th className="text-left px-4 py-3">Kategori</th>
                  <th className="text-right px-4 py-3">Energi</th>
                  <th className="text-right px-4 py-3">Protein</th>
                  <th className="text-right px-4 py-3">Karbo</th>
                  <th className="text-right px-4 py-3">Lemak</th>
                  <th className="text-right px-4 py-3">Serat</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Memuat...</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-semibold text-gray-800">{m.nama}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-semibold">{m.kategori}</span></td>
                    <td className="px-4 py-3 text-right text-gray-600">{m.energi}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{m.protein}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{m.karbohidrat}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{m.lemak}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{m.serat}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(m.id)}
                        className="text-gray-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">Makanan tidak ditemukan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
