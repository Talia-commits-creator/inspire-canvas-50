CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled');

CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE RESTRICT,
  payer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  payee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_payment_id text,
  amount_minor bigint NOT NULL,
  currency text NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_transactions_amount_nonnegative CHECK (amount_minor >= 0),
  CONSTRAINT payment_transactions_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT payment_transactions_provider_length CHECK (char_length(btrim(provider)) BETWEEN 1 AND 40),
  CONSTRAINT payment_transactions_provider_payment_id_length CHECK (
    provider_payment_id IS NULL OR char_length(btrim(provider_payment_id)) BETWEEN 1 AND 255
  )
);

GRANT SELECT ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payment_transactions TO service_role;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX payment_transactions_payer_idx
  ON public.payment_transactions (payer_id, created_at DESC);
CREATE INDEX payment_transactions_payee_idx
  ON public.payment_transactions (payee_id, created_at DESC);
CREATE INDEX payment_transactions_status_idx
  ON public.payment_transactions (status, created_at DESC);
CREATE UNIQUE INDEX payment_transactions_provider_payment_idx
  ON public.payment_transactions (provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE POLICY "Payment participants can view their transactions"
  ON public.payment_transactions FOR SELECT TO authenticated
  USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE OR REPLACE FUNCTION public.enforce_payment_booking_parties()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_row public.bookings;
BEGIN
  SELECT * INTO booking_row
  FROM public.bookings
  WHERE id = NEW.booking_id;

  IF booking_row.id IS NULL
     OR booking_row.status <> 'accepted'::booking_status
     OR NEW.payer_id <> booking_row.requester_id
     OR NEW.payee_id <> booking_row.creator_id THEN
    RAISE EXCEPTION 'invalid_payment_booking' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_transactions_enforce_booking_parties
  BEFORE INSERT OR UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_booking_parties();

CREATE TRIGGER payment_transactions_set_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();