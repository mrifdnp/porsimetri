import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Remove passwordHash before sending
  const { password_hash, passwordHash, ...safeUser } = user as any;
  return NextResponse.json(safeUser);
}
