import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ecouterJournalEnAttente, cloturerEntreeJournal } from '../../firebase/journal';
import { ecouterAccusationsEnAttente, traiterAccusation } from '../../firebase/accusations';
import { ajusterScore, mettreAJourJoueur } from '../../firebase/joueurs';
import { POINTS, heureDecimale, HEURE_DEBUT_TRIBUNAL, HEURE_FIN_TRIBUNAL } from '../../utils/constants';
import { useEffect } from 'react';

export default function Tribunal() {
  const { tousJoueurs } = useGame();
  const [journal, setJournal] = useState([]);
  const [accusations, setAccusations] = useState([]);
  const [accusationOuverte, setAccusationOuverte] = useState(null);
  const [missionChoisie, setMissionChoisie] = useState('');

  const heureActuelle = heureDecimale();
  const dansLaFenetre = heureActuelle >= HEURE_DEBUT_TRIBUNAL || heureActuelle < HEURE_FIN_TRIBUNAL - 24 + 24; // toujours vrai la nuit ; on affiche juste un avertissement hors fenêtre

  useEffect(() => {
    const unsub1 = ecouterJournalEnAttente(setJournal);
    const unsub2 = ecouterAccusationsEnAttente(setAccusations);
    return () => { unsub1(); unsub2(); };
  }, []);

  const missionsReussiesOuAbandonnees = journal;

  async function validerMissionEntree(entree) {
    await cloturerEntreeJournal(entree.id, 'validee');
    // Les points ont déjà été crédités au moment du clic joueur ; le Tribunal officialise (scoreValide)
    await ajusterScore(entree.pseudo, 0); // no-op, garde traçabilité
    await mettreAJourJoueur(entree.pseudo, {});
  }

  async function invaliderMissionEntree(entree) {
    await cloturerEntreeJournal(entree.id, 'invalidee_preuve');
    if (entree.type === 'reussie') {
      // Le joueur perd les points gagnés temporairement, sans malus supplémentaire
      await ajusterScore(entree.pseudo, -entree.points);
    }
  }

  function ouvrirJugement(accusation) {
    setAccusationOuverte(accusation);
    setMissionChoisie('');
  }

  async function jugerFausseAccusation() {
    if (!accusationOuverte) return;
    await ajusterScore(accusationOuverte.accusateur, POINTS.fausseAccusation);
    await traiterAccusation(accusationOuverte.id, 'fausse');
    setAccusationOuverte(null);
  }

  async function jugerAccusationValidee() {
    if (!accusationOuverte) return;
    const accuseData = tousJoueurs[accusationOuverte.accuse];
    const capeDispo = (accuseData?.inventaire?.capeInvisibilite || 0) > 0;

    if (capeDispo) {
      // La cape annule l'accusation contre l'accusé, mais l'accusateur perd quand même ses points
      await mettreAJourJoueur(accusationOuverte.accuse, {
        'inventaire.capeInvisibilite': accuseData.inventaire.capeInvisibilite - 1,
      });
      await ajusterScore(accusationOuverte.accusateur, POINTS.fausseAccusation);
      await traiterAccusation(accusationOuverte.id, 'annulee_cape');
      setAccusationOuverte(null);
      return;
    }

    const missionActiveAccuse = accuseData?.missionActive;
    const pointsMission = missionActiveAccuse?.points || 0;

    // L'accusé perd les points de la mission qu'il pensait valider + malus -10
    await ajusterScore(accusationOuverte.accuse, -(pointsMission + Math.abs(POINTS.accuseMalus)));
    // L'accusateur vole le pactole complet (points de la mission + 10)
    await ajusterScore(accusationOuverte.accusateur, pointsMission + 10);

    await traiterAccusation(accusationOuverte.id, 'validee');
    setAccusationOuverte(null);
  }

  async function jugerDelitInitie() {
    if (!accusationOuverte) return;
    await ajusterScore(accusationOuverte.accusateur, POINTS.delitInitieMalus);
    await ajusterScore(accusationOuverte.accuse, POINTS.delitInitieMalus);
    await traiterAccusation(accusationOuverte.id, 'delit_initie');
    setAccusationOuverte(null);
  }

  return (
    <div className="tribunal-screen">
      <h2 className="dashboard-title">⚖️ Tribunal du Soir</h2>
      {!dansLaFenetre && (
        <p className="warning-text">Hors fenêtre habituelle (21h00–00h00), mais tu peux quand même traiter le report.</p>
      )}

      <section className="tribunal-section">
        <h3>Débrief — Missions terminées / abandonnées en attente</h3>
        {missionsReussiesOuAbandonnees.length === 0 && <p className="empty-state">Rien en attente.</p>}
        {missionsReussiesOuAbandonnees.map((entree) => (
          <div key={entree.id} className="tribunal-item">
            <div className="tribunal-item-header">
              <strong>{entree.pseudo}</strong>
              <span className={`badge ${entree.type === 'reussie' ? 'badge-success' : 'badge-danger'}`}>
                {entree.type === 'reussie' ? 'Réussie' : 'Abandonnée'}
              </span>
              {entree.preuveRequise && <span className="badge badge-preuve">📷 Preuve requise</span>}
            </div>
            <p>{entree.texte}</p>
            <p className="dashboard-note">{entree.points} pts {entree.effetDeLevier && '(effet de levier)'}</p>
            {entree.type === 'reussie' && entree.preuveRequise && (
              <div className="mission-actions">
                <button className="btn btn-success" onClick={() => validerMissionEntree(entree)}>Preuve OK — Valider</button>
                <button className="btn btn-danger" onClick={() => invaliderMissionEntree(entree)}>Pas de preuve — Invalider</button>
              </div>
            )}
            {(entree.type === 'abandonnee' || !entree.preuveRequise) && (
              <button className="btn btn-secondary" onClick={() => validerMissionEntree(entree)}>Acter (clore)</button>
            )}
          </div>
        ))}
      </section>

      <section className="tribunal-section">
        <h3>Accusations en attente</h3>
        {accusations.length === 0 && <p className="empty-state">Aucune accusation en attente.</p>}
        {accusations.map((acc) => (
          <div key={acc.id} className="tribunal-item">
            <p><strong>{acc.accusateur}</strong> accuse <strong>{acc.accuse}</strong></p>
            <p className="dashboard-note">« {acc.description} »</p>
            <button className="btn btn-primary" onClick={() => ouvrirJugement(acc)}>Juger maintenant</button>
          </div>
        ))}
      </section>

      {accusationOuverte && (
        <div className="modal-overlay" onClick={() => setAccusationOuverte(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Jugement : {accusationOuverte.accusateur} vs {accusationOuverte.accuse}</h3>
            <p className="dashboard-note">« {accusationOuverte.description} »</p>
            <p>Mission réelle de {accusationOuverte.accuse} : <strong>{tousJoueurs[accusationOuverte.accuse]?.missionActive?.texte || 'Aucune mission active'}</strong></p>

            <div className="mission-actions" style={{ flexDirection: 'column' }}>
              <button className="btn btn-secondary" onClick={jugerFausseAccusation}>
                Fausse accusation (-10 pts accusateur)
              </button>
              <button className="btn btn-success" onClick={jugerAccusationValidee}>
                Accusation validée (accusé perd mission + 10, accusateur vole le pactole)
              </button>
              <button className="btn btn-danger" onClick={jugerDelitInitie}>
                Délit d'initié / triche avérée (-30 pts aux deux)
              </button>
            </div>
            <button className="btn btn-secondary" onClick={() => setAccusationOuverte(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
