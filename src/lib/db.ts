import { prisma } from "./prisma";
import type { DbUser, FoodRecord, AnalisisGizi, KebutuhanGizi, MakananInduk } from "./types";

// ── Users ──────────────────────────────────────────────
export async function readUsers(): Promise<DbUser[]> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null }
  });
  return users.map(u => ({
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role as any,
    namaLengkap: u.namaLengkap,
    noHp: u.noHp || undefined,
    createdAt: u.createdAt.toISOString(),
    profile: u.profile as any
  }));
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null }
  });
  if (!user) return null;
  return {
    ...user,
    role: user.role as any,
    noHp: user.noHp || undefined,
    createdAt: user.createdAt.toISOString(),
    profile: user.profile as any
  };
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null }
  });
  if (!user) return null;
  return {
    ...user,
    role: user.role as any,
    noHp: user.noHp || undefined,
    createdAt: user.createdAt.toISOString(),
    profile: user.profile as any
  };
}

// ── Makanan ────────────────────────────────────────────
export async function readMakanan(): Promise<any[]> {
  const data = await prisma.makananInduk.findMany({
    where: { deletedAt: null },
    include: {
      kategori: true,
      porsi: {
        where: { deletedAt: null }
      }
    }
  });
  // Map Prisma relations to Supabase format for backward compatibility
  return data.map(item => ({
    ...item,
    kategori_id: item.kategoriId,
    kategori: item.kategori,
    porsi: item.porsi.map(p => ({
      ...p,
      makanan_id: p.makananId,
      kode_porsi: p.kodePorsi,
      nama_porsi: p.namaPorsi,
      berat_gram: p.beratGram
    }))
  }));
}

const mapFoodRecord = (db: any): FoodRecord => ({
  id: db.id,
  userId: db.userId || db.user_id,
  tanggal: db.tanggal,
  hari: db.hari,
  waktuMakan: db.waktuMakan || db.waktu_makan,
  jamMakan: db.jamMakan || db.jam_makan,
  asalMakanan: db.asalMakanan || db.asal_makanan,
  makananId: db.makananId || db.makanan_id,
  porsiId: db.porsiId || db.porsi_id,
  namaMakanan: db.namaMakanan || db.nama_makanan,
  namaPorsi: db.namaPorsi || db.nama_porsi,
  urt: db.urt,
  jumlahUrt: db.jumlahUrt || db.jumlah_urt,
  caraPengolahan: db.caraPengolahan || db.cara_pengolahan,
  createdAt: db.createdAt ? new Date(db.createdAt).toISOString() : '',
  deleted_at: db.deletedAt ? new Date(db.deletedAt).toISOString() : undefined
});

// ── Food Records ───────────────────────────────────────
export async function readFoodRecords(): Promise<FoodRecord[]> {
  const data = await prisma.foodRecord.findMany({
    where: { deletedAt: null }
  });
  return data.map(mapFoodRecord);
}

export async function getFoodRecordsByUser(userId: string): Promise<FoodRecord[]> {
  const data = await prisma.foodRecord.findMany({
    where: { userId, deletedAt: null }
  });
  return data.map(mapFoodRecord);
}

const mapAnalisisGizi = (db: any): AnalisisGizi => ({
  id: db.id,
  foodRecordId: db.foodRecordId || db.food_record_id,
  nakesId: db.nakesId || db.nakes_id,
  energi: db.energi,
  protein: db.protein,
  lemak: db.lemak,
  karbohidrat: db.karbohidrat,
  serat: db.serat,
  createdAt: db.createdAt ? new Date(db.createdAt).toISOString() : ''
});

// ── Analisis Gizi ──────────────────────────────────────
export async function readAnalisisGizi(): Promise<AnalisisGizi[]> {
  const data = await prisma.analisisGizi.findMany();
  return data.map(mapAnalisisGizi);
}

export async function getAnalisisByFoodRecord(foodRecordId: string): Promise<AnalisisGizi | null> {
  const data = await prisma.analisisGizi.findUnique({
    where: { foodRecordId }
  });
  if (!data) return null;
  return mapAnalisisGizi(data);
}

const mapKebutuhanGizi = (db: any): KebutuhanGizi => ({
  id: db.id,
  userId: db.userId || db.user_id,
  nakesId: db.nakesId || db.nakes_id,
  energi: db.energi,
  protein: db.protein,
  lemak: db.lemak,
  karbohidrat: db.karbohidrat,
  serat: db.serat,
  createdAt: db.createdAt ? new Date(db.createdAt).toISOString() : ''
});

// ── Kebutuhan Gizi ─────────────────────────────────────
export async function readKebutuhanGizi(): Promise<KebutuhanGizi[]> {
  const data = await prisma.kebutuhanGizi.findMany();
  return data.map(mapKebutuhanGizi);
}

export async function getKebutuhanByUser(userId: string): Promise<KebutuhanGizi | null> {
  const data = await prisma.kebutuhanGizi.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  if (!data) return null;
  return mapKebutuhanGizi(data);
}