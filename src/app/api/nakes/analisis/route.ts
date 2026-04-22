import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "nakes") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const nakesId = session.user?.id as string;

  try {
    const body = await req.json();

    // Hapus analisis lama untuk food record yang sama (soft delete) sebelum insert baru
    await supabase
      .from('analisis_gizi')
      .update({ deleted_at: new Date().toISOString() })
      .eq('food_record_id', body.foodRecordId);

    const { data: entry, error } = await supabase
      .from('analisis_gizi')
      .insert({
        food_record_id: body.foodRecordId,
        nakes_id: nakesId,
        energi: Number(body.energi),
        protein: Number(body.protein),
        lemak: Number(body.lemak),
        karbohidrat: Number(body.karbohidrat),
        serat: Number(body.serat),
      })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
