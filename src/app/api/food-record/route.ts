import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readFoodRecords, writeFoodRecords } from "@/lib/db";
import type { FoodRecord } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;
  const all = await readFoodRecords();
  const records = all.filter(r => r.userId === userId);
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;

  try {
    const body = await req.json();
    const newRecord: FoodRecord = {
      id: uuidv4(),
      userId,
      tanggal: body.tanggal,
      hari: body.hari,
      waktuMakan: body.waktuMakan,
      jamMakan: body.jamMakan,
      asalMakanan: body.asalMakanan,
      makananId: body.makananId,
      namaMakanan: body.namaMakanan,
      urt: body.urt,
      jumlahUrt: body.jumlahUrt,
      caraPengolahan: body.caraPengolahan,
      createdAt: new Date().toISOString(),
    };
    const all = await readFoodRecords();
    await writeFoodRecords([...all, newRecord]);
    return NextResponse.json(newRecord, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
