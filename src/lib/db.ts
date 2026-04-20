import { supabase } from "./supabase";
import type { DbUser, FoodRecord, AnalisisGizi, KebutuhanGizi, MakananItem } from "./types";

// ── Users ──────────────────────────────────────────────
export async function readUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data || [];
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error) return null;
  return data;
}

// ── Makanan ────────────────────────────────────────────
export async function readMakanan(): Promise<MakananItem[]> {
  const { data, error } = await supabase.from('makanan_item').select('*, kategori:kategori_makanan(*)');
  if (error) throw error;
  return data || [];
}

// ── Food Records ───────────────────────────────────────
export async function readFoodRecords(): Promise<FoodRecord[]> {
  const { data, error } = await supabase.from('food_records').select('*');
  if (error) throw error;
  return data || [];
}

export async function getFoodRecordsByUser(userId: string): Promise<FoodRecord[]> {
  const { data, error } = await supabase.from('food_records').select('*').eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

// ── Analisis Gizi ──────────────────────────────────────
export async function readAnalisisGizi(): Promise<AnalisisGizi[]> {
  const { data, error } = await supabase.from('analisis_gizi').select('*');
  if (error) throw error;
  return data || [];
}

export async function getAnalisisByFoodRecord(foodRecordId: string): Promise<AnalisisGizi | null> {
  const { data, error } = await supabase.from('analisis_gizi').select('*').eq('food_record_id', foodRecordId).single();
  if (error) return null;
  return data;
}

// ── Kebutuhan Gizi ─────────────────────────────────────
export async function readKebutuhanGizi(): Promise<KebutuhanGizi[]> {
  const { data, error } = await supabase.from('kebutuhan_gizi').select('*');
  if (error) throw error;
  return data || [];
}

export async function getKebutuhanByUser(userId: string): Promise<KebutuhanGizi | null> {
  const { data, error } = await supabase
    .from('kebutuhan_gizi')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}