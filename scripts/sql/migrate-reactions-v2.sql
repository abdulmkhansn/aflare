-- Migrate social reaction enum to the new four-value set.
-- Run in Supabase SQL editor (both post_reactions and flare_comment_reactions use post_reaction).
--
-- Mapping:
--   shipped  -> keep_going
--   curious  -> made_me_think
--   been_there, respect unchanged
--
-- New values: respect, been_there, keep_going, made_me_think

-- 1) Add new enum labels (safe if already present)
ALTER TYPE public.post_reaction ADD VALUE IF NOT EXISTS 'keep_going';
ALTER TYPE public.post_reaction ADD VALUE IF NOT EXISTS 'made_me_think';

-- 2) Rewrite existing rows
UPDATE public.post_reactions
SET reaction = 'keep_going'::public.post_reaction
WHERE reaction = 'shipped'::public.post_reaction;

UPDATE public.post_reactions
SET reaction = 'made_me_think'::public.post_reaction
WHERE reaction = 'curious'::public.post_reaction;

UPDATE public.flare_comment_reactions
SET reaction = 'keep_going'::public.post_reaction
WHERE reaction = 'shipped'::public.post_reaction;

UPDATE public.flare_comment_reactions
SET reaction = 'made_me_think'::public.post_reaction
WHERE reaction = 'curious'::public.post_reaction;

-- 3) Optional: remove deprecated enum labels (PostgreSQL requires type swap)
-- Skip unless you need a strict enum. Old labels can remain unused.
--
-- BEGIN;
-- CREATE TYPE public.post_reaction_new AS ENUM ('respect', 'been_there', 'keep_going', 'made_me_think');
-- ALTER TABLE public.post_reactions
--   ALTER COLUMN reaction TYPE public.post_reaction_new
--   USING reaction::text::public.post_reaction_new;
-- ALTER TABLE public.flare_comment_reactions
--   ALTER COLUMN reaction TYPE public.post_reaction_new
--   USING reaction::text::public.post_reaction_new;
-- DROP TYPE public.post_reaction;
-- ALTER TYPE public.post_reaction_new RENAME TO post_reaction;
-- COMMIT;
