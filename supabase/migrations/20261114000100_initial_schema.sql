-- Schema initial Laurent Crash Autos pour Supabase/PostgREST.
-- Le site utilise NextAuth pour les comptes administrateur; aucun acces utilisateur Supabase n'est requis.

CREATE TABLE public.users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "passwordHash" text NOT NULL,
  role text NOT NULL DEFAULT 'MANAGER' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')),
  active boolean NOT NULL DEFAULT true,
  "lastLoginAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX users_role_idx ON public.users(role);

CREATE TABLE public.vehicles (
  id text PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  brand text NOT NULL,
  model text NOT NULL,
  version text,
  category text NOT NULL CHECK (category IN ('BERLINE', 'SUV', 'CITADINE', 'PICKUP', 'UTILITAIRE', 'MONOSPACE', 'COUPE', 'LUXE')),
  year integer NOT NULL,
  "offerType" text NOT NULL DEFAULT 'BOTH' CHECK ("offerType" IN ('SALE', 'RENT', 'BOTH')),
  status text NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'RENTED', 'SOLD', 'MAINTENANCE')),
  "salePrice" numeric(12,2),
  "dailyPrice" numeric(12,2),
  "weeklyPrice" numeric(12,2),
  "monthlyPrice" numeric(12,2),
  deposit numeric(12,2),
  mileage integer NOT NULL,
  fuel text NOT NULL CHECK (fuel IN ('ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE', 'GPL')),
  transmission text NOT NULL CHECK (transmission IN ('MANUELLE', 'AUTOMATIQUE')),
  color text NOT NULL,
  seats integer NOT NULL DEFAULT 5,
  doors integer NOT NULL DEFAULT 5,
  power integer NOT NULL,
  vin text,
  description text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  "rentalConditions" text,
  "requiredDocuments" text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  "publishedAt" timestamptz,
  views integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vehicles_brand_model_idx ON public.vehicles(brand, model);
CREATE INDEX vehicles_status_published_idx ON public.vehicles(status, published);
CREATE INDEX vehicles_offer_type_idx ON public.vehicles("offerType");
CREATE INDEX vehicles_featured_idx ON public.vehicles(featured);

CREATE TABLE public.vehicle_images (
  id text PRIMARY KEY,
  "vehicleId" text NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  url text NOT NULL,
  "publicId" text,
  alt text NOT NULL,
  "isMain" boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vehicle_images_vehicle_position_idx ON public.vehicle_images("vehicleId", position);

CREATE TABLE public.customers (
  id text PRIMARY KEY,
  "fullName" text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, phone)
);
CREATE INDEX customers_email_idx ON public.customers(email);

CREATE TABLE public.reservations (
  id text PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  "vehicleId" text NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  "customerId" text NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  "startDate" timestamptz NOT NULL,
  "endDate" timestamptz NOT NULL,
  "pickupPlace" text NOT NULL,
  "returnPlace" text NOT NULL,
  days integer NOT NULL,
  "totalPrice" numeric(12,2) NOT NULL,
  "extraFees" numeric(12,2) NOT NULL DEFAULT 0,
  message text,
  "internalNote" text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REFUSED', 'CANCELLED', 'ONGOING', 'COMPLETED')),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reservations_vehicle_period_idx ON public.reservations("vehicleId", "startDate", "endDate");
CREATE INDEX reservations_status_idx ON public.reservations(status);

CREATE TABLE public.purchase_requests (
  id text PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  "vehicleId" text NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  "customerId" text NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  budget numeric(12,2),
  payment text NOT NULL DEFAULT 'CASH' CHECK (payment IN ('CASH', 'VIREMENT', 'MOBILE_MONEY', 'FINANCEMENT')),
  financing boolean NOT NULL DEFAULT false,
  "tradeIn" boolean NOT NULL DEFAULT false,
  "tradeInInfo" text,
  message text,
  "internalNote" text,
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'NEGOTIATION', 'CLOSED', 'REFUSED')),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX purchase_requests_status_idx ON public.purchase_requests(status);

CREATE TABLE public.favorites (
  id text PRIMARY KEY,
  "vehicleId" text NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  "userId" text REFERENCES public.users(id) ON DELETE CASCADE,
  "sessionId" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("vehicleId", "userId"),
  UNIQUE ("vehicleId", "sessionId")
);

CREATE TABLE public.contact_messages (
  id text PRIMARY KEY,
  "fullName" text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_messages_handled_idx ON public.contact_messages(handled);

CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  "garageName" text NOT NULL DEFAULT 'Laurent Crash Autos',
  tagline text,
  phone text,
  whatsapp text,
  email text,
  address text,
  "mapUrl" text,
  facebook text,
  instagram text,
  tiktok text,
  linkedin text,
  "accentColor" text NOT NULL DEFAULT '#ED1C24',
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.site_settings (id, "garageName", address)
VALUES ('default', 'Laurent Crash Autos', 'France metropolitaine');

CREATE TABLE public.audit_logs (
  id text PRIMARY KEY,
  "userId" text REFERENCES public.users(id) ON DELETE SET NULL,
  "userEmail" text NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  "entityId" text,
  metadata jsonb,
  ip text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs("createdAt");

CREATE TABLE public.login_attempts (
  id text PRIMARY KEY,
  email text NOT NULL,
  ip text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX login_attempts_email_created_idx ON public.login_attempts(email, "createdAt");
CREATE INDEX login_attempts_ip_created_idx ON public.login_attempts(ip, "createdAt");

CREATE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER vehicles_set_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER reservations_set_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER purchase_requests_set_updated_at BEFORE UPDATE ON public.purchase_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Les requetes publiques lisent uniquement les annonces publiees; toutes les mutations passent par le serveur.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.vehicles, public.vehicle_images TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

CREATE POLICY public_read_published_vehicles ON public.vehicles
  FOR SELECT TO anon USING (published = true);
CREATE POLICY public_read_published_vehicle_images ON public.vehicle_images
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = vehicle_images."vehicleId" AND vehicles.published = true
    )
  );

CREATE FUNCTION public.increment_vehicle_views(vehicle_id text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.vehicles SET views = views + 1 WHERE id = vehicle_id;
$$;

CREATE FUNCTION public.set_main_vehicle_image(image_id text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_vehicle text;
BEGIN
  SELECT "vehicleId" INTO target_vehicle FROM public.vehicle_images WHERE id = image_id;
  IF target_vehicle IS NULL THEN RAISE EXCEPTION 'Image introuvable'; END IF;
  UPDATE public.vehicle_images SET "isMain" = false WHERE "vehicleId" = target_vehicle;
  UPDATE public.vehicle_images SET "isMain" = true, position = 0 WHERE id = image_id;
END;
$$;

CREATE FUNCTION public.reorder_vehicle_images(vehicle_id text, ordered_ids text[]) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE found_count integer;
BEGIN
  SELECT count(*) INTO found_count
  FROM public.vehicle_images
  WHERE "vehicleId" = reorder_vehicle_images.vehicle_id AND id = ANY(ordered_ids);
  IF found_count <> cardinality(ordered_ids) THEN RAISE EXCEPTION 'Liste d images invalide'; END IF;
  UPDATE public.vehicle_images AS image
  SET position = ordered.position
  FROM unnest(ordered_ids) WITH ORDINALITY AS ordered(id, position)
  WHERE image.id = ordered.id AND image."vehicleId" = reorder_vehicle_images.vehicle_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_vehicle_views(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_main_vehicle_image(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reorder_vehicle_images(text, text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_vehicle_views(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_main_vehicle_image(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.reorder_vehicle_images(text, text[]) TO service_role;
