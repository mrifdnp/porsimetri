import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readMakanan, writeMakanan } from "@/lib/db";
import type { MakananItem } from "@/lib/types";

export async function GET() {
  const all = await readMakanan();
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const all = await readMakanan();
  const maxId = all.reduce((max, m) => Math.max(max, m.id), 0);
  const newItem: MakananItem = { id: maxId + 1, ...body };
  await writeMakanan([...all, newItem]);
  return NextResponse.json(newItem, { status: 201 });
}
