import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "nakes" && role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  const { userId } = await params;
  
  try {
    const data = await prisma.kebutuhanGizi.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!data) return NextResponse.json(null);

    const mappedData = {
      ...data,
      user_id: data.userId,
      nakes_id: data.nakesId,
      created_at: data.createdAt.toISOString()
    };

    return NextResponse.json(mappedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
    
    const entry = await prisma.kebutuhanGizi.create({
      data: {
        userId: userId,
        nakesId: nakesId,
        energi: Number(body.energi),
        protein: Number(body.protein),
        lemak: Number(body.lemak),
        karbohidrat: Number(body.karbohidrat),
        serat: Number(body.serat)
      }
    });
    
    const mappedEntry = {
      ...entry,
      user_id: entry.userId,
      nakes_id: entry.nakesId,
      created_at: entry.createdAt.toISOString()
    };

    return NextResponse.json(mappedEntry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
