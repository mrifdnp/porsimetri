import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;
  
  try {
    const data = await prisma.foodRecord.findMany({
      where: { userId, deletedAt: null }
    });

    const mapped = data.map((db) => ({
      id: db.id,
      userId: db.userId,
      tanggal: db.tanggal,
      hari: db.hari,
      waktuMakan: db.waktuMakan,
      jamMakan: db.jamMakan,
      asalMakanan: db.asalMakanan,
      makananId: db.makananId,
      porsiId: db.porsiId,
      namaMakanan: db.namaMakanan,
      namaPorsi: db.namaPorsi,
      urt: db.urt,
      jumlahUrt: db.jumlahUrt || 1,
      caraPengolahan: db.caraPengolahan,
      createdAt: db.createdAt.toISOString()
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;

  try {
    const body = await req.json();

    const newRecord = await prisma.foodRecord.create({
      data: {
        userId: userId,
        tanggal: body.tanggal,
        hari: body.hari,
        waktuMakan: body.waktuMakan,
        jamMakan: body.jamMakan,
        asalMakanan: body.asalMakanan,
        makananId: body.makananId,
        porsiId: body.porsiId,
        namaMakanan: body.namaMakanan,
        namaPorsi: body.namaPorsi,
        urt: body.urt || body.namaPorsi || "1 Porsi",
        jumlahUrt: body.jumlahUrt || 1,
        caraPengolahan: body.caraPengolahan
      }
    });

    const mappedRecord = {
      id: newRecord.id,
      userId: newRecord.userId,
      tanggal: newRecord.tanggal,
      hari: newRecord.hari,
      waktuMakan: newRecord.waktuMakan,
      jamMakan: newRecord.jamMakan,
      asalMakanan: newRecord.asalMakanan,
      makananId: newRecord.makananId,
      namaMakanan: newRecord.namaMakanan,
      urt: newRecord.urt,
      jumlahUrt: newRecord.jumlahUrt,
      caraPengolahan: newRecord.caraPengolahan,
      createdAt: newRecord.createdAt.toISOString()
    };

    return NextResponse.json(mappedRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
