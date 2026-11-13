ALTER TABLE "SiteSetting"
  ALTER COLUMN "garageName" SET DEFAULT 'Laurent Crash Autos';

UPDATE "SiteSetting"
SET "garageName" = 'Laurent Crash Autos',
    "accentColor" = CASE WHEN "accentColor" = '#2F5BEA' THEN '#ED1C24' ELSE "accentColor" END
WHERE "id" = 'default'
  AND "garageName" = 'AutoRoyal';
