import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { readUsers, writeUsers } from "@/lib/db";
import type { DbUser } from "@/lib/types";

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

    const users = await readUsers();
    if (users.find((u) => u.email === email)) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: DbUser = {
      id: uuidv4(),
      email,
      passwordHash,
      role,
      namaLengkap,
      noHp: noHp ?? undefined,
      createdAt: new Date().toISOString(),
      profile: profile ?? undefined,
    };

    await writeUsers([...users, newUser]);
    return NextResponse.json({ success: true, id: newUser.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
