import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';

const systemRef = doc(db, 'systeme', 'etat');

// Force refresh : écrit un timestamp que tous les clients écoutent.
// Chaque changement déclenche un window.location.reload() côté joueurs.
export async function declencherForceRefresh() {
  await setDoc(systemRef, { forceRefreshAt: Date.now() }, { merge: true });
}

export function ecouterForceRefresh(callback) {
  return onSnapshot(systemRef, (snap) => {
    if (snap.exists()) callback(snap.data().forceRefreshAt);
  });
}

// Bascule manuelle de saison (utile pour tests, ou si l'admin veut forcer la bascule)
export async function forcerSaison(saison) {
  await setDoc(systemRef, { saisonForcee: saison }, { merge: true });
}

export function ecouterEtatSysteme(callback) {
  return onSnapshot(systemRef, (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
}
