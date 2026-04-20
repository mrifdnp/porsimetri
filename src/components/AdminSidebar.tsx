"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react"; // 1. Import signOut
import { 
  LayoutDashboard, Utensils, Users, 
  LogOut, ShieldCheck, User
} from "lucide-react";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },      
  { icon: Utensils, label: "Database Makanan", href: "/dashboard/admin/makanan" },
  { icon: Users, label: "Data Pengguna", href: "/dashboard/admin/users" },      
  { icon: User, label: "Profil Saya", href: "/dashboard/profile" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  // 2. Handler untuk logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }); // Mengarahkan ke halaman login setelah keluar
  };

  return (
    <aside className="w-64 border-r border-gray-200 flex flex-col bg-white h-screen sticky top-0 shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 text-[#00B9AD] mb-8">
          <ShieldCheck size={28} strokeWidth={2.5} />
          <span className="font-black text-xl tracking-tighter text-slate-900">
            PORSI<span className="text-[#00B9AD]">METRI</span>
          </span>
        </div>

        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                  ? "bg-[#00B9AD]/10 text-[#00B9AD]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-100">
        <button 
          onClick={handleLogout} // 3. Tambahkan onClick
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Keluar
        </button>
      </div>
    </aside>
  );
}