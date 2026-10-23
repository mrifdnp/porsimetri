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
    console.error("Error create kategori:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "ID kategori wajib disertakan" }, { status: 400 });
    }

    const kategoriId = Number(id);

    const makananCount = await prisma.makananInduk.count({
      where: { kategoriId }
    });

    if (makananCount > 0) {
      return NextResponse.json({
        error: `Kategori tidak bisa dihapus karena masih digunakan oleh ${makananCount} data makanan.`
      }, { status: 400 });
    }

    await prisma.kategoriMakanan.delete({
      where: { id: kategoriId }
    });

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error: any) {
    console.error("Error delete kategori:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
