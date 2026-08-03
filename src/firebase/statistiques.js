import {
  collection, getDocs, doc, getDoc, setDoc,
} from 'firebase/firestore';
import { db } from './config';
import { SAISON_2_DEBUT, FIN_DE_PARTIE, JOUEURS_SAISON_1, TOUS_JOUEURS } from '../utils/constants';

const statistiquesRef = (saison) => doc(db, 'statistiques', `saison${saison}`);

// Calcule et fige les statistiques de la Saison 1 à partir de tout l'historique
// (journal + accusations) créé avant le début de la Saison 2, plus les compteurs cumulés
// déjà présents sur chaque joueur (nombrePartiesCasino). N'est appelé qu'une seule fois,
// au moment du reset Saison 2, protégé par le même verrou que la remise à zéro.
export async function calculerEtFigerStatistiquesSaison1(scoresFinaux, joueursAvantReset) {
  const dateLimit = SAISON_2_DEBUT.toISOString();

  const [journalSnap, accusationsSnap] = await Promise.all([
    getDocs(collection(db, 'journal')),
    getDocs(collection(db, 'accusations')),
  ]);

  const compteurs = {};
  JOUEURS_SAISON_1.forEach((p) => {
    compteurs[p] = {
      missionsReussies: 0,
      missionsAbandonnees: 0,
      accusationsEnvoyees: 0,
      foisDemasque: 0,
      partiesCasino: joueursAvantReset?.[p]?.nombrePartiesCasino || 0,
    };
  });

  journalSnap.forEach((d) => {
    const entree = d.data();
    if (entree.createdAt >= dateLimit) return;
    if (!compteurs[entree.pseudo]) return;
    if (entree.type === 'reussie') compteurs[entree.pseudo].missionsReussies += 1;
    if (entree.type === 'abandonnee') compteurs[entree.pseudo].missionsAbandonnees += 1;
  });

  accusationsSnap.forEach((d) => {
    const acc = d.data();
    if (acc.createdAt >= dateLimit) return;
    if (compteurs[acc.accusateur]) compteurs[acc.accusateur].accusationsEnvoyees += 1;
    if (
      (acc.resultat === 'validee' || acc.resultat === 'validee_mission_abandonnee')
      && compteurs[acc.accuse]
    ) {
      compteurs[acc.accuse].foisDemasque += 1;
    }
  });

  function meilleurPour(critere) {
    let meilleur = null;
    let meilleureValeur = -1;
    JOUEURS_SAISON_1.forEach((p) => {
      const valeur = compteurs[p][critere];
      if (valeur > meilleureValeur) {
        meilleureValeur = valeur;
        meilleur = p;
      }
    });
    return { pseudo: meilleur, valeur: meilleureValeur };
  }

  const classement = JOUEURS_SAISON_1
    .map((p) => ({ pseudo: p, score: scoresFinaux[p] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const stats = {
    classementFinal: classement,
    titres: {
      plusAccusateur: meilleurPour('accusationsEnvoyees'),
      plusDemasque: meilleurPour('foisDemasque'),
      plusFuyard: meilleurPour('missionsAbandonnees'),
      plusBosseur: meilleurPour('missionsReussies'),
      plusFlambeur: meilleurPour('partiesCasino'),
    },
    figeeLe: new Date().toISOString(),
  };

  await setDoc(statistiquesRef(1), stats);
  return stats;
}

export async function recupererStatistiquesSaison(saison) {
  const snap = await getDoc(statistiquesRef(saison));
  return snap.exists() ? snap.data() : null;
}

// Calcule et fige les statistiques de la Saison 2 à partir de tout l'historique créé entre
// le début de la Saison 2 et la fin de partie, pour les 6 joueurs. Inclut le détail complet
// par joueur en plus du classement et des titres, comme demandé. N'est appelé qu'une seule
// fois, au moment de la fin de partie, protégé par un verrou dédié (voir godmode.js).
export async function calculerEtFigerStatistiquesSaison2(scoresFinaux, joueursActuels) {
  const dateDebut = SAISON_2_DEBUT.toISOString();
  const dateFin = FIN_DE_PARTIE.toISOString();

  const [journalSnap, accusationsSnap] = await Promise.all([
    getDocs(collection(db, 'journal')),
    getDocs(collection(db, 'accusations')),
  ]);

  const compteurs = {};
  TOUS_JOUEURS.forEach((p) => {
    compteurs[p] = {
      missionsReussies: 0,
      missionsAbandonnees: 0,
      accusationsEnvoyees: 0,
      foisDemasque: 0,
      partiesCasino: joueursActuels?.[p]?.nombrePartiesCasino || 0,
    };
  });

  journalSnap.forEach((d) => {
    const entree = d.data();
    if (entree.createdAt < dateDebut || entree.createdAt >= dateFin) return;
    if (!compteurs[entree.pseudo]) return;
    if (entree.type === 'reussie') compteurs[entree.pseudo].missionsReussies += 1;
    if (entree.type === 'abandonnee') compteurs[entree.pseudo].missionsAbandonnees += 1;
  });

  accusationsSnap.forEach((d) => {
    const acc = d.data();
    if (acc.createdAt < dateDebut || acc.createdAt >= dateFin) return;
    if (compteurs[acc.accusateur]) compteurs[acc.accusateur].accusationsEnvoyees += 1;
    if (
      (acc.resultat === 'validee' || acc.resultat === 'validee_mission_abandonnee')
      && compteurs[acc.accuse]
    ) {
      compteurs[acc.accuse].foisDemasque += 1;
    }
  });

  function meilleurPour(critere) {
    let meilleur = null;
    let meilleureValeur = -1;
    TOUS_JOUEURS.forEach((p) => {
      const valeur = compteurs[p][critere];
      if (valeur > meilleureValeur) {
        meilleureValeur = valeur;
        meilleur = p;
      }
    });
    return { pseudo: meilleur, valeur: meilleureValeur };
  }

  const classement = TOUS_JOUEURS
    .map((p) => ({ pseudo: p, score: scoresFinaux[p] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const detailParJoueur = {};
  TOUS_JOUEURS.forEach((p) => {
    detailParJoueur[p] = { score: scoresFinaux[p] ?? 0, ...compteurs[p] };
  });

  const stats = {
    classementFinal: classement,
    titres: {
      plusAccusateur: meilleurPour('accusationsEnvoyees'),
      plusDemasque: meilleurPour('foisDemasque'),
      plusFuyard: meilleurPour('missionsAbandonnees'),
      plusBosseur: meilleurPour('missionsReussies'),
      plusFlambeur: meilleurPour('partiesCasino'),
    },
    detailParJoueur,
    figeeLe: new Date().toISOString(),
  };

  await setDoc(statistiquesRef(2), stats);
  return stats;
}
