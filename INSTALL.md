# Demarrage rapide

```bash
# 1. Dependances
npm install

# 2. Environnement
cp .env.example .env
# renseigner DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Base Supabase (renseigner DATABASE_URL et DIRECT_URL dans .env)
npx prisma generate
npm run db:deploy

# 4. Optionnel : donnees de demonstration (efface les donnees avant rechargement)
# a lancer uniquement sur une base de demonstration vide
npm run db:seed

# 5. Lancer
npm run dev
```

Site public : http://localhost:3000
Administration : http://localhost:3000/admin/login

## Commandes utiles

| Commande | Effet |
| --- | --- |
| `npm run dev` | serveur de developpement |
| `npm run build` | build de production (inclut `prisma generate`) |
| `npm start` | serveur de production |
| `npm run db:migrate` | nouvelle migration en developpement |
| `npm run db:deploy` | appliquer les migrations en production |
| `npm run db:studio` | explorateur de base de donnees |
| `npm run db:seed` | effacer puis recharger les donnees de demonstration (base de demo seulement) |
| `npm run lint` | verification ESLint |
