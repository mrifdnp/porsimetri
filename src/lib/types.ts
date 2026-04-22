// Types untuk seluruh aplikasi PorsiMetri

export type Role = "admin" | "nakes" | "user";

export interface UserProfile {
  tanggalLahir?: string;
  alamat?: string;
  beratBadan?: number;
  tinggiBadan?: number;
  pekerjaan?: string;
  tingkatAktivitas?: "Sangat Ringan" | "Ringan" | "Sedang" | "Berat" | "Sangat Berat";
  riwayatPenyakit?: string[];
  riwayatKonsultasiGizi?: boolean;
  statusDiet?: string;
  pengobatanRutin?: { ada: boolean; jenis?: string };
  kepesertaanProlanis?: boolean;
  pemeriksaanRutin?: boolean;
}

export interface NakesProfile {
  noHp?: string;
  pekerjaan?: "Nutrisionis" | "Dietisien";
  lamaBekerja?: "1-5 th" | "5-10 th" | ">10 th";
  instansi?: string;
  alamatInstansi?: string;
  dokumenSTR?: string;
  dokumenSIP?: string;
}

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  namaLengkap: string;
  noHp?: string;
  createdAt: string;
  profile?: UserProfile | NakesProfile;
}

export interface KategoriMakanan {
  id: number;
  nama: string;
}

export interface MakananPorsi {
  id: number;
  makanan_id: number;
  kode_porsi?: string;
  nama_porsi: string;
  berat_gram: number;
  energi: number;
  protein: number;
  lemak: number;
  karbohidrat: number;
  serat: number;
  deleted_at?: string;
}

export interface MakananInduk {
  id: number;
  kode?: string;
  nama: string;
  kategori_id: number;
  kategori?: KategoriMakanan; // Join table
  keterangan?: string;
  foto: string | null;
  porsi?: MakananPorsi[]; // Nested
  deleted_at?: string;
}

export type WaktuMakan = "Pagi" | "Snack Pagi" | "Siang" | "Snack Siang" | "Malam" | "Snack Malam";
export type AsalMakanan = "Memasak sendiri" | "Membeli";
export type CaraPengolahan = "Goreng" | "Kukus" | "Rebus (air)" | "Rebus (santan)" | "Bakar" | "Pan" | "Panggang" | "Tumis" | "Air Fryer" | "Tidak diolah";

export interface FoodRecord {
  id: string;
  userId: string;
  tanggal: string; // YYYY-MM-DD
  hari: number; // 1–7
  waktuMakan: WaktuMakan;
  jamMakan: string; // HH:mm
  asalMakanan: AsalMakanan;
  makananId: number;
  porsiId: number; // Baru
  namaMakanan: string;
  namaPorsi: string; // Baru untuk kemudahan
  urt: string; // Bisa disimpan sbg legacy / untuk form
  jumlahUrt: number; // Default: 1
  caraPengolahan: CaraPengolahan;
  createdAt: string;
  deleted_at?: string;
}

export interface AnalisisGizi {
  id: string;
  foodRecordId: string;
  nakesId: string;
  energi: number;
  protein: number;
  lemak: number;
  karbohidrat: number;
  serat: number;
  createdAt: string;
}

export interface KebutuhanGizi {
  id: string;
  userId: string;
  nakesId: string;
  energi: number;
  protein: number;
  lemak: number;
  karbohidrat: number;
  serat: number;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

// Untuk summary hasil analisis per hari
export interface HariSummary {
  hari: number;
  energi: number;
  protein: number;
  lemak: number;
  karbohidrat: number;
  serat: number;
}

export interface HasilAnalisis {
  totalAsupan: { energi: number; protein: number; lemak: number; karbohidrat: number; serat: number };
  kebutuhan: KebutuhanGizi | null;
  persentase: { energi: number; protein: number; lemak: number; karbohidrat: number; serat: number };
  hariSummary: HariSummary[];
}
