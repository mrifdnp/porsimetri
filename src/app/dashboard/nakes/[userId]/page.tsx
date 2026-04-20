"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Save, CheckCircle2, AlertCircle, 
  Loader2, ChevronDown, ChevronUp, Activity, 
  Target, ClipboardCheck, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NakesSidebar from "@/components/NakesSidebar";
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

  // Form states
  const [kForm, setKForm] = useState(emptyNutri());
  const [kSaving, setKSaving] = useState(false);
  const [kSuccess, setKSuccess] = useState(false);
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
      const userRecs = Array.isArray(recs) ? recs.filter((r: FoodRecord) => r.userId === userId) : [];
      setRecords(userRecs);
      const userAnalisis = Array.isArray(an) ? an.filter((a: AnalisisGizi) => userRecs.some(r => r.id === a.foodRecordId)) : [];
      setAnalisis(userAnalisis);
      setKebutuhan(kb && !kb.error ? kb : null);

      if (kb && !kb.error) {
        setKForm({ energi: String(kb.energi), protein: String(kb.protein), lemak: String(kb.lemak), karbohidrat: String(kb.karbohidrat), serat: String(kb.serat) });
      }

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
    if (res.ok) {
      const d = await res.json();
      setKebutuhan(d);
      setKSuccess(true);
      setTimeout(() => setKSuccess(false), 2000);
    }
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-[#00B9AD]" size={32} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] selection:bg-[#00B9AD]/20 font-sans">
      <NakesSidebar />

      <main className="flex-1 min-w-0">
        {/* Sticky Header Pasien */}
        <header className="sticky top-0 z-[100] h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/nakes" className="p-2 hover:bg-slate-100 rounded-full transition-all group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight leading-none uppercase">{pasien?.namaLengkap}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pasien?.email}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-black text-[#00B9AD] uppercase tracking-widest">Analisis Mode</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Status Pantauan</p>
              <p className="text-xs font-bold text-[#74D58C] uppercase tracking-tighter italic">Active Evaluation</p>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-10 space-y-12">
          
          {/* Section: Target Kebutuhan Gizi */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <Target size={150} />
            </div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#00B9AD]/10 flex items-center justify-center text-[#00B9AD]">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Kebutuhan Gizi Harian</h2>
                <p className="text-xs font-medium text-slate-400">Tentukan baseline nutrisi harian pasien.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(["energi", "protein", "lemak", "karbohidrat", "serat"] as const).map(k => (
                <div key={k} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{k} {k === "energi" ? "(K)" : "(G)"}</label>
                  <input 
                    type="number" step="0.1" value={kForm[k]}
                    onChange={e => setKForm(prev => ({ ...prev, [k]: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#00B9AD] focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all" 
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={saveKebutuhan} 
              disabled={kSaving}
              className="mt-8 flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-[#00B9AD] transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {kSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {kSuccess ? "Kebutuhan Terupdate" : "Simpan Baseline Gizi"}
            </button>
          </section>

          {/* Section: Food Record List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Evaluasi Food Record</h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ClipboardCheck size={14} /> Total 7 Hari
              </div>
            </div>

            <div className="space-y-4">
              {HARI.map(h => {
                const hRecords = records.filter(r => r.hari === h);
                const isOpen = expandedHari === h;
                const isCompleted = hRecords.length > 0 && hRecords.every(r => analisis.some(a => a.foodRecordId === r.id));

                return (
                  <div key={h} className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${isOpen ? "border-[#00B9AD] shadow-lg shadow-[#00B9AD]/5" : "border-slate-200"}`}>
                    <button 
                      onClick={() => setExpandedHari(isOpen ? null : h)}
                      className="w-full flex items-center justify-between px-8 py-6 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center transition-colors
                          ${hRecords.length > 0 ? (isCompleted ? "bg-[#74D58C] text-white" : "bg-[#00B9AD] text-white") : "bg-slate-100 text-slate-300"}`}>
                          {h}
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">HARI KE-{h}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {hRecords.length} Items Tercatat
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {isCompleted && <span className="text-[10px] font-black text-[#74D58C] uppercase tracking-widest hidden md:block">Analisis Lengkap</span>}
                        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100"
                        >
                          {hRecords.length === 0 ? (
                            <div className="p-12 text-center">
                              <Info size={32} className="mx-auto mb-4 text-slate-200" />
                              <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Belum ada data dari pasien</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {hRecords.map(r => {
                                const hasAnalisis = analisis.some(a => a.foodRecordId === r.id);
                                const form = analisisForm[r.id] ?? emptyNutri();
                                return (
                                  <div key={r.id} className="p-8 group hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-start justify-between gap-6 mb-8">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{r.namaMakanan}</h4>
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${hasAnalisis ? "bg-[#74D58C]/10 text-[#74D58C]" : "bg-amber-100 text-amber-600"}`}>
                                            {hasAnalisis ? "Verified" : "Pending Analysis"}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                           <span>🕑 {r.waktuMakan} · {r.jamMakan}</span>
                                           <span>🍽️ {r.urt}</span>
                                           <span className="md:col-span-2">🔥 {r.caraPengolahan}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Analisis Input Grid */}
                                    <div className="bg-slate-50 rounded-[1.5rem] p-6 space-y-6">
                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {(["energi", "protein", "lemak", "karbohidrat", "serat"] as const).map(k => (
                                          <div key={k} className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase text-slate-400 tracking-tighter block text-center truncate">{k}</label>
                                            <input 
                                              type="number" step="0.01" value={form[k]}
                                              onChange={e => setAnalisisForm(prev => ({
                                                ...prev,
                                                [r.id]: { ...(prev[r.id] ?? emptyNutri()), [k]: e.target.value }
                                              }))}
                                              placeholder="0.0"
                                              className="w-full bg-white border border-slate-200 focus:border-[#00B9AD] text-center rounded-xl px-2 py-2.5 text-xs font-black outline-none transition-all" 
                                            />
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex justify-end">
                                        <button 
                                          onClick={() => saveAnalisis(r.id)} 
                                          disabled={analisisSaving[r.id]}
                                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                            analisisSuccess[r.id] ? "bg-[#74D58C] text-white" : "bg-white border border-slate-200 text-slate-900 hover:border-[#00B9AD] hover:text-[#00B9AD]"
                                          }`}
                                        >
                                          {analisisSaving[r.id] ? <Loader2 size={14} className="animate-spin" /> : (analisisSuccess[r.id] ? <CheckCircle2 size={14} /> : <Save size={14} />)}
                                          {analisisSuccess[r.id] ? "Analisis Disimpan" : "Submit Analisis"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}