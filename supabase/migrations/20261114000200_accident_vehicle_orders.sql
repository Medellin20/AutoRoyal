-- AutoRoyal: accident-vehicle sales and guest order flow.
-- Orders are private and all mutations run through the server service-role client.

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS "damageLevel" text NOT NULL DEFAULT 'A_DEFINIR'
    CHECK ("damageLevel" IN ('LEGER', 'MODERE', 'IMPORTANT', 'NON_ROULANT', 'A_DEFINIR')),
  ADD COLUMN IF NOT EXISTS "damageTypes" text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "runningCondition" text NOT NULL DEFAULT 'A_VERIFIER'
    CHECK ("runningCondition" IN ('ROULANT', 'DEMARRE', 'NON_ROULANT', 'A_VERIFIER'));

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS "paymentMethod" text NOT NULL DEFAULT 'BANK_TRANSFER'
    CHECK ("paymentMethod" IN ('BANK_TRANSFER', 'PAYMENT_LINK')),
  ADD COLUMN IF NOT EXISTS "bankAccountHolder" text,
  ADD COLUMN IF NOT EXISTS "bankName" text,
  ADD COLUMN IF NOT EXISTS iban text,
  ADD COLUMN IF NOT EXISTS bic text,
  ADD COLUMN IF NOT EXISTS "paymentLinkUrl" text CHECK ("paymentLinkUrl" IS NULL OR "paymentLinkUrl" ~ '^https://');

CREATE TABLE public.sales_orders (
  id text PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  "customerId" text NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  "vehicleId" text NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  "guestAccessToken" text NOT NULL UNIQUE,
  "vehicleSnapshot" jsonb NOT NULL,
  "paymentInstructions" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "totalAmount" numeric(12,2) NOT NULL CHECK ("totalAmount" >= 0),
  status text NOT NULL DEFAULT 'PENDING_PAYMENT'
    CHECK (status IN ('PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'CANCELLED')),
  "paymentStatus" text NOT NULL DEFAULT 'PENDING'
    CHECK ("paymentStatus" IN ('PENDING', 'CONFIRMED', 'REJECTED')),
  "paymentReference" text,
  "internalNote" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sales_orders_status_created_idx ON public.sales_orders(status, "createdAt" DESC);
CREATE INDEX sales_orders_customer_idx ON public.sales_orders("customerId");
CREATE INDEX sales_orders_vehicle_idx ON public.sales_orders("vehicleId");
CREATE TRIGGER sales_orders_set_updated_at BEFORE UPDATE ON public.sales_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sales_order_notifications (
  id text PRIMARY KEY,
  "orderId" text NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'NOT_CONFIGURED')),
  detail text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sales_order_notifications_order_idx
  ON public.sales_order_notifications("orderId", "createdAt" DESC);

ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_notifications ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.sales_orders, public.sales_order_notifications TO service_role;
REVOKE ALL ON public.sales_orders, public.sales_order_notifications FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_sales_order(
  p_order_id text,
  p_reference text,
  p_customer_id text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_vehicle_id text,
  p_access_token text,
  p_payment_instructions jsonb,
  p_alert_recipient text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_vehicle public.vehicles%ROWTYPE;
  v_customer_id text;
  v_order public.sales_orders%ROWTYPE;
BEGIN
  IF char_length(trim(p_full_name)) NOT BETWEEN 3 AND 120
    OR trim(p_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR char_length(trim(p_phone)) NOT BETWEEN 7 AND 30 THEN
    RAISE EXCEPTION 'Coordonnées client invalides.';
  END IF;

  SELECT * INTO v_vehicle FROM public.vehicles
  WHERE id = p_vehicle_id FOR UPDATE;
  IF NOT FOUND OR NOT v_vehicle.published OR v_vehicle.status <> 'AVAILABLE'
    OR v_vehicle."offerType" = 'RENT' OR v_vehicle."salePrice" IS NULL OR v_vehicle.quantity <= 0 THEN
    RAISE EXCEPTION 'Ce véhicule n’est plus disponible à la vente.';
  END IF;

  INSERT INTO public.customers (id, "fullName", email, phone)
  VALUES (p_customer_id, trim(p_full_name), lower(trim(p_email)), trim(p_phone))
  ON CONFLICT (email, phone) DO UPDATE
    SET "fullName" = EXCLUDED."fullName", "updatedAt" = now()
  RETURNING id INTO v_customer_id;

  INSERT INTO public.sales_orders (
    id, reference, "customerId", "vehicleId", "guestAccessToken", "vehicleSnapshot", "paymentInstructions", "totalAmount"
  ) VALUES (
    p_order_id, p_reference, v_customer_id, v_vehicle.id, p_access_token,
    jsonb_build_object('title', v_vehicle.title, 'brand', v_vehicle.brand, 'model', v_vehicle.model,
      'version', v_vehicle.version, 'year', v_vehicle.year, 'reference', v_vehicle.reference,
      'salePrice', v_vehicle."salePrice", 'currency', v_vehicle.currency, 'damageLevel', v_vehicle."damageLevel",
      'damageTypes', v_vehicle."damageTypes"), coalesce(p_payment_instructions, '{}'::jsonb), v_vehicle."salePrice"
  ) RETURNING * INTO v_order;

  UPDATE public.vehicles SET quantity = quantity - 1,
    status = CASE WHEN quantity - 1 <= 0 THEN 'RESERVED' ELSE 'AVAILABLE' END
  WHERE id = v_vehicle.id;
  INSERT INTO public.sales_order_notifications (id, "orderId", recipient, status)
  VALUES (p_order_id || '-alert', v_order.id, coalesce(nullif(trim(p_alert_recipient), ''), 'non-configure'),
    CASE WHEN coalesce(nullif(trim(p_alert_recipient), ''), '') = '' THEN 'NOT_CONFIGURED' ELSE 'PENDING' END);
  RETURN to_jsonb(v_order);
END;
$$;
REVOKE ALL ON FUNCTION public.create_sales_order(text,text,text,text,text,text,text,text,jsonb,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_sales_order(text,text,text,text,text,text,text,text,jsonb,text) TO service_role;

CREATE OR REPLACE FUNCTION public.review_sales_order_payment(
  p_order_id text, p_status text, p_payment_reference text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_vehicle_id text; v_order_status text;
BEGIN
  IF p_status NOT IN ('CONFIRMED', 'REJECTED') THEN RAISE EXCEPTION 'Statut de paiement invalide.'; END IF;
  IF p_status = 'CONFIRMED' AND char_length(trim(coalesce(p_payment_reference, ''))) < 4 THEN
    RAISE EXCEPTION 'Une référence vérifiée est obligatoire pour confirmer le paiement.';
  END IF;
  SELECT "vehicleId", status INTO v_vehicle_id, v_order_status
  FROM public.sales_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order_status <> 'PENDING_PAYMENT' THEN RAISE EXCEPTION 'Commande introuvable ou déjà clôturée.'; END IF;

  UPDATE public.sales_orders SET
    "paymentStatus" = p_status,
    "paymentReference" = CASE WHEN p_status = 'CONFIRMED' THEN trim(p_payment_reference) ELSE NULL END,
    status = CASE WHEN p_status = 'CONFIRMED' THEN 'PAYMENT_CONFIRMED' ELSE status END
  WHERE id = p_order_id;

  IF p_status = 'CONFIRMED' THEN
    UPDATE public.vehicles SET status = CASE WHEN quantity > 0 THEN 'AVAILABLE' ELSE 'SOLD' END
    WHERE id = v_vehicle_id AND status IN ('RESERVED', 'AVAILABLE');
    IF NOT FOUND THEN RAISE EXCEPTION 'Le véhicule n’est plus réservé par cette commande.'; END IF;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.review_sales_order_payment(text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_sales_order_payment(text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.cancel_sales_order(p_order_id text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_vehicle_id text; v_status text; v_payment_status text;
BEGIN
  SELECT "vehicleId", status, "paymentStatus" INTO v_vehicle_id, v_status, v_payment_status
  FROM public.sales_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_status <> 'PENDING_PAYMENT' OR v_payment_status = 'CONFIRMED' THEN
    RAISE EXCEPTION 'Seule une commande sans paiement confirmé peut être annulée.';
  END IF;
  UPDATE public.sales_orders SET status = 'CANCELLED' WHERE id = p_order_id;
  UPDATE public.vehicles SET quantity = quantity + 1,
    status = CASE WHEN status = 'RESERVED' THEN 'AVAILABLE' ELSE status END
  WHERE id = v_vehicle_id AND status IN ('RESERVED', 'AVAILABLE');
END;
$$;
REVOKE ALL ON FUNCTION public.cancel_sales_order(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_sales_order(text) TO service_role;
