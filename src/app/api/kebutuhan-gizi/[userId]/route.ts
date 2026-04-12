import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readKebutuhanGizi, writeKebutuhanGizi } from "@/lib/db";
import type { KebutuhanGizi } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "nakes" && role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId } = await params;
  const all = await readKebutuhanGizi();
  const found = all.filter(k => k.userId === userId).sort((a, b) => a.createdAt > b.createdAt ? -1 : 1);
  return NextResponse.json(found[0] ?? null);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "nakes") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const nakesId = session.user?.id as string;
  const { userId } = await params;

  try {
    const body = await req.json();
    const entry: KebutuhanGizi = {
      id: uuidv4(),
      userId,
      nakesId,
      energi: Number(body.energi),
      protein: Number(body.protein),
      lemak: Number(body.lemak),
      karbohidrat: Number(body.karbohidrat),
      serat: Number(body.serat),
      createdAt: new Date().toISOString(),
    };
    const all = await readKebutuhanGizi();
    await writeKebutuhanGizi([...all, entry]);
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
