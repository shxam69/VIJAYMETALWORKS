-- ==========================================
-- VIJAY METAL WORKS - LUXURY GALLERY SCHEMA
-- ==========================================

-- Clean up existing tables
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS saved_items CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ==========================================
-- 1. PROFILES
-- ==========================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. GALLERY ITEMS
-- ==========================================
CREATE TABLE gallery_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    metal_type TEXT,
    stone_type TEXT,
    purity TEXT,
    dimensions TEXT,
    weight TEXT,
    crafting_duration TEXT,
    artisan_notes TEXT,
    image_url TEXT NOT NULL,
    video_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. INQUIRIES
-- ==========================================
CREATE TABLE inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    artwork_type TEXT,
    preferred_metal TEXT,
    budget TEXT,
    timeline TEXT,
    description TEXT,
    reference_images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. COLLECTIONS (Custom User Folders)
-- ==========================================
CREATE TABLE collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. SAVED ITEMS
-- ==========================================
CREATE TABLE saved_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    gallery_item_id UUID REFERENCES gallery_items(id) ON DELETE CASCADE NOT NULL,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, gallery_item_id)
);

-- ==========================================
-- 6. LIKES
-- ==========================================
CREATE TABLE likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    gallery_item_id UUID REFERENCES gallery_items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, gallery_item_id)
);

-- ==========================================
-- 7. COMMENTS
-- ==========================================
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    gallery_item_id UUID REFERENCES gallery_items(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 8. ACTIVITY LOGS
-- ==========================================
CREATE TABLE activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_id UUID,
    entity_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 9. ADMIN NOTIFICATIONS
-- ==========================================
CREATE TABLE admin_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 10. ANALYTICS EVENTS
-- ==========================================
CREATE TABLE analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL, -- e.g., 'page_view', 'inquiry_conversion'
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 11. SETTINGS
-- ==========================================
CREATE TABLE settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    website_title TEXT DEFAULT 'Vijay Metal Works',
    whatsapp_link TEXT,
    contact_email TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    branding_config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings
INSERT INTO settings (id, website_title) VALUES ('global', 'Vijay Metal Works') ON CONFLICT DO NOTHING;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for new inquiries to create admin notification
CREATE OR REPLACE FUNCTION public.notify_new_inquiry()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.admin_notifications (title, message, type, link)
  VALUES (
    'New Commission Request',
    'From ' || new.full_name || ' regarding ' || new.artwork_type,
    'inquiry',
    '/admin/inquiries/' || new.id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_inquiry
  AFTER INSERT ON public.inquiries
  FOR EACH ROW EXECUTE PROCEDURE public.notify_new_inquiry();

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================

-- Insert buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery_images', 'gallery_images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('inquiry_references', 'inquiry_references', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('branding_assets', 'branding_assets', true) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read/update their own, Admins can read/update all
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles." ON profiles FOR ALL USING (public.is_admin());

-- Gallery Items: Public read, Admin write
CREATE POLICY "Gallery items are public." ON gallery_items FOR SELECT USING (true);
CREATE POLICY "Admins manage gallery." ON gallery_items FOR ALL USING (public.is_admin());

-- Inquiries: Users can read own, anyone can insert (guests too), Admins can read all
CREATE POLICY "Users view own inquiries" ON inquiries FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Anyone can insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage inquiries" ON inquiries FOR ALL USING (public.is_admin());

-- Collections: Users read/write own, Admins read all
CREATE POLICY "Users manage own collections" ON collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all collections" ON collections FOR SELECT USING (public.is_admin());

-- Saved Items: Users read/write own
CREATE POLICY "Users manage own saved items" ON saved_items FOR ALL USING (auth.uid() = user_id);

-- Likes: Public read, Users write own
CREATE POLICY "Likes are public" ON likes FOR SELECT USING (true);
CREATE POLICY "Users manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- Comments: Public read, Users write own, Admins delete
CREATE POLICY "Comments are public" ON comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Users write comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update/delete own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users update/delete own comments delete" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage comments" ON comments FOR ALL USING (public.is_admin());

-- Activity Logs: Users read own, Admins read all
CREATE POLICY "Users view own activity" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts activity" ON activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view all activity" ON activity_logs FOR SELECT USING (public.is_admin());

-- Admin Notifications: Admins only
CREATE POLICY "Admins manage notifications" ON admin_notifications FOR ALL USING (public.is_admin());

-- Analytics: Insert public, Select admins only
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view analytics" ON analytics_events FOR SELECT USING (public.is_admin());

-- Settings: Public read, Admins write
CREATE POLICY "Settings public read" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON settings FOR ALL USING (public.is_admin());

-- ==========================================
-- STORAGE POLICIES
-- ==========================================

-- Gallery Images
CREATE POLICY "Gallery Images Public View" ON storage.objects FOR SELECT USING (bucket_id = 'gallery_images');
CREATE POLICY "Gallery Images Admin Manage" ON storage.objects FOR ALL USING (bucket_id = 'gallery_images' AND public.is_admin());

-- Avatars
CREATE POLICY "Avatars Public View" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users manage own avatar" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Inquiry References
CREATE POLICY "Admins view references" ON storage.objects FOR SELECT USING (bucket_id = 'inquiry_references' AND public.is_admin());
CREATE POLICY "Anyone can upload references" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inquiry_references');

-- Branding Assets
CREATE POLICY "Branding Assets Public View" ON storage.objects FOR SELECT USING (bucket_id = 'branding_assets');
CREATE POLICY "Branding Assets Admin Manage" ON storage.objects FOR ALL USING (bucket_id = 'branding_assets' AND public.is_admin());

