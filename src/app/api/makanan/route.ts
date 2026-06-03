import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.makananInduk.findMany({
    where: { deletedAt: null },
    include: {
      kategori: true,
      porsi: {
        where: { deletedAt: null }
      }
    }
  });

  // Map to Supabase-like format just in case frontend relies on exact snake_case fields
  const filteredData = data.map(item => ({
    ...item,
    kategori_id: item.kategoriId,
    kategori: item.kategori,
    porsi: item.porsi.map(p => ({
      ...p,
      makanan_id: p.makananId,
      kode_porsi: p.kodePorsi,
      nama_porsi: p.namaPorsi,
      berat_gram: p.beratGram
    }))
  }));

  return NextResponse.json(filteredData);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { kode, nama, kategori_id, keterangan, foto, porsi } = body;

  try {
    const newItem = await prisma.makananInduk.create({
      data: {
        kode,
        nama,
        kategoriId: kategori_id,
        keterangan,
        foto
      }
    });

    if (porsi && Array.isArray(porsi) && porsi.length > 0) {
      const porsiToInsert = porsi.map((p: any) => ({
        makananId: newItem.id,
        kodePorsi: p.kode_porsi,
        namaPorsi: p.nama_porsi,
        beratGram: p.berat_gram,
        energi: p.energi || 0,
        protein: p.protein || 0,
        lemak: p.lemak || 0,
        karbohidrat: p.karbohidrat || 0,
        serat: p.serat || 0,
      }));
      await prisma.makananPorsi.createMany({ data: porsiToInsert });
    }
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, kode, nama, kategori_id, keterangan, foto, porsi } = body;

  if (!id) return NextResponse.json({ error: "ID is required for update" }, { status: 400 });

  try {
    const updatedItem = await prisma.makananInduk.update({
      where: { id },
      data: { kode, nama, kategoriId: kategori_id, keterangan, foto }
    });

    if (porsi && Array.isArray(porsi)) {
      const existingPorsi = await prisma.makananPorsi.findMany({ where: { makananId: id } });
      const existingIds = existingPorsi.map(ep => ep.id);
      
      const incomingIds = porsi.map((p: any) => p.id).filter(pid => pid);
      const toDelete = existingIds.filter(eid => !incomingIds.includes(eid));
      
      if (toDelete.length > 0) {
        await prisma.makananPorsi.updateMany({
          where: { id: { in: toDelete } },
          data: { deletedAt: new Date() }
        });
      }

      for (const p of porsi) {
        const pData = {
          makananId: id,
          kodePorsi: p.kode_porsi,
          namaPorsi: p.nama_porsi,
          beratGram: p.berat_gram,
          energi: p.energi || 0,
          protein: p.protein || 0,
          lemak: p.lemak || 0,
          karbohidrat: p.karbohidrat || 0,
          serat: p.serat || 0,
        };
        if (p.id) {
           await prisma.makananPorsi.update({
             where: { id: p.id },
             data: pData
           });
        } else {
           await prisma.makananPorsi.create({
             data: pData
           });
        }
      }
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
