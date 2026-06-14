import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, namaLengkap, noHp, role, profile } = body;

    if (!email || !password || !namaLengkap || !role) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }
    if (!["nakes", "user"].includes(role)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Cek duplikasi email manual untuk menangani pesan error
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const userProfile = profile || {};
    if (role === "nakes") {
      userProfile.isVerified = false;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        namaLengkap,
        noHp: noHp || null,
        profile: userProfile,
      }
    });

    return NextResponse.json({ success: true, id: newUser.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
