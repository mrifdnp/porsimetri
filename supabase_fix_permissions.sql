-- Jalankan ini di Supabase SQL Editor untuk memastikan semua kolom ada
-- dan hak akses tabel food_records terbuka

-- Pastikan extension untuk UUID tersedia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Pastikan kolom-kolom baru ada
ALTER TABLE food_records ADD COLUMN IF NOT EXISTS porsi_id BIGINT REFERENCES makanan_porsi(id) ON DELETE SET NULL;
ALTER TABLE food_records ADD COLUMN IF NOT EXISTS nama_porsi TEXT;
ALTER TABLE food_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Pastikan tabel favorit user ada
CREATE TABLE IF NOT EXISTS public.user_favorites (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	makanan_id BIGINT NOT NULL REFERENCES public.makanan_induk(id) ON DELETE CASCADE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	UNIQUE(user_id, makanan_id)
);

-- Hak akses
GRANT ALL ON TABLE public.food_records TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.makanan_induk TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.makanan_porsi TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_favorites TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.makanan_induk_id_seq TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.makanan_porsi_id_seq TO anon, authenticated, service_role;

-- Nonaktifkan RLS (Row Level Security) agar tabel bisa diakses tanpa policy
ALTER TABLE public.food_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.makanan_induk DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.makanan_porsi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;

-- Reload schema
NOTIFY pgrst, 'reload schema';
