-- ══════════════════════════════════════════════════════════════════
-- VMW FULL FIX — Run this ONCE in Supabase SQL Editor
-- Fixes: storage bucket, RLS policies, admin function, gallery columns
-- ══════════════════════════════════════════════════════════════════

-- 1. Ensure gallery_items has all needed columns
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS artisan_notes TEXT;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS metal_type TEXT;

-- 2. Admin check function (recreate safely)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Enable RLS on gallery_items
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- 4. Clean and recreate gallery_items policies
DROP POLICY IF EXISTS "Gallery items are public." ON gallery_items;
DROP POLICY IF EXISTS "Admins manage gallery." ON gallery_items;
DROP POLICY IF EXISTS "Public can read gallery" ON gallery_items;
DROP POLICY IF EXISTS "Admin full access gallery" ON gallery_items;

CREATE POLICY "Public can read gallery" ON gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Admin full access gallery" ON gallery_items
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Storage bucket: gallery-images (hyphen — matches the app code)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('gallery-images', 'gallery-images', true)
  ON CONFLICT (id) DO NOTHING;

-- 6. Clean and recreate storage policies for gallery-images bucket
DROP POLICY IF EXISTS "Gallery Images Public View" ON storage.objects;
DROP POLICY IF EXISTS "Gallery Images Admin Manage" ON storage.objects;
DROP POLICY IF EXISTS "Admin gallery upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin gallery update" ON storage.objects;
DROP POLICY IF EXISTS "Admin gallery delete" ON storage.objects;

-- Public read
CREATE POLICY "Gallery Images Public View" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

-- Admin upload (INSERT)
CREATE POLICY "Admin gallery upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND public.is_admin());

-- Admin update/upsert
CREATE POLICY "Admin gallery update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gallery-images' AND public.is_admin());

-- Admin delete
CREATE POLICY "Admin gallery delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery-images' AND public.is_admin());

-- 7. Analytics events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics_events;
DROP POLICY IF EXISTS "Admins view analytics" ON analytics_events;

CREATE POLICY "Anyone can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view analytics" ON analytics_events
  FOR SELECT USING (public.is_admin());

-- 8. Inquiries
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins manage inquiries" ON inquiries;

CREATE POLICY "Anyone can insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage inquiries" ON inquiries
  FOR ALL USING (public.is_admin());

-- ══════════════════════════════════════════════════════════════════
-- GRANT ADMIN ROLE — change email to your actual admin email
-- ══════════════════════════════════════════════════════════════════
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';

-- Verify admin role:
-- SELECT id, email, role FROM profiles WHERE role = 'admin';
