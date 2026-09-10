-- Supabase Schema for ResiFix KNUST Mobile App & Dashboard
-- Run this in your Supabase SQL Editor (Project -> SQL Editor -> New Query)

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.report_status AS ENUM ('pending', 'scheduled', 'in-progress', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Halls Table
CREATE TABLE IF NOT EXISTS public.halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT,
    floors INT DEFAULT 1,
    rooms INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure unique constraint on hall name for existing tables
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'halls_name_key'
    ) THEN
        ALTER TABLE public.halls ADD CONSTRAINT halls_name_key UNIQUE (name);
    END IF;
END $$;

-- 3. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
    specialty TEXT,
    phone TEXT,
    room TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Maintenance Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT UNIQUE DEFAULT ('REP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT,
    student_email TEXT,
    hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
    hall_name TEXT DEFAULT '',
    location TEXT DEFAULT '',
    category TEXT DEFAULT '',
    issue TEXT DEFAULT '',
    description TEXT DEFAULT '',
    status public.report_status DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    photos TEXT[] DEFAULT '{}',
    video TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_name TEXT,
    assigned_specialty TEXT,
    technician_notes TEXT DEFAULT '',
    repair_date TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'general',
    title TEXT NOT NULL,
    body TEXT DEFAULT '',
    category TEXT DEFAULT '',
    icon TEXT DEFAULT '🔔',
    is_read BOOLEAN DEFAULT FALSE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Push Tokens Table
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Support Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Support Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT,
    sender_role TEXT DEFAULT 'student',
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. News / Announcements Table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'Hall Administration',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger when a new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS) & Policies
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Allow public read access to halls and news
CREATE POLICY "Allow public read on halls" ON public.halls FOR SELECT USING (true);
CREATE POLICY "Allow public read on news" ON public.news FOR SELECT USING (true);

-- User-level access policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can manage push tokens" ON public.push_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can view messages in conversation" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Storage Bucket Setup for 'report-media'
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-media', 'report-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
CREATE POLICY "Public media access" ON storage.objects FOR SELECT USING (bucket_id = 'report-media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-media' AND auth.role() = 'authenticated');

-- 11. Initial Seed Data for Halls
INSERT INTO public.halls (name, code, floors, rooms)
VALUES 
    ('Unity Hall', 'unity', 5, 50),
    ('Independence Hall', 'independence', 4, 40),
    ('Republic Hall', 'republic', 6, 60),
    ('Africa Hall', 'africa', 3, 30),
    ('University Hall (Katanga)', 'university', 4, 45),
    ('Queen Elizabeth II Hall', 'queenshall', 5, 55)
ON CONFLICT (name) DO UPDATE SET 
    code = EXCLUDED.code,
    floors = EXCLUDED.floors,
    rooms = EXCLUDED.rooms;

-- 12. Security Definer RPC for Super Admin to Provision Staff Accounts
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$ 
BEGIN
    EXECUTE 'DROP FUNCTION IF EXISTS public.create_staff_account(text, text, text, public.user_role, uuid, text, text)';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP FUNCTION IF EXISTS public.create_staff_account(text, text, text, text, uuid, text, text);

CREATE OR REPLACE FUNCTION public.create_staff_account(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_role TEXT,
    p_hall_id UUID DEFAULT NULL,
    p_specialty TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
    clean_email TEXT;
BEGIN
    new_user_id := gen_random_uuid();
    clean_email := LOWER(TRIM(p_email));
    encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf', 10));

    -- Create user in auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        is_super_admin
    )
    VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        clean_email,
        encrypted_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', p_full_name, 'role', p_role),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        FALSE
    );

    -- Create identity row for email authentication
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at,
        provider_id
    )
    VALUES (
        gen_random_uuid(),
        new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', clean_email),
        'email',
        NOW(),
        NOW(),
        NOW(),
        clean_email
    );

    -- Create user profile row
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        hall_id,
        specialty,
        phone
    )
    VALUES (
        new_user_id,
        clean_email,
        p_full_name,
        p_role,
        p_hall_id,
        p_specialty,
        p_phone
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        hall_id = EXCLUDED.hall_id,
        specialty = EXCLUDED.specialty,
        phone = EXCLUDED.phone;

    RETURN new_user_id;
END;
$$;
