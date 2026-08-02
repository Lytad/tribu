import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, query, where,
  writeBatch, addDoc,
} from 'firebase/firestore';
import { db } from './config';

// ============================================================================
// BAC À SABLE — collections totalement séparées du vrai jeu (_test en suffixe).
// Rien ici ne touche jamais aux collections "joueurs", "missions", "accusations",
// "journal" ou "evenements" utilisées par la vraie partie.
// ============================================================================

const TEST_JOUEURS = ['TEST1', 'TEST2'];

const joueursTestRef = collection(db, 'joueurs_test');
const missionsTestRef = collection(db, 'missions_test');
const accusationsTestRef = collection(db, 'accusations_test');
const journalTestRef = collection(db, 'journal_test');
const evenementsTestRef = collection(db, 'evenements_test');

const MISSIONS_TEST_SEED = [
  {
    id: 'TEST-F-1', difficulte: 'facile', points: 10,
    texte: '[TEST] Dire le mot "ornithorynque" dans la conversation.', preuveRequise: false,
  },
  {
    id: 'TEST-F-2', difficulte: 'facile', points: 10,
    texte: '[TEST] Faire un compliment sur les chaussures de quelqu\'un.', preuveRequise: false,
  },
  {
    id: 'TEST-F-3', difficulte: 'facile', points: 10,
    texte: '[TEST] Bailler de façon exagérée trois fois.', preuveRequise: true,
  },
  {
    id: 'TEST-M-1', difficulte: 'moyenne', points: 20,
    texte: '[TEST] Convaincre quelqu\'un d\'écouter une chanson précise.', preuveRequise: false,
  },
  {
    id: 'TEST-M-2', difficulte: 'moyenne', points: 20,
    texte: '[TEST] Raconter un rêve inventé de toutes pièces.', preuveRequise: false,
  },
  {
    id: 'TEST-M-3', difficulte: 'moyenne', points: 20,
    texte: '[TEST] Faire croire à une panne de wifi.', preuveRequise: true,
  },
  {
    id: 'TEST-D-1', difficulte: 'difficile', points: 40,
    texte: '[TEST] Porter un vêtement de quelqu\'un d\'autre une heure.', preuveRequise: true,
  },
  {
    id: 'TEST-D-2', difficulte: 'difficile', points: 40,
    texte: '[TEST] Simuler une conversation téléphonique fictive.', preuveRequise: false,
  },
  {
    id: 'TEST-D-3', difficulte: 'difficile', points: 40,
    texte: '[TEST] Convaincre le groupe de changer d\'activité.', preuveRequise: false,
  },
  {
    id: 'TEST-D-4', difficulte: 'difficile', points: 40,
    texte: '[TEST] Faire porter un accessoire ridicule à quelqu\'un 30 min.', preuveRequise: true,
  },
];

// ---------------------------------------------------------------------------
// Initialisation / réinitialisation du bac à sable
// ---------------------------------------------------------------------------

// Remet TEST1 et TEST2 à un état neuf (40 pts, aucune mission active, aucun objet actif)
export async function reinitialiserJoueursTest() {
  await Promise.all(TEST_JOUEURS.map((pseudo) => setDoc(doc(joueursTestRef, pseudo), {
    pseudo,
    score: 40,
    missionActive: null,
    amnesieActiveJusqua: null,
    prochaineMissionForceeDifficile: null,
    geleJusqua: null,
    casinoBeneficeJour: 0,
    casinoDateJour: null,
    createdAt: new Date().toISOString(),
  })));
}

// Remet les 10 missions de test à 'disponible', sans exclusions ni compteur d'abandons
export async function reinitialiserMissionsTest() {
  const batch = writeBatch(db);
  MISSIONS_TEST_SEED.forEach((m) => {
    batch.set(doc(missionsTestRef, m.id), {
      ...m,
      saison: 1,
      statut: 'disponible',
      joueurActuel: null,
      joueursExclus: [],
      nombreAbandons: 0,
    });
  });
  await batch.commit();
}

// Vide les accusations, le journal et les événements de test en attente (les marque traitées,
// pour repartir sur un Tribunal de test propre)
export async function reinitialiserHistoriqueTest() {
  const [accSnap, jourSnap] = await Promise.all([
    getDocs(query(accusationsTestRef, where('statut', '==', 'en_attente'))),
    getDocs(query(journalTestRef, where('statut', '==', 'en_attente'))),
  ]);
  const batch = writeBatch(db);
  accSnap.forEach((d) => batch.update(d.ref, { statut: 'traitee', resultat: 'reset_test' }));
  jourSnap.forEach((d) => batch.update(d.ref, { statut: 'validee_tribunal', decisionAdmin: 'reset_test' }));
  await batch.commit();
}

// Réinitialisation complète en un clic : joueurs + missions + historique
export async function reinitialiserBacASable() {
  await reinitialiserJoueursTest();
  await reinitialiserMissionsTest();
  await reinitialiserHistoriqueTest();
}

export async function verifierBacASableInitialise() {
  const snap = await getDoc(doc(joueursTestRef, 'TEST1'));
  return snap.exists();
}

// ---------------------------------------------------------------------------
// Joueurs de test
// ---------------------------------------------------------------------------

export function ecouterJoueurTest(pseudo, callback) {
  return onSnapshot(doc(joueursTestRef, pseudo), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function ecouterTousJoueursTest(callback) {
  return onSnapshot(joueursTestRef, (snap) => {
    const joueurs = {};
    snap.forEach((d) => { joueurs[d.id] = d.data(); });
    callback(joueurs);
  });
}

export async function ajusterScoreTest(pseudo, delta) {
  const ref = doc(joueursTestRef, pseudo);
  const snap = await getDoc(ref);
  const scoreActuel = snap.exists() ? (snap.data().score || 0) : 0;
  const nouveauScore = Math.max(0, scoreActuel + delta);
  await updateDoc(ref, { score: nouveauScore });
}

export async function mettreAJourJoueurTest(pseudo, data) {
  await updateDoc(doc(joueursTestRef, pseudo), data);
}

export async function definirMissionActiveTest(pseudo, mission) {
  await updateDoc(doc(joueursTestRef, pseudo), { missionActive: mission });
}

export async function retirerMissionActiveTest(pseudo) {
  await updateDoc(doc(joueursTestRef, pseudo), { missionActive: null });
}

// ---------------------------------------------------------------------------
// Missions de test
// ---------------------------------------------------------------------------

export async function piocherMissionTest(pseudo, difficulteForcee) {
  const contraintes = [where('statut', '==', 'disponible')];
  if (difficulteForcee) contraintes.push(where('difficulte', '==', difficulteForcee));
  const snap = await getDocs(query(missionsTestRef, ...contraintes));
  if (snap.empty) return null;
  const eligibles = snap.docs.filter((d) => {
    const exclus = d.data().joueursExclus || [];
    return !exclus.includes(pseudo);
  });
  if (eligibles.length === 0) return null;
  const choix = eligibles[Math.floor(Math.random() * eligibles.length)];
  return { id: choix.id, ...choix.data() };
}

export async function marquerMissionActiveTest(missionId, pseudo) {
  await updateDoc(doc(missionsTestRef, missionId), { statut: 'active', joueurActuel: pseudo });
}

export async function bruleMissionTest(missionId) {
  await updateDoc(doc(missionsTestRef, missionId), { statut: 'brulee', joueurActuel: null });
}

export async function remettreDisponibleTest(missionId) {
  await updateDoc(doc(missionsTestRef, missionId), { statut: 'disponible', joueurActuel: null });
}

export async function remettreDisponibleApresAbandonTest(missionId, pseudo) {
  const snap = await getDoc(doc(missionsTestRef, missionId));
  const actuel = snap.exists() ? snap.data() : {};
  const exclus = actuel.joueursExclus || [];
  const nbAbandons = actuel.nombreAbandons || 0;
  await updateDoc(doc(missionsTestRef, missionId), {
    statut: 'disponible',
    joueurActuel: null,
    joueursExclus: exclus.includes(pseudo) ? exclus : [...exclus, pseudo],
    nombreAbandons: nbAbandons + 1,
  });
}

export function ecouterStatsMissionsTest(callback) {
  return onSnapshot(missionsTestRef, (snap) => {
    let disponibles = 0, actives = 0, brulees = 0;
    snap.forEach((d) => {
      const s = d.data().statut;
      if (s === 'disponible') disponibles++;
      else if (s === 'active') actives++;
      else if (s === 'brulee') brulees++;
    });
    callback({ disponibles, actives, brulees, total: snap.size });
  });
}

export async function sabrerMissionCibleTest(pseudoCible, missionIdActuelle) {
  await updateDoc(doc(missionsTestRef, missionIdActuelle), { statut: 'disponible', joueurActuel: null });
  const nouvelle = await piocherMissionTest(pseudoCible);
  if (nouvelle) {
    await marquerMissionActiveTest(nouvelle.id, pseudoCible);
    await mettreAJourJoueurTest(pseudoCible, {
      missionActive: {
        missionId: nouvelle.id,
        texte: nouvelle.texte,
        difficulte: nouvelle.difficulte,
        points: nouvelle.points,
        preuveRequise: nouvelle.preuveRequise,
        nombreAbandons: nouvelle.nombreAbandons || 0,
        effetDeLevier: false,
        dateAcceptation: new Date().toISOString(),
      },
    });
  } else {
    await retirerMissionActiveTest(pseudoCible);
  }
}

// ---------------------------------------------------------------------------
// Accusations de test
// ---------------------------------------------------------------------------

export async function creerAccusationTest({ accusateur, accuse, description }) {
  await addDoc(accusationsTestRef, {
    accusateur, accuse, description,
    statut: 'en_attente',
    resultat: null,
    createdAt: new Date().toISOString(),
  });
}

export function ecouterAccusationsTestEnAttente(callback) {
  const q = query(accusationsTestRef, where('statut', '==', 'en_attente'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    callback(items);
  }, (erreur) => {
    console.error('Erreur écoute accusations test:', erreur);
  });
}

export async function traiterAccusationTest(id, resultat) {
  await updateDoc(doc(accusationsTestRef, id), {
    statut: 'traitee', resultat, traiteeAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Journal de test (missions terminées/abandonnées en attente de "Tribunal test")
// ---------------------------------------------------------------------------

export async function ajouterEntreeJournalTest(entree) {
  await addDoc(journalTestRef, {
    ...entree,
    statut: 'en_attente',
    createdAt: new Date().toISOString(),
  });
}

export function ecouterJournalTestEnAttente(callback) {
  const q = query(journalTestRef, where('statut', '==', 'en_attente'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    callback(items);
  }, (erreur) => {
    console.error('Erreur écoute journal test:', erreur);
  });
}

export async function cloturerEntreeJournalTest(id, decision) {
  await updateDoc(doc(journalTestRef, id), {
    statut: 'validee_tribunal', decisionAdmin: decision, traiteeAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Événements de test (Journal public de test — jamais mélangé au vrai Journal)
// ---------------------------------------------------------------------------

export async function ajouterEvenementTest(texte) {
  await addDoc(evenementsTestRef, { texte, createdAt: new Date().toISOString() });
}

export function ecouterEvenementsTest(callback) {
  return onSnapshot(evenementsTestRef, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    callback(items);
  }, (erreur) => {
    console.error('Erreur écoute événements test:', erreur);
  });
}

export { TEST_JOUEURS };
