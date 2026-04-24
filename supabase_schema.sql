-- COMPLETE SUPABASE SCHEMA (Combined from migrations)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'user');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE public.booking_status AS ENUM ('new','contacted','confirmed','done','cancelled');
    END IF;
END $$;

-- 3. USER ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- 4. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$;

-- 5. TABLES (Robust version)

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  cover_image text NOT NULL,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  date_label text,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS date_label text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- SERVICES
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  image text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- SHOTS
CREATE TABLE IF NOT EXISTS public.shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
ALTER TABLE public.shots ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  text text NOT NULL,
  image text,
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text,
  status booking_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'global',
  hero_title_part1 text NOT NULL DEFAULT 'NINO',
  hero_title_part2 text NOT NULL DEFAULT 'Khikhidze',
  hero_image text,
  hero_quote text,
  contact_location text NOT NULL DEFAULT 'Tbilisi, Georgia',
  contact_email text,
  contact_phone text,
  instagram text,
  facebook text,
  about_text text,
  about_image text,
  primary_color text NOT NULL DEFAULT '#E29E2E',
  accent_color text NOT NULL DEFAULT '#E29E2E',
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#E29E2E';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#E29E2E';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- 11. RLS ENABLEMENT
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 12. TRIGGERS
DO $$ BEGIN
  PERFORM 1 FROM pg_trigger WHERE tgname = 'projects_updated';
  IF NOT FOUND THEN CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  
  PERFORM 1 FROM pg_trigger WHERE tgname = 'services_updated';
  IF NOT FOUND THEN CREATE TRIGGER services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  
  PERFORM 1 FROM pg_trigger WHERE tgname = 'shots_updated';
  IF NOT FOUND THEN CREATE TRIGGER shots_updated BEFORE UPDATE ON public.shots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  
  PERFORM 1 FROM pg_trigger WHERE tgname = 'reviews_updated';
  IF NOT FOUND THEN CREATE TRIGGER reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  
  PERFORM 1 FROM pg_trigger WHERE tgname = 'bookings_updated';
  IF NOT FOUND THEN CREATE TRIGGER bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  
  PERFORM 1 FROM pg_trigger WHERE tgname = 'site_settings_updated';
  IF NOT FOUND THEN CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
END $$;

-- 12. DATA POLICIES (AUTHENTICATED ADMINS)

-- SELECTS (Public)
DROP POLICY IF EXISTS "Public Read Projects" ON public.projects;
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Services" ON public.services;
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Shots" ON public.shots;
CREATE POLICY "Public Read Shots" ON public.shots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Settings" ON public.site_settings;
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);

-- ALL OTHER OPS (Admin only)
DROP POLICY IF EXISTS "Admin CRUD Projects" ON public.projects;
CREATE POLICY "Admin CRUD Projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin CRUD Services" ON public.services;
CREATE POLICY "Admin CRUD Services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin CRUD Shots" ON public.shots;
CREATE POLICY "Admin CRUD Shots" ON public.shots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin CRUD Reviews" ON public.reviews;
CREATE POLICY "Admin CRUD Reviews" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin CRUD Settings" ON public.site_settings;
CREATE POLICY "Admin CRUD Settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin CRUD Bookings" ON public.bookings;
CREATE POLICY "Admin CRUD Bookings" ON public.bookings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bookings insert (Public)
DROP POLICY IF EXISTS "Public Insert Bookings" ON public.bookings;
CREATE POLICY "Public Insert Bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- User Role Select
DROP POLICY IF EXISTS "User Role Select" ON public.user_roles;
CREATE POLICY "User Role Select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 13. STORAGE SETUP
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
DROP POLICY IF EXISTS "Admin upload media" ON storage.objects;
CREATE POLICY "Admin upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update media" ON storage.objects;
CREATE POLICY "Admin update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete media" ON storage.objects;
CREATE POLICY "Admin delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- 14. ADMIN BOOTSTRAP HELP
-- Your user ID: f4806403-6207-4c66-a8b5-101b9d739f00
-- Run this in Supabase SQL editor to ensure you are an admin and the settings table is correct:

-- 1. Create Admin Role if not exists
INSERT INTO public.user_roles (user_id, role) 
VALUES ('f4806403-6207-4c66-a8b5-101b9d739f00', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Fix site_settings table structure
DO $$ 
BEGIN
    -- Ensure table exists
    CREATE TABLE IF NOT EXISTS public.site_settings (
        id text PRIMARY KEY DEFAULT 'global',
        hero_title_part1 text NOT NULL DEFAULT 'NINO',
        hero_title_part2 text NOT NULL DEFAULT 'Khikhidze',
        hero_image text,
        hero_quote text,
        contact_location text NOT NULL DEFAULT 'Tbilisi, Georgia',
        contact_email text,
        contact_phone text,
        instagram text,
        facebook text,
        about_text text,
        about_image text,
        primary_color text NOT NULL DEFAULT '#E29E2E',
        accent_color text NOT NULL DEFAULT '#E29E2E',
        updated_at timestamptz NOT NULL DEFAULT NOW()
    );

    -- Ensure Primary Key exists (Explicitly)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_pkey') THEN
        BEGIN
            ALTER TABLE public.site_settings ADD PRIMARY KEY (id);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add PK, it might already exist with a different name';
        END;
    END IF;
    
    -- Ensure all columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='hero_image') THEN
        ALTER TABLE public.site_settings ADD COLUMN hero_image text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='primary_color') THEN
        ALTER TABLE public.site_settings ADD COLUMN primary_color text DEFAULT '#E29E2E';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='accent_color') THEN
        ALTER TABLE public.site_settings ADD COLUMN accent_color text DEFAULT '#E29E2E';
    END IF;

    -- Insert default row if empty
    INSERT INTO public.site_settings (id) VALUES ('global') ON CONFLICT DO NOTHING;
END $$;
