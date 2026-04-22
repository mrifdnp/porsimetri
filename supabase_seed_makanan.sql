-- ============================================================
-- SEED DATA: Kategori Makanan & Makanan Item
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Buat kategori makanan (jika belum ada)
INSERT INTO kategori_makanan (id, nama) VALUES
  (2, 'Karbohidrat'),
  (3, 'Lauk Hewani'),
  (4, 'Lauk Nabati'),
  (5, 'Sayur'),
  (6, 'Buah'),
  (7, 'Lemak'),
  (8, 'Serba-serbi'),
  (9, 'One Dish Meal'),
  (10, 'Snack')
ON CONFLICT (id) DO NOTHING;

-- 2. Hapus data test lama (optional)
-- DELETE FROM makanan_item WHERE nama = '2dwa';

-- 3. Insert semua data makanan
INSERT INTO makanan_item (id, nama, kategori_id, jenis, energi, protein, karbohidrat, lemak, serat, urt, satuan_gram, foto) VALUES
  -- Karbohidrat
  (1, 'Nasi Putih', 2, 'Bahan Makanan', 130, 2.4, 28, 0.2, 0.4, ARRAY['1 piring sedang (200g)', '1 centong (100g)', '1 sdm (15g)'], 100, NULL),
  (2, 'Nasi Merah', 2, 'Bahan Makanan', 111, 2.6, 23, 0.9, 1.8, ARRAY['1 piring sedang (200g)', '1 centong (100g)'], 100, NULL),
  (3, 'Roti Gandum', 2, 'Bahan Makanan', 247, 13, 41, 3.4, 6.8, ARRAY['1 lembar (30g)', '2 lembar (60g)'], 100, NULL),
  (4, 'Roti Putih', 2, 'Bahan Makanan', 265, 9, 49, 3.2, 2.7, ARRAY['1 lembar (30g)', '2 lembar (60g)'], 100, NULL),
  (5, 'Kentang', 2, 'Bahan Makanan', 87, 1.9, 20, 0.1, 2.2, ARRAY['1 buah sedang (150g)', '1 buah kecil (100g)'], 100, NULL),
  (6, 'Singkong', 2, 'Bahan Makanan', 160, 1.4, 38, 0.3, 1.8, ARRAY['1 potong (100g)', '1 buah (250g)'], 100, NULL),
  (7, 'Oatmeal', 2, 'Bahan Makanan', 68, 2.4, 12, 1.4, 1.7, ARRAY['1 mangkuk (200g)', '1 sdm (10g)'], 100, NULL),
  (8, 'Mie Kuning', 2, 'Bahan Makanan', 138, 4.7, 27, 1.2, 1.0, ARRAY['1 porsi (100g)', '0.5 porsi (50g)'], 100, NULL),
  (9, 'Jagung', 2, 'Bahan Makanan', 86, 3.3, 19, 1.4, 2.0, ARRAY['1 buah (150g)', '0.5 buah (75g)'], 100, NULL),

  -- Lauk Hewani
  (10, 'Dada Ayam', 3, 'Bahan Makanan', 120, 22.5, 0, 2.6, 0, ARRAY['1 potong (80g)', '1 potong besar (120g)'], 100, NULL),
  (11, 'Paha Ayam', 3, 'Bahan Makanan', 179, 17, 0, 12, 0, ARRAY['1 buah (100g)', '2 buah (200g)'], 100, NULL),
  (12, 'Daging Sapi', 3, 'Bahan Makanan', 250, 26, 0, 15, 0, ARRAY['1 potong (80g)', '2 potong (160g)'], 100, NULL),
  (13, 'Telur Ayam', 3, 'Bahan Makanan', 155, 13, 1.1, 11, 0, ARRAY['1 butir (60g)', '2 butir (120g)'], 100, NULL),
  (14, 'Ikan Salmon', 3, 'Bahan Makanan', 208, 20, 0, 13, 0, ARRAY['1 potong (100g)', '1 fillet (150g)'], 100, NULL),
  (15, 'Ikan Lele', 3, 'Bahan Makanan', 116, 18, 0, 4.3, 0, ARRAY['1 ekor sedang (100g)', '1 ekor besar (150g)'], 100, NULL),
  (16, 'Ikan Tongkol', 3, 'Bahan Makanan', 132, 26, 0, 2.7, 0, ARRAY['1 potong (80g)', '2 potong (160g)'], 100, NULL),
  (17, 'Udang', 3, 'Bahan Makanan', 99, 24, 0.2, 0.3, 0, ARRAY['5 ekor sedang (100g)', '10 ekor (200g)'], 100, NULL),

  -- Lauk Nabati
  (18, 'Tahu Putih', 4, 'Bahan Makanan', 76, 8, 1.9, 4.8, 0.3, ARRAY['1 potong (100g)', '2 potong (200g)'], 100, NULL),
  (19, 'Tahu Goreng', 4, 'Bahan Makanan', 271, 17, 9, 20, 0.3, ARRAY['1 potong (100g)', '2 potong (200g)'], 100, NULL),
  (20, 'Tempe', 4, 'Bahan Makanan', 193, 20, 9.4, 11, 1.4, ARRAY['1 potong (50g)', '2 potong (100g)'], 100, NULL),
  (21, 'Kacang Merah', 4, 'Bahan Makanan', 127, 8.7, 22, 0.5, 6.4, ARRAY['5 sdm matang (100g)', '1 gelas (200g)'], 100, NULL),
  (22, 'Kacang Hijau', 4, 'Bahan Makanan', 103, 7.6, 19, 0.4, 7.6, ARRAY['5 sdm matang (100g)'], 100, NULL),

  -- Sayur
  (23, 'Bayam', 5, 'Bahan Makanan', 23, 2.9, 3.6, 0.4, 2.2, ARRAY['1 mangkuk (100g)', '0.5 mangkuk (50g)'], 100, NULL),
  (24, 'Kangkung', 5, 'Bahan Makanan', 19, 2.6, 3.1, 0.3, 2.0, ARRAY['1 mangkuk (100g)', '0.5 mangkuk (50g)'], 100, NULL),
  (25, 'Wortel', 5, 'Bahan Makanan', 41, 0.9, 10, 0.2, 2.8, ARRAY['1 buah (100g)', '0.5 buah (50g)'], 100, NULL),
  (26, 'Brokoli', 5, 'Bahan Makanan', 34, 2.8, 7, 0.4, 2.6, ARRAY['1 mangkuk (100g)', '0.5 mangkuk (50g)'], 100, NULL),
  (27, 'Kol / Kubis', 5, 'Bahan Makanan', 25, 1.3, 5.8, 0.1, 2.5, ARRAY['1 mangkuk (100g)', '0.5 mangkuk (50g)'], 100, NULL),
  (28, 'Tomat', 5, 'Bahan Makanan', 18, 0.9, 3.9, 0.2, 1.2, ARRAY['1 buah (100g)', '2 buah (200g)'], 100, NULL),
  (29, 'Terong', 5, 'Bahan Makanan', 25, 1.0, 5.9, 0.2, 3.0, ARRAY['1 buah (150g)', '0.5 buah (75g)'], 100, NULL),

  -- Buah
  (30, 'Pisang', 6, 'Bahan Makanan', 89, 1.1, 23, 0.3, 2.6, ARRAY['1 buah (100g)', '2 buah (200g)'], 100, NULL),
  (31, 'Apel', 6, 'Bahan Makanan', 52, 0.3, 14, 0.2, 2.4, ARRAY['1 buah (150g)', '0.5 buah (75g)'], 100, NULL),
  (32, 'Alpukat', 6, 'Bahan Makanan', 160, 2.0, 9, 15, 6.7, ARRAY['0.5 buah (100g)', '1 buah (200g)'], 100, NULL),
  (33, 'Jeruk', 6, 'Bahan Makanan', 47, 0.9, 12, 0.1, 2.4, ARRAY['1 buah (150g)', '2 buah (300g)'], 100, NULL),
  (34, 'Pepaya', 6, 'Bahan Makanan', 43, 0.5, 11, 0.3, 1.7, ARRAY['1 potong (150g)', '2 potong (300g)'], 100, NULL),
  (35, 'Mangga', 6, 'Bahan Makanan', 60, 0.8, 15, 0.4, 1.6, ARRAY['0.5 buah (150g)', '1 buah (300g)'], 100, NULL),

  -- Lemak
  (36, 'Minyak Kelapa Sawit', 7, 'Bahan Makanan', 884, 0, 0, 100, 0, ARRAY['1 sdm (13g)', '1 sdt (5g)'], 100, NULL),
  (37, 'Minyak Zaitun', 7, 'Bahan Makanan', 884, 0, 0, 100, 0, ARRAY['1 sdm (13g)', '1 sdt (5g)'], 100, NULL),
  (38, 'Santan Kelapa', 7, 'Bahan Makanan', 230, 2.3, 5.5, 24, 2.2, ARRAY['1 gelas (200ml)', '0.5 gelas (100ml)'], 100, NULL),
  (39, 'Margarin', 7, 'Bahan Makanan', 717, 0.2, 0.1, 80, 0, ARRAY['1 sdm (13g)', '1 sdt (5g)'], 100, NULL),

  -- Serba-serbi
  (40, 'Susu Full Cream Cair', 8, 'Bahan Makanan', 61, 3.2, 4.8, 3.3, 0, ARRAY['1 gelas (200ml)', '0.5 gelas (100ml)'], 100, NULL),
  (41, 'Susu Skim', 8, 'Bahan Makanan', 34, 3.4, 5.0, 0.1, 0, ARRAY['1 gelas (200ml)'], 100, NULL),
  (42, 'Gula Pasir', 8, 'Bahan Makanan', 387, 0, 100, 0, 0, ARRAY['1 sdt (5g)', '1 sdm (12g)'], 100, NULL),
  (43, 'Kecap Manis', 8, 'Bahan Makanan', 100, 5.3, 19, 0.1, 0, ARRAY['1 sdt (5ml)', '1 sdm (15ml)'], 100, NULL),

  -- One Dish Meal
  (44, 'Nasi Goreng', 9, 'Makanan Matang', 200, 6.5, 28, 7.0, 1.0, ARRAY['1 piring (250g)', '0.5 piring (125g)'], 100, NULL),
  (45, 'Mie Goreng', 9, 'Makanan Matang', 220, 7.0, 30, 8.0, 1.5, ARRAY['1 piring (250g)'], 100, NULL),
  (46, 'Soto Ayam', 9, 'Makanan Matang', 120, 8.0, 10, 5.0, 0.8, ARRAY['1 mangkuk (300ml)', '0.5 mangkuk (150ml)'], 100, NULL),
  (47, 'Gado-gado', 9, 'Makanan Matang', 140, 7.5, 12, 8.0, 2.0, ARRAY['1 piring (300g)'], 100, NULL),

  -- Snack
  (48, 'Pisang Goreng', 10, 'Makanan Matang', 180, 1.5, 30, 6.0, 1.5, ARRAY['1 buah (80g)', '2 buah (160g)'], 100, NULL),
  (49, 'Biskuit Gandum', 10, 'Makanan Matang', 418, 9.4, 72, 11, 3.6, ARRAY['2 keping (20g)', '5 keping kecil (25g)'], 100, NULL),
  (50, 'Lemper', 10, 'Makanan Matang', 160, 4.2, 27, 3.5, 0.5, ARRAY['1 buah (80g)', '2 buah (160g)'], 100, NULL)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  kategori_id = EXCLUDED.kategori_id,
  jenis = EXCLUDED.jenis,
  energi = EXCLUDED.energi,
  protein = EXCLUDED.protein,
  karbohidrat = EXCLUDED.karbohidrat,
  lemak = EXCLUDED.lemak,
  serat = EXCLUDED.serat,
  urt = EXCLUDED.urt,
  satuan_gram = EXCLUDED.satuan_gram,
  foto = EXCLUDED.foto;
