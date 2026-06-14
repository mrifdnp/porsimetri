import Link from "next/link";
import { AlertCircle, ArrowLeft, LogOut } from "lucide-react";
import { signOut } from "@/auth";

export const runtime = "nodejs";

export default function NakesPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f9fa] via-white to-[#d0f0f2] flex flex-col items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Menunggu Verifikasi</h1>
        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
          Akun Tenaga Kesehatan Anda sedang dalam tahap peninjauan oleh Admin kami. Anda baru dapat mengakses fitur dashboard setelah dokumen (KTP, STR, SIP) berhasil diverifikasi.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/api/auth/signout" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl transition-colors">
            <LogOut size={18} /> Keluar (Logout)
          </Link>
        </div>
      </div>
    </div>
  );
}
