-- ====================================================================
-- VIJAY METAL WORKS — Gallery Image Storage Setup
-- Run this ONCE in Supabase SQL Editor before using Admin → Gallery Upload
-- ====================================================================

-- ── 1. Create public gallery-images storage bucket ───────────────────
-- Images uploaded here get a permanent public URL used directly in the website.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,           -- public: anyone can read image URLs (required for website display)
  10485760,       -- 10 MB max per image
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif'];

-- ── 2. Allow anyone to VIEW images (required for public gallery) ──────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='objects' AND policyname='Public can view gallery images'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Public can view gallery images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'gallery-images')
    $p$;
  END IF;
END $$;

-- ── 3. Allow authenticated admins to UPLOAD ───────────────────────────
-- Only users with role='admin' in profiles table can upload.
-- (The app sends the user's JWT, so RLS checks auth.uid())
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='objects' AND policyname='Admins can upload gallery images'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can upload gallery images"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'gallery-images'
        AND EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    $p$;
  END IF;
END $$;

-- ── 4. Allow admins to DELETE images ─────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='objects' AND policyname='Admins can delete gallery images'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can delete gallery images"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'gallery-images'
        AND EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    $p$;
  END IF;
END $$;

-- ── 5. Allow admins to UPDATE gallery_items table ────────────────────
-- Required for the "Feature/Unfeature" toggle and status updates from admin dashboard.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='gallery_items' AND policyname='Admins can manage gallery items'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can manage gallery items"
      ON gallery_items FOR ALL
      USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    $p$;
  END IF;
END $$;

-- ── 6. Keep public read access on gallery_items ───────────────────────
-- (website gallery reads this table for live items)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='gallery_items' AND policyname='Anyone can view gallery items'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Anyone can view gallery items"
      ON gallery_items FOR SELECT
      USING (true)
    $p$;
  END IF;
END $$;

-- ── DONE ─────────────────────────────────────────────────────────────
-- After running this:
-- 1. Log into the website at /admin/login with your admin email
-- 2. Go to Admin → Gallery tab
-- 3. Click "+ Upload New Artwork" → fill title, category, metal, upload image
-- 4. Image uploads to Supabase Storage, record inserted into gallery_items
-- 5. Website gallery reloads and shows the new item instantly (no redeploy needed)
-- 6. Use "Feature" toggle to show items in the home page featured section
-- 7. Use "Delete" to permanently remove an item + its image from storage
