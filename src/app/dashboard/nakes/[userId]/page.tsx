"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Save, CheckCircle2, AlertCircle, 
  Loader2, ChevronDown, ChevronUp, Activity, 
  Target, ClipboardCheck, Info, FileDown, MapPin, Clock, Wifi
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NakesSidebar from "@/components/NakesSidebar";
import type { DbUser, FoodRecord, AnalisisGizi, KebutuhanGizi, MakananInduk } from "@/lib/types";

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
  const [makananData, setMakananData] = useState<MakananInduk[]>([]);
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
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [pctForm, setPctForm] = useState<Record<string, Record<string, string>>>({});

  const NUTRI_KEYS = ["energi", "protein", "lemak", "karbohidrat", "serat"] as const;
  type NutriKey = typeof NUTRI_KEYS[number];
  const NUTRI_LABEL: Record<NutriKey, string> = { energi: "Energi (kkal)", protein: "Protein (g)", lemak: "Lemak (g)", karbohidrat: "Karbo (g)", serat: "Serat (g)" };
  const emptyPct = () => ({ energi: "", protein: "", lemak: "", karbohidrat: "", serat: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users`).then(r => r.json()).catch(() => []),
      fetch(`/api/admin/food-records`).then(r => r.json()).catch(() => []),
      fetch(`/api/admin/analisis`).then(r => r.json()).catch(() => []),
      fetch(`/api/kebutuhan-gizi/${userId}`).then(r => r.json()).catch(() => null),
      fetch(`/api/makanan`).then(r => r.json()).catch(() => []),
      fetch(`/api/admin/access-logs`).then(r => r.json()).catch(() => []),
    ]).then(([users, recs, an, kb, m, logs]) => {
      const found = Array.isArray(users) ? users.find((u: DbUser) => u.id === userId) : null;
      setPasien(found ?? null);
      const userRecs = Array.isArray(recs) ? recs.filter((r: FoodRecord) => r.userId === userId) : [];
      setRecords(userRecs);
      const userAnalisis = Array.isArray(an) ? an.filter((a: AnalisisGizi) => userRecs.some(r => r.id === a.foodRecordId)) : [];
      setAnalisis(userAnalisis);
      setMakananData(Array.isArray(m) ? m : []);
      // Filter log akses hanya untuk user ini
      const userLogs = Array.isArray(logs) ? logs.filter((l: any) => l.user_id === userId) : [];
      setAccessLogs(userLogs);
      setKebutuhan(kb && !kb.error ? kb : null);

      if (kb && !kb.error) {
        setKForm({ energi: String(kb.energi), protein: String(kb.protein), lemak: String(kb.lemak), karbohidrat: String(kb.karbohidrat), serat: String(kb.serat) });
      }

      // Prefill form dari analisis yang sudah tersimpan
      const aForms: Record<string, ReturnType<typeof emptyNutri>> = {};
      const pForms: Record<string, Record<string, string>> = {};
      for (const a of userAnalisis) {
        aForms[a.foodRecordId] = { energi: String(a.energi), protein: String(a.protein), lemak: String(a.lemak), karbohidrat: String(a.karbohidrat), serat: String(a.serat) };
        // Hitung % dari kebutuhan jika ada
        if (kb && !kb.error) {
          pForms[a.foodRecordId] = {
            energi: kb.energi ? String(Math.round((a.energi / kb.energi) * 100)) : "",
            protein: kb.protein ? String(Math.round((a.protein / kb.protein) * 100)) : "",
            lemak: kb.lemak ? String(Math.round((a.lemak / kb.lemak) * 100)) : "",
            karbohidrat: kb.karbohidrat ? String(Math.round((a.karbohidrat / kb.karbohidrat) * 100)) : "",
            serat: kb.serat ? String(Math.round((a.serat / kb.serat) * 100)) : "",
          };
        }
      }
      // Auto-prefill dari nilai gizi porsi untuk record yang belum ada analisisnya
      const makananArr = Array.isArray(m) ? m : [];
      for (const rec of userRecs) {
        if (!aForms[rec.id]) {
          const mk = makananArr.find((mk: any) => mk.id === rec.makananId);
          const prs = mk?.porsi?.find((p: any) => p.id === rec.porsiId);
          if (prs) {
            aForms[rec.id] = {
              energi: String(prs.energi ?? ""),
              protein: String(prs.protein ?? ""),
              lemak: String(prs.lemak ?? ""),
              karbohidrat: String(prs.karbohidrat ?? ""),
              serat: String(prs.serat ?? ""),
            };
            if (kb && !kb.error && prs.energi) {
              pForms[rec.id] = {
                energi: kb.energi ? String(Math.round((prs.energi / kb.energi) * 100)) : "",
                protein: kb.protein ? String(Math.round((prs.protein / kb.protein) * 100)) : "",
                lemak: kb.lemak ? String(Math.round((prs.lemak / kb.lemak) * 100)) : "",
                karbohidrat: kb.karbohidrat ? String(Math.round((prs.karbohidrat / kb.karbohidrat) * 100)) : "",
                serat: kb.serat ? String(Math.round((prs.serat / kb.serat) * 100)) : "",
              };
            }
          } else {
            aForms[rec.id] = emptyNutri();
          }
        }
      }
      setAnalisisForm(aForms);
      setPctForm(pForms);
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

  function handleExportPDF() {
    const profile = pasien?.profile as any;
    const namaLengkap = pasien?.namaLengkap || (pasien as any)?.nama_lengkap || "-";
    const tglLahir = profile?.tanggalLahir || "-";
    const bb = profile?.beratBadan || "-";
    const tb = profile?.tinggiBadan || "-";
    const pekerjaan = profile?.pekerjaan || "-";
    const alamat = profile?.alamat || "-";
    const usia = profile?.tanggalLahir ? (new Date().getFullYear() - new Date(profile.tanggalLahir).getFullYear()) + " tahun" : "-";

    // Build rows per record
    type RowData = { no: number; waktu: string; nama: string; urt: string; pengolahan: string; beratEstimasi: string; bahanMakanan: string; energi: string; protein: string; lemak: string; karbo: string; serat: string; };
    const rows: RowData[] = [];
    let no = 1;
    const totals = { energi: 0, protein: 0, lemak: 0, karbo: 0, serat: 0 };

    for (let h = 1; h <= 7; h++) {
      const hRecs = records.filter(r => r.hari === h);
      for (const r of hRecs) {
        const a = analisis.find(x => x.foodRecordId === r.id);
        const mk = makananData.find(m => m.id === r.makananId);
        const prs = mk?.porsi?.find((p: any) => p.id === r.porsiId);
        
        let e = 0, p = 0, l = 0, c = 0, f = 0;
        if (a) {
          e = a.energi; p = a.protein; l = a.lemak; c = a.karbohidrat; f = a.serat;
        } else if (prs) {
          e = prs.energi * (r.jumlahUrt || 1); 
          p = prs.protein * (r.jumlahUrt || 1); 
          l = prs.lemak * (r.jumlahUrt || 1); 
          c = prs.karbohidrat * (r.jumlahUrt || 1); 
          f = prs.serat * (r.jumlahUrt || 1);
        }
        const beratGram = prs ? Math.round((r.jumlahUrt || 1) * prs.berat_gram) : 0;
        const bahan = mk?.kategori?.nama || (mk?.kategori_id != null ? String(mk.kategori_id) : "-");

        totals.energi += e; totals.protein += p; totals.lemak += l; totals.karbo += c; totals.serat += f;

        rows.push({
          no: no++,
          waktu: `${r.waktuMakan} (H${r.hari})\n${r.jamMakan}`,
          nama: r.namaMakanan,
          urt: r.urt,
          pengolahan: r.caraPengolahan,
          beratEstimasi: beratGram ? String(Math.round(beratGram)) : "-",
          bahanMakanan: bahan,
          energi: Math.round(e).toString(),
          protein: (Math.round(p * 10) / 10).toFixed(1),
          lemak: (Math.round(l * 10) / 10).toFixed(1),
          karbo: (Math.round(c * 10) / 10).toFixed(1),
          serat: (Math.round(f * 10) / 10).toFixed(1),
        });
      }
    }

    const kebutuhanTotal = kebutuhan ? {
      energi: kebutuhan.energi * 7,
      protein: kebutuhan.protein * 7,
      lemak: kebutuhan.lemak * 7,
      karbo: kebutuhan.karbohidrat * 7,
      serat: kebutuhan.serat * 7,
    } : null;

    const pct = kebutuhanTotal ? {
      energi: Math.round((totals.energi / kebutuhanTotal.energi) * 100),
      protein: Math.round((totals.protein / kebutuhanTotal.protein) * 100),
      lemak: Math.round((totals.lemak / kebutuhanTotal.lemak) * 100),
      karbo: Math.round((totals.karbo / kebutuhanTotal.karbo) * 100),
      serat: Math.round((totals.serat / kebutuhanTotal.serat) * 100),
    } : null;

    const interpret = (val: number) => val >= 80 ? "Terpenuhi" : "Kurang";

    const rowsHtml = rows.map(r => `
      <tr>
        <td>${r.no}</td>
        <td style="white-space:pre-line">${r.waktu}</td>
        <td>${r.nama}</td>
        <td>${r.urt}</td>
        <td>${r.pengolahan}</td>
        <td>${r.beratEstimasi}</td>
        <td>${r.bahanMakanan}</td>
        <td>${r.energi}</td>
        <td>${r.protein}</td>
        <td>${r.lemak}</td>
        <td>${r.karbo}</td>
        <td>${r.serat}</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Form Estimated Food Record - ${namaLengkap}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; font-size: 11px; color: #1e293b; }
      h1 { text-align: center; font-size: 16px; font-weight: 800; margin-bottom: 20px; letter-spacing: 1px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 40px; margin-bottom: 20px; }
      .info-row { display: flex; gap: 8px; padding: 3px 0; }
      .info-label { font-weight: 700; min-width: 120px; }
      .info-value { border-bottom: 1px solid #cbd5e1; flex: 1; padding-bottom: 1px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #94a3b8; padding: 5px 6px; text-align: center; font-size: 10px; }
      th { background: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
      td { vertical-align: top; }
      .footer-row td { font-weight: 700; background: #f8fafc; }
      .footer-row.red td { color: #dc2626; font-weight: 800; }
      @media print { body { padding: 15px; } @page { size: landscape; margin: 10mm; } }
    </style></head><body>
    <h1>FORM ESTIMATED FOOD RECORD</h1>
    <div class="info-grid">
      <div class="info-row"><span class="info-label">Nama</span><span class="info-value">${namaLengkap}</span></div>
      <div class="info-row"><span class="info-label">Berat Badan</span><span class="info-value">${bb} kg</span></div>
      <div class="info-row"><span class="info-label">Tanggal Lahir</span><span class="info-value">${tglLahir}</span></div>
      <div class="info-row"><span class="info-label">Tinggi Badan</span><span class="info-value">${tb} cm</span></div>
      <div class="info-row"><span class="info-label">Usia</span><span class="info-value">${usia}</span></div>
      <div class="info-row"><span class="info-label">Pekerjaan</span><span class="info-value">${pekerjaan}</span></div>
      <div class="info-row"><span class="info-label">Alamat</span><span class="info-value">${alamat}</span></div>
      <div class="info-row"><span class="info-label">Periode</span><span class="info-value">7 Hari (${records.length} item)</span></div>
    </div>
    <table>
      <thead>
        <tr>
          <th rowspan="2">No</th>
          <th rowspan="2">Waktu Makan</th>
          <th rowspan="2">Nama Makanan</th>
          <th rowspan="2">URT</th>
          <th rowspan="2">Ket. Pengolahan</th>
          <th rowspan="2">Berat Estimasi (gr)</th>
          <th rowspan="2">Bahan Makanan</th>
          <th colspan="5">Analisis Nilai Gizi</th>
        </tr>
        <tr>
          <th>Energi (kkal)</th>
          <th>Protein (g)</th>
          <th>Lemak (g)</th>
          <th>Karbohidrat (g)</th>
          <th>Serat (g)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="footer-row">
          <td colspan="7" style="text-align:right;font-weight:800">Total Asupan</td>
          <td>${Math.round(totals.energi)}</td>
          <td>${(Math.round(totals.protein*10)/10).toFixed(1)}</td>
          <td>${(Math.round(totals.lemak*10)/10).toFixed(1)}</td>
          <td>${(Math.round(totals.karbo*10)/10).toFixed(1)}</td>
          <td>${(Math.round(totals.serat*10)/10).toFixed(1)}</td>
        </tr>
        ${kebutuhanTotal ? `<tr class="footer-row">
          <td colspan="7" style="text-align:right;font-weight:800">Kebutuhan Zat Gizi (7 hari)</td>
          <td>${kebutuhanTotal.energi}</td>
          <td>${kebutuhanTotal.protein}</td>
          <td>${kebutuhanTotal.lemak}</td>
          <td>${kebutuhanTotal.karbo}</td>
          <td>${kebutuhanTotal.serat}</td>
        </tr>` : ""}
        ${pct ? `<tr class="footer-row red">
          <td colspan="7" style="text-align:right">Persentase Pemenuhan Kebutuhan Zat Gizi (%)</td>
          <td>${pct.energi}%</td>
          <td>${pct.protein}%</td>
          <td>${pct.lemak}%</td>
          <td>${pct.karbo}%</td>
          <td>${pct.serat}%</td>
        </tr>
        <tr class="footer-row red">
          <td colspan="7" style="text-align:right">Interpretasi Kategori Pemenuhan Kebutuhan Gizi</td>
          <td>${interpret(pct.energi)}</td>
          <td>${interpret(pct.protein)}</td>
          <td>${interpret(pct.lemak)}</td>
          <td>${interpret(pct.karbo)}</td>
          <td>${interpret(pct.serat)}</td>
        </tr>` : ""}
      </tbody>
    </table>
    <script>setTimeout(()=>window.print(),500)<\/script>
    </body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
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
          
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all shadow-lg"
            >
              <FileDown size={16} />
              Export PDF
            </button>
            <div className="text-right text-slate-400">
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
              className="mt-8 flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 disabled:opacity-50"
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

                                    {/* Analisis Input Grid — Nilai + % */}
                                     <div className="bg-slate-50 rounded-[1.5rem] p-6 space-y-3">
                                       <div className="grid grid-cols-5 gap-3">
                                         {NUTRI_KEYS.map(k => (
                                           <p key={k} className="text-[8px] font-black uppercase tracking-widest text-slate-400 text-center truncate">{NUTRI_LABEL[k]}</p>
                                         ))}
                                       </div>
                                       <div className="grid grid-cols-5 gap-3">
                                         {NUTRI_KEYS.map(k => (
                                           <input key={k} type="number" step="0.01" value={form[k]}
                                             onChange={e => {
                                               const nv = e.target.value;
                                               setAnalisisForm(prev => ({ ...prev, [r.id]: { ...(prev[r.id] ?? emptyNutri()), [k]: nv } }));
                                               const kb2 = kebutuhan ? (kebutuhan as any)[k] : null;
                                               if (kb2 && parseFloat(nv) >= 0) {
                                                 const p = Math.round((parseFloat(nv) / kb2) * 100);
                                                 setPctForm(prev => ({ ...prev, [r.id]: { ...(prev[r.id] ?? emptyPct()), [k]: isNaN(p) ? "" : String(p) } }));
                                               }
                                             }}
                                             placeholder="0.0"
                                             className="w-full bg-white border border-slate-200 focus:border-[#00B9AD] text-center rounded-xl px-2 py-2 text-xs font-black outline-none transition-all"
                                           />
                                         ))}
                                       </div>
                                       <div className="grid grid-cols-5 gap-3">
                                         {NUTRI_KEYS.map(k => {
                                           const pv = pctForm[r.id]?.[k] || "";
                                           const kb2 = kebutuhan ? (kebutuhan as any)[k] : null;
                                           const pn = parseFloat(pv);
                                           const cc = !pv ? "bg-slate-100 border-slate-100 text-slate-400" :
                                             pn >= 80 ? "bg-[#74D58C]/10 border-[#74D58C]/50 text-[#3fa85b]" :
                                             pn >= 50 ? "bg-amber-50 border-amber-200 text-amber-600" :
                                             "bg-red-50 border-red-200 text-red-500";
                                           return (
                                             <div key={k} className="relative">
                                               <input type="number" step="1" value={pv}
                                                 onChange={e => {
                                                   const np = e.target.value;
                                                   setPctForm(prev => ({ ...prev, [r.id]: { ...(prev[r.id] ?? emptyPct()), [k]: np } }));
                                                   if (kb2 && parseFloat(np) >= 0) {
                                                     const val = ((parseFloat(np) / 100) * kb2).toFixed(1);
                                                     setAnalisisForm(prev => ({ ...prev, [r.id]: { ...(prev[r.id] ?? emptyNutri()), [k]: val } }));
                                                   }
                                                 }}
                                                 placeholder="%"
                                                 className={`w-full border text-center rounded-xl px-2 py-2 text-xs font-black outline-none transition-all pr-5 ${cc}`}
                                               />
                                               <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black pointer-events-none opacity-50">%</span>
                                             </div>
                                           );
                                         })}
                                       </div>
                                       {kebutuhan && (
                                         <div className="grid grid-cols-5 gap-3">
                                           {NUTRI_KEYS.map(k => (
                                             <p key={k} className="text-[8px] text-slate-300 font-bold text-center">dari {(kebutuhan as any)[k] ?? "–"}</p>
                                           ))}
                                         </div>
                                       )}
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

          {/* === ACCESS LOG SECTION === */}
          <div className="mt-8">
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-widest mb-4 flex items-center gap-2">
              <Wifi size={16} className="text-[#00B9AD]" /> Riwayat Akses Pasien
            </h2>
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              {accessLogs.length === 0 ? (
                <div className="py-14 text-center text-slate-300 text-xs font-black uppercase tracking-widest">
                  Belum ada riwayat akses tercatat
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Waktu Akses</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">IP Address</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Lokasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {accessLogs.slice(0, 20).map((log: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={13} className="text-slate-300 shrink-0" />
                            <span className="font-bold text-slate-700">
                              {log.logged_at ? new Date(log.logged_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "–"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                            {log.ip_address || "unknown"}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          {(log.city || log.region || log.country) ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-[#00B9AD] shrink-0" />
                              <span className="text-xs font-bold text-slate-600">
                                {[log.city, log.region, log.country].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-bold">–</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
