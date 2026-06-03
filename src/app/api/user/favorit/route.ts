import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function getMakananByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const data = await prisma.makananInduk.findMany({
    where: { id: { in: ids }, deletedAt: null },
    include: {
      kategori: true,
      porsi: { where: { deletedAt: null } }
    }
  });
  return data;
}

async function getMakananById(id: number) {
  const data = await prisma.makananInduk.findFirst({
    where: { id, deletedAt: null },
    include: {
      kategori: true,
      porsi: { where: { deletedAt: null } }
    }
  });
  return data;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const favorites = await prisma.userFavorite.findMany({
      where: { userId: session.user.id }
    });

    const makananIds = favorites.map(fav => fav.makananId);
    const makananList = await getMakananByIds(makananIds);
    const makananMap = new Map<number, any>(
      makananList.map(makanan => [
        makanan.id, 
        {
          ...makanan,
          kategori_id: makanan.kategoriId,
          kategori: makanan.kategori,
          porsi: makanan.porsi.map(p => ({
            ...p,
            makanan_id: p.makananId,
            kode_porsi: p.kodePorsi,
            nama_porsi: p.namaPorsi,
            berat_gram: p.beratGram
          }))
        }
      ])
    );

    const result = favorites.map(fav => ({
      id: fav.id,
      userId: fav.userId,
      makananId: fav.makananId,
      createdAt: fav.createdAt.toISOString(),
      makanan: makananMap.get(fav.makananId) || null,
    }));

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Failed to load favorites' },
      { status: 500 }
    );
  }
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

    const existing = await prisma.userFavorite.findUnique({
      where: {
        userId_makananId: {
          userId: session.user.id,
          makananId: makananId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Sudah ada di favorit' }, { status: 400 });
    }

    const inserted = await prisma.userFavorite.create({
      data: {
        userId: session.user.id,
        makananId: makananId
      }
    });

    const rawMakanan = await getMakananById(makananId);
    const makanan = rawMakanan ? {
      ...rawMakanan,
      kategori_id: rawMakanan.kategoriId,
      kategori: rawMakanan.kategori,
      porsi: rawMakanan.porsi.map(p => ({
        ...p,
        makanan_id: p.makananId,
        kode_porsi: p.kodePorsi,
        nama_porsi: p.namaPorsi,
        berat_gram: p.beratGram
      }))
    } : null;

    const result = {
      id: inserted.id,
      userId: inserted.userId,
      makananId: inserted.makananId,
      createdAt: inserted.createdAt.toISOString(),
      makanan,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Catch error in POST /api/user/favorit:', error);
    return NextResponse.json(
      { error: error.message },
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

    await prisma.userFavorite.delete({
      where: {
        userId_makananId: {
          userId: session.user.id,
          makananId: makananId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Catch error in DELETE /api/user/favorit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
