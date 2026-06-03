import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "nakes") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const nakesId = session.user?.id as string;

  try {
    const body = await req.json();

    const existingAnalisis = await prisma.analisisGizi.findUnique({
      where: { foodRecordId: body.foodRecordId }
    });

    if (existingAnalisis) {
      await prisma.analisisGizi.delete({
        where: { foodRecordId: body.foodRecordId }
      });
    }

    const entry = await prisma.analisisGizi.create({
      data: {
        foodRecordId: body.foodRecordId,
        nakesId: nakesId,
        energi: Number(body.energi),
        protein: Number(body.protein),
        lemak: Number(body.lemak),
        karbohidrat: Number(body.karbohidrat),
        serat: Number(body.serat),
      }
    });
    
    // Map response for backwards compatibility
    const mappedEntry = {
      ...entry,
      food_record_id: entry.foodRecordId,
      nakes_id: entry.nakesId
    };

    return NextResponse.json(mappedEntry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
