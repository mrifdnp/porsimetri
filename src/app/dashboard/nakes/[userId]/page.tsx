"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { ChevronLeft, Save, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { DbUser, FoodRecord, AnalisisGizi, KebutuhanGizi } from "@/lib/types";

interface Props {
  params: Promise<{ userId: string }>;
}

const HARI = [1, 2, 3, 4, 5, 6, 7];

const emptyNutri = () => ({ energi: "", protein: "", lemak: "", karbohidrat: "", serat: "" });

export default function NakesPasienPage({ params }: Props) {
  const { userId } = use(params);
  const [pasien, setPasien] = useState<DbUser | null>(null);
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisGizi[]>([]);
  const [kebutuhan, setKebutuhan] = useState<KebutuhanGizi | null>(null);
  const [loading, setLoading] = useState(true);

  // Form kebutuhan gizi
  const [kForm, setKForm] = useState({ energi: "", protein: "", lemak: "", karbohidrat: "", serat: "" });
  const [kSaving, setKSaving] = useState(false);
  const [kSuccess, setKSuccess] = useState(false);

  // Analisis per food record
  const [analisisForm, setAnalisisForm] = useState<Record<string, ReturnType<typeof emptyNutri>>>({});
  const [analisisSaving, setAnalisisSaving] = useState<Record<string, boolean>>({});
  const [analisisSuccess, setAnalisisSuccess] = useState<Record<string, boolean>>({});
  const [expandedHari, setExpandedHari] = useState<number | null>(1);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users`).then(r => r.json()).catch(() => []),
      fetch(`/api/admin/food-records`).then(r => r.json()).catch(() => []),
      fetch(`/api/admin/analisis`).then(r => r.json()).catch(() => []),
      fetch(`/api/kebutuhan-gizi/${userId}`).then(r => r.json()).catch(() => null),
    ]).then(([users, recs, an, kb]) => {
      const found = Array.isArray(users) ? users.find((u: DbUser) => u.id === userId) : null;
      setPasien(found ?? null);
      const userRecs: FoodRecord[] = Array.isArray(recs) ? recs.filter((r: FoodRecord) => r.userId === userId) : [];
      setRecords(userRecs);
      const userAnalisis: AnalisisGizi[] = Array.isArray(an)
        ? an.filter((a: AnalisisGizi) => userRecs.some(r => r.id === a.foodRecordId))
        : [];
      setAnalisis(userAnalisis);
      setKebutuhan(kb && !kb.error ? kb : null);
      // Pre-fill kebutuhan form
      if (kb && !kb.error) {
        setKForm({ energi: String(kb.energi), protein: String(kb.protein), lemak: String(kb.lemak), karbohidrat: String(kb.karbohidrat), serat: String(kb.serat) });
      }
      // Pre-fill analisis forms
      const aForms: Record<string, ReturnType<typeof emptyNutri>> = {};
      for (const a of userAnalisis) {
        aForms[a.foodRecordId] = { energi: String(a.energi), protein: String(a.protein), lemak: String(a.lemak), karbohidrat: String(a.karbohidrat), serat: String(a.serat) };
      }
      setAnalisisForm(aForms);
      setLoading(false);
    });
  }, [userId]);

  async function saveKebutuhan() {
    setKSaving(true);
    const res = await fetch(`/api/kebutuhan-gizi/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        energi: Number(kForm.energi),
        protein: Number(kForm.protein),
        lemak: Number(kForm.lemak),
        karbohidrat: Number(kForm.karbohidrat),
        serat: Number(kForm.serat),
      }),
    });
    if (res.ok) { const d = await res.json(); setKebutuhan(d); setKSuccess(true); setTimeout(() => setKSuccess(false), 2000); }
    setKSaving(false);
  }

  async function saveAnalisis(recordId: string) {
    setAnalisisSaving(prev => ({ ...prev, [recordId]: true }));
    const form = analisisForm[recordId] ?? emptyNutri();
    await fetch(`/api/nakes/analisis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodRecordId: recordId, ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)])) }),
    });
    setAnalisisSaving(prev => ({ ...prev, [recordId]: false }));
    setAnalisisSuccess(prev => ({ ...prev, [recordId]: true }));
    setTimeout(() => setAnalisisSuccess(prev => ({ ...prev, [recordId]: false })), 2000);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 shadow-sm">
        <Link href="/dashboard/nakes" className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="font-bold text-gray-900 text-sm leading-tight">{pasien?.namaLengkap ?? "Pasien"}</h1>
          <div className="text-xs text-gray-500">{pasien?.email}</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Kebutuhan Gizi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-1">Kebutuhan Gizi Harian</h2>
          <p className="text-xs text-gray-500 mb-4">Input kebutuhan gizi per hari untuk pasien ini</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(["energi", "protein", "lemak", "karbohidrat", "serat"] as const).map(k => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-500 mb-1 capitalize">{k} {k === "energi" ? "(kkal)" : "(g)"}</label>
                <input type="number" min="0" step="0.1" value={kForm[k]}
                  onChange={e => setKForm(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
            ))}
          </div>
          <button onClick={saveKebutuhan} disabled={kSaving}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark disabled:opacity-60 transition-all shadow-sm shadow-primary/20">
            {kSaving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> :
              kSuccess ? <><CheckCircle2 size={15} /> Tersimpan!</> : <><Save size={15} /> Simpan Kebutuhan</>}
          </button>
        </div>

        {/* Food Record per Hari */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Food Record 7 Hari</h2>
          <div className="space-y-3">
            {HARI.map(h => {
              const hRecords = records.filter(r => r.hari === h);
              const isOpen = expandedHari === h;
              return (
                <div key={h} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button onClick={() => setExpandedHari(isOpen ? null : h)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl text-sm font-bold flex items-center justify-center
                        ${hRecords.length > 0 ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                        {h}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-gray-900">Hari {h}</div>
                        <div className="text-xs text-gray-500">{hRecords.length} item makanan</div>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-50 divide-y divide-gray-50">
                      {hRecords.length === 0 ? (
                        <div className="px-5 py-6 text-center text-sm text-gray-400">Belum ada catatan untuk hari ini</div>
                      ) : (
                        hRecords.map(r => {
                          const hasAnalisis = analisis.some(a => a.foodRecordId === r.id);
                          const form = analisisForm[r.id] ?? emptyNutri();
                          return (
                            <div key={r.id} className="px-5 py-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                  <div className="font-semibold text-sm text-gray-900">{r.namaMakanan}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{r.waktuMakan} · {r.jamMakan} · {r.urt} · {r.caraPengolahan}</div>
                                </div>
                                {hasAnalisis && <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />}
                                {!hasAnalisis && <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />}
                              </div>

                              {/* Analisis form */}
                              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                                {(["energi", "protein", "lemak", "karbohidrat", "serat"] as const).map(k => (
                                  <div key={k}>
                                    <label className="block text-[10px] font-semibold text-gray-400 mb-1 capitalize">{k}</label>
                                    <input type="number" min="0" step="0.01" value={form[k]}
                                      onChange={e => setAnalisisForm(prev => ({
                                        ...prev,
                                        [r.id]: { ...(prev[r.id] ?? emptyNutri()), [k]: e.target.value }
                                      }))}
                                      placeholder="0"
                                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                                  </div>
                                ))}
                              </div>
                              <button onClick={() => saveAnalisis(r.id)} disabled={analisisSaving[r.id]}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs rounded-lg transition-all">
                                {analisisSaving[r.id] ? <><Loader2 size={12} className="animate-spin" /> Menyimpan...</> :
                                  analisisSuccess[r.id] ? <><CheckCircle2 size={12} /> Tersimpan!</> : <><Save size={12} /> Simpan Analisis</>}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
