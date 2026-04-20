import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from('makanan_item').select('*, kategori:kategori_makanan(*)');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { nama, kategori_id, jenis, energi, protein, karbohidrat, lemak, serat, urt, satuanGram, foto } = body;

  const { data: newItem, error } = await supabase
    .from('makanan_item')
    .insert({
      nama,
      kategori_id,
      jenis,
      energi,
      protein,
      karbohidrat,
      lemak,
      serat,
      urt: urt || '{}',
      satuan_gram: satuanGram,
      foto
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json(newItem, { status: 201 });
}
