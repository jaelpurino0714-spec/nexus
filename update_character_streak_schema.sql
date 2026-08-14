-- ============================================================================
-- NEXUS: INTERACTIVE CHARACTER & FLOATING STREAK COMPANION SCHEMA EXTENSION
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS character_name TEXT DEFAULT 'Nexus Buddy',
ADD COLUMN IF NOT EXISTS character_outfit TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS character_gender TEXT DEFAULT 'male',
ADD COLUMN IF NOT EXISTS character_xp INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS character_stage TEXT DEFAULT 'baby',
ADD COLUMN IF NOT EXISTS character_mood TEXT DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS last_character_interaction TIMESTAMP WITH TIME ZONE;

-- Comments for documentation
COMMENT ON COLUMN public.profiles.character_name IS 'Custom display name for student companion';
COMMENT ON COLUMN public.profiles.character_outfit IS 'Equipped companion outfit style (default | academic | lab_coat | golden)';
COMMENT ON COLUMN public.profiles.character_gender IS 'Gender selection for student stage character (male | female)';
COMMENT ON COLUMN public.profiles.character_xp IS 'Total accumulated companion XP / growth points';
COMMENT ON COLUMN public.profiles.character_stage IS 'Evolution stage (baby | student | graduate | adult)';
COMMENT ON COLUMN public.profiles.character_mood IS 'Current companion mood (idle | happy | excited | sleepy | encouraging)';
COMMENT ON COLUMN public.profiles.current_streak IS 'Consecutive calendar day activity streak count';
COMMENT ON COLUMN public.profiles.longest_streak IS 'All-time maximum streak count';
COMMENT ON COLUMN public.profiles.last_activity_date IS 'Calendar date of last completed learning activity (YYYY-MM-DD)';
