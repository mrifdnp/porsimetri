import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('*, makanan:makanan_induk(*, kategori:kategori_makanan(*), porsi:makanan_porsi(*))')
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to camelCase
  const result = data.map((fav: any) => ({
    id: fav.id,
    userId: fav.user_id,
    makananId: fav.makanan_id,
    createdAt: fav.created_at,
    makanan: fav.makanan,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { makananId } = await req.json();
    if (!makananId) {
      return NextResponse.json({ error: 'Makanan ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([
        { user_id: session.user.id, makanan_id: makananId }
      ])
      .select('*, makanan:makanan_induk(*, kategori:kategori_makanan(*), porsi:makanan_porsi(*))')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Sudah ada di favorit' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = {
      id: data.id,
      userId: data.user_id,
      makananId: data.makanan_id,
      createdAt: data.created_at,
      makanan: data.makanan,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
