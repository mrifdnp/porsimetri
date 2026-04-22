import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;
  
  const { data, error } = await supabase
    .from('food_records')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = (data || []).map((db: any) => ({
    id: db.id,
    userId: db.user_id,
    tanggal: db.tanggal,
    hari: db.hari,
    waktuMakan: db.waktu_makan,
    jamMakan: db.jam_makan,
    asalMakanan: db.asal_makanan,
    makananId: db.makanan_id,
    porsiId: db.porsi_id,
    namaMakanan: db.nama_makanan,
    namaPorsi: db.nama_porsi,
    urt: db.urt,
    jumlahUrt: db.jumlah_urt || 1,
    caraPengolahan: db.cara_pengolahan,
    createdAt: db.created_at
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;

  try {
    const body = await req.json();

    const { data: newRecord, error } = await supabase
      .from('food_records')
      .insert({
        user_id: userId,
        tanggal: body.tanggal,
        hari: body.hari,
        waktu_makan: body.waktuMakan,
        jam_makan: body.jamMakan,
        asal_makanan: body.asalMakanan,
        makanan_id: body.makananId,
        porsi_id: body.porsiId,
        nama_makanan: body.namaMakanan,
        nama_porsi: body.namaPorsi,
        urt: body.urt || body.namaPorsi || "1 Porsi",
        jumlah_urt: body.jumlahUrt || 1,
        cara_pengolahan: body.caraPengolahan
      })
      .select()
      .single();

    if (error) throw error;
    
    const mappedRecord = {
      id: newRecord.id,
      userId: newRecord.user_id,
      tanggal: newRecord.tanggal,
      hari: newRecord.hari,
      waktuMakan: newRecord.waktu_makan,
      jamMakan: newRecord.jam_makan,
      asalMakanan: newRecord.asal_makanan,
      makananId: newRecord.makanan_id,
      namaMakanan: newRecord.nama_makanan,
      urt: newRecord.urt,
      jumlahUrt: newRecord.jumlah_urt,
      caraPengolahan: newRecord.cara_pengolahan,
      createdAt: newRecord.created_at
    };

    return NextResponse.json(mappedRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
