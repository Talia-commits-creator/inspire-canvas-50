-- 1. Reserved usernames
CREATE TABLE IF NOT EXISTS public.reserved_usernames (
  name text PRIMARY KEY
);
GRANT SELECT ON public.reserved_usernames TO authenticated;
GRANT ALL ON public.reserved_usernames TO service_role;
ALTER TABLE public.reserved_usernames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reserved usernames are readable by authenticated users"
  ON public.reserved_usernames FOR SELECT TO authenticated USING (true);

INSERT INTO public.reserved_usernames(name) VALUES
  ('admin'),('administrator'),('dashboard'),('login'),('logout'),('register'),
  ('settings'),('api'),('styleguide'),('creators'),('creator'),('organizations'),
  ('organization'),('projects'),('project'),('community'),('discover'),('about'),
  ('contact'),('profile'),('profiles'),('user'),('users'),('account'),('accounts'),
  ('auth'),('signin'),('signup'),('sitemap'),('robots'),('static'),('assets'),
  ('support'),('help'),('inspiretoaspire'),('root'),('system'),('null'),('undefined'),
  ('forgot-password'),('reset-password'),('home'),('search'),('explore')
ON CONFLICT DO NOTHING;

-- 2. Profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS website text;

-- 3. Username generator
CREATE OR REPLACE FUNCTION public.generate_username(_seed text)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  i int := 0;
BEGIN
  base := lower(regexp_replace(coalesce(_seed, ''), '[^a-zA-Z0-9_-]', '', 'g'));
  IF length(base) < 3 THEN
    base := 'user' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  END IF;
  base := substr(base, 1, 24);
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate)
     OR EXISTS (SELECT 1 FROM public.reserved_usernames WHERE name = candidate) LOOP
    i := i + 1;
    candidate := substr(base, 1, 24) || i::text;
  END LOOP;
  RETURN candidate;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.generate_username(text) FROM public, anon, authenticated;

-- 4. Backfill usernames
UPDATE public.profiles p
SET username = public.generate_username(coalesce(p.display_name, 'user'))
WHERE p.username IS NULL;

-- 5. Constraints + index
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_format
    CHECK (username ~ '^[a-z0-9](?:[a-z0-9_-]{1,28})[a-z0-9]$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_display_name_length
    CHECK (display_name IS NULL OR char_length(display_name) BETWEEN 2 AND 60);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_length
    CHECK (bio IS NULL OR char_length(bio) <= 500);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_location_length
    CHECK (location IS NULL OR char_length(location) <= 100);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_website_format
    CHECK (website IS NULL OR (char_length(website) <= 200 AND website ~* '^https?://[^\s/$.?#].[^\s]*$'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (lower(username));

-- 6. Normalize + guard trigger
CREATE OR REPLACE FUNCTION public.normalize_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.username := lower(trim(NEW.username));
  NEW.display_name := NULLIF(trim(coalesce(NEW.display_name, '')), '');
  NEW.bio := NULLIF(trim(coalesce(NEW.bio, '')), '');
  NEW.location := NULLIF(trim(coalesce(NEW.location, '')), '');
  NEW.website := NULLIF(trim(coalesce(NEW.website, '')), '');
  IF EXISTS (SELECT 1 FROM public.reserved_usernames r WHERE r.name = NEW.username) THEN
    RAISE EXCEPTION 'reserved_username' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_normalize ON public.profiles;
CREATE TRIGGER profiles_normalize
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_profile();

-- 7. Auto-create profile on signup with username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seed text;
BEGIN
  seed := coalesce(
    NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''),
    split_part(coalesce(NEW.email, 'user'), '@', 1)
  );
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''),
    public.generate_username(seed)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

-- 8. Public profile lookup (only public fields; never email)
CREATE OR REPLACE FUNCTION public.get_public_profile(_username text)
RETURNS TABLE (
  username text,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  website text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.username, p.display_name, p.avatar_url, p.bio, p.location, p.website, p.created_at
  FROM public.profiles p
  WHERE lower(p.username) = lower(trim(_username))
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;

-- 9. Username availability check (no data leaked)
CREATE OR REPLACE FUNCTION public.is_username_available(_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles p WHERE lower(p.username) = lower(trim(_username)))
     AND NOT EXISTS (SELECT 1 FROM public.reserved_usernames r WHERE r.name = lower(trim(_username)))
$$;
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO authenticated;
