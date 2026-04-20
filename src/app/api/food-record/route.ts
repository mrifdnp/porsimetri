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
    .eq('user_id', userId);
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
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
        nama_makanan: body.namaMakanan,
        urt: body.urt,
        jumlah_urt: body.jumlahUrt,
        cara_pengolahan: body.caraPengolahan
      })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
