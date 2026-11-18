CREATE TYPE public.collaboration_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE public.collaboration_participant_role AS ENUM ('owner', 'creator', 'client', 'organization');

CREATE TABLE public.collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_booking_id uuid UNIQUE REFERENCES public.bookings(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  status public.collaboration_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collaborations_title_length CHECK (char_length(btrim(title)) BETWEEN 3 AND 120),
  CONSTRAINT collaborations_description_length CHECK (
    description IS NULL OR char_length(description) <= 2000
  )
);

CREATE TABLE public.collaboration_participants (
  collaboration_id uuid NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.collaboration_participant_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collaboration_id, user_id)
);

GRANT SELECT, INSERT, UPDATE ON public.collaborations TO authenticated;
GRANT SELECT, INSERT ON public.collaboration_participants TO authenticated;
GRANT ALL ON public.collaborations TO service_role;
GRANT ALL ON public.collaboration_participants TO service_role;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_participants ENABLE ROW LEVEL SECURITY;

CREATE INDEX collaborations_owner_idx ON public.collaborations (owner_id, created_at DESC);
CREATE INDEX collaborations_status_idx ON public.collaborations (status, created_at DESC);
CREATE INDEX collaborations_source_booking_idx ON public.collaborations (source_booking_id);
CREATE INDEX collaboration_participants_user_idx
  ON public.collaboration_participants (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.is_collaboration_participant(_collaboration_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.collaborations c
    WHERE c.id = _collaboration_id
      AND c.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.collaboration_participants cp
    WHERE cp.collaboration_id = _collaboration_id
      AND cp.user_id = auth.uid()
  )
$$;

REVOKE ALL ON FUNCTION public.is_collaboration_participant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_collaboration_participant(uuid) TO authenticated;

CREATE POLICY "Participants can view their collaborations"
  ON public.collaborations FOR SELECT TO authenticated
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1
      FROM public.collaboration_participants cp
      WHERE cp.collaboration_id = collaborations.id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own collaborations"
  ON public.collaborations FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      organization_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.organizations o
        WHERE o.id = collaborations.organization_id
          AND o.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owners can update their collaborations"
  ON public.collaborations FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can add collaboration participants"
  ON public.collaboration_participants FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.collaborations c
      WHERE c.id = collaboration_id
        AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view collaboration participants"
  ON public.collaboration_participants FOR SELECT TO authenticated
  USING (public.is_collaboration_participant(collaboration_id));

CREATE OR REPLACE FUNCTION public.enforce_collaboration_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id <> OLD.owner_id
     OR NEW.source_booking_id IS DISTINCT FROM OLD.source_booking_id THEN
    RAISE EXCEPTION 'collaboration_identity_is_immutable' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status = 'draft'::collaboration_status
     AND NEW.status NOT IN ('draft'::collaboration_status, 'active'::collaboration_status, 'cancelled'::collaboration_status) THEN
    RAISE EXCEPTION 'invalid_collaboration_status_transition' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status = 'active'::collaboration_status
     AND NEW.status NOT IN ('active'::collaboration_status, 'completed'::collaboration_status, 'cancelled'::collaboration_status) THEN
    RAISE EXCEPTION 'invalid_collaboration_status_transition' USING ERRCODE = 'check_violation';
  END IF;
  IF OLD.status IN ('completed'::collaboration_status, 'cancelled'::collaboration_status)
     AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'invalid_collaboration_status_transition' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER collaborations_enforce_status_transition
  BEFORE UPDATE ON public.collaborations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_collaboration_status_transition();

CREATE TRIGGER collaborations_set_updated_at
  BEFORE UPDATE ON public.collaborations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.create_collaboration_from_booking(
  _booking_id uuid,
  _title text,
  _description text DEFAULT NULL
)
RETURNS public.collaborations
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  booking_row public.bookings;
  collaboration_row public.collaborations;
  owner_role public.collaboration_participant_role;
  other_user_id uuid;
  other_role public.collaboration_participant_role;
BEGIN
  SELECT * INTO booking_row
  FROM public.bookings
  WHERE id = _booking_id
    AND status = 'accepted'::booking_status
    AND (requester_id = auth.uid() OR creator_id = auth.uid());

  IF booking_row.id IS NULL THEN
    RAISE EXCEPTION 'collaboration_requires_accepted_booking' USING ERRCODE = 'check_violation';
  END IF;

  IF auth.uid() = booking_row.requester_id THEN
    owner_role := 'owner'::collaboration_participant_role;
    other_user_id := booking_row.creator_id;
    other_role := 'creator'::collaboration_participant_role;
  ELSE
    owner_role := 'owner'::collaboration_participant_role;
    other_user_id := booking_row.requester_id;
    other_role := 'client'::collaboration_participant_role;
  END IF;

  INSERT INTO public.collaborations (owner_id, source_booking_id, title, description, status)
  VALUES (auth.uid(), booking_row.id, btrim(_title), NULLIF(btrim(_description), ''), 'active')
  RETURNING * INTO collaboration_row;

  INSERT INTO public.collaboration_participants (collaboration_id, user_id, role)
  VALUES
    (collaboration_row.id, auth.uid(), owner_role),
    (collaboration_row.id, other_user_id, other_role);

  RETURN collaboration_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_collaboration_from_booking(uuid, text, text) TO authenticated;