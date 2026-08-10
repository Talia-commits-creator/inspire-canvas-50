-- ENUMS
CREATE TYPE public.creator_availability AS ENUM ('available', 'limited', 'unavailable');
CREATE TYPE public.creator_experience AS ENUM ('beginner', 'intermediate', 'experienced', 'professional');
CREATE TYPE public.creator_visibility AS ENUM ('public', 'private');

-- CATEGORIES
CREATE TABLE public.creative_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.creative_categories TO anon, authenticated;
GRANT ALL ON public.creative_categories TO service_role;
ALTER TABLE public.creative_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active categories are readable by everyone"
  ON public.creative_categories FOR SELECT TO anon, authenticated USING (is_active);

-- SKILLS
CREATE TABLE public.creative_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.creative_skills TO anon, authenticated;
GRANT ALL ON public.creative_skills TO service_role;
ALTER TABLE public.creative_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active skills are readable by everyone"
  ON public.creative_skills FOR SELECT TO anon, authenticated USING (is_active);

-- CREATOR PROFILES
CREATE TABLE public.creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_name text,
  headline text NOT NULL,
  about text,
  primary_category_id uuid REFERENCES public.creative_categories(id) ON DELETE SET NULL,
  location text,
  availability public.creator_availability NOT NULL DEFAULT 'available',
  experience_level public.creator_experience NOT NULL DEFAULT 'beginner',
  years_experience smallint,
  website text,
  links jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility public.creator_visibility NOT NULL DEFAULT 'private',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_headline_length CHECK (char_length(headline) BETWEEN 3 AND 90),
  CONSTRAINT creator_about_length CHECK (about IS NULL OR char_length(about) <= 1200),
  CONSTRAINT creator_name_length CHECK (creator_name IS NULL OR char_length(creator_name) <= 80),
  CONSTRAINT creator_location_length CHECK (location IS NULL OR char_length(location) <= 100),
  CONSTRAINT creator_website_length CHECK (website IS NULL OR char_length(website) <= 200),
  CONSTRAINT creator_years_range CHECK (years_experience IS NULL OR (years_experience >= 0 AND years_experience <= 70))
);
CREATE INDEX creator_profiles_visibility_idx ON public.creator_profiles (visibility);
CREATE INDEX creator_profiles_primary_category_idx ON public.creator_profiles (primary_category_id);
CREATE INDEX creator_profiles_availability_idx ON public.creator_profiles (availability);
CREATE INDEX creator_profiles_experience_idx ON public.creator_profiles (experience_level);

GRANT SELECT, INSERT, UPDATE ON public.creator_profiles TO authenticated;
GRANT SELECT ON public.creator_profiles TO anon;
GRANT ALL ON public.creator_profiles TO service_role;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own creator profile"
  ON public.creator_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public creator profiles are viewable by everyone"
  ON public.creator_profiles FOR SELECT TO anon, authenticated USING (visibility = 'public');
CREATE POLICY "Creators can create their own creator profile"
  ON public.creator_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Creators can update their own creator profile"
  ON public.creator_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER creator_profiles_set_updated_at
  BEFORE UPDATE ON public.creator_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ADDITIONAL CATEGORIES
CREATE TABLE public.creator_profile_categories (
  creator_profile_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.creative_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (creator_profile_id, category_id)
);
CREATE INDEX creator_profile_categories_category_idx ON public.creator_profile_categories (category_id);
GRANT SELECT, INSERT, DELETE ON public.creator_profile_categories TO authenticated;
GRANT SELECT ON public.creator_profile_categories TO anon;
GRANT ALL ON public.creator_profile_categories TO service_role;
ALTER TABLE public.creator_profile_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their creator categories"
  ON public.creator_profile_categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.creator_profiles p WHERE p.id = creator_profile_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.creator_profiles p WHERE p.id = creator_profile_id AND p.user_id = auth.uid()));
CREATE POLICY "Public creator categories are viewable by everyone"
  ON public.creator_profile_categories FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.creator_profiles p WHERE p.id = creator_profile_id AND p.visibility = 'public'));

-- SKILLS LINK
CREATE TABLE public.creator_profile_skills (
  creator_profile_id uuid NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.creative_skills(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (creator_profile_id, skill_id)
);
CREATE INDEX creator_profile_skills_skill_idx ON public.creator_profile_skills (skill_id);
GRANT SELECT, INSERT, DELETE ON public.creator_profile_skills TO authenticated;
GRANT SELECT ON public.creator_profile_skills TO anon;
GRANT ALL ON public.creator_profile_skills TO service_role;
ALTER TABLE public.creator_profile_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their creator skills"
  ON public.creator_profile_skills FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.creator_profiles p WHERE p.id = creator_profile_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.creator_profiles p WHERE p.id = creator_profile_id AND p.user_id = auth.uid()));
CREATE POLICY "Public creator skills are viewable by everyone"
  ON public.creator_profile_skills FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.creator_profiles p WHERE p.id = creator_profile_id AND p.visibility = 'public'));

-- SELF-SERVICE CREATOR ROLE (never admin)
CREATE POLICY "Users can claim the creator or client role"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role IN ('creator', 'client'));

-- PUBLIC LOOKUP
CREATE OR REPLACE FUNCTION public.get_public_creator_profile(_username text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'username', p.username,
    'display_name', p.display_name,
    'avatar_path', p.avatar_url,
    'profile_location', p.location,
    'profile_website', p.website,
    'profile_bio', p.bio,
    'creator', jsonb_build_object(
      'id', c.id,
      'creator_name', c.creator_name,
      'headline', c.headline,
      'about', c.about,
      'location', c.location,
      'availability', c.availability,
      'experience_level', c.experience_level,
      'years_experience', c.years_experience,
      'website', c.website,
      'links', c.links,
      'created_at', c.created_at,
      'primary_category', (
        SELECT jsonb_build_object('slug', pc.slug, 'name', pc.name)
        FROM public.creative_categories pc WHERE pc.id = c.primary_category_id
      ),
      'categories', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('slug', cc.slug, 'name', cc.name) ORDER BY cc.sort_order)
        FROM public.creator_profile_categories cpc
        JOIN public.creative_categories cc ON cc.id = cpc.category_id
        WHERE cpc.creator_profile_id = c.id
      ), '[]'::jsonb),
      'skills', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('slug', cs.slug, 'name', cs.name) ORDER BY cs.name)
        FROM public.creator_profile_skills cps
        JOIN public.creative_skills cs ON cs.id = cps.skill_id
        WHERE cps.creator_profile_id = c.id
      ), '[]'::jsonb)
    )
  )
  FROM public.profiles p
  JOIN public.creator_profiles c ON c.user_id = p.id
  WHERE lower(p.username) = lower(trim(_username))
    AND c.visibility = 'public'
  LIMIT 1
$$;

-- LIST PUBLIC CREATORS (foundation for future discovery)
CREATE OR REPLACE FUNCTION public.list_public_creators(_limit integer DEFAULT 24)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.created_at DESC), '[]'::jsonb)
  FROM (
    SELECT p.username, p.display_name, p.avatar_url AS avatar_path,
           c.creator_name, c.headline, c.location, c.availability,
           c.experience_level, c.created_at,
           (SELECT cc.name FROM public.creative_categories cc WHERE cc.id = c.primary_category_id) AS primary_category
    FROM public.creator_profiles c
    JOIN public.profiles p ON p.id = c.user_id
    WHERE c.visibility = 'public'
    ORDER BY c.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(_limit, 24), 1), 60)
  ) t
$$;

-- SEED CATEGORIES
INSERT INTO public.creative_categories (slug, name, sort_order) VALUES
  ('dj','DJ',10),('mc','MC',20),('musician','Musician',30),('singer','Singer',40),
  ('producer','Producer',50),('podcaster','Podcaster',60),('photographer','Photographer',70),
  ('videographer','Videographer',80),('video-editor','Video Editor',90),
  ('graphic-designer','Graphic Designer',100),('writer','Writer',110),
  ('content-creator','Content Creator',120),('event-organizer','Event Organizer',130),
  ('actor','Actor',140),('dancer','Dancer',150),('other','Other',999);

-- SEED SKILLS
INSERT INTO public.creative_skills (slug, name) VALUES
  ('event-hosting','Event hosting'),('portrait-photography','Portrait photography'),
  ('wedding-photography','Wedding photography'),('audio-production','Audio production'),
  ('video-editing','Video editing'),('social-media-content','Social media content'),
  ('podcast-production','Podcast production'),('live-performance','Live performance'),
  ('music-mixing','Music mixing'),('songwriting','Songwriting'),
  ('brand-identity','Brand identity'),('copywriting','Copywriting'),
  ('motion-graphics','Motion graphics'),('studio-recording','Studio recording'),
  ('lighting-design','Lighting design'),('stage-performance','Stage performance'),
  ('interviewing','Interviewing'),('choreography','Choreography'),
  ('colour-grading','Colour grading'),('event-photography','Event photography');
