-- 0004_storage_buckets.sql

-- Enable storage extension if not already enabled (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the bucket for winner proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('winner-proofs', 'winner-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Note: Storage tables are in the `storage` schema, specifically `storage.objects`

-- 1. Users can upload their own proofs to their own folder (folder name = user_id)
CREATE POLICY "Users can upload own proofs" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'winner-proofs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Users can view their own proofs
CREATE POLICY "Users can view own proofs" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
    bucket_id = 'winner-proofs' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Admins can view all proofs
CREATE POLICY "Admins can view all proofs" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
    bucket_id = 'winner-proofs' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Admins can delete proofs (if a rejection happens, maybe they want to clear it, though usually we keep it)
CREATE POLICY "Admins can delete proofs" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'winner-proofs' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
