"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Home, ClipboardList, BarChart3, LogOut, User,
  Heart, PlusCircle, CheckCircle2, Clock
} from "lucide-react";
import type { FoodRecord } from "@/lib/types";

const HARI_LABEL = ["Hari 1", "Hari 2", "Hari 3", "Hari 4", "Hari 5", "Hari 6", "Hari 7"];

export default function UserDashboard() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/food-record")
      .then(r => r.json())
      .then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hariDiisi = new Set(records.map(r => r.hari)).size;
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter(r => r.tanggal === today);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      {/* Topbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
            <Heart size={16} fill="currentColor" />
          </div>
          <span className="text-gray-800">Porsi</span><span className="text-primary -ml-1">Metri</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 font-semibold">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            {session?.user?.name}
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50">
            <LogOut size={15} /> <span className="hidden md:block">Keluar</span>
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 flex-1">
        {/* Salam */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Halo, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pantau asupan gizi harianmu di sini</p>
        </div>

        {/* Progress 7 Hari */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-6 mb-6 shadow-lg shadow-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white/80 text-sm font-medium mb-0.5">Progress Pencatatan</div>
              <div className="text-2xl font-extrabold">{hariDiisi} / 7 Hari</div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-white/30 flex items-center justify-center">
              <span className="text-xl font-extrabold">{Math.round((hariDiisi / 7) * 100)}%</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {HARI_LABEL.map((_, i) => {
              const filled = records.some(r => r.hari === i + 1);
              return (
                <div key={i} className={`flex-1 h-2.5 rounded-full transition-all
                  ${filled ? "bg-white" : "bg-white/25"}`} />
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            {HARI_LABEL.map((l, i) => (
              <span key={i} className="text-[9px] text-white/70 font-semibold">{i + 1}</span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/dashboard/user/food-record"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all">
              <PlusCircle size={20} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Tambah Catatan</div>
              <div className="text-xs text-gray-500 mt-0.5">Input makanan yang dikonsumsi</div>
            </div>
          </Link>
          <Link href="/dashboard/user/hasil"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Lihat Hasil</div>
              <div className="text-xs text-gray-500 mt-0.5">Grafik & analisis asupan gizi</div>
            </div>
          </Link>
        </div>

        {/* Catatan Hari Ini */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Catatan Hari Ini</h2>
            <Link href="/dashboard/user/food-record" className="text-xs text-primary font-semibold hover:underline">Lihat Semua</Link>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center text-gray-400 text-sm">Memuat...</div>
          ) : todayRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center">
              <Clock size={32} className="text-gray-200 mx-auto mb-3" />
              <div className="text-sm text-gray-500 font-medium">Belum ada catatan hari ini</div>
              <Link href="/dashboard/user/food-record"
                className="inline-block mt-4 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm">
                + Tambah Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayRecords.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{r.namaMakanan}</div>
                    <div className="text-xs text-gray-500">{r.waktuMakan} · {r.jamMakan} · {r.urt}</div>
                  </div>
                  <span className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-500 font-medium shrink-0">{r.caraPengolahan}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <Link href="/dashboard/user" className="flex flex-col items-center gap-1 text-primary">
          <Home size={20} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">Beranda</span>
        </Link>
        <Link href="/dashboard/user/food-record" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
          <ClipboardList size={20} strokeWidth={2} />
          <span className="text-[10px] font-medium">Catatan</span>
        </Link>
        <Link href="/dashboard/user/hasil" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
          <BarChart3 size={20} strokeWidth={2} />
          <span className="text-[10px] font-medium">Hasil</span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
          <User size={20} strokeWidth={2} />
          <span className="text-[10px] font-medium">Profil</span>
        </button>
      </nav>
    </div>
  );
}
