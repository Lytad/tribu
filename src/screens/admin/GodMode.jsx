import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ajusterScore, retirerMissionActive } from '../../firebase/joueurs';
import { initialiserMissions, verifierBaseInitialisee, ecouterStatsMissions, remettreDisponible, ajouterMissionPersonnalisee } from '../../firebase/missions';
import { declencherForceRefresh } from '../../firebase/godmode';
import { ecouterAccusationsEnAttente, supprimerAccusationBug } from '../../firebase/accusations';
import {
  reinitialiserBacASable, verifierBacASableInitialise, ecouterStatsMissionsTest,
} from '../../firebase/sandbox';
import { TOUS_JOUEURS } from '../../utils/constants';

export default function GodMode() {
  const { tousJoueurs, entrerModeTest } = useGame();
  const [cibleScore, setCibleScore] = useState('');
  const [montantScore, setMontantScore] = useState('');
  const [cibleKill, setCibleKill] = useState('');
  const [baseInitialisee, setBaseInitialisee] = useState(null);
  const [progression, setProgression] = useState(null);
  const [statsS1, setStatsS1] = useState(null);
  const [statsS2, setStatsS2] = useState(null);
  const [accusations, setAccusations] = useState([]);
  const [message, setMessage] = useState(null);
  const [confirmationReinit, setConfirmationReinit] = useState(false);
  const [bacASableInitialise, setBacASableInitialise] = useState(null);
  const [statsBacASable, setStatsBacASable] = useState(null);
  const [chargementBacASable, setChargementBacASable] = useState(false);
  const [nouvelleSaison, setNouvelleSaison] = useState('1');
  const [nouvelleDifficulte, setNouvelleDifficulte] = useState('facile');
  const [nouveauTexte, setNouveauTexte] = useState('');
  const [nouvellePreuveRequise, setNouvellePreuveRequise] = useState(false);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);

  useEffect(() => {
    verifierBaseInitialisee().then(setBaseInitialisee);
    verifierBacASableInitialise().then(setBacASableInitialise);
    const unsub1 = ecouterStatsMissions(1, setStatsS1);
    const unsub2 = ecouterStatsMissions(2, setStatsS2);
    const unsub3 = ecouterAccusationsEnAttente(setAccusations);
    const unsub4 = ecouterStatsMissionsTest(setStatsBacASable);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, []);

  async function reinitialiserEtEntrerTest() {
    setChargementBacASable(true);
    try {
      await reinitialiserBacASable();
      setBacASableInitialise(true);
      entrerModeTest();
    } finally {
      setChargementBacASable(false);
    }
  }

  function entrerSansReinitialiser() {
    entrerModeTest();
  }

  async function reinitialiserSeulement() {
    setChargementBacASable(true);
    try {
      await reinitialiserBacASable();
      afficherMessage('Bac à sable réinitialisé : TEST1 et TEST2 à 40 pts, 10 missions disponibles.');
    } finally {
      setChargementBacASable(false);
    }
  }

  function afficherMessage(txt) {
    setMessage(txt);
    setTimeout(() => setMessage(null), 4000);
  }

  const POINTS_PAR_DIFFICULTE = { facile: 10, moyenne: 20, difficile: 40 };

  async function soumettreNouvelleMission() {
    if (!nouveauTexte.trim()) return afficherMessage('Le texte de la mission ne peut pas être vide.');
    setAjoutEnCours(true);
    try {
      await ajouterMissionPersonnalisee({
        saison: Number(nouvelleSaison),
        difficulte: nouvelleDifficulte,
        points: POINTS_PAR_DIFFICULTE[nouvelleDifficulte],
        texte: nouveauTexte.trim(),
        preuveRequise: nouvellePreuveRequise,
      });
      afficherMessage('Nouvelle mission ajoutée à la base, disponible immédiatement.');
      setNouveauTexte('');
      setNouvellePreuveRequise(false);
    } finally {
      setAjoutEnCours(false);
    }
  }

  async function lancerInitialisation() {
    setProgression({ done: 0, total: 430 });
    await initialiserMissions((done, total) => setProgression({ done, total }));
    setBaseInitialisee(true);
    setConfirmationReinit(false);
    afficherMessage('430 missions chargées dans la base.');
  }

  async function appliquerRegulateurScore() {
    const montant = Number(montantScore);
    if (!cibleScore || !montant) return;
    await ajusterScore(cibleScore, montant);
    afficherMessage(`${montant > 0 ? '+' : ''}${montant} pts appliqués à ${cibleScore}.`);
    setMontantScore('');
  }

  async function forcerAbandon() {
    if (!cibleKill) return;
    const missionActiveCible = tousJoueurs[cibleKill]?.missionActive;
    if (missionActiveCible?.missionId) {
      await remettreDisponible(missionActiveCible.missionId);
    }
    await retirerMissionActive(cibleKill);
    afficherMessage(`Mission de ${cibleKill} nettoyée (sans malus) et remise disponible pour tout le monde.`);
    setCibleKill('');
  }

  async function forceRefreshTousLesTelephones() {
    await declencherForceRefresh();
    afficherMessage('Signal de rechargement envoyé à tous les téléphones connectés.');
  }

  async function supprimerAccusation(id) {
    await supprimerAccusationBug(id);
    afficherMessage('Accusation supprimée du serveur.');
  }

  return (
    <div className="godmode-screen">
      <h2 className="dashboard-title">🛠️ God Mode</h2>
      {message && <div className="toast-message">{message}</div>}

      <section className="tribunal-section bac-a-sable-section">
        <h3>🧪 Bac à Sable — tester sans impact sur la vraie partie</h3>
        <p className="dashboard-note">
          Un environnement complètement séparé avec deux joueurs fictifs (TEST1, TEST2) et
          10 missions dédiées. Rien ici ne touche aux vraies données du jeu — utilisable à
          n'importe quelle date, même avant le 6 août.
        </p>
        {bacASableInitialise && statsBacASable && (
          <p className="dashboard-note">
            Missions test — Disponibles : {statsBacASable.disponibles} / Actives : {statsBacASable.actives} / Brûlées : {statsBacASable.brulees}
          </p>
        )}
        <div className="mission-actions">
          {bacASableInitialise ? (
            <button className="btn btn-primary" onClick={entrerSansReinitialiser} disabled={chargementBacASable}>
              🧪 Entrer en Mode Test (reprendre où c'était)
            </button>
          ) : (
            <button className="btn btn-primary" onClick={reinitialiserEtEntrerTest} disabled={chargementBacASable}>
              🧪 Initialiser et Entrer en Mode Test
            </button>
          )}
          <button className="btn btn-secondary" onClick={reinitialiserSeulement} disabled={chargementBacASable}>
            Réinitialiser (repartir à zéro)
          </button>
        </div>
      </section>

      <section className="tribunal-section">
        <h3>Base de missions</h3>
        {baseInitialisee === null && <p className="empty-state">Vérification...</p>}
        {baseInitialisee === false && (
          <>
            <p className="warning-text">La base de missions n'est pas encore initialisée dans Firestore.</p>
            <button className="btn btn-primary" onClick={lancerInitialisation}>
              Initialiser les 430 missions
            </button>
          </>
        )}
        {baseInitialisee === true && (
          <div>
            <p>Saison 1 — Disponibles : {statsS1?.disponibles ?? '...'} / Actives : {statsS1?.actives ?? '...'} / Brûlées : {statsS1?.brulees ?? '...'} (total {statsS1?.total ?? '...'})</p>
            <p>Saison 2 — Disponibles : {statsS2?.disponibles ?? '...'} / Actives : {statsS2?.actives ?? '...'} / Brûlées : {statsS2?.brulees ?? '...'} (total {statsS2?.total ?? '...'})</p>

            {!confirmationReinit ? (
              <button className="btn btn-secondary" onClick={() => setConfirmationReinit(true)}>
                Réinitialiser quand même les 430 missions
              </button>
            ) : (
              <div className="confirmation-box">
                <p className="warning-text">
                  ⚠️ Ça va effacer tous les statuts actuels (disponible/active/brûlée) et remettre les 430
                  missions à zéro. À utiliser seulement avant le début réel du jeu, ou si tu sais ce que tu fais.
                </p>
                <div className="mission-actions">
                  <button className="btn btn-danger" onClick={lancerInitialisation}>Confirmer la réinitialisation</button>
                  <button className="btn btn-secondary" onClick={() => setConfirmationReinit(false)}>Annuler</button>
                </div>
              </div>
            )}
          </div>
        )}
        {progression && (
          <p>Chargement : {progression.done} / {progression.total}</p>
        )}
      </section>

      <section className="tribunal-section">
        <h3>➕ Ajouter une mission</h3>
        <p className="dashboard-note">
          Pour compléter la base en cours de partie si les missions viennent à manquer.
          N'affecte jamais les 430 missions existantes ni leur statut actuel.
        </p>

        <label className="form-label">Saison</label>
        <select className="form-select" value={nouvelleSaison} onChange={(e) => setNouvelleSaison(e.target.value)}>
          <option value="1">Saison 1</option>
          <option value="2">Saison 2</option>
        </select>

        <label className="form-label">Difficulté</label>
        <select className="form-select" value={nouvelleDifficulte} onChange={(e) => setNouvelleDifficulte(e.target.value)}>
          <option value="facile">Facile (10 pts)</option>
          <option value="moyenne">Moyenne (20 pts)</option>
          <option value="difficile">Difficile (40 pts)</option>
        </select>

        <label className="form-label">Texte de la mission</label>
        <textarea
          className="form-textarea"
          placeholder="Décris la mission..."
          value={nouveauTexte}
          onChange={(e) => setNouveauTexte(e.target.value)}
          rows={3}
        />

        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={nouvellePreuveRequise}
            onChange={(e) => setNouvellePreuveRequise(e.target.checked)}
          />
          Preuve (photo/vidéo) requise pour cette mission
        </label>

        <button className="btn btn-primary" onClick={soumettreNouvelleMission} disabled={ajoutEnCours || !nouveauTexte.trim()}>
          Ajouter cette mission
        </button>
      </section>

      <section className="tribunal-section">
        <h3>Régulateur de score manuel</h3>
        <select className="form-select" value={cibleScore} onChange={(e) => setCibleScore(e.target.value)}>
          <option value="">-- Choisir un joueur --</option>
          {Object.keys(tousJoueurs).filter(p => TOUS_JOUEURS.includes(p)).map((j) => (
            <option key={j} value={j}>{j} (actuellement {tousJoueurs[j]?.score || 0} pts)</option>
          ))}
        </select>
        <input
          type="number"
          className="form-select"
          placeholder="Montant (ex: 10 ou -10)"
          value={montantScore}
          onChange={(e) => setMontantScore(e.target.value)}
        />
        <button className="btn btn-primary" onClick={appliquerRegulateurScore}>Appliquer</button>
      </section>

      <section className="tribunal-section">
        <h3>Nettoyeur de missions (Kill Switch)</h3>
        <select className="form-select" value={cibleKill} onChange={(e) => setCibleKill(e.target.value)}>
          <option value="">-- Choisir un joueur --</option>
          {Object.keys(tousJoueurs).filter(p => TOUS_JOUEURS.includes(p) && tousJoueurs[p]?.missionActive).map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
        <button className="btn btn-danger" onClick={forcerAbandon}>Forcer l'abandon (sans malus)</button>
      </section>

      <section className="tribunal-section">
        <h3>Suppression d'accusation (bug)</h3>
        {accusations.length === 0 && <p className="empty-state">Aucune accusation en attente.</p>}
        {accusations.map((acc) => (
          <div key={acc.id} className="tribunal-item">
            <p>{acc.accusateur} → {acc.accuse}</p>
            <button className="btn btn-danger" onClick={() => supprimerAccusation(acc.id)}>Supprimer (sans passer par le Tribunal)</button>
          </div>
        ))}
      </section>

      <section className="tribunal-section">
        <h3>Force Refresh</h3>
        <p className="dashboard-note">Envoie un signal à tous les téléphones connectés pour forcer le rechargement de la page.</p>
        <button className="btn btn-danger" onClick={forceRefreshTousLesTelephones}>🔁 Forcer le rechargement global</button>
      </section>
    </div>
  );
}
