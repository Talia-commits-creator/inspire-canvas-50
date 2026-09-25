CREATE TYPE public.community_post_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.community_post_visibility AS ENUM ('public', 'private');

CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  status public.community_post_status NOT NULL DEFAULT 'draft',
  visibility public.community_post_visibility NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_posts_title_length CHECK (char_length(btrim(title)) BETWEEN 3 AND 120),
  CONSTRAINT community_posts_body_length CHECK (char_length(btrim(body)) BETWEEN 1 AND 5000)
);

GRANT SELECT ON public.community_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX community_posts_feed_idx
  ON public.community_posts (status, visibility, created_at DESC);
CREATE INDEX community_posts_author_idx
  ON public.community_posts (author_id, updated_at DESC);

CREATE POLICY "Public community posts are viewable by everyone"
  ON public.community_posts FOR SELECT TO anon, authenticated
  USING (
    status = 'published'::community_post_status
    AND visibility = 'public'::community_post_visibility
  );

CREATE POLICY "Authors can view their own community posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create their own community posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own community posts"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own community posts"
  ON public.community_posts FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION public.enforce_community_post_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.author_id <> OLD.author_id THEN
    RAISE EXCEPTION 'community_post_author_is_immutable' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status = 'draft'::community_post_status
     AND NEW.status NOT IN ('draft'::community_post_status, 'published'::community_post_status, 'archived'::community_post_status) THEN
    RAISE EXCEPTION 'invalid_community_post_status_transition' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status = 'published'::community_post_status
     AND NEW.status NOT IN ('published'::community_post_status, 'archived'::community_post_status) THEN
    RAISE EXCEPTION 'invalid_community_post_status_transition' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status = 'archived'::community_post_status
     AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'invalid_community_post_status_transition' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER community_posts_enforce_transition
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_community_post_transition();

CREATE TRIGGER community_posts_set_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.list_community_posts(_limit integer DEFAULT 30)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.created_at DESC), '[]'::jsonb)
  FROM (
    SELECT cp.id,
           cp.title,
           cp.body,
           cp.created_at,
           cp.updated_at,
           p.username AS author_username,
           p.display_name AS author_display_name
    FROM public.community_posts cp
    JOIN public.profiles p ON p.id = cp.author_id
    WHERE cp.status = 'published'::community_post_status
      AND cp.visibility = 'public'::community_post_visibility
    ORDER BY cp.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(_limit, 30), 1), 60)
  ) t
$$;

GRANT EXECUTE ON FUNCTION public.list_community_posts(integer) TO anon, authenticated;