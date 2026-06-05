# Thibaut Juge — site perso

Développeur freelance et créateur de produits. Ce dépôt contient le code source
de mon site personnel [thibautjuge.com](https://thibautjuge.com), qui me sert de
vitrine et de point d'entrée vers mes projets.

## Mes projets

- [mon-crm.fr](https://mon-crm.fr) — le CRM des indépendants et TPE français.
- [piflette.com](https://piflette.com) — production vidéo et créative.
- [Mon profil LinkedIn](https://www.linkedin.com/in/thibaut-juge/)

## Stack

Le site est un front-end Next.js adossé à un WordPress headless.

- **Next.js 16** (App Router) avec **React 19** et **TypeScript**.
- **Tailwind CSS v4**, complété par quelques CSS Modules et feuilles globales.
- **Three.js** via **@react-three/fiber** et **@react-three/drei** pour les
  effets visuels (fond animé, fluides, fumée, etc.).
- **WordPress headless** comme source de contenu, interrogé en **GraphQL**
  (WPGraphQL) avec `fetch` natif — pas de client GraphQL tiers. Les types de
  contenu personnalisés sont définis dans un plugin must-use
  ([wp-mu-plugins/thibautjuge-cpt.php](wp-mu-plugins/thibautjuge-cpt.php)).
- **ESLint** (config `next`).
- Serveur Node maison ([server.js](server.js)) pour la production, déploiement
  sur VPS via GitHub Actions.

## Lancer le projet en local

Prérequis : Node.js et npm.

```bash
# 1. Installer les dépendances
npm install

# 2. Créer un fichier .env.local à la racine
#    (le contenu n'est pas versionné)
```

Variables d'environnement attendues dans `.env.local` :

```bash
# URL de l'endpoint GraphQL du WordPress headless
NEXT_PUBLIC_WP_GRAPHQL_URL=https://exemple.com/graphql

# Token de l'API du CRM, utilisé par le formulaire de contact
CRM_TOKEN=xxxxxxxx
```

```bash
# 3. Démarrer le serveur de développement
npm run dev
```

Le site est alors accessible sur [http://localhost:3000](http://localhost:3000).

Scripts disponibles :

- `npm run dev` — serveur de développement.
- `npm run build` — build de production.
- `npm run start` — démarre le build de production.
- `npm run lint` — analyse ESLint.

## Licence

Tous droits réservés. Le code est consultable à titre de démonstration, mais ne
peut être réutilisé, copié ou redistribué sans mon autorisation.
