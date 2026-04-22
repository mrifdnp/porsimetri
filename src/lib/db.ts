import { supabase } from "./supabase";
import type { DbUser, FoodRecord, AnalisisGizi, KebutuhanGizi, MakananInduk } from "./types";

// ── Users ──────────────────────────────────────────────
export async function readUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase.from('users').select('*').is('deleted_at', null);
  if (error) throw error;
  return data || [];
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).is('deleted_at', null).single();
  if (error) return null;
  return data;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).is('deleted_at', null).single();
  if (error) return null;
  return data;
}

// ── Makanan ────────────────────────────────────────────
export async function readMakanan(): Promise<any[]> {
  const { data, error } = await supabase
    .from('makanan_induk')
    .select('*, kategori:kategori_makanan(*), porsi:makanan_porsi(*)')
    .is('deleted_at', null);
  if (error) throw error;
  return data || [];
}

const mapFoodRecord = (db: any): FoodRecord => ({
  id: db.id,
  userId: db.user_id,
  tanggal: db.tanggal,
  hari: db.hari,
  waktuMakan: db.waktu_makan,
  jamMakan: db.jam_makan,
  asalMakanan: db.asal_makanan,
  makananId: db.makanan_id,
  porsiId: db.porsi_id,
  namaMakanan: db.nama_makanan,
  namaPorsi: db.nama_porsi,
  urt: db.urt,
  jumlahUrt: db.jumlah_urt,
  caraPengolahan: db.cara_pengolahan,
  createdAt: db.created_at,
  deleted_at: db.deleted_at
});

// ── Food Records ───────────────────────────────────────
export async function readFoodRecords(): Promise<FoodRecord[]> {
  const { data, error } = await supabase.from('food_records').select('*').is('deleted_at', null);
  if (error) throw error;
  return (data || []).map(mapFoodRecord);
}

export async function getFoodRecordsByUser(userId: string): Promise<FoodRecord[]> {
  const { data, error } = await supabase.from('food_records').select('*').eq('user_id', userId).is('deleted_at', null);
  if (error) throw error;
  return (data || []).map(mapFoodRecord);
}

const mapAnalisisGizi = (db: any): AnalisisGizi => ({
  id: db.id,
  foodRecordId: db.food_record_id,
  nakesId: db.nakes_id,
  energi: db.energi,
  protein: db.protein,
  lemak: db.lemak,
  karbohidrat: db.karbohidrat,
  serat: db.serat,
  createdAt: db.created_at
});

// ── Analisis Gizi ──────────────────────────────────────
export async function readAnalisisGizi(): Promise<AnalisisGizi[]> {
  const { data, error } = await supabase.from('analisis_gizi').select('*').is('deleted_at', null);
  if (error) throw error;
  return (data || []).map(mapAnalisisGizi);
}

export async function getAnalisisByFoodRecord(foodRecordId: string): Promise<AnalisisGizi | null> {
  const { data, error } = await supabase.from('analisis_gizi').select('*').eq('food_record_id', foodRecordId).is('deleted_at', null).single();
  if (error || !data) return null;
  return mapAnalisisGizi(data);
}

const mapKebutuhanGizi = (db: any): KebutuhanGizi => ({
  id: db.id,
  userId: db.user_id,
  nakesId: db.nakes_id,
  energi: db.energi,
  protein: db.protein,
  lemak: db.lemak,
  karbohidrat: db.karbohidrat,
  serat: db.serat,
  createdAt: db.created_at
});

// ── Kebutuhan Gizi ─────────────────────────────────────
export async function readKebutuhanGizi(): Promise<KebutuhanGizi[]> {
  const { data, error } = await supabase.from('kebutuhan_gizi').select('*').is('deleted_at', null);
  if (error) throw error;
  return (data || []).map(mapKebutuhanGizi);
}

export async function getKebutuhanByUser(userId: string): Promise<KebutuhanGizi | null> {
  const { data, error } = await supabase
    .from('kebutuhan_gizi')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return mapKebutuhanGizi(data);
}