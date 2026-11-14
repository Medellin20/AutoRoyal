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
`SUPABASE_SERVICE_ROLE_KEY` est strictement réservée au serveur et reste nécessaire pour charger
les données de l’administration. Définissez également `NEXTAUTH_SECRET` dans `.env`. Créez le
compte administrateur dans Supabase Auth et attribuez `admin` à `app_metadata.role`; la connexion
sur `/admin/login` vérifie l’adresse e-mail et le mot de passe avec Supabase Auth.

## Base Supabase et paiement

Exécutez les migrations du dossier `supabase/migrations` dans l’ordre des noms, depuis l’éditeur SQL
du tableau de bord Supabase. Elles créent le schéma initial, le suivi des commandes, les fonctions
transactionnelles et le stockage public des photos de véhicules. Elles ne chargent pas de véhicules de
démonstration.

Dans `/admin/parametres`, configurez soit le RIB, soit le lien sécurisé de paiement avant d’accepter
des commandes. Une commande réserve le véhicule. Le paiement reste en attente jusqu’à ce qu’un
administrateur vérifie réellement les fonds et saisisse une référence. Le reçu PDF ne modifie jamais
le statut du paiement.

Pour envoyer les alertes e-mail de nouvelles commandes, configurez `RESEND_API_KEY` et
`RESEND_FROM_EMAIL`. Le destinataire est `ORDER_ALERT_EMAIL`, ou `ADMIN_EMAIL` si cette valeur est
vide. Sans configuration Resend, la commande reste visible dans `/admin/commandes` et son état
d’alerte est indiqué dans l’administration.

`ADMIN_EMAIL` est facultatif et sert uniquement de destinataire de secours pour les alertes et le
journal admin. Après toute modification des variables d’environnement en production, redéployez le site.

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
