import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ajusterScore, mettreAJourJoueur } from '../firebase/joueurs';
import { sabrerMissionCible } from '../firebase/missions';
import { POINTS, TOUS_JOUEURS, heureDecimale, HEURE_DEBUT_ACHAT_CAPE, HEURE_FIN_ACHAT_CAPE } from '../utils/constants';

export default function Boutique() {
  const { pseudo, joueur, tousJoueurs } = useGame();
  const [cibleGel, setCibleGel] = useState('');
  const [cibleSabotage, setCibleSabotage] = useState('');
  const [message, setMessage] = useState(null);
  const [chargement, setChargement] = useState(false);

  const solde = joueur?.score || 0;
  const heureActuelle = heureDecimale();
  const capeAchetable = heureActuelle >= HEURE_DEBUT_ACHAT_CAPE && heureActuelle <= HEURE_FIN_ACHAT_CAPE;

  const autresJoueurs = Object.keys(tousJoueurs).filter((p) => p !== pseudo && TOUS_JOUEURS.includes(p));

  function afficherMessage(txt) {
    setMessage(txt);
    setTimeout(() => setMessage(null), 4000);
  }

  async function acheterAmnesie() {
    if (solde < POINTS.amnesieCout) return afficherMessage('Solde insuffisant.');
    setChargement(true);
    try {
      await ajusterScore(pseudo, -POINTS.amnesieCout);
      const nb = (joueur.inventaire?.amnesieDisponible || 0) + 1;
      await mettreAJourJoueur(pseudo, { 'inventaire.amnesieDisponible': nb });
      afficherMessage('Amnésie achetée. Utilisable lors du prochain abandon de mission.');
    } finally {
      setChargement(false);
    }
  }

  async function acheterCape() {
    if (!capeAchetable) return afficherMessage('La Cape ne peut être achetée qu\'entre 00h01 et 20h59.');
    if (solde < POINTS.capeCout) return afficherMessage('Solde insuffisant.');
    setChargement(true);
    try {
      await ajusterScore(pseudo, -POINTS.capeCout);
      const nb = (joueur.inventaire?.capeInvisibilite || 0) + 1;
      await mettreAJourJoueur(pseudo, { 'inventaire.capeInvisibilite': nb });
      afficherMessage('Cape d\'Invisibilité achetée. Elle annulera automatiquement la prochaine accusation validée contre toi.');
    } finally {
      setChargement(false);
    }
  }

  async function acheterGel() {
    if (!cibleGel) return afficherMessage('Choisis une cible.');
    if (solde < POINTS.gelCout) return afficherMessage('Solde insuffisant.');
    setChargement(true);
    try {
      await ajusterScore(pseudo, -POINTS.gelCout);
      const dans24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await mettreAJourJoueur(cibleGel, { geleJusqua: dans24h });
      afficherMessage(`Gel des Avoirs appliqué à ${cibleGel} pour 24h.`);
      setCibleGel('');
    } finally {
      setChargement(false);
    }
  }

  async function acheterSabotage() {
    if (!cibleSabotage) return afficherMessage('Choisis une cible.');
    if (solde < POINTS.sabotageCout) return afficherMessage('Solde insuffisant.');
    const cibleData = tousJoueurs[cibleSabotage];
    if (!cibleData?.missionActive) return afficherMessage(`${cibleSabotage} n'a pas de mission active à saboter.`);
    setChargement(true);
    try {
      await ajusterScore(pseudo, -POINTS.sabotageCout);
      await sabrerMissionCible(cibleSabotage, cibleData.missionActive.missionId);
      afficherMessage(`Sabotage appliqué : ${cibleSabotage} va recevoir une nouvelle mission aléatoire.`);
      setCibleSabotage('');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="boutique-screen">
      <div className="solde-header">Ton solde : <strong>{solde} pts</strong></div>
      {message && <div className="toast-message">{message}</div>}

      <div className="boutique-item">
        <h3>🧠 Amnésie — 10 pts</h3>
        <p>Permet d'abandonner ta mission active sans subir la pénalité de -5 pts.</p>
        <button className="btn btn-primary" onClick={acheterAmnesie} disabled={chargement || solde < POINTS.amnesieCout}>
          Acheter
        </button>
      </div>

      <div className="boutique-item">
        <h3>🥷 Cape d'Invisibilité — 25 pts</h3>
        <p>Annule automatiquement la prochaine accusation validée contre toi au Tribunal. Ton accusateur perd quand même ses points. {!capeAchetable && '(Achat fermé entre 21h00 et minuit)'}</p>
        <button className="btn btn-primary" onClick={acheterCape} disabled={chargement || solde < POINTS.capeCout || !capeAchetable}>
          Acheter
        </button>
      </div>

      <div className="boutique-item">
        <h3>🧊 Gel des Avoirs — 30 pts</h3>
        <p>Bloque l'accès au Casino d'un joueur ciblé pendant 24h.</p>
        <select className="form-select" value={cibleGel} onChange={(e) => setCibleGel(e.target.value)}>
          <option value="">-- Choisir une cible --</option>
          {autresJoueurs.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <button className="btn btn-danger" onClick={acheterGel} disabled={chargement || solde < POINTS.gelCout}>
          Acheter
        </button>
      </div>

      <div className="boutique-item">
        <h3>💣 Sabotage — 40 pts</h3>
        <p>Force instantanément un joueur ciblé à défausser sa mission actuelle pour une mission aléatoire.</p>
        <select className="form-select" value={cibleSabotage} onChange={(e) => setCibleSabotage(e.target.value)}>
          <option value="">-- Choisir une cible --</option>
          {autresJoueurs.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <button className="btn btn-danger" onClick={acheterSabotage} disabled={chargement || solde < POINTS.sabotageCout}>
          Acheter
        </button>
      </div>
    </div>
  );
}
