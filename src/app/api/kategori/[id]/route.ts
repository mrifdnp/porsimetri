import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const kategoriId = Number(id);
    if (!kategoriId) {
      return NextResponse.json({ error: "ID kategori tidak valid" }, { status: 400 });
    }

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
