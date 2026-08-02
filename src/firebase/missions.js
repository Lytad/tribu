import {
  doc, getDocs, getDoc, updateDoc, query, collection, where, writeBatch, onSnapshot, limit, runTransaction,
} from 'firebase/firestore';
import { db } from './config';
import missionsSeed from '../data/missions.seed.json';
import { mettreAJourJoueur, retirerMissionActive } from './joueurs';

const missionsRef = collection(db, 'missions');

// À appeler UNE SEULE FOIS (bouton God Mode "Initialiser la base de missions")
// Écrit les 430 missions dans Firestore par lots de 400 max (limite Firestore par batch = 500)
export async function initialiserMissions(onProgress) {
  const chunks = [];
  for (let i = 0; i < missionsSeed.length; i += 400) {
    chunks.push(missionsSeed.slice(i, i + 400));
  }
  let done = 0;
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((m) => {
      batch.set(doc(missionsRef, m.id), m);
    });
    await batch.commit();
    done += chunk.length;
    onProgress?.(done, missionsSeed.length);
  }
}

// Tire une mission aléatoire disponible pour une saison donnée, en excluant les missions
// que ce joueur a déjà abandonnées auparavant (il ne doit jamais la revoir).
export async function piocherMission(saison, pseudo) {
  const q = query(
    missionsRef,
    where('saison', '==', saison),
    where('statut', '==', 'disponible'),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docsEligibles = snap.docs.filter((d) => {
    const exclus = d.data().joueursExclus || [];
    return !pseudo || !exclus.includes(pseudo);
  });
  if (docsEligibles.length === 0) return null;
  const choix = docsEligibles[Math.floor(Math.random() * docsEligibles.length)];
  return { id: choix.id, ...choix.data() };
}

// Marque une mission comme active pour un joueur, en toute sécurité : si un autre joueur l'a
// déjà acceptée entre-temps (statut plus 'disponible'), l'opération échoue au lieu d'écraser
// silencieusement l'assignation de l'autre joueur.
export async function marquerMissionActive(missionId, pseudo) {
  const ref = doc(missionsRef, missionId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists() || snap.data().statut !== 'disponible') {
      throw new Error('MISSION_DEJA_PRISE');
    }
    transaction.update(ref, { statut: 'active', joueurActuel: pseudo });
  });
}

// Mission définitivement brûlée : usage unique, ne sera plus jamais proposée
export async function bruleMission(missionId) {
  await updateDoc(doc(missionsRef, missionId), {
    statut: 'brulee',
    joueurActuel: null,
  });
}

// Remet une mission disponible après un abandon : elle redevient piochable pour tout le
// monde SAUF pour le joueur qui vient de l'abandonner (il ne doit plus jamais la revoir).
// On incrémente aussi le compteur d'abandons, affiché aux futurs joueurs comme avertissement.
export async function remettreDisponibleApresAbandon(missionId, pseudo) {
  const snap = await getDocs(query(missionsRef, where('__name__', '==', missionId)));
  const actuel = snap.empty ? {} : snap.docs[0].data();
  const exclusActuels = actuel.joueursExclus || [];
  const nombreAbandonsActuel = actuel.nombreAbandons || 0;

  await updateDoc(doc(missionsRef, missionId), {
    statut: 'disponible',
    joueurActuel: null,
    joueursExclus: pseudo && !exclusActuels.includes(pseudo) ? [...exclusActuels, pseudo] : exclusActuels,
    nombreAbandons: nombreAbandonsActuel + 1,
  });
}

// Remet une mission disponible sans exclusion (ex: correction admin, sabotage) — n'incrémente
// pas le compteur d'abandons puisque ce n'est pas un abandon volontaire du joueur.
export async function remettreDisponible(missionId) {
  await updateDoc(doc(missionsRef, missionId), {
    statut: 'disponible',
    joueurActuel: null,
  });
}

export function ecouterStatsMissions(saison, callback) {
  const q = query(missionsRef, where('saison', '==', saison));
  return onSnapshot(q, (snap) => {
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

export async function verifierBaseInitialisee() {
  const q = query(missionsRef, limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

// Sabotage : la mission en cours de la cible est libérée (remise disponible),
// puis une nouvelle mission aléatoire lui est piochée et assignée directement.
export async function sabrerMissionCible(pseudoCible, missionIdActuelle) {
  const ancienneSnap = await getDocs(query(missionsRef, where('__name__', '==', missionIdActuelle)));
  const saison = ancienneSnap.empty ? 1 : ancienneSnap.docs[0].data().saison;

  await updateDoc(doc(missionsRef, missionIdActuelle), { statut: 'disponible', joueurActuel: null });

  const nouvelle = await piocherMission(saison, pseudoCible);

  if (nouvelle) {
    await marquerMissionActive(nouvelle.id, pseudoCible);
    await mettreAJourJoueur(pseudoCible, {
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
    await retirerMissionActive(pseudoCible);
  }
}
