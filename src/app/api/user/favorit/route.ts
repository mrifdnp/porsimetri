import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';

async function getMakananByIds(ids: number[]) {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('makanan_induk')
    .select('*, kategori:kategori_makanan(*), porsi:makanan_porsi(*)')
    .in('id', ids)
    .is('deleted_at', null);

  if (error) throw error;
  return data || [];
}

async function getMakananById(id: number) {
  const { data, error } = await supabase
    .from('makanan_induk')
    .select('*, kategori:kategori_makanan(*), porsi:makanan_porsi(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      },
      { status: 500 }
    );
  }

  try {
    const favorites = data || [];
    const makananIds = favorites.map((fav: any) => Number(fav.makanan_id));
    const makananList = await getMakananByIds(makananIds);
    const makananMap = new Map<number, any>(
      makananList.map((makanan: any) => [Number(makanan.id), makanan])
    );

    const result = favorites.map((fav: any) => ({
      id: fav.id,
      userId: fav.user_id,
      makananId: fav.makanan_id,
      createdAt: fav.created_at,
      makanan: makananMap.get(Number(fav.makanan_id)) || null,
    }));

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.message || 'Failed to load favorites',
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
      },
      { status: 500 }
    );
  }

  // Map to camelCase
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const makananId = Number(body?.makananId);

    if (!Number.isInteger(makananId) || makananId <= 0) {
      return NextResponse.json({ error: 'Makanan ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([
        { user_id: session.user.id, makanan_id: makananId }
      ])
      .select();

    if (error) {
      console.error('Supabase error in POST /api/user/favorit:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Sudah ada di favorit' }, { status: 400 });
      }
      if (error.code === '23503') {
        return NextResponse.json({ error: 'Data user atau makanan tidak valid' }, { status: 400 });
      }
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: (error as any).details,
          hint: (error as any).hint,
        },
        { status: 500 }
      );
    }

    const inserted = data?.[0];
    if (!inserted) {
        return NextResponse.json({ error: 'Failed to insert favorite' }, { status: 500 });
    }

    const makanan = await getMakananById(makananId);

    const result = {
      id: inserted.id,
      userId: inserted.user_id,
      makananId: inserted.makanan_id,
      createdAt: inserted.created_at,
      makanan,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Catch error in POST /api/user/favorit:', error);
    return NextResponse.json(
      {
        error: error.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const makananId = Number(body?.makananId);

    if (!Number.isInteger(makananId) || makananId <= 0) {
      return NextResponse.json({ error: 'Makanan ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', session.user.id)
      .eq('makanan_id', makananId);

    if (error) {
      console.error('Supabase error in DELETE /api/user/favorit:', error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Catch error in DELETE /api/user/favorit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
