import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection,
} from 'firebase/firestore';
import { db } from './config';

const joueursRef = collection(db, 'joueurs');

// Crée le joueur s'il n'existe pas encore (première connexion)
export async function assurerJoueur(pseudo) {
  const ref = doc(joueursRef, pseudo);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      pseudo,
      score: 40, // solde de départ offert à chaque nouveau joueur
      scoreValide: 40,
      missionActive: null, // { missionId, texte, difficulte, points, effetDeLevier, dateAcceptation }
      inventaire: { capeInvisibilite: 0, amnesieDisponible: 0 }, // objets achetés en attente d'usage
      geleJusqua: null, // timestamp ISO si Gel des Avoirs actif
      casinoBeneficeJour: 0,
      casinoDateJour: null, // pour reset quotidien
      createdAt: new Date().toISOString(),
    });
  }
  return ref;
}

export function ecouterJoueur(pseudo, callback) {
  const ref = doc(joueursRef, pseudo);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function ecouterTousJoueurs(callback) {
  return onSnapshot(joueursRef, (snap) => {
    const joueurs = {};
    snap.forEach((d) => { joueurs[d.id] = d.data(); });
    callback(joueurs);
  });
}

// Ajuste le score d'un joueur, sans jamais descendre sous 0 : si un malus dépasserait ce
// plancher, seule la portion nécessaire pour atteindre 0 est réellement appliquée.
export async function ajusterScore(pseudo, delta) {
  const ref = doc(joueursRef, pseudo);
  const snap = await getDoc(ref);
  const scoreActuel = snap.exists() ? (snap.data().score || 0) : 0;
  const nouveauScore = Math.max(0, scoreActuel + delta);
  await updateDoc(ref, { score: nouveauScore });
}

export async function definirMissionActive(pseudo, mission) {
  const ref = doc(joueursRef, pseudo);
  await updateDoc(ref, { missionActive: mission });
}

export async function retirerMissionActive(pseudo) {
  const ref = doc(joueursRef, pseudo);
  await updateDoc(ref, { missionActive: null });
}

export async function mettreAJourJoueur(pseudo, data) {
  const ref = doc(joueursRef, pseudo);
  await updateDoc(ref, data);
}

export async function reinitialiserScores(pseudos) {
  await Promise.all(pseudos.map((p) => mettreAJourJoueur(p, {
    score: 0,
    scoreValide: 0,
    missionActive: null,
  })));
}
