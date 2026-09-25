-- ==========================================
-- VIJAY METAL WORKS - CLIENT REVIEWS SCHEMA
-- Run this in Supabase SQL Editor
-- ==========================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    organisation TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for public queries
CREATE INDEX IF NOT EXISTS idx_reviews_status_order ON public.reviews (status, display_order, created_at DESC);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Public can read approved reviews only
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved');

-- 2. Anyone (guests/patrons) can submit a review with status = 'pending'
DROP POLICY IF EXISTS "Anyone can submit a pending review" ON public.reviews;
CREATE POLICY "Anyone can submit a pending review" ON public.reviews
    FOR INSERT WITH CHECK (status = 'pending');

-- 3. Admins have full access to view, update, delete, feature, moderate
DROP POLICY IF EXISTS "Admins manage all reviews" ON public.reviews;
CREATE POLICY "Admins manage all reviews" ON public.reviews
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 4. Storage bucket: review-images
INSERT INTO storage.buckets (id, name, public)
    VALUES ('review-images', 'review-images', true)
    ON CONFLICT (id) DO NOTHING;

-- Public can view review images
DROP POLICY IF EXISTS "Review images are publicly viewable" ON storage.objects;
CREATE POLICY "Review images are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'review-images');

-- Anyone can upload review images
DROP POLICY IF EXISTS "Anyone can upload review images" ON storage.objects;
CREATE POLICY "Anyone can upload review images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'review-images');

-- Admin can manage review images
DROP POLICY IF EXISTS "Admin manage review images" ON storage.objects;
CREATE POLICY "Admin manage review images" ON storage.objects
    FOR ALL USING (bucket_id = 'review-images' AND public.is_admin());
