import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readAnalisisGizi, readFoodRecords } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;
  const records = await readFoodRecords();
  const userRecordIds = new Set(records.filter(r => r.userId === userId).map(r => r.id));
  const all = await readAnalisisGizi();
  const result = all.filter(a => userRecordIds.has(a.foodRecordId));
  return NextResponse.json(result);
}
