CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    makanan_id BIGINT NOT NULL REFERENCES public.makanan_induk(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, makanan_id)
);