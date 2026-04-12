"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Heart, LogOut, Users, ClipboardList, ChevronRight, User } from "lucide-react";
import type { DbUser, FoodRecord } from "@/lib/types";

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
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
            <Heart size={16} fill="currentColor" />
          </div>
          <span className="text-gray-800">Porsi</span><span className="text-primary -ml-1">Metri</span>
          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Nakes</span>
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

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard Nakes</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data gizi pasien Anda</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users size={22} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-500 font-medium">Total Pasien</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardList size={22} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{records.length}</div>
              <div className="text-sm text-gray-500 font-medium">Total Food Record</div>
            </div>
          </div>
        </div>

        {/* Daftar Pasien */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Daftar Pasien</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Memuat...</div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-sm text-gray-400">
              Belum ada pasien terdaftar
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(u => {
                const userRecords = records.filter(r => r.userId === u.id);
                const hariDiisi = new Set(userRecords.map(r => r.hari)).size;
                return (
                  <Link key={u.id} href={`/dashboard/nakes/${u.id}`}
                    className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {u.namaLengkap.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{u.namaLengkap}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="font-bold text-primary">{hariDiisi}/7</div>
                      <div className="text-xs text-gray-400">Hari</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
