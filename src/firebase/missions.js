import {
  doc, getDocs, updateDoc, query, collection, where, writeBatch, onSnapshot, limit,
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

// Tire une mission aléatoire disponible pour une saison donnée
export async function piocherMission(saison) {
  const q = query(
    missionsRef,
    where('saison', '==', saison),
    where('statut', '==', 'disponible'),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docs = snap.docs;
  const choix = docs[Math.floor(Math.random() * docs.length)];
  return { id: choix.id, ...choix.data() };
}

export async function marquerMissionActive(missionId, pseudo) {
  await updateDoc(doc(missionsRef, missionId), {
    statut: 'active',
    joueurActuel: pseudo,
  });
}

// Mission définitivement brûlée : usage unique, ne sera plus jamais proposée
export async function bruleMission(missionId) {
  await updateDoc(doc(missionsRef, missionId), {
    statut: 'brulee',
    joueurActuel: null,
  });
}

// Remet une mission disponible (ex: abandon → elle redevient piochable, ou correction admin)
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

  const nouvelle = await piocherMission(saison);

  if (nouvelle) {
    await marquerMissionActive(nouvelle.id, pseudoCible);
    await mettreAJourJoueur(pseudoCible, {
      missionActive: {
        missionId: nouvelle.id,
        texte: nouvelle.texte,
        difficulte: nouvelle.difficulte,
        points: nouvelle.points,
        preuveRequise: nouvelle.preuveRequise,
        effetDeLevier: false,
        dateAcceptation: new Date().toISOString(),
      },
    });
  } else {
    await retirerMissionActive(pseudoCible);
  }
}
