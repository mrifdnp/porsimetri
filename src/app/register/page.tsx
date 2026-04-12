"use client";

import { Heart, User, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f9fa] via-white to-[#d0f0f2] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 mb-3">
            <Heart size={28} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Porsi<span className="text-primary">Metri</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manajemen Gizi Digital</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Buat Akun Baru</h2>
          <p className="text-sm text-gray-500 mb-6">Pilih jenis akun yang sesuai dengan Anda</p>

          <div className="grid grid-cols-1 gap-4">
            <button
              id="register-as-user"
              onClick={() => router.push("/register/user")}
              className="group flex items-center gap-4 border-2 border-gray-100 hover:border-primary rounded-2xl p-5 text-left transition-all hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all shrink-0">
                <User size={22} />
              </div>
              <div>
                <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">Pasien / Umum</div>
                <div className="text-sm text-gray-500 mt-0.5">Pengguna yang ingin mencatat asupan gizi harian</div>
              </div>
            </button>

            <button
              id="register-as-nakes"
              onClick={() => router.push("/register/nakes")}
              className="group flex items-center gap-4 border-2 border-gray-100 hover:border-primary rounded-2xl p-5 text-left transition-all hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-all shrink-0">
                <Stethoscope size={22} />
              </div>
              <div>
                <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">Tenaga Kesehatan</div>
                <div className="text-sm text-gray-500 mt-0.5">Nutrisionis atau Dietisien yang mengelola pasien</div>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
