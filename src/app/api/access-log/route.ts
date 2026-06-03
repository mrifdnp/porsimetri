import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ambil IP dari header (bisa dari x-forwarded-for atau fallback)
  const forwarded = req.headers.get("x-forwarded-for");
  let ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // Jika IP lokal, coba ambil public IP via ipify
  const isLocal = ip === "unknown" || ip === "::1" || ip === "127.0.0.1";
  if (isLocal) {
    try {
      const pubIp = await fetch("https://api.ipify.org?format=json");
      if (pubIp.ok) {
        const { ip: publicIp } = await pubIp.json();
        if (publicIp) ip = publicIp;
      }
    } catch {}
  }

  // Geolocation dari IP via ip-api.com (gratis, no key)
  let city = null, region = null, country = null;
  try {
    if (ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`);
      if (geo.ok) {
        const data = await geo.json();
        city = data.city || null;
        region = data.regionName || null;
        country = data.country || null;
      }
    }
  } catch {
    // Jika gagal geolocation, tetap simpan log tanpa lokasi
  }

  try {
    await prisma.accessLog.create({
      data: {
        userId: session.user.id,
        ipAddress: ip,
        city,
        region,
        country
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
