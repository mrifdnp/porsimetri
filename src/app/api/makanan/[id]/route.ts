import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readMakanan, writeMakanan } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const all = await readMakanan();
  await writeMakanan(all.filter(m => m.id !== Number(id)));
  return NextResponse.json({ success: true });
}
