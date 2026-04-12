import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readUsers } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "admin" && role !== "nakes") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await readUsers();
  // Hapus passwordHash sebelum kirim
  const sanitized = users.map(({ passwordHash: _ph, ...rest }) => rest);
  return NextResponse.json(sanitized);
}
