# Tribu

Application PWA du jeu "Tribu" — jeu de manipulation, bluff et contre-espionnage
grandeur nature sur 10 jours de vacances.

## Avant de commencer

Lis les guides dans cet ordre :

1. **GUIDE_FIREBASE.md** — créer la base de données temps réel (obligatoire)
2. **GUIDE_VERCEL.md** — déployer et obtenir le lien à envoyer aux copains
3. **GUIDE_MISE_EN_ROUTE.md** — checklist du jour J et pendant le séjour

## Développement local (optionnel)

```bash
npm install
cp .env.example .env   # puis remplis avec tes clés Firebase
npm run dev
```

## Build de production

```bash
npm run build
```

Le résultat est dans `dist/` (Vercel s'en charge automatiquement, pas besoin de le
faire à la main).

## Structure du projet

- `src/data/missions.seed.json` — les 430 missions, générées depuis
  `scripts/build-missions.mjs`
- `src/firebase/` — toute la logique d'accès à la base de données temps réel
- `src/screens/` — écrans joueurs (missions, boutique, casino, accusations,
  classement)
- `src/screens/admin/` — Tribunal et God Mode (protégés par code PIN)
- `firestore.rules` — règles de sécurité à coller dans la console Firebase
