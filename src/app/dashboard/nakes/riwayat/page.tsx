"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Search, Loader2, ClipboardList, 
  User as UserIcon, Calendar, Clock, Filter, ArrowRight,
  CheckCircle2
} from "lucide-react";
import NakesSidebar from "@/components/NakesSidebar";
import type { DbUser, FoodRecord, AnalisisGizi } from "@/lib/types";

export default function NakesHistoryPage() {
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisGizi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/food-records").then(r => r.json()).catch(() => []),
      fetch("/api/admin/users").then(r => r.json()).catch(() => []),
      fetch("/api/admin/analisis").then(r => r.json()).catch(() => []),
    ]).then(([r, u, a]) => {
      setRecords(Array.isArray(r) ? r : []);
      setUsers(Array.isArray(u) ? u : []);
      setAnalisis(Array.isArray(a) ? a : []);
      setLoading(false);
    });
  }, []);

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.namaLengkap || "Unknown Patient";
  };

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const q = searchTerm.toLowerCase();
    return records.filter(r => {
      const patientName = getUserName(r.userId).toLowerCase();
      const foodName = r.namaMakanan.toLowerCase();
      return patientName.includes(q) || foodName.includes(q);
    });
  }, [records, users, searchTerm]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] flex-col md:flex-row">
      <NakesSidebar />

      <main className="flex-1 p-4 md:p-12 overflow-y-auto pb-24 md:pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Riwayat Konsultasi</h1>
              <p className="text-slate-500 text-sm font-medium">Rekapitulasi seluruh asupan gizi pasien yang telah diinput.</p>
           </div>
           
           <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#00B9AD]/10 flex items-center justify-center text-[#00B9AD]">
                 <ClipboardList size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Records</p>
                 <p className="text-lg font-black text-slate-900 leading-none">{records.length}</p>
              </div>
           </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
           <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
              type="text" 
              placeholder="Cari nama pasien atau menu makanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#00B9AD]/10 focus:border-[#00B9AD] transition-all shadow-sm"
           />
        </div>

        {/* List Records */}
        <div className="space-y-4">
           {loading ? (
              <div className="py-20 text-center">
                 <Loader2 className="animate-spin inline text-[#00B9AD]" size={32} />
                 <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Sinkronisasi Data...</p>
              </div>
           ) : filteredRecords.length === 0 ? (
              <div className="py-20 text-center bg-white border border-slate-200 rounded-[2rem]">
                 <ClipboardList className="mx-auto text-slate-100 mb-4" size={48} />
                 <p className="text-slate-400 font-medium italic">Tidak ada riwayat catatan ditemukan.</p>
              </div>
           ) : (
              filteredRecords.slice().reverse().map((r) => {
                 const hasAnalisis = analisis.some(a => a.foodRecordId === r.id);
                 return (
                    <div key={r.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#00B9AD] transition-all group shadow-sm">
                       <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${hasAnalisis ? "bg-[#74D58C]/10 text-[#74D58C]" : "bg-[#60C0D0]/10 text-[#60C0D0]"}`}>
                             <UserIcon size={24} />
                          </div>
                          <div className="min-w-0">
                             <h4 className="font-black text-slate-900 group-hover:text-[#00B9AD] transition-colors truncate">{getUserName(r.userId)}</h4>
                             <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HARI KE-{r.hari}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="text-[10px] font-black text-[#60C0D0] uppercase tracking-widest">{r.waktuMakan}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex-1 w-full md:px-10">
                          <div className="flex items-center gap-2 mb-1">
                             <p className="text-sm font-bold text-slate-700">{r.namaMakanan}</p>
                             {hasAnalisis && <CheckCircle2 size={14} className="text-[#74D58C]" />}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                             {r.namaPorsi || r.urt} · {r.caraPengolahan} · {r.jamMakan}
                          </p>
                       </div>

                       <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right hidden md:block">
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status Analisis</p>
                             <p className={`text-[10px] font-black uppercase ${hasAnalisis ? "text-[#74D58C]" : "text-amber-500"}`}>
                                {hasAnalisis ? "Selesai" : "Pending"}
                             </p>
                          </div>
                          <Link 
                             href={`/dashboard/nakes/${r.userId}`}
                             className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#00B9AD] hover:text-white transition-all border border-slate-200 w-full md:w-auto justify-center"
                          >
                             Evaluasi <ArrowRight size={14} />
                          </Link>
                       </div>
                    </div>
                 );
              })
           )}
        </div>
      </main>
    </div>
  );
}
