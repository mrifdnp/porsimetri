"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Search, Filter, MoreVertical, User, Stethoscope, Shield, MapPin, Clock } from "lucide-react";
import type { DbUser } from "@/lib/types";

interface AccessLog {
  user_id: string;
  ip_address: string;
  city: string | null;
  region: string | null;
  country: string | null;
  logged_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()).catch(() => []),
      fetch("/api/admin/access-logs").then(r => r.json()).catch(() => []),
    ]).then(([u, logs]) => {
      setUsers(Array.isArray(u) ? u : []);
      setAccessLogs(Array.isArray(logs) ? logs : []);
      setLoading(false);
    });
  }, []);

  // Helper: ambil log terakhir per user
  function getLastAccess(userId: string): AccessLog | null {
    return accessLogs.find(l => l.user_id === userId) || null;
  }

  function formatLocation(log: AccessLog | null): string {
    if (!log) return "-";
    const parts = [log.city, log.region, log.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : log.ip_address || "-";
  }

  function formatTime(log: AccessLog | null): string {
    if (!log) return "-";
    return new Date(log.logged_at).toLocaleString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.namaLengkap.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-10">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Pengguna</h1>
            <p className="text-sm text-slate-500 font-medium">Kelola akses dan informasi personil sistem</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari nama atau email..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] w-64 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* User Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Pengguna</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lokasi Akses</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu Akses Terakhir</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Tanggal Daftar</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 text-sm italic">Memuat data...</td></tr>
              ) : (
                filtered.map((u) => {
                  const lastAccess = getLastAccess(u.id);
                  return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                          {u.namaLengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{u.namaLengkap}</p>
                          <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-red-50 text-red-600' : 
                        u.role === 'nakes' ? 'bg-green-50 text-green-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {u.role === 'admin' && <Shield size={12} />}
                        {u.role === 'nakes' && <Stethoscope size={12} />}
                        {u.role === 'user' && <User size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#00B9AD] shrink-0" />
                        <p className="text-xs font-medium text-slate-600">{formatLocation(lastAccess)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#60C0D0] shrink-0" />
                        <p className="text-xs font-medium text-slate-600">{formatTime(lastAccess)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-xs font-bold text-slate-600">
                        {new Date(u.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
                      <button className="hover:text-slate-900 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
          
          {filtered.length === 0 && !loading && (
            <div className="p-20 text-center">
              <p className="text-sm text-slate-400 font-medium italic">Tidak ada data pengguna ditemukan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}