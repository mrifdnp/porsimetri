"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, ClipboardList, BarChart3, User, 
  ImageIcon, LayoutDashboard, Utensils, Users, 
  Stethoscope, Activity
} from "lucide-react";

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

export default function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
          { icon: Utensils, label: "Makanan", href: "/dashboard/admin/makanan" },
          { icon: Users, label: "Users", href: "/dashboard/admin/users" },
          { icon: User, label: "Profil", href: "/dashboard/profile" },
        ];
      case "nakes":
        return [
          { icon: Activity, label: "Overview", href: "/dashboard/nakes" },
          { icon: Users, label: "Pasien", href: "/dashboard/nakes/pasien" },
          { icon: ClipboardList, label: "Riwayat", href: "/dashboard/nakes/riwayat" },
          { icon: User, label: "Profil", href: "/dashboard/profile" },
        ];
      default: // user
        return [
          { icon: Home, label: "Beranda", href: "/dashboard/user" },
          { icon: ImageIcon, label: "Galeri", href: "/dashboard/user/galeri" },
          { icon: ClipboardList, label: "Catatan", href: "/dashboard/user/food-record" },
          { icon: BarChart3, label: "Hasil", href: "/dashboard/user/hasil" },
          { icon: User, label: "Profil", href: "/dashboard/profile" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-2 py-3 flex justify-around items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-[#00B9AD]" : "text-gray-400"}`}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
