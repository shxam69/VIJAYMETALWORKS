-- ================================================================
-- VMW SITE IMAGES PATCH
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- This enables admin-controlled images for all homepage sections
-- ================================================================

-- 1. Create site_images table
CREATE TABLE IF NOT EXISTS site_images (
    id TEXT PRIMARY KEY,           -- e.g. 'hero_bg', 'service_gold', 'craftwork_1'
    section TEXT NOT NULL,         -- e.g. 'Hero', 'Services', 'CraftworkPanel'
    label TEXT NOT NULL,           -- Human-readable label for admin UI
    image_url TEXT NOT NULL,       -- Supabase storage public URL
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- 3. Public read (website fetches these freely)
DROP POLICY IF EXISTS "Site images public read" ON site_images;
CREATE POLICY "Site images public read" ON site_images FOR SELECT USING (true);

-- 4. Admin write only
DROP POLICY IF EXISTS "Admins manage site images" ON site_images;
CREATE POLICY "Admins manage site images" ON site_images FOR ALL USING (public.is_admin());

-- 5. Create storage bucket for site images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies for site-images bucket
DROP POLICY IF EXISTS "Site images public view" ON storage.objects;
CREATE POLICY "Site images public view" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "Site images admin manage" ON storage.objects;
CREATE POLICY "Site images admin manage" ON storage.objects
  FOR ALL USING (bucket_id = 'site-images' AND public.is_admin());

-- 7. Also fix inquiries status constraint if not done yet
ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE inquiries ADD CONSTRAINT inquiries_status_check
  CHECK (status IN ('pending', 'new', 'contacted', 'in_progress', 'completed', 'rejected'));
ALTER TABLE inquiries ALTER COLUMN status SET DEFAULT 'pending';

-- Add notes column if missing
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS notes TEXT;

-- Done!
-- After running this, go to the VMW Admin → "Site Images" tab to upload homepage images.
