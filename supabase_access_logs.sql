-- Jalankan SQL ini di Supabase SQL Editor untuk membuat tabel access_logs
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query per user
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_logged_at ON access_logs(logged_at DESC);

-- RLS (optional, karena API sudah cek auth)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON access_logs FOR ALL USING (true);
