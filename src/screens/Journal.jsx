import { useEffect, useRef, useState } from 'react';
import { ecouterEvenements } from '../firebase/evenements';

function formaterHeure(dateIso) {
  return new Date(dateIso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formaterJour(dateIso) {
  return new Date(dateIso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Journal() {
  const [evenements, setEvenements] = useState([]);
  const finDeListeRef = useRef(null);

  useEffect(() => {
    const unsub = ecouterEvenements(setEvenements);
    return unsub;
  }, []);

  useEffect(() => {
    finDeListeRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [evenements.length]);

  // Regroupement par jour pour insérer un séparateur de date dans le fil
  let dernierJourAffiche = null;

  return (
    <div className="journal-screen">
      <h2 className="dashboard-title">📰 Journal</h2>
      <p className="dashboard-note">Ce que tout le monde sait — les rumeurs et faits publics de la partie.</p>

      <div className="journal-fil">
        {evenements.length === 0 && (
          <p className="empty-state">Rien à signaler pour l'instant...</p>
        )}
        {evenements.map((evt) => {
          const jourEvt = formaterJour(evt.createdAt);
          const afficherSeparateur = jourEvt !== dernierJourAffiche;
          dernierJourAffiche = jourEvt;
          return (
            <div key={evt.id}>
              {afficherSeparateur && (
                <div className="journal-separateur-jour">{jourEvt}</div>
              )}
              <div className="journal-bulle">
                <span className="journal-heure">{formaterHeure(evt.createdAt)}</span>
                <span className="journal-texte">{evt.texte}</span>
              </div>
            </div>
          );
        })}
        <div ref={finDeListeRef} />
      </div>
    </div>
  );
}
