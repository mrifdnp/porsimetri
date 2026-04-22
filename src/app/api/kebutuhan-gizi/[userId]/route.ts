import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role !== "nakes" && role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  const { userId } = await params;
  
  const { data, error } = await supabase
    .from('kebutuhan_gizi')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
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
    
    // Sama halnya dengan file di atas, jika ingin hanya ada satu kebutuhan per user,
    // kita bisa mendelete yang lama atau biarkan saja history-nya menumpuk dan GET data terbaru.
    // Di sini kita biarkan menumpuk seperti versi aslinya.
    
    const { data: entry, error } = await supabase
      .from('kebutuhan_gizi')
      .insert({
        user_id: userId,
        nakes_id: nakesId,
        energi: Number(body.energi),
        protein: Number(body.protein),
        lemak: Number(body.lemak),
        karbohidrat: Number(body.karbohidrat),
        serat: Number(body.serat)
      })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
