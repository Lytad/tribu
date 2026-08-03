import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { piocherMission, marquerMissionActive, bruleMission, remettreDisponibleApresAbandon } from '../firebase/missions';
import { ajusterScore, definirMissionActive, retirerMissionActive, mettreAJourJoueur } from '../firebase/joueurs';
import { ajouterEntreeJournal } from '../firebase/journal';
import { ajouterEvenement } from '../firebase/evenements';
import {
  piocherMissionTest, marquerMissionActiveTest, bruleMissionTest, remettreDisponibleApresAbandonTest,
  ajusterScoreTest, definirMissionActiveTest, retirerMissionActiveTest, mettreAJourJoueurTest,
  ajouterEntreeJournalTest, ajouterEvenementTest,
} from '../firebase/sandbox';
import { POINTS } from '../utils/constants';

const LABELS_DIFFICULTE = { facile: 'Facile', moyenne: 'Moyenne', difficile: 'Difficile' };
const LABELS_DIFFICULTE_MAJ = { facile: 'FACILE', moyenne: 'MOYENNE', difficile: 'DIFFICILE' };

export default function Missions() {
  const { pseudo, joueur, saison, modeTest, estPartieTerminee } = useGame();
  const [propositionCourante, setPropositionCourante] = useState(null);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [confirmationReussite, setConfirmationReussite] = useState(false);

  // Sélection des fonctions réelles ou de test selon le mode actif — un seul point de
  // bascule, le reste du composant ne s'en soucie plus.
  const fn = modeTest ? {
    piocherMission: piocherMissionTest,
    marquerMissionActive: marquerMissionActiveTest,
    bruleMission: bruleMissionTest,
    remettreDisponibleApresAbandon: remettreDisponibleApresAbandonTest,
    ajusterScore: ajusterScoreTest,
    definirMissionActive: definirMissionActiveTest,
    retirerMissionActive: retirerMissionActiveTest,
    mettreAJourJoueur: mettreAJourJoueurTest,
    ajouterEntreeJournal: ajouterEntreeJournalTest,
    ajouterEvenement: ajouterEvenementTest,
  } : {
    piocherMission, marquerMissionActive, bruleMission, remettreDisponibleApresAbandon,
    ajusterScore, definirMissionActive, retirerMissionActive, mettreAJourJoueur,
    ajouterEntreeJournal, ajouterEvenement,
  };

  const missionActive = joueur?.missionActive || null;

  // Si aucune mission active et aucune proposition en attente, on pioche automatiquement
  useEffect(() => {
    if (!missionActive && !propositionCourante && (saison > 0 || modeTest) && !estPartieTerminee) {
      piocher();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionActive, saison, modeTest, estPartieTerminee]);

  async function piocher() {
    setErreur(null);
    setChargementAction(true);
    try {
      const difficulteForcee = joueur?.prochaineMissionForceeDifficile || null;
      const mission = modeTest
        ? await fn.piocherMission(pseudo, difficulteForcee)
        : await fn.piocherMission(saison, pseudo, difficulteForcee);
      if (difficulteForcee) {
        // Le Ralentissement ne s'applique qu'une seule fois : on le consomme dès qu'on
        // a tenté de piocher avec, qu'une mission ait été trouvée ou non.
        await fn.mettreAJourJoueur(pseudo, { prochaineMissionForceeDifficile: null });
      }
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
      await fn.ajusterScore(pseudo, POINTS.passer);
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
      // On tente d'abord de sécuriser la mission (transaction en mode réel) AVANT de débiter
      // les points, pour ne jamais faire payer un joueur pour une mission déjà prise ailleurs.
      try {
        await fn.marquerMissionActive(propositionCourante.id, pseudo);
      } catch (err) {
        if (err.message === 'MISSION_DEJA_PRISE') {
          setErreur('Cette mission vient d\'être prise par quelqu\'un d\'autre — une nouvelle t\'est proposée.');
          setPropositionCourante(null);
          await piocher();
          return;
        }
        throw err;
      }

      if (avecLevier) {
        await fn.ajusterScore(pseudo, POINTS.effetDeLevierCout);
      }
      await fn.definirMissionActive(pseudo, {
        missionId: propositionCourante.id,
        texte: propositionCourante.texte,
        difficulte: propositionCourante.difficulte,
        points: propositionCourante.points,
        preuveRequise: propositionCourante.preuveRequise,
        nombreAbandons: propositionCourante.nombreAbandons || 0,
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
      await fn.ajusterScore(pseudo, pointsGagnes);
      await fn.ajouterEntreeJournal({
        pseudo,
        missionId: missionActive.missionId,
        texte: missionActive.texte,
        difficulte: missionActive.difficulte,
        points: pointsGagnes,
        effetDeLevier: missionActive.effetDeLevier,
        preuveRequise: missionActive.preuveRequise,
        type: 'reussie',
      });
      await fn.bruleMission(missionActive.missionId);
      await fn.retirerMissionActive(pseudo);
      await fn.ajouterEvenement(`Une mission ${LABELS_DIFFICULTE_MAJ[missionActive.difficulte]} vient d'être réussie.`);
      setConfirmationReussite(false);
    } finally {
      setChargementAction(false);
    }
  }

  async function abandonner() {
    if (!missionActive) return;
    setChargementAction(true);
    try {
      await fn.ajusterScore(pseudo, POINTS.abandonner);
      await fn.ajouterEntreeJournal({
        pseudo,
        missionId: missionActive.missionId,
        texte: missionActive.texte,
        difficulte: missionActive.difficulte,
        points: 0,
        effetDeLevier: missionActive.effetDeLevier,
        preuveRequise: missionActive.preuveRequise,
        type: 'abandonnee',
      });
      await fn.remettreDisponibleApresAbandon(missionActive.missionId, pseudo);
      await fn.retirerMissionActive(pseudo);
      await fn.ajouterEvenement(`Quelqu'un a abandonné une mission ${LABELS_DIFFICULTE_MAJ[missionActive.difficulte]}.`);
    } finally {
      setChargementAction(false);
    }
  }

  if (saison === 0 && !modeTest) {
    return <div className="missions-screen"><p className="empty-state">Le jeu n'a pas encore commencé. Rendez-vous le 6 août !</p></div>;
  }

  if (estPartieTerminee) {
    return <div className="missions-screen"><p className="empty-state">🏁 La partie est terminée. Retrouve les statistiques finales dans l'onglet 📊.</p></div>;
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
                ❌ Abandonner (-5 pts)
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
          {propositionCourante.nombreAbandons > 0 && (
            <p className="warning-text">
              ⚠️ Cette mission a déjà été abandonnée {propositionCourante.nombreAbandons} fois par
              d'autres joueurs — à vos risques et périls.
            </p>
          )}
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
