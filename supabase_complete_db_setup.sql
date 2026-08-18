-- ============================================================================
-- NEXUS SCIENCE TRIVIA - COMPLETE SUPABASE DATABASE SETUP SCRIPT (IDEMPOTENT)
-- Run this script in your Supabase SQL Editor to define all database tables!
-- ============================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    full_name TEXT,
    name TEXT,
    role TEXT DEFAULT 'student',
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

-- Ensure all columns exist on profiles table
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(LOWER(username)) WHERE username IS NOT NULL;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles read') THEN
        CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users profile insert') THEN
        CREATE POLICY "Users profile insert" ON public.profiles FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users profile update') THEN
        CREATE POLICY "Users profile update" ON public.profiles FOR UPDATE USING (true);
    END IF;
END $$;


-- 2. TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    quarter INTEGER DEFAULT 1,
    order_no INTEGER DEFAULT 1,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS quarter INTEGER DEFAULT 1;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS order_no INTEGER DEFAULT 1;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'topics' AND policyname = 'Public topics read') THEN
        CREATE POLICY "Public topics read" ON public.topics FOR SELECT USING (true);
    END IF;
END $$;


-- 3. TERMS TABLE
CREATE TABLE IF NOT EXISTS public.terms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    order_no INTEGER DEFAULT 1,
    quarter INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.terms ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.terms ADD COLUMN IF NOT EXISTS order_no INTEGER DEFAULT 1;
ALTER TABLE public.terms ADD COLUMN IF NOT EXISTS quarter INTEGER DEFAULT 1;
ALTER TABLE public.terms ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'terms' AND policyname = 'Public terms read') THEN
        CREATE POLICY "Public terms read" ON public.terms FOR SELECT USING (true);
    END IF;
END $$;


-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id TEXT,
    term_id TEXT,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    correct_index INTEGER DEFAULT 0,
    explanation TEXT,
    difficulty TEXT DEFAULT 'Medium',
    question_type TEXT DEFAULT 'multiple_choice',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS topic_id TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS term_id TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_text TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS correct_index INTEGER DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Public questions read') THEN
        CREATE POLICY "Public questions read" ON public.questions FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Public questions insert') THEN
        CREATE POLICY "Public questions insert" ON public.questions FOR INSERT WITH CHECK (true);
    END IF;
END $$;


-- 5. CUSTOM QUIZZES TABLE (Made by Teachers)
CREATE TABLE IF NOT EXISTS public.custom_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    passcode TEXT,
    questions_count INTEGER DEFAULT 0,
    time_limit_mins INTEGER DEFAULT 10,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.custom_quizzes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.custom_quizzes ADD COLUMN IF NOT EXISTS teacher_id UUID;
ALTER TABLE public.custom_quizzes ADD COLUMN IF NOT EXISTS passcode TEXT;
ALTER TABLE public.custom_quizzes ADD COLUMN IF NOT EXISTS questions_count INTEGER DEFAULT 0;
ALTER TABLE public.custom_quizzes ADD COLUMN IF NOT EXISTS time_limit_mins INTEGER DEFAULT 10;
ALTER TABLE public.custom_quizzes ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.custom_quizzes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.custom_quizzes ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_quizzes' AND policyname = 'Public custom_quizzes read') THEN
        CREATE POLICY "Public custom_quizzes read" ON public.custom_quizzes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_quizzes' AND policyname = 'Public custom_quizzes insert') THEN
        CREATE POLICY "Public custom_quizzes insert" ON public.custom_quizzes FOR INSERT WITH CHECK (true);
    END IF;
END $$;


-- 6. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    quiz_id UUID,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS quiz_id UUID;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS coins_earned INTEGER DEFAULT 0;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'Public quiz_attempts read') THEN
        CREATE POLICY "Public quiz_attempts read" ON public.quiz_attempts FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'Public quiz_attempts insert') THEN
        CREATE POLICY "Public quiz_attempts insert" ON public.quiz_attempts FOR INSERT WITH CHECK (true);
    END IF;
END $$;


-- 7. QUIZ LOBBIES TABLE (Hosted Multiplayer Games)
CREATE TABLE IF NOT EXISTS public.quiz_lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_code TEXT UNIQUE NOT NULL,
    host_teacher_id UUID,
    quiz_title TEXT,
    status TEXT DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.quiz_lobbies ADD COLUMN IF NOT EXISTS lobby_code TEXT;
ALTER TABLE public.quiz_lobbies ADD COLUMN IF NOT EXISTS host_teacher_id UUID;
ALTER TABLE public.quiz_lobbies ADD COLUMN IF NOT EXISTS quiz_title TEXT;
ALTER TABLE public.quiz_lobbies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting';
ALTER TABLE public.quiz_lobbies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.quiz_lobbies ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_lobbies' AND policyname = 'Public quiz_lobbies read') THEN
        CREATE POLICY "Public quiz_lobbies read" ON public.quiz_lobbies FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_lobbies' AND policyname = 'Public quiz_lobbies insert') THEN
        CREATE POLICY "Public quiz_lobbies insert" ON public.quiz_lobbies FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_lobbies' AND policyname = 'Public quiz_lobbies update') THEN
        CREATE POLICY "Public quiz_lobbies update" ON public.quiz_lobbies FOR UPDATE USING (true);
    END IF;
END $$;


-- 8. MULTIPLAYER PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.multiplayer_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID REFERENCES public.quiz_lobbies(id) ON DELETE CASCADE,
    user_id UUID,
    player_name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.multiplayer_players ADD COLUMN IF NOT EXISTS lobby_id UUID;
ALTER TABLE public.multiplayer_players ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.multiplayer_players ADD COLUMN IF NOT EXISTS player_name TEXT;
ALTER TABLE public.multiplayer_players ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.multiplayer_players ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.multiplayer_players ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'multiplayer_players' AND policyname = 'Public multiplayer_players read') THEN
        CREATE POLICY "Public multiplayer_players read" ON public.multiplayer_players FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'multiplayer_players' AND policyname = 'Public multiplayer_players insert') THEN
        CREATE POLICY "Public multiplayer_players insert" ON public.multiplayer_players FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'multiplayer_players' AND policyname = 'Public multiplayer_players update') THEN
        CREATE POLICY "Public multiplayer_players update" ON public.multiplayer_players FOR UPDATE USING (true);
    END IF;
END $$;


-- 9. TEACHER PASSCODES TABLE
CREATE TABLE IF NOT EXISTS public.teacher_passcodes (
    passcode TEXT PRIMARY KEY,
    teacher_name TEXT DEFAULT 'Teacher',
    name TEXT DEFAULT 'Teacher',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.teacher_passcodes ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT 'Teacher';
ALTER TABLE public.teacher_passcodes ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Teacher';
ALTER TABLE public.teacher_passcodes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.teacher_passcodes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.teacher_passcodes ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_passcodes' AND policyname = 'Public teacher_passcodes read') THEN
        CREATE POLICY "Public teacher_passcodes read" ON public.teacher_passcodes FOR SELECT USING (true);
    END IF;
END $$;

-- Insert Default Passcodes safely
INSERT INTO public.teacher_passcodes (passcode, teacher_name, name)
VALUES 
    ('123456', 'Default Teacher', 'Default Teacher'), 
    ('NEXUS10', 'Grade 10 Teacher', 'Grade 10 Teacher')
ON CONFLICT (passcode) DO NOTHING;
