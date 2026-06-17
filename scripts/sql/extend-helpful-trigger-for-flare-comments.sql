-- Extend helpful_marks so target_type = 'flare_comment' credits the reply author.
-- Run in Supabase SQL editor after adding 'flare_comment' to the helpful_target enum.
--
-- Step 1: add enum value (safe to re-run)
ALTER TYPE public.helpful_target ADD VALUE IF NOT EXISTS 'flare_comment';

-- Step 2: extend apply_helpful_mark (merge with your existing comment/article/post branches)
CREATE OR REPLACE FUNCTION public.apply_helpful_mark()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target helpful_target;
  v_target_id uuid;
  v_author_id uuid;
  v_delta integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_target := NEW.target_type;
    v_target_id := NEW.target_id;
    v_delta := 1;
  ELSIF TG_OP = 'DELETE' THEN
    v_target := OLD.target_type;
    v_target_id := OLD.target_id;
    v_delta := -1;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_target = 'comment' THEN
    UPDATE comments
    SET helpful_count = helpful_count + v_delta
    WHERE id = v_target_id
    RETURNING author_id INTO v_author_id;
  ELSIF v_target = 'article' THEN
    UPDATE articles
    SET helpful_count = helpful_count + v_delta
    WHERE id = v_target_id
    RETURNING author_id INTO v_author_id;
  ELSIF v_target = 'post' THEN
    SELECT author_id
    INTO v_author_id
    FROM posts
    WHERE id = v_target_id;
  ELSIF v_target = 'flare_comment' THEN
    UPDATE flare_comments
    SET helpful_count = helpful_count + v_delta
    WHERE id = v_target_id
    RETURNING author_id INTO v_author_id;
  END IF;

  IF v_author_id IS NOT NULL THEN
    UPDATE profiles
    SET reputation_score = reputation_score + v_delta
    WHERE id = v_author_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;
