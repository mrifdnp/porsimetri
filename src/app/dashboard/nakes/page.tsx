"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Users, ClipboardList, ChevronRight, 
  Search, Bell, User as UserIcon, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import NakesSidebar from "@/components/NakesSidebar";
import type { DbUser, FoodRecord } from "@/lib/types";
import Image from "next/image";

export default function NakesDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<DbUser[]>([]);
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()).catch(() => []),
      fetch("/api/admin/food-records").then(r => r.json()).catch(() => []),
    ]).then(([u, r]) => {
      const patients = Array.isArray(u) ? u.filter((x: DbUser) => x.role === "user") : [];
      setUsers(patients);
      setRecords(Array.isArray(r) ? r : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] flex-col md:flex-row">
      <NakesSidebar />

      <main className="flex-1 min-w-0 pb-20">
        <nav className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative shrink-0">
              <Image
                src="/logo-kemenkes-color.png"
                alt="Logo Kemenkes"
                fill
                className="object-contain"
              />
            </div>
            <div className="font-bold text-xl tracking-tighter">
              <span className="text-[#60C0D0]">Porsi</span>
              <span className="text-[#74D58C] -ml-0.5">Metri</span>
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="text-[11px] font-bold text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            Profil
          </Link>
        </nav>

        {/* Simple Topbar Content */}
        <header className="hidden md:flex h-20 bg-white border-b border-slate-200 px-10 items-center justify-between sticky top-0 z-40">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <UserIcon size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Nakes</p>
                <p className="text-sm font-bold text-slate-900 leading-none">{session?.user?.name}</p>
             </div>
           </div>

           <div className="flex items-center gap-4">
              <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
           </div>
        </header>

        <div className="p-4 md:p-10 max-w-6xl">
          {/* Welcome Text */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Monitor Pasien.</h1>
            <p className="text-slate-400 font-medium">Evaluasi asupan gizi harian pasien di bawah pengawasan Anda.</p>
          </div>

          {/* Key Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[#00B9AD] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#00B9AD]/20 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Aktif</p>
                <h3 className="text-5xl font-black tracking-tighter mb-4">{users.length} Pasien</h3>
                <div className="flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1.5 rounded-full">
                  <Calendar size={14} /> Berjalan Normal
                </div>
              </div>
              <Users size={140} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Records Masuk</p>
               <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{records.length} <span className="text-lg text-slate-300">Data</span></h3>
               <p className="text-xs font-bold text-[#00B9AD] mt-4 uppercase tracking-widest">Update Real-time</p>
            </div>
          </div>

          {/* Patient List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Daftar Pantauan</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Cari pasien..." className="bg-slate-100 border-none rounded-full pl-9 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#00B9AD]/20 w-48 transition-all" />
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Memuat Data Pasien...</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {users.map(u => {
                  const userRecords = records.filter(r => r.userId === u.id);
                  const hariDiisi = new Set(userRecords.map(r => r.hari)).size;
                  
                  return (
                    <Link key={u.id} href={`/dashboard/nakes/${u.id}`}
                      className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-[#00B9AD]/50 transition-all group">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#00B9AD] font-black text-xl border border-slate-100 group-hover:bg-[#00B9AD] group-hover:text-white transition-all">
                        {u.namaLengkap.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900 group-hover:text-[#00B9AD] transition-colors leading-none mb-1 text-lg uppercase tracking-tight">
                          {u.namaLengkap}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                      </div>

                      <div className="flex items-center gap-10 pr-4">
                        <div className="text-right">
                          <div className="text-xl font-black text-slate-900 leading-none mb-1">{hariDiisi}<span className="text-[10px] text-slate-300 ml-0.5">/7</span></div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kepatuhan</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#00B9AD]/10 group-hover:text-[#00B9AD] transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}