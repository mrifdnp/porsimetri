import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getKebutuhanByUser } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;
  const data = await getKebutuhanByUser(userId);
  if (!data) return NextResponse.json({ error: "Belum ada data kebutuhan gizi" }, { status: 404 });
  return NextResponse.json(data);
}
