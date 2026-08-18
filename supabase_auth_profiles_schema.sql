-- ============================================================================
-- SUPABASE AUTH & PROFILES TABLE MIGRATION FOR NEXUS TRIVIA APP
-- Creates user profiles table linked to auth.users with Row Level Security (RLS)
-- ============================================================================

-- 1. Create Profiles Table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
    grade_level TEXT,
    section TEXT,
    photo_url TEXT,
    device_id TEXT,
    character_name TEXT,
    character_outfit TEXT DEFAULT 'default',
    character_gender TEXT,
    character_xp INTEGER DEFAULT 0,
    character_stage TEXT DEFAULT 'baby',
    character_mood TEXT DEFAULT 'idle',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date TEXT,
    last_character_interaction TIMESTAMPTZ,
    coins INTEGER DEFAULT 50,
    unlocked_outfits JSONB DEFAULT '["default"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast Username Lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(LOWER(username));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone to check username uniqueness during Sign Up
CREATE POLICY "Public profiles username read" 
ON public.profiles FOR SELECT 
USING (true);

-- Allow authenticated user to insert their own profile matching auth.uid()
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow authenticated user to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- 5. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
