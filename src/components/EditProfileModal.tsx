"use client";

import { useState } from "react";
import { Edit2, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditProfileModal({ profile, isUser }: { profile: any, isUser: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(profile || {});
  const router = useRouter();

  if (!isUser) return null; // Hanya user (pasien) yang bisa edit via modal ini untuk sekarang

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            beratBadan: formData.beratBadan ? parseFloat(formData.beratBadan) : undefined,
            tinggiBadan: formData.tinggiBadan ? parseFloat(formData.tinggiBadan) : undefined,
        }),
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
              <form id="edit-profile" onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Berat Badan (kg)</label>
                    <input 
                      type="number" step="0.1" required
                      value={formData.beratBadan || ""}
                      onChange={e => setFormData({ ...formData, beratBadan: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tinggi Badan (cm)</label>
                    <input 
                      type="number" step="0.1" required
                      value={formData.tinggiBadan || ""}
                      onChange={e => setFormData({ ...formData, tinggiBadan: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tingkat Aktivitas</label>
                  <select 
                    value={formData.tingkatAktivitas || "Ringan"}
                    onChange={e => setFormData({ ...formData, tingkatAktivitas: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option>Sangat Ringan</option>
                    <option>Ringan</option>
                    <option>Sedang</option>
                    <option>Berat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status Diet Khusus</label>
                  <select 
                    value={formData.statusDiet || "Tidak Ada"}
                    onChange={e => setFormData({ ...formData, statusDiet: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option>Tidak Ada</option>
                    <option>Diet Rendah Kalori</option>
                    <option>Diet Rendah Garam</option>
                    <option>Diet Diabetes</option>
                    <option>Diet Jantung</option>
                  </select>
                </div>
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
