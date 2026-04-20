import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

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
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role,
        nama_lengkap: namaLengkap,
        no_hp: noHp || null,
        profile: profile || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Postgres error code untuk UNIQUE constraint violation
        return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, id: newUser.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
