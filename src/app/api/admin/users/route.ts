import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readUsers } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin" && role !== "nakes") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  const users = await readUsers();
  const sanitized = users.map((u: any) => {
    const { password_hash, passwordHash, created_at, nama_lengkap, no_hp, ...rest } = u;
    return {
      ...rest,
      namaLengkap: nama_lengkap || u.namaLengkap,
      noHp: no_hp || u.noHp,
      createdAt: created_at || u.createdAt
    };
  });
  return NextResponse.json(sanitized);
}
