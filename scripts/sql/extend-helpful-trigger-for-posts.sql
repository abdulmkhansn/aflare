-- Extend helpful_marks triggers so target_type = 'post' credits the post author.
-- Run in Supabase SQL editor after adding 'post' to the helpful_target enum.
--
-- Step 1: inspect your current trigger function name and body
SELECT
  t.tgname AS trigger_name,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'helpful_marks'
  AND NOT t.tgisinternal;

-- Step 2: if your function only handles comment/article, replace it with this version.
-- Posts have no helpful_count column; counts come from helpful_marks rows in app code.
-- Reputation still bumps via profiles.reputation_score (+1 insert, -1 delete).

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
  END IF;

  IF v_author_id IS NOT NULL THEN
    UPDATE profiles
    SET reputation_score = reputation_score + v_delta
    WHERE id = v_author_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Step 3: point the helpful_marks trigger at apply_helpful_mark().
-- If step 1 shows a different function name, either rename your function to apply_helpful_mark
-- or change EXECUTE FUNCTION below to match your existing function name after editing its body.

DROP TRIGGER IF EXISTS helpful_marks_apply ON helpful_marks;
DROP TRIGGER IF EXISTS on_helpful_mark_change ON helpful_marks;
DROP TRIGGER IF EXISTS helpful_marks_after_change ON helpful_marks;

CREATE TRIGGER helpful_marks_apply
  AFTER INSERT OR DELETE ON helpful_marks
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_helpful_mark();
