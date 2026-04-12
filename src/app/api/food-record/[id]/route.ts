import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readFoodRecords, writeFoodRecords } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;
  const { id } = await params;
  const all = await readFoodRecords();
  const record = all.find(r => r.id === id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (record.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await writeFoodRecords(all.filter(r => r.id !== id));
  return NextResponse.json({ success: true });
}
