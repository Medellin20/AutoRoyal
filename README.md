# AutoRoyal — plateforme de location et de vente de vehicules

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
| `DATABASE_URL` | chaine de connexion PostgreSQL |
| `NEXTAUTH_SECRET` | cle de signature des sessions (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL publique du site |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | compte super administrateur cree par le seed |
| `CLOUDINARY_*` | stockage des photos de vehicules |
| `NEXT_PUBLIC_SITE_URL` | utilise pour le SEO, le sitemap et le partage |

`ADMIN_PASSWORD` doit faire au moins 10 caracteres. Aucun mot de passe n'est ecrit en clair dans
le code : le seed lit uniquement les variables d'environnement et stocke un hash bcrypt.

## 2. Base de donnees

```bash
npx prisma generate          # client Prisma
npx prisma migrate dev --name init   # premiere migration (developpement)
npm run db:seed              # 12 vehicules, 3 clients, reservations et demandes de demo
```

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
  La palette est claire par defaut : fond blanc, surfaces gris tres clair, accent bleu royal,
  touches dorees.
- **Typographies** : `src/app/layout.tsx` (Sora pour les titres, Plus Jakarta Sans pour le texte).
- **Logo** : `public/images/logo.svg` ou le composant `src/components/layout/logo.tsx`.
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
3. Utilisez une base PostgreSQL manageee (Neon, Supabase, Railway). Pour un environnement
   serverless, ajoutez `?pgbouncer=true&connection_limit=1` a `DATABASE_URL`.
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

## 10. Configuration locale (exécution rapide avec Docker)

Pour démarrer rapidement une base PostgreSQL locale et configurer DATABASE_URL :

1. Copier l'exemple d'environnement :

```bash
cp .env.example .env
```

2. Démarrer Postgres via Docker Compose (fichier `docker-compose.yml` à la racine fourni) :

```bash
docker compose up -d
```

Le compose démarre Postgres (port 5432) et Adminer (interface web à http://localhost:8080).

3. Exemple de chaîne de connexion à placer dans `.env` (déjà présente dans `.env.example`) :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/autoroyal?schema=public"
```

Si le mot de passe contient des caractères spéciaux, conservez les guillemets ou encodez-les.

4. Générer le client Prisma, appliquer les migrations et lancer le seed de démonstration :

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

5. Lancer l'application :

```bash
npm run dev
# ou pour la production :
# npm run build && npm start
```

Notes :

- Adminer (http://localhost:8080) : System=PostgreSQL, Server=db, Username=postgres, Password=password, Database=autoroyal
- Le fichier `docker-compose.yml` fourni est minimal et destiné au développement local. Adaptez les mots de passe et volumes pour un usage en production.
- Si vous préférez utiliser un service managé (Supabase, Neon, Railway), copiez la DATABASE_URL fournie par le service dans `.env`.

