-- ============================================================================
-- MULTIPLAYER TRIVIA LOBBY + JOIN SYSTEM SUPABASE MIGRATION
-- Adds multiplayer_games, multiplayer_players, multiplayer_game_questions,
-- multiplayer_answers, 6-character room code generator, and RLS policies.
-- ============================================================================

-- 1. Create Room Code Generator Function (6-char uppercase alphanumeric excluding 0, O, 1, I, L)
CREATE OR REPLACE FUNCTION public.generate_multiplayer_room_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    result TEXT := '';
    i INT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        
        SELECT EXISTS (
            SELECT 1 FROM public.multiplayer_games WHERE room_code = result AND status IN ('waiting', 'starting', 'active')
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Multiplayer Games Table
CREATE TABLE IF NOT EXISTS public.multiplayer_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    term_id UUID REFERENCES public.terms(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    answer_medium TEXT NOT NULL CHECK (answer_medium IN ('multiple_choice', 'true_false', 'identification')),
    question_count INT NOT NULL DEFAULT 10 CHECK (question_count BETWEEN 1 AND 30),
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'active', 'finished', 'cancelled')),
    current_question_index INT NOT NULL DEFAULT 0,
    question_start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_multiplayer_games_room_code ON public.multiplayer_games(room_code);
CREATE INDEX IF NOT EXISTS idx_multiplayer_games_status ON public.multiplayer_games(status);

-- 3. Create Multiplayer Players Table
CREATE TABLE IF NOT EXISTS public.multiplayer_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.multiplayer_games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    photo_url TEXT,
    score INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    wrong_answers INT NOT NULL DEFAULT 0,
    current_question_index INT NOT NULL DEFAULT 0,
    is_finished BOOLEAN NOT NULL DEFAULT FALSE,
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_multiplayer_game_user UNIQUE (game_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_multiplayer_players_game_id ON public.multiplayer_players(game_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_players_user_id ON public.multiplayer_players(user_id);

-- 4. Create Multiplayer Game Questions Sequence Table
CREATE TABLE IF NOT EXISTS public.multiplayer_game_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.multiplayer_games(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    CONSTRAINT unique_game_question_order UNIQUE (game_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_multiplayer_game_questions_game ON public.multiplayer_game_questions(game_id);

-- 5. Create Multiplayer Answers Table
CREATE TABLE IF NOT EXISTS public.multiplayer_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.multiplayer_games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.multiplayer_players(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    response_time NUMERIC(6, 2) DEFAULT 0,
    points_earned INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_player_game_question_answer UNIQUE (game_id, player_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_multiplayer_answers_game ON public.multiplayer_answers(game_id);
CREATE INDEX IF NOT EXISTS idx_multiplayer_answers_player ON public.multiplayer_answers(player_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.multiplayer_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_answers ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies if re-running
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow select on multiplayer_games" ON public.multiplayer_games;
    DROP POLICY IF EXISTS "Allow insert on multiplayer_games" ON public.multiplayer_games;
    DROP POLICY IF EXISTS "Allow update on multiplayer_games" ON public.multiplayer_games;

    DROP POLICY IF EXISTS "Allow select on multiplayer_players" ON public.multiplayer_players;
    DROP POLICY IF EXISTS "Allow insert on multiplayer_players" ON public.multiplayer_players;
    DROP POLICY IF EXISTS "Allow update on multiplayer_players" ON public.multiplayer_players;
    DROP POLICY IF EXISTS "Allow delete on multiplayer_players" ON public.multiplayer_players;

    DROP POLICY IF EXISTS "Allow select on multiplayer_game_questions" ON public.multiplayer_game_questions;
    DROP POLICY IF EXISTS "Allow insert on multiplayer_game_questions" ON public.multiplayer_game_questions;

    DROP POLICY IF EXISTS "Allow select on multiplayer_answers" ON public.multiplayer_answers;
    DROP POLICY IF EXISTS "Allow insert on multiplayer_answers" ON public.multiplayer_answers;
END $$;

-- Policy definitions (Permissive for web_simulator client operations)
CREATE POLICY "Allow select on multiplayer_games" ON public.multiplayer_games FOR SELECT USING (true);
CREATE POLICY "Allow insert on multiplayer_games" ON public.multiplayer_games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on multiplayer_games" ON public.multiplayer_games FOR UPDATE USING (true);

CREATE POLICY "Allow select on multiplayer_players" ON public.multiplayer_players FOR SELECT USING (true);
CREATE POLICY "Allow insert on multiplayer_players" ON public.multiplayer_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on multiplayer_players" ON public.multiplayer_players FOR UPDATE USING (true);
CREATE POLICY "Allow delete on multiplayer_players" ON public.multiplayer_players FOR DELETE USING (true);

CREATE POLICY "Allow select on multiplayer_game_questions" ON public.multiplayer_game_questions FOR SELECT USING (true);
CREATE POLICY "Allow insert on multiplayer_game_questions" ON public.multiplayer_game_questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select on multiplayer_answers" ON public.multiplayer_answers FOR SELECT USING (true);
CREATE POLICY "Allow insert on multiplayer_answers" ON public.multiplayer_answers FOR INSERT WITH CHECK (true);

-- 7. Add Tables to Supabase Realtime Publication
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_games;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_players;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_answers;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Realtime publication update skipped: %', SQLERRM;
END $$;
