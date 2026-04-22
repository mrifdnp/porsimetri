"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, User, ClipboardList, ArrowRight, Loader2, CheckCircle2, Clock, Activity } from "lucide-react";
import NakesSidebar from "@/components/NakesSidebar";
import { useSession } from "next-auth/react";

interface Pasien {
  id: string;
  namaLengkap?: string;
  email?: string;
  noHp?: string;
  createdAt?: string;
  totalRecords?: number;
  sudahAnalisis?: number;
}

export default function PasienSayaPage() {
  const { data: session } = useSession();
  const [pasienList, setPasienList] = useState<Pasien[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()).catch(() => []),
      fetch("/api/admin/food-records").then(r => r.json()).catch(() => []),
      fetch("/api/admin/analisis").then(r => r.json()).catch(() => []),
    ]).then(([users, records, analisis]) => {
      const userOnly = Array.isArray(users)
        ? users.filter((u: any) => u.role === "user")
        : [];

      const enriched: Pasien[] = userOnly.map((u: any) => {
        const userRecs = Array.isArray(records) ? records.filter((r: any) => r.userId === u.id) : [];
        const sudahAnalisis = Array.isArray(analisis)
          ? userRecs.filter(r => analisis.some((a: any) => a.foodRecordId === r.id)).length
          : 0;
        return {
          ...u,
          totalRecords: userRecs.length,
          sudahAnalisis,
        };
      });

      // Sort: yang punya catatan terbanyak duluan
      enriched.sort((a, b) => (b.totalRecords ?? 0) - (a.totalRecords ?? 0));
      setPasienList(enriched);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return pasienList;
    const q = search.toLowerCase();
    return pasienList.filter(p =>
      (p.namaLengkap || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  }, [pasienList, search]);

  const totalPasien = pasienList.length;
  const totalSelesai = pasienList.filter(p => (p.totalRecords ?? 0) > 0).length;
  const totalPending = pasienList.filter(p => (p.sudahAnalisis ?? 0) < (p.totalRecords ?? 0) && (p.totalRecords ?? 0) > 0).length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <NakesSidebar />

      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Pasien Saya</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Daftar seluruh pasien &amp; status analisis gizi mereka</p>
          </div>
          {/* Search */}
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00B9AD] transition-colors" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#00B9AD]/10 focus:border-[#00B9AD] w-72 transition-all"
            />
          </div>
        </header>

        <div className="p-10 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { label: "Total Pasien", value: totalPasien, icon: User, color: "#00B9AD", bg: "bg-[#00B9AD]/5" },
              { label: "Ada Catatan Makan", value: totalSelesai, icon: ClipboardList, color: "#74D58C", bg: "bg-[#74D58C]/5" },
              { label: "Perlu Analisis", value: totalPending, icon: Clock, color: "#F59E0B", bg: "bg-amber-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-[2rem] border border-slate-200 p-6 flex items-center gap-5`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "1a" }}>
                  <s.icon size={22} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                  <p className="text-3xl font-black text-slate-900 leading-none mt-1">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Pasien</th>
                  <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Kontak</th>
                  <th className="text-center px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Catatan</th>
                  <th className="text-center px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Analisis</th>
                  <th className="text-center px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="animate-spin inline text-slate-200" size={28} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-300 text-xs font-black uppercase tracking-widest">
                      {search ? "Pasien tidak ditemukan" : "Belum ada data pasien"}
                    </td>
                  </tr>
                ) : filtered.map(p => {
                  const total = p.totalRecords ?? 0;
                  const selesai = p.sudahAnalisis ?? 0;
                  const pct = total > 0 ? Math.round((selesai / total) * 100) : 0;
                  const statusColor = total === 0 ? "text-slate-300" : pct === 100 ? "text-[#74D58C]" : "text-amber-500";
                  const statusLabel = total === 0 ? "Belum ada catatan" : pct === 100 ? "Analisis Lengkap" : `${selesai}/${total} Teranalisis`;
                  const initials = (p.namaLengkap || p.email || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      {/* Avatar + Nama */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00B9AD] to-[#74D58C] flex items-center justify-center text-white font-black text-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{p.namaLengkap || "–"}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Kontak */}
                      <td className="px-6 py-5 hidden md:table-cell">
                        <p className="text-xs font-bold text-slate-500">{p.noHp || "–"}</p>
                      </td>
                      {/* Total Records */}
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${total > 0 ? "bg-[#00B9AD]/10 text-[#00B9AD]" : "bg-slate-100 text-slate-400"}`}>
                          <Activity size={11} />
                          {total} Item
                        </span>
                      </td>
                      {/* Analisis Progress */}
                      <td className="px-6 py-5 text-center">
                        {total > 0 ? (
                          <div className="space-y-1.5">
                            <div className="w-24 mx-auto bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#74D58C" : "#F59E0B" }} />
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{pct}%</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 font-bold">—</span>
                        )}
                      </td>
                      {/* Status Badge */}
                      <td className="px-6 py-5 text-center">
                        <div className={`flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${statusColor}`}>
                          {pct === 100 && total > 0 ? <CheckCircle2 size={13} /> : total > 0 ? <Clock size={13} /> : null}
                          {statusLabel}
                        </div>
                      </td>
                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/dashboard/nakes/${p.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00B9AD] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#00a69b] transition-all opacity-0 group-hover:opacity-100 shadow-lg shadow-[#00B9AD]/20"
                        >
                          Lihat <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
