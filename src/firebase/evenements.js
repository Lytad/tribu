import {
  addDoc, collection, onSnapshot, query, orderBy, limit,
} from 'firebase/firestore';
import { db } from './config';

// Fil d'actualité public : chaque entrée est un texte prêt à afficher, déjà anonymisé ou
// nommé selon la règle décidée pour chaque type d'événement. Personne ne peut modifier ou
// supprimer une entrée depuis l'interface joueur — c'est un historique en lecture seule.
const evenementsRef = collection(db, 'evenements');

export async function ajouterEvenement(texte) {
  await addDoc(evenementsRef, {
    texte,
    createdAt: new Date().toISOString(),
  });
}

// Les 200 derniers événements suffisent largement pour 10 jours de jeu ; on garde une limite
// pour éviter de charger un historique illimité si jamais la partie s'éternisait.
export function ecouterEvenements(callback) {
  const q = query(evenementsRef, orderBy('createdAt', 'asc'), limit(200));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
