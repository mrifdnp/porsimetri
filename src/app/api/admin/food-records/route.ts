import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readFoodRecords } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin" && role !== "nakes") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  const records = await readFoodRecords();
  
  // Transform snake_case from DB into camelCase expected by the UI
  const sanitized = records.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    tanggal: r.tanggal,
    hari: r.hari,
    waktuMakan: r.waktu_makan,
    jamMakan: r.jam_makan,
    asalMakanan: r.asal_makanan,
    makananId: r.makanan_id,
    namaMakanan: r.nama_makanan,
    urt: r.urt,
    jumlahUrt: r.jumlah_urt,
    caraPengolahan: r.cara_pengolahan,
    createdAt: r.created_at
  }));
  
  return NextResponse.json(sanitized);
}
