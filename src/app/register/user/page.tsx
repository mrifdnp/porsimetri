"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Eye, EyeOff, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

const RIWAYAT_PENYAKIT_OPTIONS = ["DM (Diabetes Melitus)", "Hipertensi", "Stroke", "Jantung", "Kanker", "Hepatitis"];
const TINGKAT_AKTIVITAS = [
  { value: "Sangat Ringan", desc: "Tidur/istirahat hampir seharian" },
  { value: "Ringan", desc: "Duduk, aktivitas ringan di kantor/rumah" },
  { value: "Sedang", desc: "Berdiri, berjalan, aktivitas sedang" },
  { value: "Berat", desc: "Olahraga, pekerjaan fisik berat" },
  { value: "Sangat Berat", desc: "Atlet, pekerjaan sangat berat" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLengkap,
          email,
          password,
          role: "user",
          profile: {
            tanggalLahir,
            alamat,
            beratBadan: beratBadan ? Number(beratBadan) : undefined,
            tinggiBadan: tinggiBadan ? Number(tinggiBadan) : undefined,
            pekerjaan,
            tingkatAktivitas,
            riwayatPenyakit,
            riwayatKonsultasiGizi: riwayatKonsultasi ?? undefined,
            statusDiet,
            pengobatanRutin: adaPengobatan !== null ? { ada: adaPengobatan, jenis: jenisPengobatan || undefined } : undefined,
            kepesertaanProlanis: prolanis ?? undefined,
            pemeriksaanRutin: pemeriksaanRutin ?? undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registrasi gagal"); setLoading(false); return; }
      router.push("/login?registered=1");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f9fa] via-white to-[#d0f0f2] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 mb-2">
            <Heart size={22} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Porsi<span className="text-primary">Metri</span></h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step >= s ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? "bg-primary" : "bg-gray-100"}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Akun */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Data Akun</h2>
                <p className="text-sm text-gray-500">Isi informasi untuk login</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                <input id="u-nama" type="text" value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)}
                  placeholder="Nama sesuai identitas" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Aktif</label>
                <input id="u-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input id="u-password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter" className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button onClick={() => {
                if (!namaLengkap || !email || password.length < 8) { setError("Lengkapi semua data. Password min. 8 karakter."); return; }
                setError(""); setStep(2);
              }} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 mt-2">
                Lanjut
              </button>
            </div>
          )}

          {/* Step 2: Profil Fisik */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Data Fisik</h2>
                <p className="text-sm text-gray-500">Informasi fisik untuk analisis gizi</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Lahir</label>
                  <input id="u-ttl" type="date" value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pekerjaan</label>
                  <input id="u-pekerjaan" type="text" value={pekerjaan} onChange={e => setPekerjaan(e.target.value)}
                    placeholder="Pelajar, PNS, dll." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat</label>
                <input id="u-alamat" type="text" value={alamat} onChange={e => setAlamat(e.target.value)}
                  placeholder="Alamat lengkap" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Berat Badan (kg)</label>
                  <input id="u-bb" type="number" min="20" max="300" value={beratBadan} onChange={e => setBeratBadan(e.target.value)}
                    placeholder="60" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tinggi Badan (cm)</label>
                  <input id="u-tb" type="number" min="100" max="250" value={tinggiBadan} onChange={e => setTinggiBadan(e.target.value)}
                    placeholder="165" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tingkat Aktivitas Fisik</label>
                <div className="space-y-2">
                  {TINGKAT_AKTIVITAS.map(ta => (
                    <button key={ta.value} type="button" onClick={() => setTingkatAktivitas(ta.value)}
                      className={`w-full flex items-center gap-3 border-2 rounded-xl px-4 py-2.5 text-left transition-all
                        ${tingkatAktivitas === ta.value ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all
                        ${tingkatAktivitas === ta.value ? "border-primary bg-primary" : "border-gray-300"}`} />
                      <div>
                        <div className={`text-sm font-semibold ${tingkatAktivitas === ta.value ? "text-primary" : "text-gray-700"}`}>{ta.value}</div>
                        <div className="text-xs text-gray-500">{ta.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
                  <ChevronLeft size={16} /> Kembali
                </button>
                <button onClick={() => { setError(""); setStep(3); }} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20">
                  Lanjut
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Riwayat Kesehatan */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Riwayat Kesehatan</h2>
                <p className="text-sm text-gray-500">Informasi kesehatan untuk analisis lebih akurat</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Riwayat Penyakit (pilih yang sesuai)</label>
                <div className="grid grid-cols-2 gap-2">
                  {RIWAYAT_PENYAKIT_OPTIONS.map(p => (
                    <button key={p} type="button" onClick={() => togglePenyakit(p)}
                      className={`border-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all
                        ${riwayatPenyakit.includes(p) ? "border-primary bg-primary/10 text-primary" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pernah konsultasi gizi?</label>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)} type="button" onClick={() => setRiwayatKonsultasi(v)}
                      className={`flex-1 border-2 rounded-xl py-2.5 text-sm font-semibold transition-all
                        ${riwayatKonsultasi === v ? "border-primary bg-primary/10 text-primary" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                      {v ? "Ya" : "Tidak"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Diet Saat Ini</label>
                <input id="u-diet" type="text" value={statusDiet} onChange={e => setStatusDiet(e.target.value)}
                  placeholder="Cth: Diet rendah garam, diet DM" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pengobatan rutin?</label>
                <div className="flex gap-3 mb-2">
                  {[true, false].map(v => (
                    <button key={String(v)} type="button" onClick={() => setAdaPengobatan(v)}
                      className={`flex-1 border-2 rounded-xl py-2.5 text-sm font-semibold transition-all
                        ${adaPengobatan === v ? "border-primary bg-primary/10 text-primary" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                      {v ? "Ya" : "Tidak"}
                    </button>
                  ))}
                </div>
                {adaPengobatan && (
                  <input id="u-obat" type="text" value={jenisPengobatan} onChange={e => setJenisPengobatan(e.target.value)}
                    placeholder="Jenis obat yang dikonsumsi" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Peserta Prolanis?</label>
                  <div className="flex gap-2">
                    {[true, false].map(v => (
                      <button key={String(v)} type="button" onClick={() => setProlanis(v)}
                        className={`flex-1 border-2 rounded-xl py-2 text-sm font-semibold transition-all
                          ${prolanis === v ? "border-primary bg-primary/10 text-primary" : "border-gray-100 text-gray-600"}`}>
                        {v ? "Ya" : "Tidak"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pemeriksaan Rutin?</label>
                  <div className="flex gap-2">
                    {[true, false].map(v => (
                      <button key={String(v)} type="button" onClick={() => setPemeriksaanRutin(v)}
                        className={`flex-1 border-2 rounded-xl py-2 text-sm font-semibold transition-all
                          ${pemeriksaanRutin === v ? "border-primary bg-primary/10 text-primary" : "border-gray-100 text-gray-600"}`}>
                        {v ? "Ya" : "Tidak"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(2)} className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
                  <ChevronLeft size={16} /> Kembali
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark disabled:opacity-60 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Mendaftar...</> : "Selesai & Daftar"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
