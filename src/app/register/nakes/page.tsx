"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Eye, EyeOff, Loader2, AlertCircle, ChevronLeft, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const PEKERJAAN_OPTIONS = ["Nutrisionis", "Dietisien"] as const;
const LAMA_OPTIONS = ["1-5 th", "5-10 th", ">10 th"] as const;

export default function RegisterNakesPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Step 1: Akun
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Profil Nakes
  const [pekerjaan, setPekerjaan] = useState<"Nutrisionis" | "Dietisien" | "">("");
  const [lamaBekerja, setLamaBekerja] = useState("");
  const [instansi, setInstansi] = useState("");
  const [alamatInstansi, setAlamatInstansi] = useState("");

  // Step 3: Upload Dokumen
  const [strFile, setStrFile] = useState<File | null>(null);
  const [sipFile, setSipFile] = useState<File | null>(null);

  function handleFileChange(type: "str" | "sip", file: File | null) {
    if (!file) return;
    if (type === "str") setStrFile(file);
    else setSipFile(file);
  }

  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Import supabase on the fly or ensure it's imported at the top
    const { supabase } = await import("@/lib/supabase");
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("dokumen_nakes")
      .upload(fileName, file);

    if (uploadError) throw new Error("Gagal upload " + folder + ": " + uploadError.message);

    const { data: urlData } = supabase.storage
      .from("dokumen_nakes")
      .getPublicUrl(uploadData.path);
      
    return urlData.publicUrl;
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      let urlSTR, urlSIP;
      
      // Upload file directly if selected
      if (strFile) urlSTR = await uploadFile(strFile, "STR");
      if (sipFile) urlSIP = await uploadFile(sipFile, "SIP");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLengkap,
          email,
          password,
          noHp,
          role: "nakes",
          profile: {
            noHp,
            pekerjaan,
            lamaBekerja,
            instansi,
            alamatInstansi,
            dokumenSTR: urlSTR || undefined,
            dokumenSIP: urlSIP || undefined,
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
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 relative shrink-0">
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
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Pendaftaran Tenaga Kesehatan</p>
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
                <p className="text-sm text-gray-500">Identitas untuk login ke sistem</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                <input id="n-nama" type="text" value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)}
                  placeholder="Termasuk gelar (cth: dr. Siti, S.Gz)" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">No HP / WA Aktif</label>
                <input id="n-hp" type="tel" value={noHp} onChange={e => setNoHp(e.target.value)}
                  placeholder="08xxxxxxxxxx" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Aktif</label>
                <input id="n-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input id="n-password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter" className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button onClick={() => {
                if (!namaLengkap || !noHp || !email || password.length < 8) { setError("Lengkapi semua data. Password min. 8 karakter."); return; }
                setError(""); setStep(2);
              }} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 mt-2">
                Lanjut
              </button>
            </div>
          )}

          {/* Step 2: Profil Nakes */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Data Profesional</h2>
                <p className="text-sm text-gray-500">Informasi pekerjaan dan instansi</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan</label>
                <div className="grid grid-cols-2 gap-3">
                  {PEKERJAAN_OPTIONS.map(p => (
                    <button key={p} type="button" onClick={() => setPekerjaan(p)}
                      className={`border-2 rounded-xl py-3 text-sm font-semibold transition-all
                        ${pekerjaan === p ? "border-primary bg-primary/10 text-primary" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lama Bekerja</label>
                <div className="grid grid-cols-3 gap-2">
                  {LAMA_OPTIONS.map(l => (
                    <button key={l} type="button" onClick={() => setLamaBekerja(l)}
                      className={`border-2 rounded-xl py-2.5 text-sm font-semibold transition-all
                        ${lamaBekerja === l ? "border-primary bg-primary/10 text-primary" : "border-gray-100 text-gray-600 hover:border-gray-200"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Instansi</label>
                <input id="n-instansi" type="text" value={instansi} onChange={e => setInstansi(e.target.value)}
                  placeholder="Cth: RSUD Dr. Sardjito, Puskesmas..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Instansi</label>
                <input id="n-alamat-instansi" type="text" value={alamatInstansi} onChange={e => setAlamatInstansi(e.target.value)}
                  placeholder="Jl. ..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all">
                  <ChevronLeft size={16} /> Kembali
                </button>
                <button onClick={() => {
                  if (!pekerjaan || !lamaBekerja || !instansi) { setError("Lengkapi pekerjaan, lama bekerja, dan instansi."); return; }
                  setError(""); setStep(3);
                }} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20">
                  Lanjut
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Dokumen */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Dokumen Kompetensi</h2>
                <p className="text-sm text-gray-500">Upload STR dan SIP untuk verifikasi</p>
              </div>

              {[
                { label: "STR (Surat Tanda Registrasi)", id: "n-str", type: "str" as const, file: strFile },
                { label: "SIP (Surat Izin Praktik)", id: "n-sip", type: "sip" as const, file: sipFile },
              ].map(doc => (
                <div key={doc.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{doc.label}</label>
                  <label htmlFor={doc.id} className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition-all
                    ${doc.file ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${doc.file ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                      <Upload size={18} />
                    </div>
                    <div className="truncate">
                      {doc.file
                        ? <div className="text-sm font-semibold text-primary truncate max-w-[200px]">{doc.file.name}</div>
                        : <>
                          <div className="text-sm font-semibold text-gray-700">Klik untuk upload</div>
                          <div className="text-xs text-gray-400">PDF, JPG, PNG (max 5MB)</div>
                        </>
                      }
                    </div>
                    <input id={doc.id} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                      onChange={e => handleFileChange(doc.type, e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              ))}

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                ⚠️ Akun Anda akan diverifikasi admin sebelum dapat mengakses fitur nakes.
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
