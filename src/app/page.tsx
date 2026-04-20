"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, SlidersHorizontal } from "lucide-react";

export default function PorsiMetriLanding() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1E293B] font-sans antialiased overflow-hidden flex flex-col">

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 z-[100] w-full bg-white/95 backdrop-blur-md px-6 md:px-12 h-20 flex items-center justify-between border-b border-[#00B9AD]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <Image 
              src="/logo-kemenkes-color.png" 
              alt="Logo Kemenkes"
              fill
              className="object-contain"
            />
          </div>
          <div className="font-bold text-2xl tracking-tighter">
            <span className="text-[#60C0D0]">Porsi</span>
            <span className="text-[#74D58C] -ml-0.5">Metri</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-[#1E293B]">
          {["Bagaimana Cara Kerja", "Tentang Kami", "Fitur", "Database Gizi"].map((link) => (
            <button key={link} className="hover:text-[#00B9AD] transition-colors uppercase tracking-widest text-[10px]">
              {link}
            </button>
          ))}
        </div>

        {/* Tombol LOGIN dengan warna #CDD729 */}
        <Link href="/login">
          <button className="hidden sm:flex bg-[#CDD729] text-[#1E293B] px-10 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-[#00B9AD] hover:text-white transition-all shadow-lg shadow-[#CDD729]/20 hover:shadow-[#00B9AD]/20 active:scale-95">
            LOGIN
          </button>
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative flex-1 flex items-center pt-20 px-6 md:px-12 bg-white overflow-hidden">
        {/* Decorative Circuit Lines */}
        <div className="absolute top-0 right-0 w-[50vw] h-full pointer-events-none opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none">
            <path d="M50 300 H 300 V 100 H 600 V 400 H 800" stroke="#00B9AD" strokeWidth="2" strokeDasharray="8 8"/>
            <path d="M100 250 V 450 H 350 V 250 H 700" stroke="#74D58C" strokeWidth="1" strokeDasharray="4 4"/>
            <circle cx="300" cy="100" r="5" fill="#CDD729"/>
            <circle cx="600" cy="400" r="5" fill="#60C0D0"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="w-full text-center md:text-left space-y-6">
            <div className="text-xs uppercase tracking-[0.4em] font-black text-[#00B9AD]">01 — MISI KAMI</div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tighter text-[#1E293B]">
              Ciptakan Pola <br className="hidden md:block"/> Asupan <span className="text-[#00B9AD]">Terbaik.</span>
            </h1>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
              Database nutrisi akurat persembahan Kemenkes Poltekkes Yogyakarta. Analisis energi dan komposisi gizi dalam satu genggaman.
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-4 max-w-md mx-auto md:mx-0">
              {[
                { name: "TKPI Terintegrasi", color: "text-[#CDD729]" },
                { name: "Database Lokal", color: "text-[#74D58C]" },
                { name: "Konsultasi Pakar", color: "text-[#60C0D0]" },
                { name: "Laporan Akurat", color: "text-[#00B9AD]" },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#1E293B]">
                  <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`} />
                  {item.name}
                </div>
              ))}
            </div>

            <div className="pt-8 flex justify-center md:justify-start">
              <Link href="/login">
                <button className="bg-[#1E293B] text-white px-12 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#00B9AD] transition-all shadow-2xl flex items-center gap-4 group">
                  MULAI ANALISIS SEKARANG <SlidersHorizontal size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </Link>
            </div>
          </div>

          <div className="w-full aspect-square relative flex items-center justify-center">
            <div className="w-full h-[80%] relative">
              <Image 
                src="/hero.png" 
                alt="Visual Porsi Metri"
                fill
                className="object-contain"
                priority
              />
              <div className="absolute top-1/4 right-0 w-16 h-16 bg-[#CDD729]/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-1/4 left-0 w-20 h-20 bg-[#60C0D0]/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-50 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-8 h-8 relative opacity-80">
                <Image src="/logo-kemenkes-color.png" alt="Footer Logo" fill className="object-contain" />
              </div>
              <div className="font-black text-2xl tracking-tighter text-[#1E293B]">
                <span className="text-[#60C0D0]">PORSI</span><span className="text-[#74D58C]">METRI</span>
              </div>
            </div>
            <p className="text-xs text-[#64748B] font-medium max-w-xs uppercase tracking-widest">
              Politeknik Kesehatan Kemenkes Yogyakarta. <br/>Data gizi estimasi per 100g sajian.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#CDD729]/10 flex items-center justify-center text-[#CDD729]"><Heart size={20} fill="currentColor"/></div>
              <div className="w-10 h-10 rounded-full bg-[#74D58C]/10 flex items-center justify-center text-[#74D58C] font-bold text-[10px]">IG</div>
              <div className="w-10 h-10 rounded-full bg-[#60C0D0]/10 flex items-center justify-center text-[#60C0D0] font-bold text-[10px]">FB</div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
              © 2026 Porsimetri • Hak Cipta Dilindungi
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}