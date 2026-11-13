-- Les montants historiques etaient exprimes en XOF. Convertir au taux fixe XOF/EUR.
UPDATE "Vehicle"
SET "salePrice" = ROUND("salePrice" / 655.957),
    "dailyPrice" = ROUND("dailyPrice" / 655.957),
    "weeklyPrice" = ROUND("weeklyPrice" / 655.957),
    "monthlyPrice" = ROUND("monthlyPrice" / 655.957),
    "deposit" = ROUND("deposit" / 655.957);

UPDATE "Reservation"
SET "totalPrice" = ROUND("totalPrice" / 655.957),
    "extraFees" = ROUND("extraFees" / 655.957);

UPDATE "PurchaseRequest"
SET "budget" = ROUND("budget" / 655.957);

ALTER TABLE "SiteSetting"
  ALTER COLUMN "accentColor" SET DEFAULT '#ED1C24';

-- Recentrer les anciennes coordonnees par defaut sans ecraser les valeurs personnalisees.
UPDATE "SiteSetting"
SET "phone" = CASE WHEN "phone" LIKE '+229%' THEN '' ELSE "phone" END,
    "whatsapp" = CASE WHEN "whatsapp" LIKE '229%' THEN '' ELSE "whatsapp" END,
    "address" = CASE WHEN "address" ILIKE ANY (ARRAY['%Benin%', '%Cotonou%', '%Abomey-Calavi%']) THEN 'France metropolitaine' ELSE "address" END,
    "mapUrl" = CASE WHEN "mapUrl" ILIKE ANY (ARRAY['%Benin%', '%Cotonou%', '%Abomey-Calavi%']) THEN 'https://www.google.com/maps?q=France&output=embed' ELSE "mapUrl" END
WHERE "id" = 'default';

-- Les descriptions de demonstration reprennent egalement les prix en euros.
UPDATE "Vehicle"
SET "rentalConditions" = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(COALESCE("rentalConditions", ''), '150 000 FCFA', '230 €'),
            '250 000 FCFA', '380 €'),
          '150 FCFA par kilometre', '0,23 € par kilometre'),
        '100 000 FCFA', '150 €'),
      '25 000 FCFA par jour', '38 € par jour'),
    'Grand Nokoue', 'France metropolitaine'),
  'Benin', 'France metropolitaine')
WHERE "rentalConditions" IS NOT NULL;

UPDATE "Customer"
SET "fullName" = CASE
      WHEN "email" = 'fabrice.adjovi@example.com' THEN 'Camille Martin'
      WHEN "email" = 'nadege.koukou@example.com' THEN 'Nadia Bernard'
      WHEN "email" = 'serge.dossou@example.com' THEN 'Hugo Petit'
      ELSE "fullName"
    END,
    "email" = CASE
      WHEN "email" = 'fabrice.adjovi@example.com' THEN 'camille.martin@example.com'
      WHEN "email" = 'nadege.koukou@example.com' THEN 'nadia.bernard@example.com'
      WHEN "email" = 'serge.dossou@example.com' THEN 'hugo.petit@example.com'
      ELSE "email"
    END,
    "phone" = CASE
      WHEN "phone" = '+22997000001' THEN '+33639980001'
      WHEN "phone" = '+22997000002' THEN '+33639980002'
      WHEN "phone" = '+22997000003' THEN '+33639980003'
      ELSE "phone"
    END,
    "address" = CASE
      WHEN "email" = 'fabrice.adjovi@example.com' THEN 'Paris, France'
      WHEN "email" = 'nadege.koukou@example.com' THEN 'Lyon, France'
      WHEN "email" = 'serge.dossou@example.com' THEN 'Nantes, France'
      ELSE "address"
    END
WHERE "email" IN (
  'fabrice.adjovi@example.com', 'nadege.koukou@example.com', 'serge.dossou@example.com'
);

UPDATE "Reservation"
SET "pickupPlace" = 'Lieu convenu en France metropolitaine',
    "returnPlace" = 'Lieu convenu en France metropolitaine'
WHERE "reference" LIKE 'RES-DEMO-%';
