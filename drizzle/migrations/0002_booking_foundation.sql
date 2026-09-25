CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_message_length CHECK (char_length(btrim(message)) BETWEEN 1 AND 2000),
  CONSTRAINT bookings_different_users CHECK (requester_id <> creator_id)
);

GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX bookings_requester_idx ON public.bookings (requester_id, created_at DESC);
CREATE INDEX bookings_creator_status_idx ON public.bookings (creator_id, status, created_at DESC);
CREATE INDEX bookings_service_idx ON public.bookings (service_id, created_at DESC);

CREATE POLICY "Requesters can view their own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = requester_id);

CREATE POLICY "Creators can view bookings for their services"
  ON public.bookings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.services s
      WHERE s.id = bookings.service_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can request public services"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = requester_id
    AND requester_id <> creator_id
    AND EXISTS (
      SELECT 1
      FROM public.services s
      JOIN public.creator_profiles cp ON cp.id = s.creator_profile_id
      WHERE s.id = bookings.service_id
        AND s.user_id = bookings.creator_id
        AND s.visibility = 'public'::creator_visibility
        AND cp.visibility = 'public'::creator_visibility
    )
  );

CREATE POLICY "Creators can decide their booking requests"
  ON public.bookings FOR UPDATE TO authenticated
  USING (
    auth.uid() = creator_id
    AND status = 'pending'::booking_status
  )
  WITH CHECK (
    auth.uid() = creator_id
    AND status IN ('accepted'::booking_status, 'rejected'::booking_status)
  );

CREATE OR REPLACE FUNCTION public.create_booking(_service_id uuid, _message text)
RETURNS public.bookings
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  INSERT INTO public.bookings (requester_id, creator_id, service_id, message)
  SELECT auth.uid(), s.user_id, s.id, btrim(_message)
  FROM public.services s
  JOIN public.creator_profiles cp ON cp.id = s.creator_profile_id
  WHERE s.id = _service_id
    AND s.visibility = 'public'::creator_visibility
    AND cp.visibility = 'public'::creator_visibility
  RETURNING *
$$;

GRANT EXECUTE ON FUNCTION public.create_booking(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_booking_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.requester_id <> OLD.requester_id
     OR NEW.creator_id <> OLD.creator_id
     OR NEW.service_id <> OLD.service_id
     OR NEW.message <> OLD.message
     OR OLD.status <> 'pending'::booking_status
     OR NEW.status NOT IN ('accepted'::booking_status, 'rejected'::booking_status) THEN
    RAISE EXCEPTION 'invalid_booking_update' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_enforce_status_transition
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_status_transition();

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();