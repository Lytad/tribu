import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ecouterJournalEnAttente, cloturerEntreeJournal } from '../../firebase/journal';
import { ecouterAccusationsEnAttente, traiterAccusation, traiterAccusationRedondante } from '../../firebase/accusations';
import { ajusterScore, mettreAJourJoueur, retirerMissionActive } from '../../firebase/joueurs';
import { bruleMission } from '../../firebase/missions';
import { ajouterEvenement } from '../../firebase/evenements';
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

  function formaterHeure(dateIso) {
    if (!dateIso) return '';
    return new Date(dateIso).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

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

    const missionActiveAccuse = accuseData?.missionActive;
    const pointsMission = missionActiveAccuse?.points || 0;

    // L'accusé perd les points de la mission qu'il pensait valider + malus -10
    await ajusterScore(accusationOuverte.accuse, -(pointsMission + Math.abs(POINTS.accuseMalus)));
    // L'accusateur vole le pactole complet (points de la mission + 10)
    await ajusterScore(accusationOuverte.accusateur, pointsMission + 10);

    // La mission démasquée est consommée : brûlée définitivement (comme une mission réussie),
    // et retirée de l'écran de l'accusé pour qu'il ne puisse plus la valider a posteriori.
    if (missionActiveAccuse?.missionId) {
      await bruleMission(missionActiveAccuse.missionId);
    }
    await retirerMissionActive(accusationOuverte.accuse);

    await traiterAccusation(accusationOuverte.id, 'validee');
    await ajouterEvenement(`${accusationOuverte.accuse} a été démasqué(e) au Tribunal.`);
    setAccusationOuverte(null);
  }

  async function jugerAccusationValideeSurAbandon() {
    if (!accusationOuverte) return;
    // L'accusé avait vraiment cette mission mais l'a abandonnée avant le Tribunal — il a déjà
    // payé le prix de l'abandon (-5 pts ou Amnésie), donc pas de malus supplémentaire ici.
    // L'accusateur touche un bonus fixe, puisque la mission n'a rapporté aucun point à l'accusé.
    await ajusterScore(accusationOuverte.accusateur, 10);
    await traiterAccusation(accusationOuverte.id, 'validee_mission_abandonnee');
    setAccusationOuverte(null);
  }

  async function jugerAccusationValideeAvecAmnesie() {
    if (!accusationOuverte) return;
    const accuseData = tousJoueurs[accusationOuverte.accuse];
    const missionActiveAccuse = accuseData?.missionActive;

    // Neutre : personne ne gagne ni ne perd de points. La mission reste tout de même
    // démasquée (brûlée + retirée), puisqu'elle a été révélée au grand jour au Tribunal.
    if (missionActiveAccuse?.missionId) {
      await bruleMission(missionActiveAccuse.missionId);
    }
    await retirerMissionActive(accusationOuverte.accuse);
    // L'Amnésie est consommée : elle ne protège qu'une seule fois par jour.
    await mettreAJourJoueur(accusationOuverte.accuse, { amnesieActiveJusqua: null });

    await traiterAccusation(accusationOuverte.id, 'validee_amnesie');
    setAccusationOuverte(null);
  }

  async function jugerDelitInitie() {
    if (!accusationOuverte) return;
    await ajusterScore(accusationOuverte.accusateur, POINTS.delitInitieMalus);
    await ajusterScore(accusationOuverte.accuse, POINTS.delitInitieMalus);
    await traiterAccusation(accusationOuverte.id, 'delit_initie');
    setAccusationOuverte(null);
  }

  async function jugerRedondante() {
    if (!accusationOuverte) return;
    await traiterAccusationRedondante(accusationOuverte.id);
    setAccusationOuverte(null);
  }

  // Pour chaque accusation, on repère si elle est la première (par ordre chronologique,
  // déjà garanti par le tri Firestore) à viser cette cible parmi les accusations en attente.
  // Les suivantes sur la même cible sont signalées comme doublons potentiels.
  const premiereParCible = {};
  accusations.forEach((acc) => {
    if (!(acc.accuse in premiereParCible)) {
      premiereParCible[acc.accuse] = acc.id;
    }
  });

  // Pour l'accusation actuellement ouverte : est-ce que l'accusé n'a plus de mission active
  // (donc soit réussie, soit abandonnée) ? Si oui, on retrouve la dernière entrée de journal
  // le concernant pour afficher ce qu'il en est réellement.
  function derniereEntreeJournalPour(pseudoAccuse) {
    const entrees = journal.filter((e) => e.pseudo === pseudoAccuse);
    if (entrees.length === 0) return null;
    return entrees[entrees.length - 1];
  }

  // Tout l'historique du jour pour un joueur (missions terminées/abandonnées), trié
  // chronologiquement — permet de retrouver quelle mission correspond à quelle accusation
  // quand plusieurs missions se sont enchaînées dans la même journée.
  function historiqueJournalPour(pseudoAccuse) {
    return journal.filter((e) => e.pseudo === pseudoAccuse);
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
        {accusations.map((acc) => {
          const estDoublon = premiereParCible[acc.accuse] !== acc.id;
          return (
            <div key={acc.id} className="tribunal-item">
              <div className="tribunal-item-header">
                <strong>{acc.accusateur}</strong>
                <span>accuse</span>
                <strong>{acc.accuse}</strong>
                {!estDoublon && <span className="badge badge-success">⏱ 1ère accusation — {formaterHeure(acc.createdAt)}</span>}
                {estDoublon && <span className="badge badge-danger">⏱ Accusé à {formaterHeure(acc.createdAt)}</span>}
              </div>
              <p className="dashboard-note">« {acc.description} »</p>
              {estDoublon && (
                <p className="warning-text">
                  ⚠️ {acc.accuse} a déjà été accusé(e) à {formaterHeure(accusations.find((a) => a.id === premiereParCible[acc.accuse])?.createdAt)}
                  {' '}par {accusations.find((a) => a.id === premiereParCible[acc.accuse])?.accusateur} — probablement la même mission repérée par plusieurs joueurs.
                </p>
              )}
              <button className="btn btn-primary" onClick={() => ouvrirJugement(acc)}>Juger maintenant</button>
            </div>
          );
        })}
      </section>

      {accusationOuverte && (() => {
        const accuseData = tousJoueurs[accusationOuverte.accuse];
        const missionActiveAccuse = accuseData?.missionActive;
        const derniereEntree = derniereEntreeJournalPour(accusationOuverte.accuse);
        const missionAbandonneeDetectee = !missionActiveAccuse && derniereEntree?.type === 'abandonnee';
        const amnesieActive = accuseData?.amnesieActiveJusqua && new Date(accuseData.amnesieActiveJusqua) > new Date();

        return (
          <div className="modal-overlay" onClick={() => setAccusationOuverte(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Jugement : {accusationOuverte.accusateur} vs {accusationOuverte.accuse}</h3>
              <p className="dashboard-note">Accusation reçue à {formaterHeure(accusationOuverte.createdAt)}</p>
              <p className="dashboard-note">« {accusationOuverte.description} »</p>

              {missionActiveAccuse ? (
                <p>Mission active actuelle de {accusationOuverte.accuse} : <strong>{missionActiveAccuse.texte}</strong></p>
              ) : missionAbandonneeDetectee ? (
                <p className="warning-text">
                  ⚠️ {accusationOuverte.accuse} n'a plus de mission active — sa dernière entrée du journal
                  montre qu'il/elle a <strong>abandonné</strong> la mission : « {derniereEntree.texte} ».
                  Si l'accusation portait bien sur cette mission, utilise le bouton dédié ci-dessous.
                </p>
              ) : (
                <p className="dashboard-note">
                  {accusationOuverte.accuse} n'a plus de mission active en ce moment (aucune entrée de
                  journal correspondante trouvée — vérifie avec le groupe avant de trancher).
                </p>
              )}

              {historiqueJournalPour(accusationOuverte.accuse).length > 0 && (
                <div className="confirmation-box">
                  <p className="dashboard-note">
                    Historique du jour pour {accusationOuverte.accuse} (compare avec l'heure de
                    l'accusation ci-dessus pour identifier la bonne mission) :
                  </p>
                  {historiqueJournalPour(accusationOuverte.accuse).map((entree) => (
                    <p key={entree.id} className="dashboard-note">
                      {formaterHeure(entree.createdAt)} — {entree.type === 'reussie' ? '✅ Réussie' : '❌ Abandonnée'} : « {entree.texte} »
                    </p>
                  ))}
                </div>
              )}

              {premiereParCible[accusationOuverte.accuse] !== accusationOuverte.id && (
                <p className="warning-text">
                  ⚠️ {accusationOuverte.accuse} a déjà été accusé(e) plus tôt, à{' '}
                  {formaterHeure(accusations.find((a) => a.id === premiereParCible[accusationOuverte.accuse])?.createdAt)}
                  {' '}par {accusations.find((a) => a.id === premiereParCible[accusationOuverte.accuse])?.accusateur}.
                  Si c'est la même mission et qu'elle a déjà été validée, utilise "Accusation redondante"
                  ci-dessous plutôt que de revalider le pactole une deuxième fois.
                </p>
              )}

              {amnesieActive && (
                <p className="warning-text">
                  🧠 {accusationOuverte.accuse} a une Amnésie active aujourd'hui. Demande à voix haute :
                  veut-il/elle l'utiliser sur CETTE accusation précise ?
                </p>
              )}

              <div className="mission-actions" style={{ flexDirection: 'column' }}>
                <button className="btn btn-secondary" onClick={jugerFausseAccusation}>
                  Fausse accusation (-10 pts accusateur)
                </button>
                <button className="btn btn-success" onClick={jugerAccusationValidee}>
                  Accusation validée (accusé perd mission + 10, accusateur vole le pactole)
                </button>
                {amnesieActive && (
                  <button className="btn btn-primary" onClick={jugerAccusationValideeAvecAmnesie}>
                    🧠 Oui, Amnésie utilisée ici (neutre pour les deux, mission quand même révélée)
                  </button>
                )}
                {missionAbandonneeDetectee && (
                  <button className="btn btn-success" onClick={jugerAccusationValideeSurAbandon}>
                    Accusation validée — mission déjà abandonnée (+10 pts fixes accusateur, aucun malus accusé)
                  </button>
                )}
                <button className="btn btn-danger" onClick={jugerDelitInitie}>
                  Délit d'initié / triche avérée (-30 pts aux deux)
                </button>
                {premiereParCible[accusationOuverte.accuse] !== accusationOuverte.id && (
                  <button className="btn btn-secondary" onClick={jugerRedondante}>
                    Accusation redondante (déjà traitée — aucun point pour cet accusateur)
                  </button>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => setAccusationOuverte(null)}>Fermer</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
