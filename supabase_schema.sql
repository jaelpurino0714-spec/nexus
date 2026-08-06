-- ============================================================================
-- NEXUS: Grade 10 Science Trivia Application
-- SUPABASE COMPLETE DATABASE SCHEMA, INDEXES, RLS POLICIES & STORAGE
-- ============================================================================

-- Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLES DEFINITION
-- ============================================================================

-- 1.1 Profiles Table (Student & Teacher Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
    name TEXT NOT NULL,
    grade_level TEXT,
    section TEXT,
    photo_url TEXT,
    device_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 Terms Table (Quarter 1, Quarter 2, Quarter 3, Quarter 4)
CREATE TABLE IF NOT EXISTS public.terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4 Question Bank Table
CREATE TABLE IF NOT EXISTS public.question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL, -- e.g., 'A', 'B', 'C', 'D' or 'True', 'False'
    explanation TEXT,
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    time_limit INT DEFAULT 30, -- seconds per question
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.5 Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('pre_test', 'practice', 'post_test', 'custom')),
    score INT NOT NULL DEFAULT 0,
    correct INT NOT NULL DEFAULT 0,
    wrong INT NOT NULL DEFAULT 0,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    duration INT NOT NULL DEFAULT 0, -- total duration in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.6 Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken INT DEFAULT 0, -- seconds taken for this question
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.7 Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement_type TEXT NOT NULL, -- e.g., 'quizzes_completed', 'score_percentage', 'streak'
    requirement_value INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.8 Student Achievements Table
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_achievement UNIQUE (student_id, achievement_id)
);

-- 1.9 Teacher Passcodes Table
CREATE TABLE IF NOT EXISTS public.teacher_passcodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passcode TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure column name is 'active' if table was previously created with 'is_active'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_passcodes' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.teacher_passcodes RENAME COLUMN is_active TO active;
    END IF;
END $$;

-- 1.10 Custom Quizzes Table
CREATE TABLE IF NOT EXISTS public.custom_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.11 Custom Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.custom_quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.custom_quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    CONSTRAINT unique_quiz_question UNIQUE (quiz_id, question_id)
);


-- ============================================================================
-- 2. HIGH PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_device_id ON public.profiles(device_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_topics_term_id ON public.topics(term_id);
CREATE INDEX IF NOT EXISTS idx_topics_order ON public.topics(order_index);

CREATE INDEX IF NOT EXISTS idx_question_bank_topic_id ON public.question_bank(topic_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_active ON public.question_bank(is_active);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic_id ON public.quiz_attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON public.quiz_attempts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON public.answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);

CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_custom_quizzes_teacher ON public.custom_quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_custom_quiz_questions_quiz ON public.custom_quiz_questions(quiz_id);


-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_passcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_quiz_questions ENABLE ROW LEVEL SECURITY;

-- 3.1 Profiles RLS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public select profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
    CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
    CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
    CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.2 Terms & Topics RLS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read terms" ON public.terms;
    CREATE POLICY "Allow read terms" ON public.terms FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow teacher manage terms" ON public.terms;
    CREATE POLICY "Allow teacher manage terms" ON public.terms FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read topics" ON public.topics;
    CREATE POLICY "Allow read topics" ON public.topics FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow teacher manage topics" ON public.topics;
    CREATE POLICY "Allow teacher manage topics" ON public.topics FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.3 Question Bank RLS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read active questions" ON public.question_bank;
    CREATE POLICY "Allow read active questions" ON public.question_bank FOR SELECT USING (is_active = true OR true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow teacher manage question_bank" ON public.question_bank;
    CREATE POLICY "Allow teacher manage question_bank" ON public.question_bank FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.4 Quiz Attempts RLS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read quiz_attempts" ON public.quiz_attempts;
    CREATE POLICY "Allow read quiz_attempts" ON public.quiz_attempts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow insert quiz_attempts" ON public.quiz_attempts;
    CREATE POLICY "Allow insert quiz_attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.5 Answers RLS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read answers" ON public.answers;
    CREATE POLICY "Allow read answers" ON public.answers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow insert answers" ON public.answers;
    CREATE POLICY "Allow insert answers" ON public.answers FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.6 Achievements RLS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read achievements" ON public.achievements;
    CREATE POLICY "Allow read achievements" ON public.achievements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read student_achievements" ON public.student_achievements;
    CREATE POLICY "Allow read student_achievements" ON public.student_achievements FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow insert student_achievements" ON public.student_achievements;
    CREATE POLICY "Allow insert student_achievements" ON public.student_achievements FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.7 Teacher Passcodes RLS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public select active passcodes" ON public.teacher_passcodes;
    DROP POLICY IF EXISTS "Allow read active passcodes" ON public.teacher_passcodes;
    CREATE POLICY "Allow read active passcodes" ON public.teacher_passcodes FOR SELECT USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow manage passcodes" ON public.teacher_passcodes;
    CREATE POLICY "Allow manage passcodes" ON public.teacher_passcodes FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.8 Custom Quizzes RLS
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read custom_quizzes" ON public.custom_quizzes;
    CREATE POLICY "Allow read custom_quizzes" ON public.custom_quizzes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow manage custom_quizzes" ON public.custom_quizzes;
    CREATE POLICY "Allow manage custom_quizzes" ON public.custom_quizzes FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow read custom_quiz_questions" ON public.custom_quiz_questions;
    CREATE POLICY "Allow read custom_quiz_questions" ON public.custom_quiz_questions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow manage custom_quiz_questions" ON public.custom_quiz_questions;
    CREATE POLICY "Allow manage custom_quiz_questions" ON public.custom_quiz_questions FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================================
-- 4. SUPABASE STORAGE BUCKET SETUP (profile-images)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies for profile-images
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Read Access for profile-images" ON storage.objects;
    CREATE POLICY "Public Read Access for profile-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Upload Access for profile-images" ON storage.objects;
    CREATE POLICY "Public Upload Access for profile-images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'profile-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Update Access for profile-images" ON storage.objects;
    CREATE POLICY "Public Update Access for profile-images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'profile-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================================
-- 5. SEED INITIAL DATA
-- ============================================================================

-- Seed Default Teacher Passcodes
INSERT INTO public.teacher_passcodes (passcode, active)
VALUES ('123456', true), ('NEXUS10', true), ('TEACHER2026', true)
ON CONFLICT (passcode) DO NOTHING;

-- Seed Default Grade 10 Science Terms
INSERT INTO public.terms (id, title, order_index) VALUES
('a0000000-0000-0000-0000-000000000001', '1st Quarter: Earth and Space', 1),
('a0000000-0000-0000-0000-000000000002', '2nd Quarter: Force, Motion & Energy', 2),
('a0000000-0000-0000-0000-000000000003', '3rd Quarter: Living Things & Environment', 3),
('a0000000-0000-0000-0000-000000000004', '4th Quarter: Matter & Its Interactions', 4)
ON CONFLICT (id) DO NOTHING;

-- Seed Default Topics
INSERT INTO public.topics (id, term_id, title, description, icon, order_index) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Plate Tectonics & Processes', 'Plate boundaries, earthquake epicenters, and mountain formation.', '🌋', 1),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Internal Structure of Earth', 'Crust, mantle, outer core, inner core, and seismic waves.', '🌍', 2),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Electromagnetic Spectrum', 'Radio waves, microwaves, infrared, visible light, UV, X-rays, gamma rays.', '📻', 1),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Light: Mirrors and Lenses', 'Reflection, refraction, concave/convex mirrors, ray diagrams.', '🔍', 2),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'Endocrine & Reproductive System', 'Hormones, feedback mechanisms, human reproduction.', '🧬', 1),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'Gas Laws & Chemical Reactions', 'Boyle''s law, Charles'' law, ideal gas law, chemical equations.', '🧪', 1)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Questions
INSERT INTO public.question_bank (topic_id, question, question_type, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, time_limit, is_active) VALUES
('b0000000-0000-0000-0000-000000000001', 'What type of plate boundary is formed when two tectonic plates move away from each other?', 'multiple_choice', 'Divergent Boundary', 'Convergent Boundary', 'Transform Fault Boundary', 'Subduction Zone Boundary', 'A', 'Divergent boundaries occur when plates pull apart, forming rift valleys or mid-ocean ridges.', 'Easy', 30, true),
('b0000000-0000-0000-0000-000000000001', 'Which seismic wave travels fastest and can move through both solid and liquid layers of Earth?', 'multiple_choice', 'S-wave (Secondary)', 'P-wave (Primary)', 'Love Wave', 'Rayleigh Wave', 'B', 'Primary waves (P-waves) are longitudinal waves that travel fastest through solids, liquids, and gases.', 'Medium', 30, true),
('b0000000-0000-0000-0000-000000000003', 'Which wave in the electromagnetic spectrum has the highest frequency and energy?', 'multiple_choice', 'Radio waves', 'Visible light', 'Gamma rays', 'Ultraviolet rays', 'C', 'Gamma rays have the shortest wavelength and highest frequency in the EM spectrum.', 'Easy', 30, true),
('b0000000-0000-0000-0000-000000000004', 'What type of mirror is used as a side-view mirror in automobiles because it produces an upright, reduced virtual image?', 'multiple_choice', 'Concave mirror', 'Plane mirror', 'Convex mirror', 'Parabolic mirror', 'C', 'Convex mirrors provide a wider field of view and always produce smaller, upright virtual images.', 'Medium', 30, true);

-- Seed Default Achievements
INSERT INTO public.achievements (title, description, icon, requirement_type, requirement_value) VALUES
('First Step into Science', 'Complete your very first science quiz attempt.', '🌱', 'quizzes_completed', 1),
('Science Scholar', 'Complete 10 quiz attempts.', '🎓', 'quizzes_completed', 10),
('Perfect Score', 'Score 100% on any science quiz.', '🌟', 'score_percentage', 100),
('Trivia Master', 'Achieve a 5-quiz streak with 80%+ scores.', '🔥', 'streak', 5)
ON CONFLICT DO NOTHING;
