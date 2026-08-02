import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ajusterScore, mettreAJourJoueur } from '../firebase/joueurs';
import { sabrerMissionCible } from '../firebase/missions';
import { ajouterEvenement } from '../firebase/evenements';
import {
  ajusterScoreTest, mettreAJourJoueurTest, sabrerMissionCibleTest, ajouterEvenementTest, TEST_JOUEURS,
} from '../firebase/sandbox';
import { POINTS, TOUS_JOUEURS } from '../utils/constants';

function finDeJournee() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function Boutique() {
  const { pseudo, joueur, tousJoueurs, modeTest } = useGame();
  const [cibleGel, setCibleGel] = useState('');
  const [cibleSabotage, setCibleSabotage] = useState('');
  const [cibleIndice, setCibleIndice] = useState('');
  const [cibleUsurpation, setCibleUsurpation] = useState('');
  const [cibleRalentissement, setCibleRalentissement] = useState('');
  const [indiceResultat, setIndiceResultat] = useState(null);
  const [message, setMessage] = useState(null);
  const [chargement, setChargement] = useState(false);

  const fn = modeTest ? {
    ajusterScore: ajusterScoreTest,
    mettreAJourJoueur: mettreAJourJoueurTest,
    sabrerMissionCible: sabrerMissionCibleTest,
    ajouterEvenement: ajouterEvenementTest,
  } : {
    ajusterScore, mettreAJourJoueur, sabrerMissionCible, ajouterEvenement,
  };

  const solde = joueur?.score || 0;
  const listeJoueursValides = modeTest ? TEST_JOUEURS : TOUS_JOUEURS;
  const autresJoueurs = Object.keys(tousJoueurs).filter((p) => p !== pseudo && listeJoueursValides.includes(p));

  const amnesieActive = joueur?.amnesieActiveJusqua && new Date(joueur.amnesieActiveJusqua) > new Date();

  function afficherMessage(txt) {
    setMessage(txt);
    setTimeout(() => setMessage(null), 5000);
  }

  async function acheterAmnesie() {
    if (amnesieActive) return afficherMessage('Tu as déjà une Amnésie active pour aujourd\'hui.');
    if (solde < POINTS.amnesieCout) return afficherMessage('Solde insuffisant.');
    setChargement(true);
    try {
      await fn.ajusterScore(pseudo, -POINTS.amnesieCout);
      await fn.mettreAJourJoueur(pseudo, { amnesieActiveJusqua: finDeJournee() });
      await fn.ajouterEvenement('Quelqu\'un s\'est protégé pour la journée.');
      afficherMessage('Amnésie activée pour la journée. Si une accusation contre toi est validée ce soir, tu pourras choisir de l\'annuler au Tribunal.');
    } finally {
      setChargement(false);
    }
  }

  async function acheterIndice() {
    if (!cibleIndice) return afficherMessage('Choisis une cible.');
    if (solde < POINTS.indiceCout) return afficherMessage('Solde insuffisant.');
    const cibleData = tousJoueurs[cibleIndice];
    if (!cibleData?.missionActive) {
      return afficherMessage(`${cibleIndice} n'a pas de mission active en ce moment.`);
    }
    setChargement(true);
    try {
      await fn.ajusterScore(pseudo, -POINTS.indiceCout);
      setIndiceResultat({ cible: cibleIndice, difficulte: cibleData.missionActive.difficulte });
      setCibleIndice('');
    } finally {
      setChargement(false);
    }
  }

  async function acheterGel() {
    if (!cibleGel) return afficherMessage('Choisis une cible.');
    if (solde < POINTS.gelCout) return afficherMessage('Solde insuffisant.');
    setChargement(true);
    try {
      await fn.ajusterScore(pseudo, -POINTS.gelCout);
      const dans24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await fn.mettreAJourJoueur(cibleGel, { geleJusqua: dans24h });
      await fn.ajouterEvenement(`${cibleGel} a été gelé(e) au Casino pendant 24h.`);
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
      await fn.ajusterScore(pseudo, -POINTS.sabotageCout);
      await fn.sabrerMissionCible(cibleSabotage, cibleData.missionActive.missionId);
      await fn.ajouterEvenement(`${cibleSabotage} a été saboté(e) — nouvelle mission forcée.`);
      afficherMessage(`Sabotage appliqué : ${cibleSabotage} va recevoir une nouvelle mission aléatoire.`);
      setCibleSabotage('');
    } finally {
      setChargement(false);
    }
  }

  async function acheterUsurpation() {
    if (!cibleUsurpation) return afficherMessage('Choisis une cible.');
    if (solde < POINTS.usurpationCout) return afficherMessage('Solde insuffisant.');
    const cibleData = tousJoueurs[cibleUsurpation];
    if (!cibleData?.missionActive) return afficherMessage(`${cibleUsurpation} n'a pas de mission active en ce moment.`);
    setChargement(true);
    try {
      await fn.ajusterScore(pseudo, -POINTS.usurpationCout);
      await fn.ajouterEvenement(`La difficulté de la mission de ${cibleUsurpation} a été dévoilée : ${cibleData.missionActive.difficulte.toUpperCase()}.`);
      afficherMessage(`Usurpation appliquée : la difficulté de la mission de ${cibleUsurpation} est maintenant publique dans le Journal.`);
      setCibleUsurpation('');
    } finally {
      setChargement(false);
    }
  }

  async function acheterRalentissement() {
    if (!cibleRalentissement) return afficherMessage('Choisis une cible.');
    if (solde < POINTS.ralentissementCout) return afficherMessage('Solde insuffisant.');
    setChargement(true);
    try {
      await fn.ajusterScore(pseudo, -POINTS.ralentissementCout);
      await fn.mettreAJourJoueur(cibleRalentissement, { prochaineMissionForceeDifficile: 'difficile' });
      await fn.ajouterEvenement(`${cibleRalentissement} doit maintenant affronter une mission DIFFICILE forcée.`);
      afficherMessage(`Ralentissement appliqué : la prochaine mission de ${cibleRalentissement} sera difficile.`);
      setCibleRalentissement('');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="boutique-screen">
      <div className="solde-header">Ton solde : <strong>{solde} pts</strong></div>
      {message && <div className="toast-message">{message}</div>}

      <div className="boutique-item">
        <h3>🧠 Amnésie — {POINTS.amnesieCout} pts</h3>
        <p>
          Active une protection pour toute la journée. Si une accusation contre toi s'avère juste
          au Tribunal de ce soir, tu pourras choisir de l'annuler : personne ne gagne ni ne perd de
          points sur cette accusation-là. Une seule active à la fois.
        </p>
        {amnesieActive && <p className="dashboard-note">✅ Déjà active pour aujourd'hui.</p>}
        <button className="btn btn-primary" onClick={acheterAmnesie} disabled={chargement || solde < POINTS.amnesieCout || amnesieActive}>
          Acheter
        </button>
      </div>

      <div className="boutique-item">
        <h3>🔍 Indice — {POINTS.indiceCout} pts</h3>
        <p>Révèle uniquement la difficulté (facile/moyenne/difficile) de la mission active d'un joueur, sans révéler son texte. Reste connu de toi seul.</p>
        <select className="form-select" value={cibleIndice} onChange={(e) => setCibleIndice(e.target.value)}>
          <option value="">-- Choisir une cible --</option>
          {autresJoueurs.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <button className="btn btn-primary" onClick={acheterIndice} disabled={chargement || solde < POINTS.indiceCout}>
          Acheter
        </button>
        {indiceResultat && (
          <div className="confirmation-box">
            <p>La mission active de <strong>{indiceResultat.cible}</strong> est de difficulté <strong>{indiceResultat.difficulte.toUpperCase()}</strong>.</p>
          </div>
        )}
      </div>

      <div className="boutique-item">
        <h3>🧊 Gel des Avoirs — {POINTS.gelCout} pts</h3>
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
        <h3>🐌 Ralentissement — {POINTS.ralentissementCout} pts</h3>
        <p>La prochaine mission piochée par un joueur ciblé sera forcément difficile. Il pourra toujours l'abandonner normalement.</p>
        <select className="form-select" value={cibleRalentissement} onChange={(e) => setCibleRalentissement(e.target.value)}>
          <option value="">-- Choisir une cible --</option>
          {autresJoueurs.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <button className="btn btn-danger" onClick={acheterRalentissement} disabled={chargement || solde < POINTS.ralentissementCout}>
          Acheter
        </button>
      </div>

      <div className="boutique-item">
        <h3>💣 Sabotage — {POINTS.sabotageCout} pts</h3>
        <p>Force instantanément un joueur ciblé à défausser sa mission actuelle pour une mission aléatoire.</p>
        <select className="form-select" value={cibleSabotage} onChange={(e) => setCibleSabotage(e.target.value)}>
          <option value="">-- Choisir une cible --</option>
          {autresJoueurs.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <button className="btn btn-danger" onClick={acheterSabotage} disabled={chargement || solde < POINTS.sabotageCout}>
          Acheter
        </button>
      </div>

      <div className="boutique-item">
        <h3>🎭 Usurpation — {POINTS.usurpationCout} pts</h3>
        <p>Révèle publiquement dans le Journal la difficulté de la mission active d'un joueur ciblé. Personne ne saura que c'est toi qui l'as fait.</p>
        <select className="form-select" value={cibleUsurpation} onChange={(e) => setCibleUsurpation(e.target.value)}>
          <option value="">-- Choisir une cible --</option>
          {autresJoueurs.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <button className="btn btn-danger" onClick={acheterUsurpation} disabled={chargement || solde < POINTS.usurpationCout}>
          Acheter
        </button>
      </div>
    </div>
  );
}
