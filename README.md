# Laurent Crash Autos — plateforme de location et de vente de vehicules

Application Next.js (App Router) complete : catalogue public, reservation en ligne, demandes
d'achat et espace d'administration protege.

Stack : Next.js 14 · React 18 · TypeScript · Tailwind CSS · Framer Motion · PostgreSQL · Prisma ·
NextAuth · Cloudinary · Zod · Lucide.

---

## 1. Installation

```bash
npm install
cp .env.example .env
```

Renseignez `.env` :

| Variable | Role |
| --- | --- |
| `DATABASE_URL` | URL Supabase pooler transactionnel, utilisee par Prisma Client |
| `DIRECT_URL` | URL directe Supabase, utilisee par Prisma Migrate |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | acces public a la Supabase Data API |
| `SUPABASE_SERVICE_ROLE_KEY` | cle API privilegiee, serveur uniquement |
| `NEXTAUTH_SECRET` | cle de signature des sessions (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL publique du site |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | compte super administrateur cree par le seed |
| `CLOUDINARY_*` | stockage des photos de vehicules |
| `NEXT_PUBLIC_SITE_URL` | utilise pour le SEO, le sitemap et le partage |

`ADMIN_PASSWORD` doit faire au moins 10 caracteres. Aucun mot de passe n'est ecrit en clair dans
le code : le seed lit uniquement les variables d'environnement et stocke un hash bcrypt.

## 2. Base de donnees Supabase

Dans Supabase, creez un projet PostgreSQL puis recuperez les URL dans **Connect**. Placez le pooler
transactionnel (port 6543) dans `DATABASE_URL` et la connexion directe (port 5432) dans
`DIRECT_URL`. Si votre reseau ne peut pas joindre l endpoint direct IPv6, utilisez le pooler en mode
session (port 5432) pour `DIRECT_URL`. Les deux URL doivent viser le meme projet.

Les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` servent a la Data API;
`SUPABASE_SERVICE_ROLE_KEY` ne doit jamais etre exposee au navigateur. Prisma se connecte a Postgres
avec `DATABASE_URL` et `DIRECT_URL`, pas avec ces cles API.

```bash
npx prisma generate
npm run db:deploy
```

Le seed charge des donnees de demonstration mais commence par effacer les donnees existantes.
Ne lancez `npm run db:seed` que sur une base vide de demonstration.

En production :

```bash
npx prisma migrate deploy
```

Autres commandes : `npm run db:studio` (explorateur), `npm run db:migrate` (nouvelle migration).

## 3. Lancer le projet

```bash
npm run dev     # http://localhost:3000
npm run build   # build de production (genere le client Prisma)
npm start
```

Connexion a l'administration : `/admin/login` avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## 4. Architecture

```
prisma/
  schema.prisma          modeles, enums, index et relations
  seed.ts                donnees de demonstration
public/images/           visuels de remplacement (SVG, a substituer par vos photos)
src/
  app/
    page.tsx             accueil
    vehicules/           catalogue et fiche detaillee [slug]
    reservation/         formulaire de location
    demande-achat/       formulaire d'achat
    favoris/             selection enregistree dans le navigateur
    contact/ a-propos/ services/ faq/            pages editoriales
    conditions-location/ politique-confidentialite/ mentions-legales/
    admin/               espace protege (login, dashboard, CRUD)
    api/                 auth, upload, catalogue JSON, export CSV
    sitemap.ts robots.ts not-found.tsx
  components/
    ui/                  bouton, champs, badge, modale, skeleton, primitives Framer Motion
    layout/              navbar, footer, logo, WhatsApp, enveloppes de page
    home/                hero et sections de l'accueil
    vehicles/            carte, galerie, filtres, tri, pagination, etat vide
    forms/               reservation, achat, contact
    admin/               shell, statistiques, formulaire vehicule, gestion des images
  server/
    queries.ts           lectures (catalogue, filtres, statistiques)
    actions/             Server Actions : vehicle, reservation, purchase, contact, settings
  validations/           schemas Zod partages client et serveur
  lib/                   prisma, auth, permissions, audit, rate-limit, cloudinary, seo, utils
  config/site.ts         nom, logo, couleurs, coordonnees, reseaux, regles de tarification
  hooks/                 favoris, debounce
  types/                 types partages
  middleware.ts          protection des routes /admin
```

## 5. Personnalisation

- **Nom, coordonnees, reseaux, lieux de retrait, frais** : `src/config/site.ts`.
- **Couleurs** : variables CSS dans `src/app/globals.css` (`--color-accent`, `--color-gold`, ...).
  La palette est claire par defaut : fond blanc, surfaces gris tres clair, accent rouge, noir et argent,
  touches argentees.
- **Typographies** : `src/app/layout.tsx` (Sora pour les titres, Plus Jakarta Sans pour le texte).
- **Logo** : `public/images/laurent-crash-autos.png`, affiche par `src/components/layout/logo.tsx`.
- Une partie de ces valeurs est aussi modifiable sans redeploiement depuis `/admin/parametres`.

## 6. Securite

- Mots de passe haches avec bcrypt (12 tours).
- Sessions JWT signees, cookies `httpOnly` et `secure` en production.
- `middleware.ts` protege `/admin/*`, et chaque page admin revalide la session cote serveur.
- Controle des roles par permission (`src/lib/permissions.ts`) : suppression, publication, export
  et gestion des comptes sont reserves aux roles superieurs.
- Validation Zod cote client et cote serveur sur chaque formulaire.
- Prisma parametre toutes les requetes (pas de SQL concatene).
- Limitation a 5 tentatives de connexion par e-mail ou IP sur 15 minutes.
- Upload : type MIME et taille verifies (5 Mo max) avant tout appel reseau ; suppression du
  fichier distant avant suppression de la ligne en base.
- Journal des actions administratives (`AuditLog`) avec adresse IP.
- En-tetes de securite definis dans `next.config.mjs`.

## 7. Roles

| Role | Peut faire |
| --- | --- |
| Gestionnaire | creer et modifier les vehicules, traiter reservations et demandes |
| Administrateur | idem + supprimer, publier, exporter, modifier les parametres |
| Super administrateur | idem + gerer les comptes et consulter le journal d'audit |

## 8. Deploiement

**Vercel** (recommande)

1. Poussez le depot sur GitHub, puis importez-le dans Vercel.
2. Ajoutez toutes les variables de `.env.example` dans *Settings → Environment Variables*.
3. Renseignez `DATABASE_URL` avec le pooler transactionnel Supabase et `DIRECT_URL` avec l URL
   directe (ou le pooler en mode session pour les environnements IPv4 uniquement).
4. Build : `npm run build` (execute `prisma generate`).
5. Appliquez les migrations une fois : `npx prisma migrate deploy` (localement, pointe sur la base
   de production, ou via une commande de build).
6. Lancez le seed une seule fois si vous souhaitez les donnees de demonstration.

**Docker / VPS**

```bash
npm ci
npx prisma migrate deploy
npm run build
npm start   # sert sur le port 3000, a placer derriere un reverse proxy TLS
```

Verifiez apres mise en ligne : `NEXTAUTH_URL` en https, `NEXT_PUBLIC_SITE_URL` correct,
`/sitemap.xml` et `/robots.txt` accessibles, et connexion admin fonctionnelle.

## 9. Accessibilite et performances

Navigation clavier complete, focus visible, lien d'evitement, libelles et `aria-label` sur les
controles, textes alternatifs sur toutes les images. Les animations respectent
`prefers-reduced-motion`. Les images passent par `next/image` (AVIF/WebP), les listes lourdes
utilisent Suspense et des skeletons.

## 10. Configuration Supabase en local

Copiez `.env.example` vers `.env`, renseignez les URL `DATABASE_URL` et `DIRECT_URL` depuis le
tableau de bord Supabase, puis définissez `ADMIN_EMAIL` et `ADMIN_PASSWORD` avant de créer un
compte administrateur. Une clé `NEXTAUTH_SECRET` locale peut être generee avec
`openssl rand -base64 32`. Ensuite, appliquez les migrations avec `npm run db:deploy` et lancez
`npm run dev`. Le fichier `.env` local est ignore par Git.

