import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const data = await prisma.kategoriMakanan.findMany({
      orderBy: { id: "asc" }
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { nama } = await req.json();
    if (!nama) return NextResponse.json({ error: "Nama kategori wajib" }, { status: 400 });

    const newKategori = await prisma.kategoriMakanan.create({
      data: { nama }
    });
    return NextResponse.json(newKategori);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
