import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { piocherMission, marquerMissionActive, bruleMission, remettreDisponible } from '../firebase/missions';
import { ajusterScore, definirMissionActive, retirerMissionActive, mettreAJourJoueur } from '../firebase/joueurs';
import { ajouterEntreeJournal } from '../firebase/journal';
import { POINTS } from '../utils/constants';

const LABELS_DIFFICULTE = { facile: 'Facile', moyenne: 'Moyenne', difficile: 'Difficile' };

export default function Missions() {
  const { pseudo, joueur, saison } = useGame();
  const [propositionCourante, setPropositionCourante] = useState(null);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [confirmationReussite, setConfirmationReussite] = useState(false);

  const missionActive = joueur?.missionActive || null;

  // Si aucune mission active et aucune proposition en attente, on pioche automatiquement
  useEffect(() => {
    if (!missionActive && !propositionCourante && saison > 0) {
      piocher();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionActive, saison]);

  async function piocher() {
    setErreur(null);
    setChargementAction(true);
    try {
      const mission = await piocherMission(saison);
      if (!mission) {
        setErreur("Plus aucune mission disponible pour l'instant dans cette saison.");
        setPropositionCourante(null);
      } else {
        setPropositionCourante(mission);
      }
    } finally {
      setChargementAction(false);
    }
  }

  async function passer() {
    setChargementAction(true);
    try {
      await ajusterScore(pseudo, POINTS.passer);
      setPropositionCourante(null);
      await piocher();
    } finally {
      setChargementAction(false);
    }
  }

  async function accepter(avecLevier) {
    if (!propositionCourante) return;
    setChargementAction(true);
    try {
      if (avecLevier) {
        await ajusterScore(pseudo, POINTS.effetDeLevierCout);
      }
      await marquerMissionActive(propositionCourante.id, pseudo);
      await definirMissionActive(pseudo, {
        missionId: propositionCourante.id,
        texte: propositionCourante.texte,
        difficulte: propositionCourante.difficulte,
        points: propositionCourante.points,
        preuveRequise: propositionCourante.preuveRequise,
        effetDeLevier: avecLevier,
        dateAcceptation: new Date().toISOString(),
      });
      setPropositionCourante(null);
    } finally {
      setChargementAction(false);
    }
  }

  async function confirmerReussite() {
    if (!missionActive) return;
    setChargementAction(true);
    try {
      const pointsGagnes = missionActive.effetDeLevier ? missionActive.points * 2 : missionActive.points;
      await ajusterScore(pseudo, pointsGagnes);
      await ajouterEntreeJournal({
        pseudo,
        missionId: missionActive.missionId,
        texte: missionActive.texte,
        difficulte: missionActive.difficulte,
        points: pointsGagnes,
        effetDeLevier: missionActive.effetDeLevier,
        preuveRequise: missionActive.preuveRequise,
        type: 'reussie',
      });
      await bruleMission(missionActive.missionId);
      await retirerMissionActive(pseudo);
      setConfirmationReussite(false);
    } finally {
      setChargementAction(false);
    }
  }

  async function abandonner() {
    if (!missionActive) return;
    setChargementAction(true);
    try {
      const aAmnesie = (joueur.inventaire?.amnesieDisponible || 0) > 0;
      if (aAmnesie) {
        await mettreAJourJoueur(pseudo, { 'inventaire.amnesieDisponible': (joueur.inventaire.amnesieDisponible - 1) });
      } else {
        await ajusterScore(pseudo, POINTS.abandonner);
      }
      await ajouterEntreeJournal({
        pseudo,
        missionId: missionActive.missionId,
        texte: missionActive.texte,
        difficulte: missionActive.difficulte,
        points: 0,
        effetDeLevier: missionActive.effetDeLevier,
        preuveRequise: missionActive.preuveRequise,
        type: 'abandonnee',
      });
      await remettreDisponible(missionActive.missionId);
      await retirerMissionActive(pseudo);
    } finally {
      setChargementAction(false);
    }
  }

  if (saison === 0) {
    return <div className="missions-screen"><p className="empty-state">Le jeu n'a pas encore commencé. Rendez-vous le 6 août !</p></div>;
  }

  return (
    <div className="missions-screen">
      {missionActive ? (
        <div className="mission-card mission-active">
          <div className="mission-badge-row">
            <span className={`badge badge-${missionActive.difficulte}`}>{LABELS_DIFFICULTE[missionActive.difficulte]}</span>
            <span className="badge badge-points">
              {missionActive.effetDeLevier ? `${missionActive.points * 2} pts (levier)` : `${missionActive.points} pts`}
            </span>
            {missionActive.preuveRequise && <span className="badge badge-preuve">📷 Preuve requise</span>}
          </div>
          <p className="mission-texte">{missionActive.texte}</p>

          {!confirmationReussite ? (
            <div className="mission-actions">
              <button className="btn btn-success" onClick={() => setConfirmationReussite(true)} disabled={chargementAction}>
                ✅ Mission accomplie
              </button>
              <button className="btn btn-danger" onClick={abandonner} disabled={chargementAction}>
                ❌ Abandonner (-5 pts{(joueur.inventaire?.amnesieDisponible || 0) > 0 ? ' — Amnésie dispo' : ''})
              </button>
            </div>
          ) : (
            <div className="confirmation-box">
              <p>Confirmer que tu as bien réalisé cette mission ?</p>
              {missionActive.preuveRequise && (
                <p className="warning-text">⚠️ Cette mission nécessite une preuve (photo/vidéo) ou un témoin, sinon elle pourra être invalidée au Tribunal.</p>
              )}
              <div className="mission-actions">
                <button className="btn btn-success" onClick={confirmerReussite} disabled={chargementAction}>Confirmer</button>
                <button className="btn btn-secondary" onClick={() => setConfirmationReussite(false)}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      ) : propositionCourante ? (
        <div className="mission-card">
          <div className="mission-badge-row">
            <span className={`badge badge-${propositionCourante.difficulte}`}>{LABELS_DIFFICULTE[propositionCourante.difficulte]}</span>
            <span className="badge badge-points">{propositionCourante.points} pts</span>
            {propositionCourante.preuveRequise && <span className="badge badge-preuve">📷 Preuve requise</span>}
          </div>
          <p className="mission-texte">{propositionCourante.texte}</p>
          <div className="mission-actions">
            <button className="btn btn-primary" onClick={() => accepter(false)} disabled={chargementAction}>
              Accepter
            </button>
            <button
              className="btn btn-levier"
              onClick={() => accepter(true)}
              disabled={chargementAction || (joueur?.score || 0) < 15}
              title={(joueur?.score || 0) < 15 ? 'Solde insuffisant (15 pts requis)' : 'Double les points si réussite, perte normale si échec'}
            >
              ⚡ Accepter avec Effet de Levier (-15 pts)
            </button>
            <button className="btn btn-secondary" onClick={passer} disabled={chargementAction}>
              Passer (-2 pts)
            </button>
          </div>
        </div>
      ) : (
        <div className="mission-card">
          {erreur ? <p className="warning-text">{erreur}</p> : <p className="empty-state">Chargement d'une mission...</p>}
          <button className="btn btn-primary" onClick={piocher} disabled={chargementAction}>Réessayer</button>
        </div>
      )}
    </div>
  );
}
