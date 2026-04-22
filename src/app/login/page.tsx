"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Username atau password salah.");
    } else {
      // Catat log akses (fire-and-forget)
      fetch("/api/access-log", { method: "POST" }).catch(() => {});
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor (Vibe Biovita x Gambar Login) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#00B9AD]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[#CDD729]/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden relative z-10 border border-gray-100">
        
        {/* LEFT SIDE: Visual Brand */}
        <div className="hidden md:flex bg-white p-16 flex-col justify-between relative overflow-hidden border-r border-[#00B9AD]/10">
          
          <div className="absolute bottom-[-20%] right-[-30%] w-[120%] h-[120%] opacity-[0.15] pointer-events-none flex items-end justify-end mix-blend-multiply">
             <Image src="/hero.png" alt="Decor" fill className="object-contain" priority />
             <div className="absolute top-1/4 right-0 w-32 h-32 bg-[#CDD729]/30 rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-1/4 left-0 w-32 h-32 bg-[#60C0D0]/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#00B9AD] hover:text-[#1E293B] transition-colors font-bold text-sm tracking-widest uppercase mb-12"
            >
              <ArrowLeft size={20} /> Kembali
            </button>
            
            <div className="space-y-4">
              <div className="w-16 h-16 relative mb-6">
                <Image src="/logo-kemenkes-color.png" alt="Logo" fill sizes="64px" className="object-contain" />
              </div>
              <h1 className="text-5xl font-black text-[#1E293B] leading-tight tracking-tighter">
                Welcome back, <br /> Explorer !
              </h1>
              <p className="text-[#64748B] text-lg font-medium max-w-xs">
                Pantau asupan gizi harianmu dengan presisi tinggi di Porsi Metri.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-[#1E293B] text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={16} className="text-[#00B9AD]" /> Secured by Kemenkes Poltekkes Ykt
          </div>
        </div>

        {/* RIGHT SIDE: Form Section */}
        <div className="p-10 md:p-20 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-[#1E293B] mb-2 tracking-tight">Login Akun</h2>
            <div className="h-1.5 w-12 bg-[#CDD729] rounded-full" />
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 mb-8 text-sm font-bold">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-black text-[#1E293B] uppercase tracking-widest mb-3 transition-colors group-focus-within:text-[#00B9AD]">
                Username
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukan Username"
                className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all placeholder:text-gray-300 font-bold"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-black text-[#1E293B] uppercase tracking-widest mb-3 transition-colors group-focus-within:text-[#00B9AD]">
                Password
              </label>
              <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukan Password"
                className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 pr-14 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all placeholder:text-gray-300 font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B9AD] transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm font-bold text-gray-400">
                Belum ada akun?{" "}
                <Link href="/register" className="text-[#00B9AD] hover:text-[#60C0D0] transition-colors">
                  Daftar Sekarang
                </Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CDD729] hover:bg-[#D9E430] disabled:opacity-70 text-[#1E293B] font-black text-xl py-5 rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(205,215,41,0.3)] active:scale-[0.98] flex items-center justify-center mt-6"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}