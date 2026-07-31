import {
  addDoc, collection, onSnapshot, query, where, updateDoc, doc, orderBy,
} from 'firebase/firestore';
import { db } from './config';

const accusationsRef = collection(db, 'accusations');

export async function creerAccusation({ accusateur, accuse, description }) {
  await addDoc(accusationsRef, {
    accusateur,
    accuse,
    description,
    statut: 'en_attente', // 'en_attente' | 'traitee'
    resultat: null, // 'fausse' | 'validee' | 'delit_initie' | 'annulee_cape'
    createdAt: new Date().toISOString(),
  });
}

export function ecouterAccusationsEnAttente(callback) {
  const q = query(accusationsRef, where('statut', '==', 'en_attente'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function traiterAccusation(accusationId, resultat) {
  await updateDoc(doc(accusationsRef, accusationId), {
    statut: 'traitee',
    resultat,
    traiteeAt: new Date().toISOString(),
  });
}

export async function supprimerAccusationBug(accusationId) {
  // Utilisé par le God Mode : suppression pure et simple, hors process Tribunal
  await updateDoc(doc(accusationsRef, accusationId), {
    statut: 'traitee',
    resultat: 'supprimee_bug',
    traiteeAt: new Date().toISOString(),
  });
}
