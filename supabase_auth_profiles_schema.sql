-- ============================================================================
-- SUPABASE AUTH & PROFILES TABLE MIGRATION FOR NEXUS TRIVIA APP (IDEMPOTENT)
-- Safely creates or updates user profiles table linked to auth.users
-- ============================================================================

-- 1. Create Base Profiles Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add missing columns safely if the table already existed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS character_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS character_outfit TEXT DEFAULT 'default';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS character_gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS character_xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS character_stage TEXT DEFAULT 'baby';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS character_mood TEXT DEFAULT 'idle';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_character_interaction TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unlocked_outfits JSONB DEFAULT '["default"]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Create Unique Index for Username Lookup (Partial index ignoring NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(LOWER(username)) WHERE username IS NOT NULL;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies Safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles username read') THEN
        CREATE POLICY "Public profiles username read" ON public.profiles FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can delete their own profile') THEN
        CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);
    END IF;
END $$;

-- 6. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
