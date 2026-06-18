-- Treat flare reply authors as helpers (excluding the flare asker).
-- Safe to re-run. Run in Supabase SQL editor on existing databases.
--
-- 1) Remove askers incorrectly listed as helpers
DELETE FROM public.flare_helpers fh
USING public.flares f
WHERE fh.flare_id = f.id
  AND fh.user_id = f.author_id;

-- 2) Backfill helpers from discussion replies (deduped per flare/user)
INSERT INTO public.flare_helpers (flare_id, user_id, joined_at)
SELECT fc.flare_id, fc.author_id, MIN(fc.created_at)
FROM public.flare_comments fc
JOIN public.flares f ON f.id = fc.flare_id
WHERE fc.author_id <> f.author_id
GROUP BY fc.flare_id, fc.author_id
ON CONFLICT (flare_id, user_id) DO NOTHING;

-- 3) Open flares with any helper should read as being helped
UPDATE public.flares f
SET status = 'being_helped'
WHERE f.status = 'open'
  AND EXISTS (
    SELECT 1
    FROM public.flare_helpers fh
    WHERE fh.flare_id = f.id
  );
