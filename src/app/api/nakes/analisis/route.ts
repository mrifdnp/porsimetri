import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readAnalisisGizi, writeAnalisisGizi } from "@/lib/db";
import type { AnalisisGizi } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "nakes") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const nakesId = session.user?.id as string;

  try {
    const body = await req.json();
    const all = await readAnalisisGizi();

    // Hapus analisis lama untuk food record yang sama (upsert)
    const filtered = all.filter(a => a.foodRecordId !== body.foodRecordId);

    const entry: AnalisisGizi = {
      id: uuidv4(),
      foodRecordId: body.foodRecordId,
      nakesId,
      energi: Number(body.energi),
      protein: Number(body.protein),
      lemak: Number(body.lemak),
      karbohidrat: Number(body.karbohidrat),
      serat: Number(body.serat),
      createdAt: new Date().toISOString(),
    };

    await writeAnalisisGizi([...filtered, entry]);
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
