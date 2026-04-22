"use client";

import { useEffect, useState } from "react";
import { TrendingUp, AlertCircle, CheckCircle2, Loader2, FileDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { useSession } from "next-auth/react";
import UserSidebar from "@/components/UserSidebar";
import type { FoodRecord, AnalisisGizi, KebutuhanGizi, HariSummary, MakananInduk } from "@/lib/types";

const NUTRI_COLORS = {
  energi: "#60C0D0",
  protein: "#74D58C",
  karbohidrat: "#CDD729",
  lemak: "#00B9AD",
  serat: "#2DD4BF",
};

function calcNutrisi(records: FoodRecord[], analisis: AnalisisGizi[], makananData: MakananInduk[]) {
  const byHari: Record<number, any> = {};
  for (let i = 1; i <= 7; i++) {
    byHari[i] = { hari: i, energi: 0, protein: 0, lemak: 0, karbohidrat: 0, serat: 0 };
  }

  for (const r of records) {
    const a = analisis.find(x => x.foodRecordId === r.id);
    if (a) {
      byHari[r.hari].energi += a.energi;
      byHari[r.hari].protein += a.protein;
      byHari[r.hari].lemak += a.lemak;
      byHari[r.hari].karbohidrat += a.karbohidrat;
      byHari[r.hari].serat += a.serat;
    } else {
      const mk = makananData.find((m: any) => m.id === r.makananId);
      const prs = mk?.porsi?.find((p: any) => p.id === r.porsiId);
      if (prs) {
        byHari[r.hari].energi += prs.energi * (r.jumlahUrt || 1);
        byHari[r.hari].protein += prs.protein * (r.jumlahUrt || 1);
        byHari[r.hari].lemak += prs.lemak * (r.jumlahUrt || 1);
        byHari[r.hari].karbohidrat += prs.karbohidrat * (r.jumlahUrt || 1);
        byHari[r.hari].serat += prs.serat * (r.jumlahUrt || 1);
      }
    }
  }
  return Object.values(byHari);
}

export default function HasilPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [makananData, setMakananData] = useState<MakananInduk[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisGizi[]>([]);
  const [kebutuhan, setKebutuhan] = useState<KebutuhanGizi | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"semua" | "energi" | "protein" | "lemak" | "karbohidrat" | "serat">("semua");

  useEffect(() => {
    Promise.all([
      fetch("/api/food-record").then(r => r.json()),
      fetch("/api/makanan").then(r => r.json()).catch(() => []),
      fetch("/api/analisis-gizi").then(r => r.json()).catch(() => []),
      fetch("/api/kebutuhan-gizi").then(r => r.json()).catch(() => null),
      fetch("/api/profile").then(r => r.json()).catch(() => null),
    ]).then(([r, md, a, k, p]) => {
      setRecords(Array.isArray(r) ? r : []);
      setMakananData(Array.isArray(md) ? md : []);
      setAnalisis(Array.isArray(a) ? a : []);
      setKebutuhan(k && !k.error ? k : null);
      setUserProfile(p && !p.error ? p : null);
      setLoading(false);
    });
  }, []);

  function handleExportPDF() {
    const namaLengkap = session?.user?.name || (session?.user as any)?.namaLengkap || "Pasien";

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
        const beratGram = prs ? (r.jumlahUrt || 1) * prs.berat_gram : 0;
        const bahan = mk?.kategori?.nama || (mk?.kategori_id != null ? String(mk.kategori_id) : "-");

        let e = 0, p = 0, l = 0, k = 0, s = 0;
        if (a) {
          e = a.energi; p = a.protein; l = a.lemak; k = a.karbohidrat; s = a.serat;
        } else if (prs) {
          e = prs.energi * (r.jumlahUrt || 1); 
          p = prs.protein * (r.jumlahUrt || 1); 
          l = prs.lemak * (r.jumlahUrt || 1); 
          k = prs.karbohidrat * (r.jumlahUrt || 1); 
          s = prs.serat * (r.jumlahUrt || 1);
        }
        totals.energi += e; totals.protein += p; totals.lemak += l; totals.karbo += k; totals.serat += s;

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
          karbo: (Math.round(k * 10) / 10).toFixed(1),
          serat: (Math.round(s * 10) / 10).toFixed(1),
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

    const usia = userProfile?.profile?.tanggalLahir 
      ? (new Date().getFullYear() - new Date(userProfile.profile.tanggalLahir).getFullYear()) + " tahun" 
      : "___________";
    const bb = userProfile?.profile?.beratBadan ? userProfile.profile.beratBadan + " kg" : "___________";
    const tb = userProfile?.profile?.tinggiBadan ? userProfile.profile.tinggiBadan + " cm" : "___________";
    const pekerjaan = userProfile?.profile?.pekerjaan || "___________";
    const tglLahir = userProfile?.profile?.tanggalLahir ? new Date(userProfile.profile.tanggalLahir).toLocaleDateString('id-ID') : "___________";
    const alamat = userProfile?.profile?.alamat || "___________";

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Form Estimated Food Record - ${namaLengkap}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; font-size: 11px; color: #1e293b; }
      h1 { text-align: center; font-size: 16px; font-weight: 800; margin-bottom: 20px; letter-spacing: 1px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 60px; margin-bottom: 20px; }
      .info-row { display: flex; align-items: baseline; gap: 8px; padding: 3px 0; }
      .info-label { font-weight: 700; width: 100px; shrink-0; }
      .info-colon { font-weight: 700; }
      .info-value { border-bottom: 1px solid #cbd5e1; flex: 1; padding-bottom: 1px; min-height: 16px; }
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
      <div>
        <div class="info-row"><span class="info-label">Nama</span><span class="info-colon">:</span><span class="info-value">${namaLengkap}</span></div>
        <div class="info-row"><span class="info-label">Tanggal Lahir</span><span class="info-colon">:</span><span class="info-value">${tglLahir}</span></div>
        <br/>
        <div class="info-row"><span class="info-label">Usia</span><span class="info-colon">:</span><span class="info-value">${usia}</span></div>
        <div class="info-row"><span class="info-label">Alamat</span><span class="info-colon">:</span><span class="info-value">${alamat}</span></div>
      </div>
      <div>
        <div class="info-row"><span class="info-label">Berat Badan</span><span class="info-colon">:</span><span class="info-value">${bb}</span></div>
        <div class="info-row"><span class="info-label">Tinggi Badan</span><span class="info-colon">:</span><span class="info-value">${tb}</span></div>
        <br/>
        <div class="info-row"><span class="info-label">Pekerjaan</span><span class="info-colon">:</span><span class="info-value">${pekerjaan}</span></div>
        <div class="info-row"><span class="info-label">Periode catat</span><span class="info-colon">:</span><span class="info-value">(diisi hari ke: 1/2/3/4/5/6/7 dan tanggal)</span></div>
      </div>
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

  const hariSummary = calcNutrisi(records, analisis, makananData);
  const totalAsupan = hariSummary.reduce((acc, h) => ({
    energi: acc.energi + h.energi,
    protein: acc.protein + h.protein,
    lemak: acc.lemak + h.lemak,
    karbohidrat: acc.karbohidrat + h.karbohidrat,
    serat: acc.serat + h.serat,
  }), { energi: 0, protein: 0, lemak: 0, karbohidrat: 0, serat: 0 });

  const persentase = kebutuhan ? {
    energi: Math.round((totalAsupan.energi / (kebutuhan.energi * 7)) * 100),
    protein: Math.round((totalAsupan.protein / (kebutuhan.protein * 7)) * 100),
    lemak: Math.round((totalAsupan.lemak / (kebutuhan.lemak * 7)) * 100),
    karbohidrat: Math.round((totalAsupan.karbohidrat / (kebutuhan.karbohidrat * 7)) * 100),
    serat: Math.round((totalAsupan.serat / (kebutuhan.serat * 7)) * 100),
  } : null;

  const chartData = hariSummary.map(h => ({
    name: `H${h.hari}`,
    energi: Math.round(h.energi),
    protein: Math.round(h.protein * 10) / 10,
    lemak: Math.round(h.lemak * 10) / 10,
    karbohidrat: Math.round(h.karbohidrat * 10) / 10,
    serat: Math.round(h.serat * 10) / 10,
  }));

  const NUTRI_LIST = [
    { key: "energi" as const, label: "Energi", unit: "kkal" },
    { key: "protein" as const, label: "Protein", unit: "g" },
    { key: "lemak" as const, label: "Lemak", unit: "g" },
    { key: "karbohidrat" as const, label: "Karbohidrat", unit: "g" },
    { key: "serat" as const, label: "Serat", unit: "g" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <UserSidebar />

      <main className="flex-1 min-w-0 p-10 max-w-5xl">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Hasil Analisis Gizi</h1>
            <p className="text-slate-400 font-medium">Grafik dan ringkasan asupan gizi harian selama 7 hari.</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all shadow-lg w-fit"
          >
            <FileDown size={16} />
            Export Data (PDF)
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin inline text-slate-300" size={32} /></div>
        ) : (
          <div className="space-y-6">
            {!kebutuhan && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[2rem] px-6 py-5 text-sm text-amber-700 font-bold">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>Kebutuhan gizi Anda belum diinput oleh tenaga kesehatan. Grafik dan persentase akan tersedia setelah nakes mengisi data ini.</div>
              </div>
            )}

            {/* Tabs & Stats Cards */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab("semua")}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === "semua"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Tampilkan Semua Makro
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {NUTRI_LIST.map(n => (
                <div key={n.key}
                  onClick={() => setActiveTab(n.key)}
                  className={`rounded-[2rem] p-6 cursor-pointer transition-all border ${
                    activeTab === n.key 
                      ? "bg-white border-slate-200 shadow-lg scale-[1.02]" 
                      : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200"
                  }`}>
                  <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: NUTRI_COLORS[n.key] }} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{n.label}</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">
                    {n.key === "energi" ? Math.round(totalAsupan[n.key]) : (Math.round(totalAsupan[n.key] * 10) / 10).toFixed(1)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{n.unit} total</p>
                  {persentase && (
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        persentase[n.key] >= 80 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}>
                        {persentase[n.key]}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: activeTab === "semua" ? "#00B9AD" : NUTRI_COLORS[activeTab], boxShadow: `0 10px 25px -5px ${activeTab === "semua" ? "rgba(0, 185, 173, 0.3)" : NUTRI_COLORS[activeTab] + "33"}` }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">
                    {activeTab === "semua" ? "Grafik Pemenuhan Gizi Harian" : `Grafik ${NUTRI_LIST.find(n => n.key === activeTab)?.label}`}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {activeTab === "semua" ? "Kombinasi Seluruh Makronutrien" : "Asupan harian 7 hari"}
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={activeTab === "semua" ? 320 : 260}>
                {activeTab === "semua" ? (
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: NUTRI_COLORS.energi }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, padding: "12px 16px" }}
                      itemStyle={{ fontSize: 12, fontWeight: 700, padding: "4px 0" }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 800, marginTop: 20 }} />
                    <Bar yAxisId="left" dataKey="energi" name="Energi (kkal)" fill={NUTRI_COLORS.energi} radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar yAxisId="right" dataKey="protein" name="Protein (g)" fill={NUTRI_COLORS.protein} radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar yAxisId="right" dataKey="lemak" name="Lemak (g)" fill={NUTRI_COLORS.lemak} radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar yAxisId="right" dataKey="karbohidrat" name="Karbohidrat (g)" fill={NUTRI_COLORS.karbohidrat} radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar yAxisId="right" dataKey="serat" name="Serat (g)" fill={NUTRI_COLORS.serat} radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </BarChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700 }}
                      formatter={(v: number) => [`${v} ${NUTRI_LIST.find(n => n.key === activeTab)?.unit ?? ""}`, NUTRI_LIST.find(n => n.key === activeTab)?.label]}
                    />
                    {kebutuhan && (
                      <ReferenceLine y={kebutuhan[activeTab]} stroke={NUTRI_COLORS[activeTab]} strokeDasharray="5 3" label={{ value: "Kebutuhan/hari", fontSize: 10, fill: NUTRI_COLORS[activeTab] }} />
                    )}
                    <Bar dataKey={activeTab} fill={NUTRI_COLORS[activeTab]} radius={[8, 8, 0, 0]} maxBarSize={40} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Tabel Kesimpulan */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tabel Kesimpulan Gizi (7 Hari)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-y border-slate-100 bg-slate-50/50">
                      <th className="px-8 py-4">Zat Gizi</th>
                      <th className="px-4 py-4 text-right">Total Asupan</th>
                      {kebutuhan && <th className="px-4 py-4 text-right">Kebutuhan (7hr)</th>}
                      {persentase && <th className="px-4 py-4 text-right">%</th>}
                      {persentase && <th className="px-8 py-4 text-right">Status</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {NUTRI_LIST.map(n => {
                      const pct = persentase?.[n.key];
                      const terpenuhi = pct !== undefined ? pct >= 80 : null;
                      return (
                        <tr key={n.key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NUTRI_COLORS[n.key] }} />
                              {n.label}
                            </div>
                          </td>
                          <td className="px-4 py-5 text-right font-black text-slate-900">
                            {n.key === "energi" ? Math.round(totalAsupan[n.key]) : (Math.round(totalAsupan[n.key] * 10) / 10).toFixed(1)} {n.unit}
                          </td>
                          {kebutuhan && (
                            <td className="px-4 py-5 text-right text-slate-500 font-medium">
                              {kebutuhan[n.key] * 7} {n.unit}
                            </td>
                          )}
                          {persentase && (
                            <td className="px-4 py-5 text-right font-black" style={{ color: NUTRI_COLORS[n.key] }}>
                              {pct}%
                            </td>
                          )}
                          {persentase && (
                            <td className="px-8 py-5 text-right">
                              {terpenuhi !== null && (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider
                                  ${terpenuhi ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                  {terpenuhi ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                                  {terpenuhi ? "Terpenuhi" : "Kurang"}
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {persentase && (
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Interpretasi: ≥ 80% = Asupan Terpenuhi &nbsp;|&nbsp; &lt; 80% = Asupan Kurang Terpenuhi
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
