import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin" && role !== "nakes") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Ambil log akses terbaru per user (last login + lokasi)
    const data = await prisma.accessLog.findMany({
      orderBy: { loggedAt: "desc" },
      take: 500
    });

    const mappedData = data.map(log => ({
      ...log,
      user_id: log.userId,
      ip_address: log.ipAddress,
      logged_at: log.loggedAt.toISOString()
    }));

    return NextResponse.json(mappedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
