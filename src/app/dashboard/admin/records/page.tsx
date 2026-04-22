"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Search, Loader2, ClipboardList, 
  User as UserIcon, Calendar, Clock, Filter
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import type { DbUser, FoodRecord } from "@/lib/types";
import Image from "next/image";

export default function AdminRecordsPage() {
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/food-records").then(r => r.json()).catch(() => []),
      fetch("/api/admin/users").then(r => r.json()).catch(() => []),
    ]).then(([r, u]) => {
      setRecords(Array.isArray(r) ? r : []);
      setUsers(Array.isArray(u) ? u : []);
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
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-12 overflow-y-auto pb-24 md:pb-12">
        {/* Mobile Header */}
        <nav className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm -mx-4 mb-6">
          <div className="flex items-center gap-3">
             <Link href="/dashboard/admin" className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-slate-600" />
             </Link>
             <h1 className="font-bold text-lg text-slate-900">Semua Records</h1>
          </div>
        </nav>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 mb-10">
           <Link href="/dashboard/admin" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-[#00B9AD] hover:border-[#00B9AD] transition-all">
              <ChevronLeft size={20} />
           </Link>
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Master Food Records</h1>
              <p className="text-slate-500 text-sm font-medium">Monitoring seluruh aktivitas input makanan pasien.</p>
           </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 mb-8 shadow-sm">
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Cari nama pasien atau nama makanan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 transition-all placeholder:text-slate-400"
                 />
              </div>
              <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <Filter size={14} className="text-[#00B9AD]" />
                 Total: {filteredRecords.length} Items
              </div>
           </div>
        </div>

        {/* Records Table Card */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                       <th className="py-6 px-8">Pasien</th>
                       <th className="py-6 px-4">Menu Makanan</th>
                       <th className="py-6 px-4">Waktu & Hari</th>
                       <th className="py-6 px-4">Cara Olah</th>
                       <th className="py-6 px-8 text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       <tr>
                          <td colSpan={5} className="py-20 text-center">
                             <Loader2 className="animate-spin inline text-[#00B9AD]" size={32} />
                             <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Memuat database...</p>
                          </td>
                       </tr>
                    ) : filteredRecords.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="py-20 text-center">
                             <ClipboardList className="mx-auto text-slate-200 mb-4" size={48} />
                             <p className="text-slate-400 font-medium">Tidak ada data records yang ditemukan.</p>
                          </td>
                       </tr>
                    ) : (
                       filteredRecords.slice().reverse().map((r) => (
                          <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                             <td className="py-6 px-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#00B9AD] group-hover:text-white transition-all">
                                      <UserIcon size={18} />
                                   </div>
                                   <div>
                                      <p className="font-bold text-slate-900 group-hover:text-[#00B9AD] transition-colors leading-none mb-1">{getUserName(r.userId)}</p>
                                      <code className="text-[9px] font-mono text-slate-300">ID: {r.userId.substring(0, 8)}</code>
                                   </div>
                                </div>
                             </td>
                             <td className="py-6 px-4">
                                <p className="font-bold text-slate-900 leading-tight mb-1">{r.namaMakanan}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{r.namaPorsi || r.urt || "-"}</p>
                             </td>
                             <td className="py-6 px-4">
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                      <Calendar size={12} className="text-[#74D58C]" />
                                      Hari Ke-{r.hari}
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                      <Clock size={12} className="text-[#60C0D0]" />
                                      {r.waktuMakan} · {r.jamMakan}
                                   </div>
                                </div>
                             </td>
                             <td className="py-6 px-4">
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black rounded-lg uppercase tracking-tighter border border-slate-200">
                                   {r.caraPengolahan}
                                </span>
                             </td>
                             <td className="py-6 px-8 text-right">
                                <Link 
                                   href={`/dashboard/admin/users/${r.userId}`}
                                   className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-[#00B9AD] hover:text-[#00B9AD] transition-all shadow-sm"
                                >
                                   Detail Pasien
                                </Link>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
           
           {!loading && filteredRecords.length > 0 && (
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Menampilkan total {filteredRecords.length} catatan makanan dari database.
                 </p>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}
