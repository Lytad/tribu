# Guide Vercel — 5 minutes

Vercel héberge gratuitement l'application et te donne un lien public
(type `tribu-xyz.vercel.app`) que tu enverras aux copains.

**Prérequis : avoir déjà rempli le fichier `.env` avec tes clés Firebase**
(voir GUIDE_FIREBASE.md — cette étape doit être faite avant).

## Étape 1 — Mettre le code sur GitHub

Vercel déploie à partir d'un dépôt GitHub. Si tu n'as pas de compte GitHub :

1. Va sur https://github.com et crée un compte gratuit (email + mot de passe)
2. Une fois connecté, clique sur **"New repository"** (bouton vert en haut à droite ou "+")
3. Nom du dépôt : `tribu`
4. Laisse-le en **Public** ou **Private** (les deux fonctionnent avec Vercel gratuit)
5. Ne coche aucune case (pas de README, pas de .gitignore) puisqu'on a déjà le code
6. Clique **"Create repository"**

GitHub affiche alors des commandes à taper. Donne-moi l'URL du dépôt qui ressemble à
`https://github.com/ton-pseudo/tribu.git` et je pousse le code pour toi (ou je te
donne les 3 commandes exactes à coller si tu préfères le faire toi-même).

## Étape 2 — Connecter Vercel

1. Va sur https://vercel.com
2. Clique **"Sign Up"** puis choisis **"Continue with GitHub"** (le plus simple —
   ça connecte directement ton compte GitHub)
3. Autorise Vercel à accéder à GitHub quand c'est demandé

## Étape 3 — Importer le projet

1. Sur le tableau de bord Vercel, clique **"Add New..."** → **"Project"**
2. Trouve le dépôt `tribu` dans la liste et clique **"Import"**
3. Vercel détecte automatiquement que c'est un projet Vite — laisse les réglages
   par défaut (Framework Preset : "Vite")

## Étape 4 — Ajouter les variables d'environnement

**Étape cruciale** : avant de déployer, il faut donner à Vercel les mêmes clés
Firebase que dans ton `.env` local.

1. Toujours sur l'écran d'import, ouvre la section **"Environment Variables"**
2. Ajoute une par une les 7 variables (nom exact à gauche, valeur à droite) :
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_ADMIN_PIN` (valeur : `457894`)
3. Clique **"Deploy"**

Attends 1-2 minutes. Vercel affiche alors "Congratulations!" avec un lien du type
`https://tribu-xyz.vercel.app` — **c'est ce lien que tu enverras aux copains**.

## Étape 5 — Tester "Ajouter à l'écran d'accueil"

1. Ouvre le lien sur ton téléphone (Safari sur iPhone, Chrome sur Android)
2. iPhone : bouton Partager (carré avec flèche) → "Sur l'écran d'accueil"
3. Android : menu ⋮ en haut à droite → "Ajouter à l'écran d'accueil" / "Installer l'application"
4. Une icône Tribu apparaît, elle s'ouvre en plein écran comme une vraie appli

## Mises à jour futures

Si je dois corriger quelque chose plus tard : je modifie le code, tu (ou moi) le
repousses sur GitHub, et Vercel redéploie automatiquement en ~1 minute — aucune
action supplémentaire nécessaire de ta part.
