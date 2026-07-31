# Guide Firebase — 10 minutes

Firebase est le service (gratuit pour cet usage) qui fait que tous les téléphones
sont synchronisés en temps réel. Tu n'as besoin que d'un compte Google.

## Étape 1 — Créer le projet

1. Va sur https://console.firebase.google.com
2. Connecte-toi avec un compte Google (le tien convient très bien)
3. Clique sur **"Ajouter un projet"** (ou "Créer un projet")
4. Nom du projet : `tribu` (ou ce que tu veux)
5. Décoche "Activer Google Analytics" (inutile ici) puis clique **Continuer** / **Créer le projet**
6. Attends ~20 secondes que Firebase le crée, puis clique **Continuer**

## Étape 2 — Créer la base de données (Firestore)

1. Dans le menu de gauche, clique sur **"Compilation" (Build)** → **"Firestore Database"**
2. Clique sur **"Créer une base de données"**
3. Choisis l'emplacement : **eur3 (europe-west)** convient bien (proche de nous)
4. Mode de démarrage : choisis **"Mode production"**
5. Clique **Créer**

## Étape 3 — Configurer les règles de sécurité

Une fois la base créée :
1. Va dans l'onglet **"Règles"** (Rules) en haut de la page Firestore
2. Remplace tout le contenu par celui du fichier `firestore.rules` fourni avec ce projet
3. Clique **"Publier"**

(Ces règles autorisent la lecture/écriture pour ce jeu précis pendant la durée du séjour —
voir le fichier `firestore.rules` pour le détail et pourquoi c'est sans danger dans ce contexte.)

## Étape 4 — Créer l'application Web et récupérer les clés

1. Retourne à la page d'accueil du projet (icône maison ou logo Firebase en haut à gauche)
2. Clique sur l'icône **`</>`** ("Ajouter une application Web") — elle est près de "Bien démarrer"
3. Surnom de l'application : `tribu-web`
4. **Ne coche PAS** "Configurer Firebase Hosting" (on utilise Vercel à la place)
5. Clique **"Enregistrer l'application"**
6. Firebase affiche un bloc de code avec un objet `firebaseConfig = { apiKey: "...", ... }`

**C'est ce bloc que je veux que tu me copies-colles ici**, il ressemble à ça :

```js
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tribu-xxxxx.firebaseapp.com",
  projectId: "tribu-xxxxx",
  storageBucket: "tribu-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

Copie-colle moi ce bloc entier (les vraies valeurs, pas cet exemple) et je configure le
fichier `.env` du projet avec.

## C'est tout pour cette étape

Une fois que tu m'auras donné ces clés, on passera au déploiement (Vercel) puis à
l'initialisation de la base de missions depuis le God Mode de l'appli elle-même.
