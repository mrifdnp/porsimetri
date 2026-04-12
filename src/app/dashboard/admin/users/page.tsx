"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, User, Stethoscope, Shield } from "lucide-react";
import type { DbUser } from "@/lib/types";

const ROLE_ICON = {
  user: User,
  nakes: Stethoscope,
  admin: Shield,
};
const ROLE_COLOR = {
  user: "bg-blue-50 text-blue-700",
  nakes: "bg-green-50 text-green-700",
  admin: "bg-red-50 text-red-600",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<"all" | "user" | "nakes" | "admin">("all");

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => {
      setUsers(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const filtered = filterRole === "all" ? users : users.filter(u => u.role === filterRole);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 shadow-sm">
        <Link href="/dashboard/admin" className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-bold text-gray-900">Data Pengguna</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(["all", "user", "nakes", "admin"] as const).map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${filterRole === r ? "bg-primary text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-primary/40"}`}>
              {r === "all" ? "Semua" : r === "nakes" ? "Nakes" : r.charAt(0).toUpperCase() + r.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">({r === "all" ? users.length : users.filter(u => u.role === r).length})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Memuat...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => {
              const Icon = ROLE_ICON[u.role] ?? User;
              return (
                <div key={u.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${ROLE_COLOR[u.role] ?? "bg-gray-50 text-gray-500"}`}>
                    {u.namaLengkap.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{u.namaLengkap}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${ROLE_COLOR[u.role] ?? "bg-gray-50 text-gray-500"}`}>
                    <Icon size={11} />
                    {u.role}
                  </span>
                  <div className="text-xs text-gray-400 shrink-0 hidden md:block">
                    {new Date(u.createdAt).toLocaleDateString("id-ID")}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">Tidak ada pengguna</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
