# Démarrage rapide

```bash
npm install
cp .env.example .env
```

Dans `.env`, définissez les trois valeurs API du projet Supabase :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement)

Exécutez les migrations de `supabase/migrations` dans l’ordre des noms depuis l’éditeur SQL du
tableau de bord Supabase. Puis définissez `NEXTAUTH_SECRET` et `ADMIN_PASSWORD`. L’accès admin
utilise uniquement ce mot de passe; aucun compte Auth ou e-mail n’est nécessaire.
La migration `20261114000600_vehicle_images_bucket.sql` prépare le stockage Supabase des photos
administrées depuis la fiche véhicule.

```bash
npm run dev
```

Sur Netlify, renseignez également `NEXTAUTH_SECRET` (une valeur aléatoire et privée), `NEXTAUTH_URL`
(l’URL HTTPS canonique du site, sans chemin) et les trois variables Supabase ci-dessus dans les
variables d’environnement du site. `NEXT_PUBLIC_SITE_URL` doit pointer vers la même URL publique.
Après toute modification de ces variables, relancez un déploiement.

Dans l’administration, configurez le RIB ou le lien de paiement. Pour recevoir une alerte e-mail
après chaque création de commande, définissez `RESEND_API_KEY`, `RESEND_FROM_EMAIL` et,
facultativement, `ORDER_ALERT_EMAIL`. Sans destinataire explicite, `ADMIN_EMAIL` reçoit les alertes.
Le reçu PDF confirme uniquement la commande, jamais le paiement : seul le contrôle réel dans
l’espace admin confirme les fonds.

Le site est disponible sur http://localhost:3000 et l’administration sur
http://localhost:3000/admin/login. Prisma n’est plus utilisé.
