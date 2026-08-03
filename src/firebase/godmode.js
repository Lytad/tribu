import { doc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';
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

// Verrou anti-doublon pour la remise à zéro des scores au passage en Saison 2 : la
// transaction garantit qu'une seule exécution (parmi plusieurs appels simultanés depuis
// différents appareils/onglets AD) pose réellement le verrou et obtient le feu vert pour agir.
export async function tenterVerrouResetSaison2() {
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(systemRef);
    const dejaFait = snap.exists() && snap.data().resetSaison2Fait;
    if (dejaFait) return false;
    transaction.set(systemRef, { resetSaison2Fait: true }, { merge: true });
    return true;
  });
}

// Même principe pour le calcul figé des statistiques de fin de partie (16 août 12h).
export async function tenterVerrouFinDePartie() {
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(systemRef);
    const dejaFait = snap.exists() && snap.data().finDePartieFaite;
    if (dejaFait) return false;
    transaction.set(systemRef, { finDePartieFaite: true }, { merge: true });
    return true;
  });
}
