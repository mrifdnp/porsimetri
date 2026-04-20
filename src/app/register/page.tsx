"use client";

import { User, Stethoscope, ArrowLeft, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#00B9AD]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[#CDD729]/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden relative z-10 border border-gray-100">
        
        {/* LEFT SIDE: Visual Brand (Warna Solid Turquoise dari Referensi) */}
        <div className="hidden md:flex bg-[#00B9AD] p-16 flex-col justify-between relative overflow-hidden">
          {/* Circuit Decor */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 400 600">
            <path d="M400 100 H 200 V 400 H 0" stroke="white" strokeWidth="2" fill="none" strokeDasharray="10 10" />
            <circle cx="200" cy="400" r="6" fill="white" />
          </svg>

          <div className="relative z-10">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm tracking-widest uppercase mb-12"
            >
              <ArrowLeft size={20} /> Kembali
            </button>
            
            <div className="space-y-4">
              <div className="w-16 h-16 relative mb-6">
                <Image src="/logo-kemenkes-color.png" alt="Logo" fill className="object-contain brightness-0 invert" />
              </div>
              <h1 className="text-5xl font-black text-white leading-tight tracking-tighter">
                Mulai Hidup <br /> Lebih Sehat.
              </h1>
              <p className="text-[#FBFBFB]/70 text-lg font-medium max-w-xs">
                Bergabunglah dengan ribuan pengguna lainnya dalam memantau nutrisi secara digital.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={16} /> Data Aman & Terverifikasi
          </div>
        </div>

        {/* RIGHT SIDE: Register Selection Section */}
        <div className="p-10 md:p-20 flex flex-col justify-center bg-white">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-[#1E293B] mb-2 tracking-tight">Buat sebuah akun</h2>
            <p className="text-[#64748B] font-medium text-lg">Silahkan pilih tipe profil Anda.</p>
            <div className="h-1.5 w-12 bg-[#CDD729] rounded-full mt-4" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Option: User */}
            <button
              onClick={() => router.push("/register/user")}
              className="group flex items-center gap-6 bg-[#F5F5F7] hover:bg-[#00B9AD] rounded-[2rem] p-6 text-left transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(0,185,173,0.3)] active:scale-[0.98]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white text-[#00B9AD] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
                <User size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="font-black text-xl text-[#1E293B] group-hover:text-white transition-colors uppercase tracking-tight">Pengguna Umum</div>
                <div className="text-sm text-[#64748B] group-hover:text-white/80 font-medium mt-1">Saya ingin mencatat gizi harian</div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            {/* Option: Nakes */}
            <button
              onClick={() => router.push("/register/nakes")}
              className="group flex items-center gap-6 bg-[#F5F5F7] hover:bg-[#00B9AD] rounded-[2rem] p-6 text-left transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(0,185,173,0.3)] active:scale-[0.98]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white text-[#00B9AD] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
                <Stethoscope size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="font-black text-xl text-[#1E293B] group-hover:text-white transition-colors uppercase tracking-tight">Tenaga Kesehatan</div>
                <div className="text-sm text-[#64748B] group-hover:text-white/80 font-medium mt-1">Saya Nutrisionis / Dietisien</div>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <div className="text-center mt-12 pt-8 border-t border-gray-50">
            <p className="text-sm font-bold text-gray-400">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-[#00B9AD] font-black hover:text-[#60C0D0] transition-colors tracking-wide uppercase ml-2 text-xs">
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Tiny Footer */}
      <p className="absolute bottom-6 w-full text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">
        © 2026 Kemenkes Poltekkes Yogyakarta
      </p>
    </div>
  );
}