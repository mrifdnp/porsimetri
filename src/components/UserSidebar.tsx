"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  Activity, ClipboardList, BarChart3, 
  LogOut, Heart, User, ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { icon: Activity, label: "Overview", href: "/dashboard/user" },
  { icon: ClipboardList, label: "Catatan Makan", href: "/dashboard/user/food-record" },
  { icon: BarChart3, label: "Hasil Analisis", href: "/dashboard/user/hasil" },
  { icon: User, label: "Profil Saya", href: "/dashboard/profile" },
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-slate-200 flex flex-col bg-white h-screen sticky top-0 shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3 text-[#00B9AD] mb-12">
          <div className="w-10 h-10 rounded-xl bg-[#00B9AD] text-white flex items-center justify-center shadow-lg shadow-[#00B9AD]/20">
            <Heart size={20} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">
            Porsi<span className="text-[#00B9AD]">metri</span>
          </span>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all relative group ${
                  isActive 
                  ? "text-[#00B9AD]" 
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavUser"
                    className="absolute inset-0 bg-[#00B9AD]/5 border border-[#00B9AD]/10 rounded-2xl" 
                  />
                )}
                <item.icon size={20} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-100">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-5 py-4 w-full text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Keluar Sesi
        </button>
      </div>
    </aside>
  );
}
