CREATE TYPE public.portfolio_media_type AS ENUM ('image','video','audio','link');

CREATE TABLE public.portfolio_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_categories TO anon, authenticated;
GRANT ALL ON public.portfolio_categories TO service_role;
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active portfolio categories are readable by everyone"
  ON public.portfolio_categories FOR SELECT TO anon, authenticated USING (is_active);

INSERT INTO public.portfolio_categories (slug, name, sort_order) VALUES
  ('photography','Photography',10),
  ('videography','Videography',20),
  ('music','Music',30),
  ('podcast','Podcast',40),
  ('graphic-design','Graphic Design',50),
  ('writing','Writing',60),
  ('events','Events',70),
  ('performance','Performance',80),
  ('content-creation','Content Creation',90),
  ('other','Other',999);

CREATE TABLE public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  media_type public.portfolio_media_type NOT NULL,
  media_path text,
  thumbnail_path text,
  external_url text,
  category_id uuid REFERENCES public.portfolio_categories(id) ON DELETE SET NULL,
  is_featured boolean NOT NULL DEFAULT false,
  visibility public.creator_visibility NOT NULL DEFAULT 'public',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portfolio_items_title_len CHECK (char_length(btrim(title)) BETWEEN 2 AND 120),
  CONSTRAINT portfolio_items_description_len CHECK (description IS NULL OR char_length(description) <= 1200),
  CONSTRAINT portfolio_items_media_present CHECK (
    (media_type = 'link' AND external_url IS NOT NULL) OR
    (media_type <> 'link' AND media_path IS NOT NULL)
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT SELECT ON public.portfolio_items TO anon;
GRANT ALL ON public.portfolio_items TO service_role;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX portfolio_items_creator_idx ON public.portfolio_items (creator_profile_id, position, created_at DESC);
CREATE INDEX portfolio_items_public_idx ON public.portfolio_items (visibility, is_featured, position);
CREATE INDEX portfolio_items_category_idx ON public.portfolio_items (category_id);
CREATE INDEX portfolio_items_media_type_idx ON public.portfolio_items (media_type);

CREATE POLICY "Creators manage their own portfolio items"
  ON public.portfolio_items FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.creator_profiles p
      WHERE p.id = creator_profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Public portfolio items are viewable by everyone"
  ON public.portfolio_items FOR SELECT TO anon, authenticated
  USING (
    visibility = 'public'
    AND EXISTS (
      SELECT 1 FROM public.creator_profiles p
      WHERE p.id = creator_profile_id AND p.visibility = 'public'
    )
  );

CREATE TRIGGER portfolio_items_set_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_featured_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  featured_count integer;
BEGIN
  IF NEW.is_featured THEN
    SELECT count(*) INTO featured_count
    FROM public.portfolio_items
    WHERE creator_profile_id = NEW.creator_profile_id
      AND is_featured
      AND id <> NEW.id;
    IF featured_count >= 6 THEN
      RAISE EXCEPTION 'featured_limit_reached' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER portfolio_items_featured_limit
  BEFORE INSERT OR UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_featured_limit();

CREATE OR REPLACE FUNCTION public.get_public_portfolio(_username text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.is_featured DESC, t.position ASC, t.created_at DESC), '[]'::jsonb)
  FROM (
    SELECT i.id, i.title, i.description, i.media_type, i.media_path, i.thumbnail_path,
           i.external_url, i.is_featured, i.position, i.created_at,
           (SELECT jsonb_build_object('slug', pc.slug, 'name', pc.name)
              FROM public.portfolio_categories pc WHERE pc.id = i.category_id) AS category
    FROM public.portfolio_items i
    JOIN public.creator_profiles c ON c.id = i.creator_profile_id
    JOIN public.profiles p ON p.id = c.user_id
    WHERE lower(p.username) = lower(btrim(_username))
      AND c.visibility = 'public'
      AND i.visibility = 'public'
    ORDER BY i.is_featured DESC, i.position ASC, i.created_at DESC
    LIMIT 60
  ) t
$$;