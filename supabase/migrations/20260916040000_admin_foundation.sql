CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin_access_required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN jsonb_build_object(
    'public_creators', (SELECT count(*) FROM public.creator_profiles WHERE visibility = 'public'::creator_visibility),
    'public_organizations', (SELECT count(*) FROM public.organizations WHERE visibility = 'public'::organization_visibility),
    'public_services', (SELECT count(*) FROM public.services WHERE visibility = 'public'::creator_visibility),
    'published_community_posts', (SELECT count(*) FROM public.community_posts WHERE status = 'published'::community_post_status AND visibility = 'public'::community_post_visibility),
    'pending_bookings', (SELECT count(*) FROM public.bookings WHERE status = 'pending'::booking_status),
    'active_collaborations', (SELECT count(*) FROM public.collaborations WHERE status = 'active'::collaboration_status)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_overview() TO authenticated;