"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import type { FoodRecord, AnalisisGizi, KebutuhanGizi, HariSummary } from "@/lib/types";
import makananData from "../../../../../data/makanan.json";

const NUTRI_COLORS = {
  energi: "#f472b6",
  protein: "#34d399",
  karbohidrat: "#fbbf24",
  lemak: "#60a5fa",
  serat: "#a78bfa",
};

interface MakananRaw {
  id: number;
  energi: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
  serat: number;
  satuanGram: number;
}

function calcNutrisi(records: FoodRecord[], analisis: AnalisisGizi[]): HariSummary[] {
  const byHari: Record<number, HariSummary> = {};
  for (let h = 1; h <= 7; h++) {
    byHari[h] = { hari: h, energi: 0, protein: 0, lemak: 0, karbohidrat: 0, serat: 0 };
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
      // estimasi dari data makanan x jumlah gram
      const mk = (makananData as MakananRaw[]).find(m => m.id === r.makananId);
      if (mk) {
        // jumlahUrt x satuanGram / 100
        const factor = (r.jumlahUrt * mk.satuanGram) / 100;
        byHari[r.hari].energi += mk.energi * factor;
        byHari[r.hari].protein += mk.protein * factor;
        byHari[r.hari].lemak += mk.lemak * factor;
        byHari[r.hari].karbohidrat += mk.karbohidrat * factor;
        byHari[r.hari].serat += mk.serat * factor;
      }
    }
  }
  return Object.values(byHari);
}

export default function HasilPage() {
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisGizi[]>([]);
  const [kebutuhan, setKebutuhan] = useState<KebutuhanGizi | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"energi" | "protein" | "lemak" | "karbohidrat" | "serat">("energi");

  useEffect(() => {
    Promise.all([
      fetch("/api/food-record").then(r => r.json()),
      fetch("/api/analisis-gizi").then(r => r.json()).catch(() => []),
      fetch("/api/kebutuhan-gizi").then(r => r.json()).catch(() => null),
    ]).then(([r, a, k]) => {
      setRecords(Array.isArray(r) ? r : []);
      setAnalisis(Array.isArray(a) ? a : []);
      setKebutuhan(k && !k.error ? k : null);
      setLoading(false);
    });
  }, []);

  const hariSummary = calcNutrisi(records, analisis);
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
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 shadow-sm">
        <Link href="/dashboard/user" className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-bold text-gray-900 text-base">Hasil Analisis Gizi</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Memuat data...</div>
        ) : (
          <>
            {!kebutuhan && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-4 text-sm text-amber-700 font-medium">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>Kebutuhan gizi Anda belum diinput oleh tenaga kesehatan. Grafik dan persentase akan tersedia setelah nakes mengisi data ini.</div>
              </div>
            )}

            {/* Tab Nutrisi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Grafik Asupan Harian (7 Hari)
              </h2>
              <div className="flex gap-2 flex-wrap mb-4">
                {NUTRI_LIST.map(n => (
                  <button key={n.key} onClick={() => setActiveTab(n.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                      ${activeTab === n.key ? "text-white shadow-sm" : "bg-gray-50 text-gray-600 border border-gray-100"}`}
                    style={activeTab === n.key ? { backgroundColor: NUTRI_COLORS[n.key] } : {}}>
                    {n.label}
                  </button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                    formatter={(v: number) => [`${v} ${NUTRI_LIST.find(n => n.key === activeTab)?.unit ?? ""}`, NUTRI_LIST.find(n => n.key === activeTab)?.label]}
                  />
                  {kebutuhan && (
                    <ReferenceLine y={kebutuhan[activeTab]} stroke={NUTRI_COLORS[activeTab]} strokeDasharray="5 3" label={{ value: "Kebutuhan/hari", fontSize: 10, fill: NUTRI_COLORS[activeTab] }} />
                  )}
                  <Bar dataKey={activeTab} fill={NUTRI_COLORS[activeTab]} radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabel Kesimpulan */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">Tabel Kesimpulan Gizi (7 Hari)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wide">
                      <th className="text-left px-5 py-3">Zat Gizi</th>
                      <th className="text-right px-4 py-3">Total Asupan</th>
                      {kebutuhan && <th className="text-right px-4 py-3">Kebutuhan (7hr)</th>}
                      {persentase && <th className="text-right px-4 py-3">%</th>}
                      {persentase && <th className="text-right px-5 py-3">Status</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {NUTRI_LIST.map(n => {
                      const pct = persentase?.[n.key];
                      const terpenuhi = pct !== undefined ? pct >= 80 : null;
                      return (
                        <tr key={n.key} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3.5 font-semibold text-gray-800">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NUTRI_COLORS[n.key] }} />
                              {n.label}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-gray-900">
                            {n.key === "energi" ? Math.round(totalAsupan[n.key]) : (Math.round(totalAsupan[n.key] * 10) / 10).toFixed(1)} {n.unit}
                          </td>
                          {kebutuhan && (
                            <td className="px-4 py-3.5 text-right text-gray-600">
                              {kebutuhan[n.key] * 7} {n.unit}
                            </td>
                          )}
                          {persentase && (
                            <td className="px-4 py-3.5 text-right font-bold" style={{ color: NUTRI_COLORS[n.key] }}>
                              {pct}%
                            </td>
                          )}
                          {persentase && (
                            <td className="px-5 py-3.5 text-right">
                              {terpenuhi !== null && (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                                  ${terpenuhi ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
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
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">
                    <strong>Interpretasi:</strong> ≥ 80% = Asupan Terpenuhi &nbsp;|&nbsp; &lt; 80% = Asupan Kurang Terpenuhi
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
