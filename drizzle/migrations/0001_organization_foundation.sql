CREATE TYPE public.organization_visibility AS ENUM ('public', 'private');

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_path text,
  short_description text NOT NULL DEFAULT '',
  description text,
  organization_type text NOT NULL,
  location text,
  website text,
  links jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility public.organization_visibility NOT NULL DEFAULT 'private',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organizations_name_length CHECK (char_length(name) BETWEEN 2 AND 120),
  CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT organizations_slug_length CHECK (char_length(slug) BETWEEN 2 AND 60),
  CONSTRAINT organizations_short_description_length CHECK (char_length(short_description) <= 180),
  CONSTRAINT organizations_description_length CHECK (description IS NULL OR char_length(description) <= 5000),
  CONSTRAINT organizations_type_length CHECK (char_length(organization_type) BETWEEN 2 AND 80),
  CONSTRAINT organizations_location_length CHECK (location IS NULL OR char_length(location) <= 120),
  CONSTRAINT organizations_website_length CHECK (website IS NULL OR char_length(website) <= 200)
);

CREATE INDEX organizations_visibility_idx ON public.organizations (visibility);
CREATE INDEX organizations_owner_idx ON public.organizations (owner_id);
CREATE INDEX organizations_slug_idx ON public.organizations (slug);
CREATE INDEX organizations_type_idx ON public.organizations (organization_type);

GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT ON public.organizations TO anon;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public organizations are viewable by everyone"
  ON public.organizations FOR SELECT TO anon, authenticated USING (visibility = 'public');

CREATE POLICY "Owners can view their own organization"
  ON public.organizations FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create their own organization"
  ON public.organizations FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own organization"
  ON public.organizations FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_public_organization(_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'id', o.id,
    'owner_id', o.owner_id,
    'name', o.name,
    'slug', o.slug,
    'logo_path', o.logo_path,
    'short_description', o.short_description,
    'description', o.description,
    'organization_type', o.organization_type,
    'location', o.location,
    'website', o.website,
    'links', coalesce(o.links, '{}'::jsonb),
    'visibility', o.visibility,
    'created_at', o.created_at,
    'updated_at', o.updated_at
  )
  FROM public.organizations o
  WHERE lower(o.slug) = lower(trim(_slug))
    AND o.visibility = 'public'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.list_public_organizations(_limit integer DEFAULT 24)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.created_at DESC), '[]'::jsonb)
  FROM (
    SELECT o.id,
           o.slug,
           o.name,
           o.logo_path,
           o.short_description,
           o.organization_type,
           o.location,
           o.visibility,
           o.created_at
    FROM public.organizations o
    WHERE o.visibility = 'public'
    ORDER BY o.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(_limit, 24), 1), 60)
  ) t
$$;

CREATE POLICY "Users can read organization logos in their own folder"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'organization_logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload organization logos to their own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'organization_logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update organization logos in their own folder"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'organization_logos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'organization_logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete organization logos from their own folder"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'organization_logos' AND (storage.foldername(name))[1] = auth.uid()::text);