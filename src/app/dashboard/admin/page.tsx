"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, ClipboardList, Stethoscope, 
  Database, User, Activity, ArrowUpRight, Loader2,
  MapPin, Clock, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar"; // Import sidebar kamu
import type { DbUser, FoodRecord } from "@/lib/types";

interface AccessLog {
  user_id: string;
  ip_address: string;
  city: string | null;
  region: string | null;
  country: string | null;
  logged_at: string;
}

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("");
  const [users, setUsers] = useState<DbUser[]>([]);
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(s => setAdminName(s?.user?.name || "Admin")).catch(() => {});
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()).catch(() => []),
      fetch("/api/admin/food-records").then(r => r.json()).catch(() => []),
      fetch("/api/admin/access-logs").then(r => r.json()).catch(() => []),
    ]).then(([u, r, logs]) => {
      setUsers(Array.isArray(u) ? u : []);
      setRecords(Array.isArray(r) ? r : []);
      setAccessLogs(Array.isArray(logs) ? logs : []);
      setLoading(false);
    });
  }, []);

  const totalUser = users.filter(u => u.role === "user").length;
  const totalNakes = users.filter(u => u.role === "nakes").length;

  // Filter log hanya admin & nakes, lalu cocokkan dengan nama user
  const adminNakesIds = new Set(users.filter(u => u.role === "admin" || u.role === "nakes").map(u => u.id));
  const filteredLogs = accessLogs.filter(l => adminNakesIds.has(l.user_id));

  function getUserName(userId: string): string {
    return users.find(u => u.id === userId)?.namaLengkap || "Unknown";
  }
  function getUserRole(userId: string): string {
    return users.find(u => u.id === userId)?.role || "-";
  }
  function formatLocation(log: AccessLog): string {
    const parts = [log.city, log.region, log.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : log.ip_address || "-";
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar dari component yang sudah ada */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        
        {/* Simple Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-500 text-sm font-medium">Selamat datang kembali, {adminName || 'Admin'}</p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Activity size={14} className="text-[#00B9AD]" />
            System Live: 2026.04.15
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Pasien", value: totalUser, icon: Users, color: "bg-[#00B9AD]" },
            { label: "Tenaga Medis", value: totalNakes, icon: Stethoscope, color: "bg-[#74D58C]" },
            { label: "Food Records", value: records.length, icon: ClipboardList, color: "bg-[#60C0D0]" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-black/5`}>
                <stat.icon size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                {loading ? "..." : stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Quick Actions Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/dashboard/admin/makanan" className="group bg-slate-900 rounded-[2.5rem] p-8 flex items-center justify-between transition-all hover:bg-[#00B9AD]">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#CDD729]">
                <Database size={28} />
              </div>
              <div>
                <h4 className="text-white font-black text-lg uppercase tracking-tight">Database Makanan</h4>
                <p className="text-white/50 text-xs">Kelola nilai gizi & TKPI</p>
              </div>
            </div>
            <ArrowUpRight className="text-white/20 group-hover:text-white transition-colors" />
          </Link>

          <Link href="/dashboard/admin/users" className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 flex items-center justify-between transition-all hover:border-[#00B9AD]">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-[#00B9AD] group-hover:text-white transition-all">
                <User size={28} />
              </div>
              <div>
                <h4 className="text-slate-900 font-black text-lg uppercase tracking-tight">User Directory</h4>
                <p className="text-slate-400 text-xs">Manajemen akses personil</p>
              </div>
            </div>
            <ArrowUpRight className="text-slate-200 group-hover:text-[#00B9AD] transition-colors" />
          </Link>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Aktivitas Terkini</h3>
            <Link href="/dashboard/admin/records" className="text-[10px] font-black text-[#00B9AD] uppercase tracking-widest hover:underline">Lihat Semua</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="pb-4 px-2">Makanan</th>
                  <th className="pb-4 px-2">Waktu</th>
                  <th className="pb-4 px-2">Status</th>
                  <th className="pb-4 px-2 text-right">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="animate-spin inline text-slate-200" /></td></tr>
                ) : records.slice(-5).reverse().map((r) => (
                  <tr key={r.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-2">
                      <p className="font-bold text-slate-900 group-hover:text-[#00B9AD] transition-colors">{r.namaMakanan}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{r.caraPengolahan}</p>
                    </td>
                    <td className="py-5 px-2 text-sm text-slate-500 font-medium">{r.waktuMakan}</td>
                    <td className="py-5 px-2">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 text-[9px] font-black rounded-full uppercase tracking-tighter">Day-0{r.hari}</span>
                    </td>
                    <td className="py-5 px-2 text-right">
                      <code className="text-[10px] font-mono text-slate-300">#{r.userId.substring(0, 8)}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Login Admin & Nakes */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00B9AD] flex items-center justify-center text-white shadow-lg shadow-black/5">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Log Login Admin & Nakes</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredLogs.length} log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="pb-4 px-2">Nama</th>
                  <th className="pb-4 px-2">Role</th>
                  <th className="pb-4 px-2">Lokasi Akses</th>
                  <th className="pb-4 px-2">Waktu Akses</th>
                  <th className="pb-4 px-2 text-right">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="animate-spin inline text-slate-200" /></td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400 italic">Belum ada data login.</td></tr>
                ) : filteredLogs.slice(0, 10).map((log, i) => {
                  const role = getUserRole(log.user_id);
                  return (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-2">
                      <p className="font-bold text-slate-900 group-hover:text-[#00B9AD] transition-colors">{getUserName(log.user_id)}</p>
                    </td>
                    <td className="py-5 px-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {role === 'admin' ? <Shield size={10} /> : <Stethoscope size={10} />}
                        {role}
                      </span>
                    </td>
                    <td className="py-5 px-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#00B9AD] shrink-0" />
                        <span className="text-sm text-slate-600 font-medium">{formatLocation(log)}</span>
                      </div>
                    </td>
                    <td className="py-5 px-2">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#60C0D0] shrink-0" />
                        <span className="text-sm text-slate-500 font-medium">
                          {new Date(log.logged_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-2 text-right">
                      <code className="text-[10px] font-mono text-slate-300">{log.ip_address}</code>
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