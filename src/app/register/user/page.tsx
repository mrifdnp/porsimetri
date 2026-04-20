"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, Eye, EyeOff, Loader2, AlertCircle, 
  ChevronLeft, ShieldCheck, CheckCircle2, 
  User, Activity, ClipboardList 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const RIWAYAT_PENYAKIT_OPTIONS = ["DM (Diabetes Melitus)", "Hipertensi", "Stroke", "Jantung", "Kanker", "Hepatitis"];
const TINGKAT_AKTIVITAS = [
  { value: "Sangat Ringan", desc: "Tidur/istirahat hampir seharian" },
  { value: "Ringan", desc: "Duduk, aktivitas ringan di kantor/rumah" },
  { value: "Sedang", desc: "Berdiri, berjalan, aktivitas sedang" },
  { value: "Berat", desc: "Olahraga, pekerjaan fisik berat" },
];

export default function RegisterUserPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Step 1: Akun
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Profil Fisik
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [beratBadan, setBeratBadan] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [tingkatAktivitas, setTingkatAktivitas] = useState("");

  // Step 3: Riwayat Kesehatan
  const [riwayatPenyakit, setRiwayatPenyakit] = useState<string[]>([]);
  const [riwayatKonsultasi, setRiwayatKonsultasi] = useState<boolean | null>(null);
  const [statusDiet, setStatusDiet] = useState("");
  const [adaPengobatan, setAdaPengobatan] = useState<boolean | null>(null);
  const [jenisPengobatan, setJenisPengobatan] = useState("");
  const [prolanis, setProlanis] = useState<boolean | null>(null);
  const [pemeriksaanRutin, setPemeriksaanRutin] = useState<boolean | null>(null);

  function togglePenyakit(p: string) {
    setRiwayatPenyakit(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "user",
          namaLengkap,
          email,
          password,
          profile: {
            tanggalLahir,
            alamat,
            beratBadan: Number(beratBadan) || 0,
            tinggiBadan: Number(tinggiBadan) || 0,
            pekerjaan,
            tingkatAktivitas,
            riwayatPenyakit,
            riwayatKonsultasiGizi: riwayatKonsultasi,
            statusDiet,
            pengobatanRutin: { ada: adaPengobatan || false, jenis: jenisPengobatan },
            kepesertaanProlanis: prolanis,
            pemeriksaanRutin,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat akun");
      
      router.push("/login?registered=1");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-4 md:p-10 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#00B9AD]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[#CDD729]/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-5 bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden relative z-10 border border-gray-100 min-h-[700px]">
        
        {/* LEFT SIDE: Visual Brand & Stepper (2 Cols) */}
        <div className="hidden lg:flex lg:col-span-2 bg-[#00B9AD] p-16 flex-col justify-between relative overflow-hidden">
          <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 400 600">
            <path d="M0 100 H 200 V 500 H 400" stroke="white" strokeWidth="2" fill="none" strokeDasharray="10 10" />
          </svg>

          <div className="relative z-10">
            <div className="w-16 h-16 relative mb-8">
              <Image src="/logo-kemenkes-color.png" alt="Logo" fill className="object-contain brightness-0 invert" />
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tighter mb-12">
              Lengkapi Profil <br /> Kesehatan Anda.
            </h1>

            {/* Vertical Stepper */}
            <div className="space-y-10">
              {[
                { step: 1, label: "Informasi Akun", icon: User },
                { step: 2, label: "Profil Fisik", icon: Activity },
                { step: 3, label: "Riwayat Medis", icon: ClipboardList },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                    step >= item.step ? "bg-[#CDD729] text-[#1E293B]" : "bg-white/10 text-white/40"
                  }`}>
                    <item.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step >= item.step ? "text-[#CDD729]" : "text-white/30"}`}>Step 0{item.step}</span>
                    <span className={`font-bold ${step >= item.step ? "text-white" : "text-white/40"}`}>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
            <ShieldCheck size={16} /> Secured by Kemenkes Poltekkes Ykt
          </div>
        </div>

        {/* RIGHT SIDE: Form Section (3 Cols) */}
        <div className="lg:col-span-3 p-8 md:p-16 flex flex-col bg-white overflow-y-auto max-h-[90vh] lg:max-h-none">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-[#1E293B] mb-2 tracking-tight">
                {step === 1 && "Halo, Siapa Anda?"}
                {step === 2 && "Detail Tubuh Anda"}
                {step === 3 && "Kondisi Kesehatan"}
              </h2>
              <div className="h-1.5 w-12 bg-[#00B9AD] rounded-full" />
            </div>
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">User Registration</span>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 mb-8 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#00B9AD]">Nama Lengkap</label>
                  <input type="text" value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} placeholder="Masukkan nama sesuai KTP"
                    className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all font-bold" />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#00B9AD]">Email Aktif</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@perusahaan.com"
                    className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all font-bold" />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#00B9AD]">Password</label>
                  <div className="relative">
                      <input type={showPass ? "text" : "password"} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all font-bold" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#00B9AD]">
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                    <input type="date" value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)}
                      className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all font-bold" />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pekerjaan</label>
                    <input type="text" value={pekerjaan} onChange={e => setPekerjaan(e.target.value)} placeholder="Cth: PNS"
                      className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">BB (kg)</label>
                    <input type="number" value={beratBadan} onChange={e => setBeratBadan(e.target.value)} placeholder="60"
                      className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all font-bold text-center" />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TB (cm)</label>
                    <input type="number" value={tinggiBadan} onChange={e => setTinggiBadan(e.target.value)} placeholder="165"
                      className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-2xl px-6 py-4 text-lg text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all font-bold text-center" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tingkat Aktivitas Fisik</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TINGKAT_AKTIVITAS.map(ta => (
                      <button key={ta.value} type="button" onClick={() => setTingkatAktivitas(ta.value)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${tingkatAktivitas === ta.value ? "border-[#00B9AD] bg-[#EBFBF9]" : "border-gray-50 bg-[#FBFBFB] hover:border-gray-200"}`}>
                        <div className="font-black text-xs text-[#1E293B]">{ta.value}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{ta.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Riwayat Penyakit</label>
                  <div className="flex flex-wrap gap-2">
                    {RIWAYAT_PENYAKIT_OPTIONS.map(p => (
                      <button key={p} type="button" onClick={() => togglePenyakit(p)}
                        className={`px-4 py-2 rounded-full border-2 text-[10px] font-black transition-all ${riwayatPenyakit.includes(p) ? "bg-[#00B9AD] border-[#00B9AD] text-white" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pernah Konsultasi Gizi?</label>
                    <div className="flex gap-2">
                      {[true, false].map(v => (
                        <button key={String(v)} type="button" onClick={() => setRiwayatKonsultasi(v)}
                          className={`flex-1 py-3 rounded-xl border-2 font-black text-xs ${riwayatKonsultasi === v ? "border-[#74D58C] bg-[#F1FBF4] text-[#1E293B]" : "border-gray-50 text-gray-400"}`}>{v ? "YA" : "TIDAK"}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sedang Diet?</label>
                    <input type="text" value={statusDiet} onChange={e => setStatusDiet(e.target.value)} placeholder="Cth: Rendah Garam"
                      className="w-full bg-[#F5F5F7] border-2 border-transparent rounded-xl px-4 py-3 text-xs text-[#1E293B] outline-none focus:bg-white focus:border-[#00B9AD] transition-all font-bold" />
                  </div>
                </div>

                <div className="bg-[#FBFBFB] p-6 rounded-[2rem] border border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-black text-[#1E293B] uppercase tracking-[0.2em]">Pengobatan Rutin & Prolanis</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm">
                      <span className="text-[10px] font-bold text-gray-500">PROLANIS?</span>
                      <div className="flex gap-1">
                        {[true, false].map(v => (
                          <button key={String(v)} onClick={() => setProlanis(v)} className={`w-8 h-8 rounded-lg text-[10px] font-black ${prolanis === v ? "bg-[#CDD729] text-[#1E293B]" : "bg-gray-100 text-gray-300"}`}>{v ? "Y" : "T"}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm">
                      <span className="text-[10px] font-bold text-gray-500">CEK RUTIN?</span>
                      <div className="flex gap-1">
                        {[true, false].map(v => (
                          <button key={String(v)} onClick={() => setPemeriksaanRutin(v)} className={`w-8 h-8 rounded-lg text-[10px] font-black ${pemeriksaanRutin === v ? "bg-[#60C0D0] text-[#1E293B]" : "bg-gray-100 text-gray-300"}`}>{v ? "Y" : "T"}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-10 flex items-center gap-4">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="p-5 rounded-2xl border-2 border-gray-100 text-gray-400 hover:text-[#1E293B] transition-all">
                <ChevronLeft size={24} />
              </button>
            )}
            <button
              onClick={() => {
                if (step < 3) {
                  if (step === 1 && (!namaLengkap || !email || password.length < 8)) { setError("Lengkapi data akun dengan benar."); return; }
                  setError(""); setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={loading}
              className="flex-1 bg-[#1E293B] hover:bg-[#00B9AD] text-white font-black text-xl py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  {step === 3 ? "BUAT AKUN SAYA" : "SELANJUTNYA"}
                  <CheckCircle2 size={22} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs font-bold text-gray-300 mt-8">
            Sudah terdaftar? <Link href="/login" className="text-[#00B9AD] hover:underline uppercase ml-1">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}