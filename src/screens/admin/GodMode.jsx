import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ajusterScore, retirerMissionActive } from '../../firebase/joueurs';
import { initialiserMissions, verifierBaseInitialisee, ecouterStatsMissions } from '../../firebase/missions';
import { declencherForceRefresh } from '../../firebase/godmode';
import { ecouterAccusationsEnAttente, supprimerAccusationBug } from '../../firebase/accusations';
import { TOUS_JOUEURS } from '../../utils/constants';

export default function GodMode() {
  const { tousJoueurs } = useGame();
  const [cibleScore, setCibleScore] = useState('');
  const [montantScore, setMontantScore] = useState('');
  const [cibleKill, setCibleKill] = useState('');
  const [baseInitialisee, setBaseInitialisee] = useState(null);
  const [progression, setProgression] = useState(null);
  const [statsS1, setStatsS1] = useState(null);
  const [statsS2, setStatsS2] = useState(null);
  const [accusations, setAccusations] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    verifierBaseInitialisee().then(setBaseInitialisee);
    const unsub1 = ecouterStatsMissions(1, setStatsS1);
    const unsub2 = ecouterStatsMissions(2, setStatsS2);
    const unsub3 = ecouterAccusationsEnAttente(setAccusations);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  function afficherMessage(txt) {
    setMessage(txt);
    setTimeout(() => setMessage(null), 4000);
  }

  async function lancerInitialisation() {
    setProgression({ done: 0, total: 430 });
    await initialiserMissions((done, total) => setProgression({ done, total }));
    setBaseInitialisee(true);
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
    await retirerMissionActive(cibleKill);
    afficherMessage(`Mission de ${cibleKill} nettoyée (sans malus).`);
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
          </div>
        )}
        {progression && (
          <p>Chargement : {progression.done} / {progression.total}</p>
        )}
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
