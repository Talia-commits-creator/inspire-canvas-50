-- Phase 16: Premium Foundation
-- Establishes provider-agnostic plans, entitlements, and subscription records with database-authoritative authorization.

CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'trialing',
  'past_due',
  'cancelled',
  'expired',
  'inactive'
);

CREATE TYPE public.plan_billing_interval AS ENUM (
  'monthly',
  'yearly',
  'one_time'
);

CREATE TYPE public.plan_target_entity AS ENUM (
  'user',
  'organization'
);

-- 1. Subscription Plans Catalog
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  target_entity public.plan_target_entity NOT NULL DEFAULT 'user',
  price_minor bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  billing_interval public.plan_billing_interval NOT NULL DEFAULT 'monthly',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_slug_format CHECK (slug ~ '^[a-z0-9_]+$'),
  CONSTRAINT subscription_plans_slug_length CHECK (char_length(slug) BETWEEN 2 AND 50),
  CONSTRAINT subscription_plans_name_length CHECK (char_length(btrim(name)) BETWEEN 2 AND 100),
  CONSTRAINT subscription_plans_description_length CHECK (char_length(btrim(description)) BETWEEN 1 AND 1000),
  CONSTRAINT subscription_plans_price_nonnegative CHECK (price_minor >= 0),
  CONSTRAINT subscription_plans_currency_format CHECK (currency ~ '^[A-Z]{3}$')
);

GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE INDEX subscription_plans_target_idx
  ON public.subscription_plans (target_entity, sort_order ASC, is_active);

CREATE POLICY "Subscription plans are viewable by everyone"
  ON public.subscription_plans FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE TRIGGER subscription_plans_set_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Plan Entitlements (Feature Flags & Limits per Plan)
CREATE TABLE public.plan_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  value_numeric integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plan_entitlements_feature_key_format CHECK (feature_key ~ '^[a-z0-9_.]+$'),
  CONSTRAINT plan_entitlements_feature_key_length CHECK (char_length(feature_key) BETWEEN 2 AND 80),
  CONSTRAINT plan_entitlements_value_numeric_nonnegative CHECK (value_numeric IS NULL OR value_numeric >= 0),
  UNIQUE (plan_id, feature_key)
);

GRANT SELECT ON public.plan_entitlements TO anon, authenticated;
GRANT ALL ON public.plan_entitlements TO service_role;
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;

CREATE INDEX plan_entitlements_plan_idx
  ON public.plan_entitlements (plan_id);
CREATE INDEX plan_entitlements_feature_key_idx
  ON public.plan_entitlements (feature_key);

CREATE POLICY "Plan entitlements are viewable by everyone"
  ON public.plan_entitlements FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Subscriptions (Account or Organization Subscriptions)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  status public.subscription_status NOT NULL DEFAULT 'inactive',
  provider text NOT NULL DEFAULT 'unconfigured',
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_provider_length CHECK (char_length(btrim(provider)) BETWEEN 1 AND 50),
  CONSTRAINT subscriptions_provider_sub_id_length CHECK (
    provider_subscription_id IS NULL OR char_length(btrim(provider_subscription_id)) BETWEEN 1 AND 255
  )
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Indexes for performance and uniqueness
CREATE INDEX subscriptions_user_idx
  ON public.subscriptions (user_id, status, created_at DESC);
CREATE INDEX subscriptions_org_idx
  ON public.subscriptions (organization_id, status, created_at DESC)
  WHERE organization_id IS NOT NULL;
CREATE INDEX subscriptions_provider_id_idx
  ON public.subscriptions (provider, provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;

-- At most one active/trialing user subscription
CREATE UNIQUE INDEX subscriptions_unique_active_user_idx
  ON public.subscriptions (user_id)
  WHERE organization_id IS NULL AND status IN ('active', 'trialing');

-- At most one active/trialing organization subscription
CREATE UNIQUE INDEX subscriptions_unique_active_org_idx
  ON public.subscriptions (organization_id)
  WHERE organization_id IS NOT NULL AND status IN ('active', 'trialing');

-- RLS: Subscribers can view their own subscriptions; organization owners can view org subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      organization_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = subscriptions.organization_id
          AND o.owner_id = auth.uid()
      )
    )
  );

CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Authoritative Verification Functions

-- Check whether a user has an active entitlement
CREATE OR REPLACE FUNCTION public.has_user_entitlement(_feature_key text, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    JOIN public.plan_entitlements pe ON pe.plan_id = s.plan_id
    WHERE s.user_id = _user_id
      AND s.organization_id IS NULL
      AND s.status IN ('active'::subscription_status, 'trialing'::subscription_status)
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
      AND pe.feature_key = _feature_key
  )
  OR EXISTS (
    -- Free tier default entitlements
    SELECT 1
    FROM public.subscription_plans sp
    JOIN public.plan_entitlements pe ON pe.plan_id = sp.id
    WHERE sp.slug = 'free'
      AND pe.feature_key = _feature_key
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_user_entitlement(text, uuid) TO anon, authenticated;

-- Check whether an organization has an active entitlement
CREATE OR REPLACE FUNCTION public.has_organization_entitlement(_organization_id uuid, _feature_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    JOIN public.plan_entitlements pe ON pe.plan_id = s.plan_id
    WHERE s.organization_id = _organization_id
      AND s.status IN ('active'::subscription_status, 'trialing'::subscription_status)
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
      AND pe.feature_key = _feature_key
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_organization_entitlement(uuid, text) TO anon, authenticated;

-- Get active user subscription with plan details
CREATE OR REPLACE FUNCTION public.get_my_active_subscription()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_row record;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT s.id, s.status, s.provider, s.current_period_start, s.current_period_end, s.cancel_at_period_end,
         sp.id as plan_id, sp.slug as plan_slug, sp.name as plan_name, sp.target_entity,
         sp.price_minor, sp.currency, sp.billing_interval
  INTO sub_row
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id = s.plan_id
  WHERE s.user_id = auth.uid()
    AND s.organization_id IS NULL
    AND s.status IN ('active'::subscription_status, 'trialing'::subscription_status)
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF sub_row.id IS NULL THEN
    -- Fallback to default free plan
    SELECT NULL as id, 'active'::subscription_status as status, 'default' as provider,
           NULL::timestamptz as current_period_start, NULL::timestamptz as current_period_end, false as cancel_at_period_end,
           sp.id as plan_id, sp.slug as plan_slug, sp.name as plan_name, sp.target_entity,
           sp.price_minor, sp.currency, sp.billing_interval
    INTO sub_row
    FROM public.subscription_plans sp
    WHERE sp.slug = 'free'
    LIMIT 1;
  END IF;

  IF sub_row.plan_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', sub_row.id,
    'status', sub_row.status,
    'provider', sub_row.provider,
    'current_period_start', sub_row.current_period_start,
    'current_period_end', sub_row.current_period_end,
    'cancel_at_period_end', sub_row.cancel_at_period_end,
    'plan', jsonb_build_object(
      'id', sub_row.plan_id,
      'slug', sub_row.plan_slug,
      'name', sub_row.plan_name,
      'target_entity', sub_row.target_entity,
      'price_minor', sub_row.price_minor,
      'currency', sub_row.currency,
      'billing_interval', sub_row.billing_interval
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_active_subscription() TO authenticated;

-- Seed default plans and entitlements
INSERT INTO public.subscription_plans (slug, name, description, target_entity, price_minor, currency, billing_interval, is_active, sort_order, features)
VALUES
  (
    'free',
    'Free Community',
    'Essential tools for emerging creators and individual community members.',
    'user',
    0,
    'EUR',
    'monthly',
    true,
    0,
    '["Public Creator & Universal Profile", "Portfolio showcase up to 6 works", "List up to 3 services", "Direct client booking requests", "Community discussions & feed"]'::jsonb
  ),
  (
    'creator_pro',
    'Creator Pro',
    'Enhanced visibility, expanded portfolio capacity, and verified presence for working professionals.',
    'user',
    1200,
    'EUR',
    'monthly',
    true,
    1,
    '["Everything in Free Community", "Verified Creator badge on profile & cards", "Expanded portfolio capacity up to 60 works", "List up to 50 active services", "Priority placement in Creator discovery", "Performance metrics & analytics foundation"]'::jsonb
  ),
  (
    'organization_pro',
    'Organization Partner',
    'Elevate your cultural institution, studio, or nonprofit with partner branding and collaboration tools.',
    'organization',
    4900,
    'EUR',
    'monthly',
    true,
    2,
    '["Dedicated Organization profile & unique slug", "Verified Organization badge", "Featured showcase in Organization directory", "Multi-creator collaboration workspace", "Priority partner community spotlight", "Direct creator outreach & booking pipeline"]'::jsonb
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_entity = EXCLUDED.target_entity,
  price_minor = EXCLUDED.price_minor,
  currency = EXCLUDED.currency,
  billing_interval = EXCLUDED.billing_interval,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  features = EXCLUDED.features,
  updated_at = now();

-- Seed entitlements for free plan
INSERT INTO public.plan_entitlements (plan_id, feature_key, value_numeric)
SELECT sp.id, f.feature_key, f.value_numeric
FROM public.subscription_plans sp
CROSS JOIN (
  VALUES
    ('portfolio.max_items', 6),
    ('services.max_items', 3),
    ('community.post', NULL::integer)
) AS f(feature_key, value_numeric)
WHERE sp.slug = 'free'
ON CONFLICT (plan_id, feature_key) DO UPDATE
SET value_numeric = EXCLUDED.value_numeric;

-- Seed entitlements for creator_pro plan
INSERT INTO public.plan_entitlements (plan_id, feature_key, value_numeric)
SELECT sp.id, f.feature_key, f.value_numeric
FROM public.subscription_plans sp
CROSS JOIN (
  VALUES
    ('portfolio.max_items', 60),
    ('services.max_items', 50),
    ('creator.verified_badge', NULL::integer),
    ('creator.featured_portfolio', NULL::integer),
    ('creator.analytics', NULL::integer),
    ('creator.priority_discovery', NULL::integer),
    ('community.post', NULL::integer)
) AS f(feature_key, value_numeric)
WHERE sp.slug = 'creator_pro'
ON CONFLICT (plan_id, feature_key) DO UPDATE
SET value_numeric = EXCLUDED.value_numeric;

-- Seed entitlements for organization_pro plan
INSERT INTO public.plan_entitlements (plan_id, feature_key, value_numeric)
SELECT sp.id, f.feature_key, f.value_numeric
FROM public.subscription_plans sp
CROSS JOIN (
  VALUES
    ('org.verified_badge', NULL::integer),
    ('org.priority_directory', NULL::integer),
    ('org.collaboration_unlimited', NULL::integer),
    ('org.partner_spotlight', NULL::integer)
) AS f(feature_key, value_numeric)
WHERE sp.slug = 'organization_pro'
ON CONFLICT (plan_id, feature_key) DO UPDATE
SET value_numeric = EXCLUDED.value_numeric;
