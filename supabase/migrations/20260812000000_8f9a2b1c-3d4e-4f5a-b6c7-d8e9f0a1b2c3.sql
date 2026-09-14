CREATE TYPE public.service_pricing_type AS ENUM ('fixed', 'starting_from', 'contact');

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_profile_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.creative_categories(id) ON DELETE RESTRICT,
  pricing_type public.service_pricing_type NOT NULL,
  price numeric,
  currency text NOT NULL DEFAULT 'EUR',
  turnaround_days integer,
  visibility public.creator_visibility NOT NULL DEFAULT 'public',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT services_title_len CHECK (char_length(btrim(title)) BETWEEN 3 AND 100),
  CONSTRAINT services_description_len CHECK (char_length(btrim(description)) BETWEEN 1 AND 1200),
  CONSTRAINT services_price_rules CHECK (
    (pricing_type IN ('fixed', 'starting_from') AND price IS NOT NULL AND price >= 0) OR
    (pricing_type = 'contact' AND price IS NULL)
  ),
  CONSTRAINT services_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT services_turnaround_range CHECK (turnaround_days IS NULL OR (turnaround_days >= 1 AND turnaround_days <= 365))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT ON public.services TO anon;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE INDEX services_creator_idx ON public.services (creator_profile_id, position, created_at DESC);
CREATE INDEX services_public_idx ON public.services (visibility, position);
CREATE INDEX services_category_idx ON public.services (category_id);

CREATE POLICY "Creators manage their own services"
  ON public.services FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.creator_profiles p
      WHERE p.id = creator_profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Public services are viewable by everyone"
  ON public.services FOR SELECT TO anon, authenticated
  USING (
    visibility = 'public'
    AND EXISTS (
      SELECT 1 FROM public.creator_profiles p
      WHERE p.id = creator_profile_id AND p.visibility = 'public'
    )
  );

CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_public_services(_username text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.position ASC, t.created_at DESC), '[]'::jsonb)
  FROM (
    SELECT s.id, s.title, s.description, s.pricing_type, s.price, s.currency,
           s.turnaround_days, s.position, s.created_at,
           (SELECT jsonb_build_object('id', cc.id, 'slug', cc.slug, 'name', cc.name)
              FROM public.creative_categories cc WHERE cc.id = s.category_id) AS category
    FROM public.services s
    JOIN public.creator_profiles c ON c.id = s.creator_profile_id
    JOIN public.profiles p ON p.id = c.user_id
    WHERE lower(p.username) = lower(btrim(_username))
      AND c.visibility = 'public'
      AND s.visibility = 'public'
    ORDER BY s.position ASC, s.created_at DESC
    LIMIT 60
  ) t
$$;

GRANT EXECUTE ON FUNCTION public.get_public_services(text) TO anon, authenticated, service_role;
