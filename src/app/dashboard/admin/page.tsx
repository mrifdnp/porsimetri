"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Heart, LogOut, Users, ClipboardList, Stethoscope,
  Database, User, ChevronRight
} from "lucide-react";
import type { DbUser, FoodRecord } from "@/lib/types";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<DbUser[]>([]);
  const [records, setRecords] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()).catch(() => []),
      fetch("/api/admin/food-records").then(r => r.json()).catch(() => []),
    ]).then(([u, r]) => {
      setUsers(Array.isArray(u) ? u : []);
      setRecords(Array.isArray(r) ? r : []);
      setLoading(false);
    });
  }, []);

  const totalUser = users.filter(u => u.role === "user").length;
  const totalNakes = users.filter(u => u.role === "nakes").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
            <Heart size={16} fill="currentColor" />
          </div>
          <span className="text-gray-800">Porsi</span><span className="text-primary -ml-1">Metri</span>
          <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-sm font-semibold text-gray-600">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50">
            <LogOut size={15} /> <span className="hidden md:block">Keluar</span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola seluruh data aplikasi PorsiMetri</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Pasien", value: totalUser, color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Stethoscope, label: "Tenaga Kesehatan", value: totalNakes, color: "text-green-500", bg: "bg-green-50" },
            { icon: ClipboardList, label: "Food Record", value: records.length, color: "text-purple-500", bg: "bg-purple-50" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-gray-900">{loading ? "—" : stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/dashboard/admin/makanan"
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all">
              <Database size={22} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">Kelola Makanan</div>
              <div className="text-sm text-gray-500">Tambah/edit database makanan & nilai gizi</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
          <Link href="/dashboard/admin/users"
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all">
              <User size={22} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">Data Pengguna</div>
              <div className="text-sm text-gray-500">Lihat semua user, nakes, dan food record</div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>

        {/* Food Records terbaru */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Food Record Terbaru</h2>
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">Memuat...</div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wide">
                      <th className="text-left px-5 py-3">Nama Makanan</th>
                      <th className="text-left px-4 py-3">Waktu</th>
                      <th className="text-left px-4 py-3">Cara</th>
                      <th className="text-left px-4 py-3">Hari</th>
                      <th className="text-left px-5 py-3">User ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.slice(-10).reverse().map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-semibold text-gray-800">{r.namaMakanan}</td>
                        <td className="px-4 py-3 text-gray-600">{r.waktuMakan}</td>
                        <td className="px-4 py-3 text-gray-500">{r.caraPengolahan}</td>
                        <td className="px-4 py-3"><span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-lg">H{r.hari}</span></td>
                        <td className="px-5 py-3 text-xs text-gray-400 font-mono">{r.userId.substring(0, 8)}...</td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-400">Belum ada food record</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
