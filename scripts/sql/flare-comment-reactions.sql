-- Social reactions on flare discussion replies (no reputation).
-- Run in Supabase SQL editor. Mirrors post_reactions for flare_comments.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_reaction') THEN
    CREATE TYPE public.post_reaction AS ENUM ('respect', 'been_there', 'keep_going', 'made_me_think');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.flare_comment_reactions (
  flare_comment_id uuid NOT NULL REFERENCES public.flare_comments (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  reaction public.post_reaction NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (flare_comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS flare_comment_reactions_comment_id_idx
  ON public.flare_comment_reactions (flare_comment_id);

ALTER TABLE public.flare_comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flare_comment_reactions_select" ON public.flare_comment_reactions;
CREATE POLICY "flare_comment_reactions_select"
  ON public.flare_comment_reactions
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "flare_comment_reactions_insert" ON public.flare_comment_reactions;
CREATE POLICY "flare_comment_reactions_insert"
  ON public.flare_comment_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "flare_comment_reactions_update" ON public.flare_comment_reactions;
CREATE POLICY "flare_comment_reactions_update"
  ON public.flare_comment_reactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "flare_comment_reactions_delete" ON public.flare_comment_reactions;
CREATE POLICY "flare_comment_reactions_delete"
  ON public.flare_comment_reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
