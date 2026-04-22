import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from('makanan_induk')
    .select('*, kategori:kategori_makanan(*), porsi:makanan_porsi(*)')
    .is('deleted_at', null);
  
  // Filter out soft-deleted porsi explicitly just in case
  const filteredData = (data || []).map(item => ({
    ...item,
    porsi: item.porsi ? item.porsi.filter((p: any) => p.deleted_at === null) : []
  }));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(filteredData);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { kode, nama, kategori_id, keterangan, foto, porsi } = body;

  const { data: newItem, error } = await supabase
    .from('makanan_induk')
    .insert({ kode, nama, kategori_id, keterangan, foto })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (porsi && Array.isArray(porsi) && porsi.length > 0) {
    const porsiToInsert = porsi.map((p: any) => ({
      makanan_id: newItem.id,
      kode_porsi: p.kode_porsi,
      nama_porsi: p.nama_porsi,
      berat_gram: p.berat_gram,
      energi: p.energi || 0,
      protein: p.protein || 0,
      lemak: p.lemak || 0,
      karbohidrat: p.karbohidrat || 0,
      serat: p.serat || 0,
    }));
    await supabase.from('makanan_porsi').insert(porsiToInsert);
  }
  
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, kode, nama, kategori_id, keterangan, foto, porsi } = body;

  if (!id) return NextResponse.json({ error: "ID is required for update" }, { status: 400 });

  const { data: updatedItem, error } = await supabase
    .from('makanan_induk')
    .update({ kode, nama, kategori_id, keterangan, foto })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (porsi && Array.isArray(porsi)) {
    // Very simple sync logic: hard delete old porsis and reinsert (since Admin replaces list)
    // Wait, no! If we hard delete Porsi, past food_records referencing porsi_id will be orphaned!
    // We should soft-delete the ones not in the request, or just update existing, insert new.
    
    // Get existing porsi
    const { data: existingPorsi } = await supabase.from('makanan_porsi').select('id').eq('makanan_id', id);
    const existingIds = existingPorsi?.map(ep => ep.id) || [];
    
    const incomingIds = porsi.map((p: any) => p.id).filter(id => id);
    const toDelete = existingIds.filter(id => !incomingIds.includes(id));
    
    if (toDelete.length > 0) {
      await supabase.from('makanan_porsi').update({ deleted_at: new Date().toISOString() }).in('id', toDelete);
    }

    for (const p of porsi) {
      const pData = {
        makanan_id: id,
        kode_porsi: p.kode_porsi,
        nama_porsi: p.nama_porsi,
        berat_gram: p.berat_gram,
        energi: p.energi || 0,
        protein: p.protein || 0,
        lemak: p.lemak || 0,
        karbohidrat: p.karbohidrat || 0,
        serat: p.serat || 0,
      };
      if (p.id) {
         await supabase.from('makanan_porsi').update(pData).eq('id', p.id);
      } else {
         await supabase.from('makanan_porsi').insert(pData);
      }
    }
  }

  return NextResponse.json(updatedItem, { status: 200 });
}
