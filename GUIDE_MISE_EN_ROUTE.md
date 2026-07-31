# Checklist avant le 6 août

## 1. Une seule fois, avant que qui que ce soit ne joue

1. Ouvre ton lien Vercel sur ton téléphone
2. Connecte-toi en tant que **AD**
3. En bas, appuie sur **"Admin"** → tape le code **457894**
4. Va dans l'onglet **🛠️ God Mode**
5. Section "Base de missions" → clique **"Initialiser les 430 missions"**
   (ça prend quelques secondes, une barre de progression s'affiche)
6. Vérifie que ça affiche bien : Saison 1 → 100 missions disponibles, Saison 2 → 330
   missions disponibles

**Sans cette étape, l'application n'aura aucune mission à proposer — c'est la seule
manipulation technique nécessaire avant le lancement.**

## 2. Le 6 août, envoi du lien

Envoie simplement le lien Vercel (`https://tribu-xxxxx.vercel.app`) à Mattia et
Hilaire. Chacun l'ouvre et l'ajoute à son écran d'accueil (voir GUIDE_VERCEL.md,
étape 5).

## 3. Le 10 août, pour Tiphaine / Alex / Léane

Rien à faire techniquement : s'ils ont déjà ouvert le lien avant le 10 août, leur
écran affichera leurs prénoms grisés avec un cadenas jusqu'à 00h00 le 10 août, où
l'accès se débloque automatiquement. Envoie-leur simplement le même lien.

## 4. Chaque soir entre 21h et minuit — le Tribunal

1. Connecte-toi en AD → Admin → PIN → onglet **⚖️ Tribunal**
2. La liste "Débrief" montre les missions réussies/abandonnées du jour
3. La liste "Accusations en attente" montre qui a accusé qui
4. Pour chaque accusation, clique **"Juger maintenant"** : l'app affiche la vraie
   mission de l'accusé, tu choisis parmi les 3 verdicts

Si un soir tu ne peux pas faire le Tribunal, ce n'est pas grave : tout reste "en
attente" et s'accumule pour le lendemain (comportement prévu par le cahier des
charges).

## En cas de pépin technique en cours de séjour

- **Un joueur reste bloqué / écran figé** → God Mode → "Force Refresh" (recharge
  tous les téléphones connectés)
- **Un score visiblement faux suite à un bug** → God Mode → "Régulateur de score
  manuel"
- **Une mission bloquée sur un joueur** → God Mode → "Nettoyeur de missions (Kill
  Switch)"
- **Une accusation envoyée par erreur / doublon** → God Mode → "Suppression
  d'accusation"

## Rappel : ce que je n'ai pas pu tester moi-même

Je n'ai pas de vrai projet Firebase ni d'accès internet pour déployer, donc je n'ai
pas pu faire un test de bout en bout avec plusieurs téléphones réels. Le code est
solide et je l'ai fait compiler sans erreur, mais je te recommande, une fois déployé,
de faire un petit essai à 2-3 personnes avant le 6 août (piocher une mission, la
valider, faire une fausse accusation, passer au Tribunal) pour vérifier que tout se
comporte comme attendu en conditions réelles. Si quelque chose cloche, dis-le moi et
je corrige.
