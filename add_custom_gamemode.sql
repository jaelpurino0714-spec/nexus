-- ============================================================================
-- NEXUS: Custom Gamemode & Custom Play Database Schema Extension
-- Full implementation of Custom Play Flow, Host Quiz Flow & Join Quiz Flow
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. GAME MODES TABLE
-- ============================================================================

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

-- ============================================================================
-- 2. USER CUSTOM PLAY SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_custom_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    saved_time_limit INT DEFAULT 20 CHECK (saved_time_limit BETWEEN 5 AND 60),
    saved_question_count INT DEFAULT 15 CHECK (saved_question_count BETWEEN 1 AND 30),
    last_selected_term_id UUID REFERENCES public.terms(id) ON DELETE SET NULL,
    last_selected_topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. MULTIPLAYER QUIZ LOBBIES & PARTICIPANTS (HOST & JOIN QUIZ FLOW)
-- ============================================================================

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

-- ============================================================================
-- 4. RPC FUNCTIONS FOR CUSTOM PLAY & HOST/JOIN QUIZ FLOWS
-- ============================================================================

-- Function 4.1: Fetch questions for Custom Play & Built-in Host Quiz
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
    time_limit INT,
    is_active BOOLEAN
) AS $$
BEGIN
    -- Enforce limit constraints (1 to 30)
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

-- Function 4.2: Count available questions for Custom Play matching filters
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

-- Function 4.3: Save user custom play settings for persistent future use
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

-- Function 4.4: Get game modes list
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

-- Enable permissions
GRANT ALL ON TABLE public.game_modes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_custom_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.quiz_lobbies TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.lobby_participants TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_custom_play_questions TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_custom_play_question_count TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.save_user_custom_settings TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_game_modes TO anon, authenticated, service_role;
