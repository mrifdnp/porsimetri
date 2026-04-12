import fs from "fs/promises";
import path from "path";
import type {
  DbUser, FoodRecord, AnalisisGizi, KebutuhanGizi, MakananItem
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJSON<T>(filename: string): Promise<T[]> {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T[];
  } catch {
    return [];
  }
}

async function writeJSON<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Users ──────────────────────────────────────────────
export const readUsers = () => readJSON<DbUser>("users.json");
export const writeUsers = (data: DbUser[]) => writeJSON("users.json", data);

export async function getUserById(id: string): Promise<DbUser | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const users = await readUsers();
  return users.find((u) => u.email === email) ?? null;
}

// ── Makanan ────────────────────────────────────────────
export const readMakanan = () => readJSON<MakananItem>("makanan.json");
export const writeMakanan = (data: MakananItem[]) => writeJSON("makanan.json", data);

// ── Food Records ───────────────────────────────────────
export const readFoodRecords = () => readJSON<FoodRecord>("food-records.json");
export const writeFoodRecords = (data: FoodRecord[]) => writeJSON("food-records.json", data);

export async function getFoodRecordsByUser(userId: string): Promise<FoodRecord[]> {
  const all = await readFoodRecords();
  return all.filter((r) => r.userId === userId);
}

// ── Analisis Gizi ──────────────────────────────────────
export const readAnalisisGizi = () => readJSON<AnalisisGizi>("analisis-gizi.json");
export const writeAnalisisGizi = (data: AnalisisGizi[]) => writeJSON("analisis-gizi.json", data);

export async function getAnalisisByFoodRecord(foodRecordId: string): Promise<AnalisisGizi | null> {
  const all = await readAnalisisGizi();
  return all.find((a) => a.foodRecordId === foodRecordId) ?? null;
}

// ── Kebutuhan Gizi ─────────────────────────────────────
export const readKebutuhanGizi = () => readJSON<KebutuhanGizi>("kebutuhan-gizi.json");
export const writeKebutuhanGizi = (data: KebutuhanGizi[]) => writeJSON("kebutuhan-gizi.json", data);

export async function getKebutuhanByUser(userId: string): Promise<KebutuhanGizi | null> {
  const all = await readKebutuhanGizi();
  // ambil yang terbaru
  const found = all
    .filter((k) => k.userId === userId)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  return found[0] ?? null;
}
