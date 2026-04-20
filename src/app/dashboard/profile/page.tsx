import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/lib/db";
import Link from "next/link";
import { ChevronLeft, User as UserIcon, Mail, Phone, Calendar, Briefcase, Activity, Shield, Award, MapPin, ArrowLeft } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import NakesSidebar from "@/components/NakesSidebar";
import type { DbUser, UserProfile, NakesProfile } from "@/lib/types";

export const runtime = "nodejs";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dbUser = await getUserById(session.user.id);
  if (!dbUser) redirect("/login");

  const isNakes = dbUser.role === "nakes";
  const isAdmin = dbUser.role === "admin";
  const isUser = dbUser.role === "user";

  const p = dbUser.profile as any;
  const namaLengkap = dbUser.namaLengkap || (dbUser as any).nama_lengkap || "User";

  // Render Header according to role
  const RoleSidebar = () => {
    if (isAdmin) return <AdminSidebar />;
    if (isNakes) return <NakesSidebar />;
    return null;
  };

  return (
    <div className={`min-h-screen flex ${isAdmin ? "bg-slate-50" : isNakes ? "bg-[#F8FAFC]" : "bg-gray-50 flex-col"}`}>
      <RoleSidebar />

      <main className={`flex-1 ${isUser ? "max-w-3xl mx-auto w-full px-4 md:px-6 py-8" : "p-10"}`}>
        {isUser && (
          <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 h-14 flex items-center gap-3 shadow-sm mb-6 -mx-4 md:-mx-6 rounded-b-2xl">
            <Link href="/dashboard/user" className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="font-bold text-gray-900 text-base">Profil Saya</h1>
          </nav>
        )}

        {/* Content */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 md:items-center mb-10 pb-10 border-b border-gray-100">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black shrink-0 ${isUser ? 'bg-primary/10 text-primary' : isNakes ? 'bg-[#00B9AD]/10 text-[#00B9AD]' : 'bg-slate-100 text-slate-500'}`}>
              {namaLengkap.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{namaLengkap}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><Mail size={14}/> {dbUser.email}</span>
                {dbUser.noHp && <span className="flex items-center gap-1.5"><Phone size={14}/> {dbUser.noHp}</span>}
                {((dbUser as any).no_hp) && !dbUser.noHp && <span className="flex items-center gap-1.5"><Phone size={14}/> {(dbUser as any).no_hp}</span>}
                <span className={`px-2.5 py-1 uppercase tracking-widest text-[10px] rounded-full ${isAdmin ? 'bg-red-50 text-red-600' : isNakes ? 'bg-[#00B9AD]/10 text-[#00B9AD]' : 'bg-blue-50 text-blue-600'}`}>
                  {dbUser.role}
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Informasi Spesifik</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {isUser && p && (
              <>
                <InfoItem icon={Briefcase} label="Pekerjaan" value={p.pekerjaan} />
                <InfoItem icon={Activity} label="Tingkat Aktivitas" value={p.tingkatAktivitas} />
                <InfoItem icon={Calendar} label="Tanggal Lahir" value={p.tanggalLahir} />
                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Berat Badan</p>
                     <p className="text-xl font-black text-gray-900">{p.beratBadan || "-"}<span className="text-xs text-gray-500 font-bold ml-1">kg</span></p>
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tinggi Badan</p>
                     <p className="text-xl font-black text-gray-900">{p.tinggiBadan || "-"}<span className="text-xs text-gray-500 font-bold ml-1">cm</span></p>
                  </div>
                </div>
                <InfoItem icon={Shield} label="Status Diet" value={p.statusDiet} />
                <InfoItem icon={MapPin} label="Alamat" value={p.alamat} />
                <InfoItem icon={Award} label="Riwayat Penyakit" value={p.riwayatPenyakit?.length > 0 ? p.riwayatPenyakit.join(", ") : "-"} />
              </>
            )}

            {isNakes && p && (
              <>
                <InfoItem icon={Briefcase} label="Profesi" value={p.pekerjaan} />
                <InfoItem icon={Calendar} label="Lama Bekerja" value={p.lamaBekerja} />
                <InfoItem icon={MapPin} label="Instansi" value={p.instansi} />
                <InfoItem icon={MapPin} label="Alamat Instansi" value={p.alamatInstansi} />
                
                <div className="md:col-span-2 mt-4 space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 border-t border-gray-100 pt-6">Dokumen Validasi</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    {p.dokumenSTR ? (
                       <a href={p.dokumenSTR} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-[#00B9AD] bg-[#00B9AD]/5 text-[#00B9AD] font-bold text-sm hover:bg-[#00B9AD]/10 transition-colors">
                         Lihat Dokumen STR
                         <ArrowLeft className="rotate-[135deg]" size={16}/>
                       </a>
                    ) : <div className="flex-1 p-4 rounded-2xl bg-gray-50 text-gray-400 text-sm font-semibold border border-gray-100">STR Belum Terupload</div>}

                    {p.dokumenSIP ? (
                       <a href={p.dokumenSIP} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-[#00B9AD] bg-[#00B9AD]/5 text-[#00B9AD] font-bold text-sm hover:bg-[#00B9AD]/10 transition-colors">
                         Lihat Dokumen SIP
                         <ArrowLeft className="rotate-[135deg]" size={16}/>
                       </a>
                    ) : <div className="flex-1 p-4 rounded-2xl bg-gray-50 text-gray-400 text-sm font-semibold border border-gray-100">SIP Belum Terupload</div>}
                  </div>
                </div>
              </>
            )}

            {isAdmin && (
               <div className="col-span-1 md:col-span-2 py-10 text-center text-gray-400 font-semibold border-2 border-dashed border-gray-100 rounded-2xl">
                 Administrator tidak memiliki profil tambahan.
               </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
        <Icon size={16} className="text-gray-400" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );
}