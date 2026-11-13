# Laurent Crash Autos

Plateforme Next.js de vente de véhicules accidentés et d’administration des commandes. La base de
données utilise exclusivement l’API Supabase avec `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY`. Prisma a été supprimé.

## Installation

```bash
npm install
cp .env.example .env
```

Renseignez les trois variables Supabase depuis les paramètres API du projet. La clé
`SUPABASE_SERVICE_ROLE_KEY` est strictement réservée au serveur. Les autres variables décrites dans
`.env.example` configurent NextAuth, l’URL du site, l’administrateur et Cloudinary.

## Base Supabase et paiement

Exécutez les migrations du dossier `supabase/migrations` dans l’ordre des noms, depuis l’éditeur SQL
du tableau de bord Supabase. Elles créent le schéma initial puis les champs d’état accidenté, les
commandes de vente, le suivi des alertes et les fonctions transactionnelles. Elles ne chargent pas
de véhicules de démonstration.

Dans `/admin/parametres`, configurez soit le RIB, soit le lien sécurisé de paiement avant d’accepter
des commandes. Une commande réserve le véhicule. Le paiement reste en attente jusqu’à ce qu’un
administrateur vérifie réellement les fonds et saisisse une référence. Le reçu PDF ne modifie jamais
le statut du paiement.

Pour envoyer les alertes e-mail de nouvelles commandes, configurez `RESEND_API_KEY` et
`RESEND_FROM_EMAIL`. Le destinataire est `ORDER_ALERT_EMAIL`, ou `ADMIN_EMAIL` si cette valeur est
vide. Sans configuration Resend, la commande reste visible dans `/admin/commandes` et son état
d’alerte est indiqué dans l’administration.

Créez le premier compte administrateur après avoir renseigné `ADMIN_EMAIL` et `ADMIN_PASSWORD` :

```bash
npm run admin:create
```

Cette commande ajoute un compte super administrateur sans effacer de données existantes.

## Lancer le site

```bash
npm run dev
npm run build
npm start
```

L’administration se trouve à `/admin/login`; les commandes sont visibles dans `/admin/commandes`.

## Structure

- `src/app` : pages publiques, administration et routes API.
- `src/server` : lectures et mutations de données côté serveur.
- `src/lib/supabase.ts` : clients Supabase, avec clé de service réservée au serveur.
- `src/types/database.ts` : types des tables.
- `supabase/migrations` : migrations SQL versionnées.

Les identifiants API fournis à l’application sont les seules valeurs utilisées pour accéder à
Supabase. Le déploiement du schéma depuis le tableau de bord Supabase est une étape distincte.
