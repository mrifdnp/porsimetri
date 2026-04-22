import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user?.id as string;
  const { id } = await params;
  
  // Periksa apakah record tersebut ada dan milik user (atau admin yang hapus jika mau)
  const { data: record, error: fetchError } = await supabase
    .from('food_records')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError || !record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (record.user_id !== userId && (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  const { error: deleteError } = await supabase
    .from('food_records')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  
  return NextResponse.json({ success: true });
}
