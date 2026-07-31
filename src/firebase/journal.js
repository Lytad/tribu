import {
  addDoc, collection, onSnapshot, query, where, updateDoc, doc, orderBy,
} from 'firebase/firestore';
import { db } from './config';

// Une entrée est créée chaque fois qu'un joueur clique "Mission accomplie" ou "Abandonner".
// Elle reste "en_attente" jusqu'au passage au Tribunal (peut être reportée plusieurs soirs).
const journalRef = collection(db, 'journal');

export async function ajouterEntreeJournal({
  pseudo, missionId, texte, difficulte, points, effetDeLevier, preuveRequise, type,
}) {
  // type: 'reussie' | 'abandonnee'
  await addDoc(journalRef, {
    pseudo,
    missionId,
    texte,
    difficulte,
    points,
    effetDeLevier: !!effetDeLevier,
    preuveRequise: !!preuveRequise,
    type,
    statut: 'en_attente', // 'en_attente' | 'validee_tribunal'
    createdAt: new Date().toISOString(),
  });
}

export function ecouterJournalEnAttente(callback) {
  const q = query(journalRef, where('statut', '==', 'en_attente'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function cloturerEntreeJournal(entreeId, decisionAdmin) {
  // decisionAdmin: 'validee' | 'invalidee_preuve'
  await updateDoc(doc(journalRef, entreeId), {
    statut: 'validee_tribunal',
    decisionAdmin,
    traiteeAt: new Date().toISOString(),
  });
}
