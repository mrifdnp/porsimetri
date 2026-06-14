"use client";

import { useState } from "react";
import { Edit2, Loader2, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditProfileModal({ profile, isUser, isNakes }: { profile: any, isUser: boolean, isNakes?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  const router = useRouter();

  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [strFile, setStrFile] = useState<File | null>(null);
  const [sipFile, setSipFile] = useState<File | null>(null);

  if (!isUser && !isNakes) return null; // Hanya user dan nakes yang bisa edit via modal ini

  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("isPrivate", "true");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Gagal upload");
    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let urlKTP, urlSTR, urlSIP;
      if (isNakes) {
        if (ktpFile) urlKTP = await uploadFile(ktpFile, "KTP");
        if (strFile) urlSTR = await uploadFile(strFile, "STR");
        if (sipFile) urlSIP = await uploadFile(sipFile, "SIP");
      }

      const payload = {
        ...formData,
        beratBadan: formData.beratBadan ? parseFloat(formData.beratBadan) : undefined,
        tinggiBadan: formData.tinggiBadan ? parseFloat(formData.tinggiBadan) : undefined,
      };

      if (urlKTP) payload.dokumenKTP = urlKTP;
      if (urlSTR) payload.dokumenSTR = urlSTR;
      if (urlSIP) payload.dokumenSIP = urlSIP;

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
    setSaving(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
      >
        <Edit2 size={16} />
        Edit Profil
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Edit Profil Data Fisik</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="edit-profile" onSubmit={handleSubmit} className="space-y-6">
                
                {/* User Data */}
                {isUser && (
                  <>
                <div>
                  <h3 className="text-sm font-black text-gray-800 border-b pb-2 mb-4">Data Fisik & Umum</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Berat Badan (kg)</label>
                      <input type="number" step="0.1" required value={formData.beratBadan || ""} onChange={e => setFormData({ ...formData, beratBadan: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tinggi Badan (cm)</label>
                      <input type="number" step="0.1" required value={formData.tinggiBadan || ""} onChange={e => setFormData({ ...formData, tinggiBadan: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tanggal Lahir</label>
                      <input type="date" value={formData.tanggalLahir || ""} onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pekerjaan</label>
                      <input type="text" value={formData.pekerjaan || ""} onChange={e => setFormData({ ...formData, pekerjaan: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alamat Lengkap</label>
                    <textarea rows={2} value={formData.alamat || ""} onChange={e => setFormData({ ...formData, alamat: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tingkat Aktivitas Fisik</label>
                    <select value={formData.tingkatAktivitas || "Ringan"} onChange={e => setFormData({ ...formData, tingkatAktivitas: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option>Sangat Ringan</option>
                      <option>Ringan</option>
                      <option>Sedang</option>
                      <option>Berat</option>
                    </select>
                  </div>
                </div>

                {/* Medical Data */}
                <div>
                  <h3 className="text-sm font-black text-gray-800 border-b pb-2 mb-4">Data Riwayat Medis</h3>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status Diet Khusus</label>
                    <input type="text" value={formData.statusDiet || ""} onChange={e => setFormData({ ...formData, statusDiet: e.target.value })} placeholder="Kosongkan jika tidak ada" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pernah Konsultasi Gizi?</label>
                      <select value={formData.riwayatKonsultasiGizi ? "true" : "false"} onChange={e => setFormData({ ...formData, riwayatKonsultasiGizi: e.target.value === "true" })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none">
                        <option value="true">Ya</option>
                        <option value="false">Tidak</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Kepesertaan Prolanis?</label>
                      <select value={formData.kepesertaanProlanis ? "true" : "false"} onChange={e => setFormData({ ...formData, kepesertaanProlanis: e.target.value === "true" })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none">
                        <option value="true">Ya</option>
                        <option value="false">Tidak</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pengobatan Rutin</label>
                    <div className="flex gap-2">
                      <select value={formData.pengobatanRutin?.ada ? "true" : "false"} onChange={e => setFormData({ ...formData, pengobatanRutin: { ...formData.pengobatanRutin, ada: e.target.value === "true" } })} className="w-1/3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none">
                        <option value="true">Ada</option>
                        <option value="false">Tidak Ada</option>
                      </select>
                      {formData.pengobatanRutin?.ada && (
                        <input type="text" placeholder="Jenis Obat" value={formData.pengobatanRutin?.jenis || ""} onChange={e => setFormData({ ...formData, pengobatanRutin: { ...formData.pengobatanRutin, jenis: e.target.value } })} className="w-2/3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                      )}
                    </div>
                  </div>
                </div>
                  </>
                )}

                {/* Nakes Data */}
                {isNakes && (
                  <div>
                    <h3 className="text-sm font-black text-gray-800 border-b pb-2 mb-4">Data Profesional Nakes</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pekerjaan</label>
                        <select value={formData.pekerjaan || ""} onChange={e => setFormData({ ...formData, pekerjaan: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] transition-all">
                          <option value="">Pilih</option>
                          <option value="Nutrisionis">Nutrisionis</option>
                          <option value="Dietisien">Dietisien</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lama Bekerja</label>
                        <select value={formData.lamaBekerja || ""} onChange={e => setFormData({ ...formData, lamaBekerja: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] transition-all">
                          <option value="">Pilih</option>
                          <option value="1-5 th">1-5 th</option>
                          <option value="5-10 th">5-10 th</option>
                          <option value=">10 th">&gt;10 th</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Instansi</label>
                      <input type="text" value={formData.instansi || ""} onChange={e => setFormData({ ...formData, instansi: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] transition-all" />
                    </div>
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alamat Instansi</label>
                      <textarea rows={2} value={formData.alamatInstansi || ""} onChange={e => setFormData({ ...formData, alamatInstansi: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#00B9AD]/20 focus:border-[#00B9AD] transition-all resize-none" />
                    </div>

                    <h3 className="text-sm font-black text-gray-800 border-b pb-2 mb-4">Dokumen Validasi (Upload Ulang Jika Ingin Mengganti)</h3>
                    {[
                      { label: "KTP", id: "edit-ktp", file: ktpFile, setter: setKtpFile, current: profile?.dokumenKTP },
                      { label: "STR", id: "edit-str", file: strFile, setter: setStrFile, current: profile?.dokumenSTR },
                      { label: "SIP", id: "edit-sip", file: sipFile, setter: setSipFile, current: profile?.dokumenSIP },
                    ].map(doc => (
                      <div key={doc.id} className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{doc.label}</label>
                        <label htmlFor={doc.id} className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-all ${doc.file ? "border-[#00B9AD] bg-[#00B9AD]/5" : "border-gray-200 hover:border-[#00B9AD]/50 hover:bg-gray-50"}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${doc.file ? "bg-[#00B9AD] text-white" : "bg-gray-100 text-gray-400"}`}>
                            <Upload size={16} />
                          </div>
                          <div className="truncate flex-1">
                            {doc.file ? (
                              <div className="text-xs font-semibold text-[#00B9AD] truncate">{doc.file.name}</div>
                            ) : (
                              <>
                                <div className="text-xs font-semibold text-gray-700">{doc.current ? "Telah Diupload - Klik untuk mengganti" : "Klik untuk upload"}</div>
                              </>
                            )}
                          </div>
                          <input id={doc.id} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => doc.setter(e.target.files?.[0] ?? null)} />
                        </label>
                      </div>
                    ))}
                  </div>
                )}

              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                type="submit" form="edit-profile" disabled={saving}
                className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
