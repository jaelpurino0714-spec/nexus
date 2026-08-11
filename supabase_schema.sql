-- ============================================================================
-- NEXUS: Grade 10 Science Trivia Application
-- REFACTORED DATABASE SCHEMA (MASTER PROMPT ALIGNED)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLES DEFINITION (Normalized 4-Tier Hierarchy)
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

-- 1.2 Terms Table (terms)
CREATE TABLE IF NOT EXISTS public.terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT, -- optional label
    order_no INT NOT NULL DEFAULT 0,
    order_index INT GENERATED ALWAYS AS (order_no) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Topics Table (topics)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_no INT NOT NULL DEFAULT 0,
    order_index INT GENERATED ALWAYS AS (order_no) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4 Question Types Table (question_types)
CREATE TABLE IF NOT EXISTS public.question_types (
    id INT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 1.5 Questions Table (questions)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    question_type_id INT NOT NULL REFERENCES public.question_types(id) ON DELETE CASCADE,
    quiz_type TEXT DEFAULT 'post_test' CHECK (quiz_type IN ('pre_test', 'post_test', 'practice', 'custom')),
    question TEXT NOT NULL,
    choice_a TEXT,
    choice_b TEXT,
    choice_c TEXT,
    choice_d TEXT,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    image_url TEXT,
    time_limit INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.6 Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    quiz_type TEXT NOT NULL CHECK (quiz_type IN ('pre_test', 'practice', 'post_test', 'custom')),
    score INT NOT NULL DEFAULT 0,
    correct INT NOT NULL DEFAULT 0,
    wrong INT NOT NULL DEFAULT 0,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    duration INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.7 Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.8 Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    requirement_value INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.9 Student Achievements Table
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_achievement UNIQUE (student_id, achievement_id)
);

-- 1.10 Teacher Passcodes Table
CREATE TABLE IF NOT EXISTS public.teacher_passcodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passcode TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. HIGH PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_type_id ON public.questions(question_type_id);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active);
CREATE INDEX IF NOT EXISTS idx_topics_term_id ON public.topics(term_id);
CREATE INDEX IF NOT EXISTS idx_topics_order_no ON public.topics(order_no);
CREATE INDEX IF NOT EXISTS idx_terms_order_no ON public.terms(order_no);

-- ============================================================================
-- 3. SEED REQUIRED DATA (Question Types & Initial Terms)
-- ============================================================================

INSERT INTO public.question_types (id, name) VALUES
(1, 'Multiple Choice'),
(2, 'True or False'),
(3, 'Identification')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.terms (id, name, title, order_no) VALUES
('a0000000-0000-0000-0000-000000000001', 'Term 1', '1st Quarter: Earth and Space', 1),
('a0000000-0000-0000-0000-000000000002', 'Term 2', '2nd Quarter: Force, Motion & Energy', 2),
('a0000000-0000-0000-0000-000000000003', 'Term 3', '3rd Quarter: Living Things & Environment', 3),
('a0000000-0000-0000-0000-000000000004', 'Term 4', '4th Quarter: Matter & Its Interactions', 4)
ON CONFLICT (id) DO NOTHING;

-- Seed Passcodes
INSERT INTO public.teacher_passcodes (passcode, active)
VALUES ('123456', true), ('NEXUS10', true), ('TEACHER2026', true)
ON CONFLICT (passcode) DO NOTHING;

-- ============================================================================
-- 4. RPC HELPER FUNCTIONS FOR API QUERYING
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_terms()
RETURNS TABLE (
    id UUID,
    name TEXT,
    order_no INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.name, t.order_no
    FROM public.terms t
    ORDER BY t.order_no ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_topics(p_term_id UUID)
RETURNS TABLE (
    id UUID,
    term_id UUID,
    title TEXT,
    description TEXT,
    order_no INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT tp.id, tp.term_id, tp.title, tp.description, tp.order_no
    FROM public.topics tp
    WHERE tp.term_id = p_term_id
    ORDER BY tp.order_no ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_question_types()
RETURNS TABLE (
    id INT,
    name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT qt.id, qt.name
    FROM public.question_types qt
    ORDER BY qt.id ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_questions(p_topic_id UUID, p_question_type_id INT)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
    question_type_id INT,
    question TEXT,
    choice_a TEXT,
    choice_b TEXT,
    choice_c TEXT,
    choice_d TEXT,
    correct_answer TEXT,
    explanation TEXT,
    difficulty TEXT,
    image_url TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.topic_id, q.question_type_id, q.question,
           q.choice_a, q.choice_b, q.choice_c, q.choice_d,
           q.correct_answer, q.explanation, q.difficulty,
           q.image_url, q.is_active
    FROM public.questions q
    WHERE q.topic_id = p_topic_id
      AND q.question_type_id = p_question_type_id
      AND q.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_random_questions(p_topic_id UUID, p_question_type_id INT, p_limit INT DEFAULT 15)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
    question_type_id INT,
    question TEXT,
    choice_a TEXT,
    choice_b TEXT,
    choice_c TEXT,
    choice_d TEXT,
    correct_answer TEXT,
    explanation TEXT,
    difficulty TEXT,
    image_url TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT q.id, q.topic_id, q.question_type_id, q.question,
           q.choice_a, q.choice_b, q.choice_c, q.choice_d,
           q.correct_answer, q.explanation, q.difficulty,
           q.image_url, q.is_active
    FROM public.questions q
    WHERE q.topic_id = p_topic_id
      AND q.question_type_id = p_question_type_id
      AND q.is_active = true
    ORDER BY random()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_question_count(p_topic_id UUID, p_question_type_id INT)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.questions
    WHERE topic_id = p_topic_id
      AND question_type_id = p_question_type_id
      AND is_active = true;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backward-compatibility view for question_bank
CREATE OR REPLACE VIEW public.question_bank AS
SELECT
    q.id,
    q.topic_id,
    q.question,
    CASE
        WHEN q.question_type_id = 1 THEN 'multiple_choice'
        WHEN q.question_type_id = 2 THEN 'true_false'
        WHEN q.question_type_id = 3 THEN 'identification'
        ELSE 'multiple_choice'
    END AS question_type,
    COALESCE(q.choice_a, 'True') AS option_a,
    COALESCE(q.choice_b, 'False') AS option_b,
    q.choice_c AS option_c,
    q.choice_d AS option_d,
    q.correct_answer,
    q.explanation,
    q.difficulty,
    q.time_limit,
    q.is_active,
    q.created_by,
    q.created_at
FROM public.questions q;

-- ============================================================================
-- 5. CUSTOM GAMEMODE & CUSTOM PLAY EXTENSIONS
-- ============================================================================

-- 5.1 Game Modes Table
CREATE TABLE IF NOT EXISTS public.game_modes (
    id INT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    min_time_limit INT DEFAULT 5 CHECK (min_time_limit >= 5),
    max_time_limit INT DEFAULT 60 CHECK (max_time_limit <= 60),
    default_time_limit INT DEFAULT 20,
    min_questions INT DEFAULT 1 CHECK (min_questions >= 1),
    max_questions INT DEFAULT 30 CHECK (max_questions <= 30),
    default_questions INT DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Game Modes
INSERT INTO public.game_modes (id, code, name, description, min_time_limit, max_time_limit, default_time_limit, min_questions, max_questions, default_questions, is_active)
VALUES
(1, 'pre_test', 'Pre-Test', '15 multiple-choice questions for diagnostic assessment', 5, 60, 20, 1, 30, 15, true),
(2, 'post_test_mcq', 'Post-Test (Multiple Choice)', 'Multiple-choice post-test questions with 4 options', 5, 60, 20, 1, 30, 15, true),
(3, 'post_test_tf', 'Post-Test (True or False)', 'True or False post-test questions', 5, 60, 20, 1, 30, 15, true),
(4, 'post_test_id', 'Post-Test (Identification)', 'Identification post-test questions with direct input', 5, 60, 20, 1, 30, 15, true),
(5, 'custom_play', 'Custom Play Mode', 'Single-player custom quiz with adjustable time limits (5-60s) and question count (1-30)', 5, 60, 20, 1, 30, 15, true),
(6, 'host_builtin', 'Host Quiz (Built-in Questions)', 'Multiplayer quiz lobby hosted using the built-in question bank', 5, 60, 20, 1, 30, 15, true),
(7, 'host_custom', 'Host Quiz (Custom Questions)', 'Multiplayer quiz lobby hosted using custom teacher-created questions', 5, 60, 20, 1, 30, 10, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    min_time_limit = EXCLUDED.min_time_limit,
    max_time_limit = EXCLUDED.max_time_limit,
    default_time_limit = EXCLUDED.default_time_limit,
    min_questions = EXCLUDED.min_questions,
    max_questions = EXCLUDED.max_questions,
    default_questions = EXCLUDED.default_questions;

-- 5.2 User Custom Play Settings Table
CREATE TABLE IF NOT EXISTS public.user_custom_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    saved_time_limit INT DEFAULT 20 CHECK (saved_time_limit BETWEEN 5 AND 60),
    saved_question_count INT DEFAULT 15 CHECK (saved_question_count BETWEEN 1 AND 30),
    last_selected_term_id UUID REFERENCES public.terms(id) ON DELETE SET NULL,
    last_selected_topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.3 Multiplayer Quiz Lobbies & Participants
CREATE TABLE IF NOT EXISTS public.quiz_lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_code VARCHAR(7) UNIQUE NOT NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    host_name TEXT NOT NULL,
    host_photo_url TEXT,
    quiz_title TEXT NOT NULL,
    term_id UUID REFERENCES public.terms(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    quiz_type TEXT DEFAULT 'custom' CHECK (quiz_type IN ('pre_test', 'post_test', 'practice', 'custom')),
    question_type_id INT REFERENCES public.question_types(id) ON DELETE SET NULL,
    custom_quiz_id UUID REFERENCES public.custom_quizzes(id) ON DELETE CASCADE,
    time_limit_per_question INT DEFAULT 20 CHECK (time_limit_per_question BETWEEN 5 AND 60),
    question_count INT DEFAULT 15 CHECK (question_count BETWEEN 1 AND 30),
    max_participants INT DEFAULT 100 CHECK (max_participants >= 1),
    is_started BOOLEAN DEFAULT FALSE,
    is_finished BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
    current_question_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lobby_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID NOT NULL REFERENCES public.quiz_lobbies(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    photo_url TEXT,
    grade_level TEXT DEFAULT 'Grade 10',
    section TEXT DEFAULT 'Section A',
    current_question_index INT DEFAULT 0,
    score INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,
    is_finished BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_lobby_student UNIQUE (lobby_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_lobbies_access_code ON public.quiz_lobbies(access_code);
CREATE INDEX IF NOT EXISTS idx_lobby_participants_lobby_id ON public.lobby_participants(lobby_id);

-- 5.4 Custom Play RPC Functions
CREATE OR REPLACE FUNCTION public.get_custom_play_questions(
    p_term_id UUID DEFAULT NULL,
    p_topic_id UUID DEFAULT NULL,
    p_quiz_type TEXT DEFAULT 'post_test',
    p_question_type_id INT DEFAULT 1,
    p_limit INT DEFAULT 15
)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
    term_id UUID,
    question_type_id INT,
    quiz_type TEXT,
    question TEXT,
    choice_a TEXT,
    choice_b TEXT,
    choice_c TEXT,
    choice_d TEXT,
    correct_answer TEXT,
    explanation TEXT,
    difficulty TEXT,
    image_url TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    IF p_limit < 1 THEN p_limit := 1; END IF;
    IF p_limit > 30 THEN p_limit := 30; END IF;

    RETURN QUERY
    SELECT 
        q.id, 
        q.topic_id, 
        tp.term_id,
        q.question_type_id, 
        q.quiz_type,
        q.question,
        q.choice_a, 
        q.choice_b, 
        q.choice_c, 
        q.choice_d,
        q.correct_answer, 
        q.explanation, 
        q.difficulty,
        q.image_url, 
        q.is_active
    FROM public.questions q
    JOIN public.topics tp ON tp.id = q.topic_id
    WHERE (p_term_id IS NULL OR tp.term_id = p_term_id)
      AND (p_topic_id IS NULL OR q.topic_id = p_topic_id)
      AND (p_quiz_type IS NULL OR q.quiz_type = p_quiz_type)
      AND (p_question_type_id IS NULL OR q.question_type_id = p_question_type_id)
      AND q.is_active = true
    ORDER BY random()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_custom_play_question_count(
    p_term_id UUID DEFAULT NULL,
    p_topic_id UUID DEFAULT NULL,
    p_quiz_type TEXT DEFAULT 'post_test',
    p_question_type_id INT DEFAULT 1
)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.questions q
    JOIN public.topics tp ON tp.id = q.topic_id
    WHERE (p_term_id IS NULL OR tp.term_id = p_term_id)
      AND (p_topic_id IS NULL OR q.topic_id = p_topic_id)
      AND (p_quiz_type IS NULL OR q.quiz_type = p_quiz_type)
      AND (p_question_type_id IS NULL OR q.question_type_id = p_question_type_id)
      AND q.is_active = true;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.save_user_custom_settings(
    p_user_id UUID,
    p_time_limit INT,
    p_question_count INT,
    p_term_id UUID DEFAULT NULL,
    p_topic_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    IF p_time_limit < 5 OR p_time_limit > 60 THEN
        RAISE EXCEPTION 'Time limit must be between 5 and 60 seconds.';
    END IF;

    IF p_question_count < 1 OR p_question_count > 30 THEN
        RAISE EXCEPTION 'Question count must be between 1 and 30 questions.';
    END IF;

    INSERT INTO public.user_custom_settings (
        user_id, saved_time_limit, saved_question_count, last_selected_term_id, last_selected_topic_id, updated_at
    )
    VALUES (
        p_user_id, p_time_limit, p_question_count, p_term_id, p_topic_id, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        saved_time_limit = EXCLUDED.saved_time_limit,
        saved_question_count = EXCLUDED.saved_question_count,
        last_selected_term_id = COALESCE(EXCLUDED.last_selected_term_id, user_custom_settings.last_selected_term_id),
        last_selected_topic_id = COALESCE(EXCLUDED.last_selected_topic_id, user_custom_settings.last_selected_topic_id),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_game_modes()
RETURNS TABLE (
    id INT,
    code TEXT,
    name TEXT,
    description TEXT,
    min_time_limit INT,
    max_time_limit INT,
    default_time_limit INT,
    min_questions INT,
    max_questions INT,
    default_questions INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT gm.id, gm.code, gm.name, gm.description, 
           gm.min_time_limit, gm.max_time_limit, gm.default_time_limit,
           gm.min_questions, gm.max_questions, gm.default_questions
    FROM public.game_modes gm
    WHERE gm.is_active = true
    ORDER BY gm.id ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

