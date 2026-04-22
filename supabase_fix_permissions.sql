-- Jalankan ini di Supabase SQL Editor untuk memastikan semua kolom ada
-- dan hak akses tabel food_records terbuka

-- Pastikan kolom-kolom baru ada
ALTER TABLE food_records ADD COLUMN IF NOT EXISTS porsi_id BIGINT REFERENCES makanan_porsi(id) ON DELETE SET NULL;
ALTER TABLE food_records ADD COLUMN IF NOT EXISTS nama_porsi TEXT;
ALTER TABLE food_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Hak akses
GRANT ALL ON TABLE public.food_records TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.makanan_induk TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.makanan_porsi TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.makanan_induk_id_seq TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.makanan_porsi_id_seq TO anon, authenticated, service_role;

-- Nonaktifkan RLS (Row Level Security) agar tabel bisa diakses tanpa policy
ALTER TABLE public.food_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.makanan_induk DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.makanan_porsi DISABLE ROW LEVEL SECURITY;

-- Reload schema
NOTIFY pgrst, 'reload schema';
