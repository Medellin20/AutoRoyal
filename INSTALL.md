# Demarrage rapide

```bash
# 1. Dependances
npm install

# 2. Environnement
cp .env.example .env
# renseigner DATABASE_URL, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Base de donnees
npx prisma generate
npx prisma migrate dev --name init

# 4. Donnees de demonstration (12 vehicules, clients, reservations)
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
| `npm run db:seed` | reinjecter les donnees de demonstration |
| `npm run lint` | verification ESLint |
