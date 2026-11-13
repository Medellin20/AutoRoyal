-- Detailed fixed-price accident vehicle listing fields for Laurent Crash Autos.
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "vehicleType" text NOT NULL DEFAULT 'VOITURE'
    CHECK ("vehicleType" IN ('VOITURE', 'UTILITAIRE', 'MOTO', 'CAMION', 'AUTRE')),
  ADD COLUMN IF NOT EXISTS engine text NOT NULL DEFAULT 'À préciser',
  ADD COLUMN IF NOT EXISTS displacement integer NOT NULL DEFAULT 0 CHECK (displacement BETWEEN 0 AND 20000),
  ADD COLUMN IF NOT EXISTS drivetrain text NOT NULL DEFAULT 'AUTRE'
    CHECK (drivetrain IN ('TRACTION', 'PROPULSION', 'INTEGRALE', 'AUTRE')),
  ADD COLUMN IF NOT EXISTS "bodyCondition" text NOT NULL DEFAULT 'A_VERIFIER'
    CHECK ("bodyCondition" IN ('BON', 'MOYEN', 'ENDOMMAGE', 'A_VERIFIER')),
  ADD COLUMN IF NOT EXISTS "damageDescription" text NOT NULL DEFAULT 'Dommages à préciser.',
  ADD COLUMN IF NOT EXISTS "titleStatus" text NOT NULL DEFAULT 'A_VERIFIER'
    CHECK ("titleStatus" IN ('A_VERIFIER', 'CLAIR', 'ACCIDENTE', 'MANQUANT')),
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT 'À préciser',
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'France',
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR'
    CHECK (currency IN ('EUR', 'USD', 'GBP', 'XOF')),
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 0 AND 1000),
  ADD COLUMN IF NOT EXISTS "keysCount" integer NOT NULL DEFAULT 1 CHECK ("keysCount" BETWEEN 0 AND 20),
  ADD COLUMN IF NOT EXISTS "internationalSale" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "videoUrl" text;

UPDATE public.vehicles
SET title = concat_ws(' ', brand, model, nullif(version, ''), year::text)
WHERE title = '';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_video_url_https_check') THEN
    ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_video_url_https_check
      CHECK ("videoUrl" IS NULL OR "videoUrl" ~ '^https://');
  END IF;
END $$;

-- Keep stock counts accurate when orders are created, confirmed, or cancelled.
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
