import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ajusterScore, mettreAJourJoueur } from '../firebase/joueurs';
import { ajusterScoreTest, mettreAJourJoueurTest } from '../firebase/sandbox';
import { CASINO } from '../utils/constants';

function aujourdhuiStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Casino() {
  const { pseudo, joueur, modeTest, estPartieTerminee } = useGame();
  const [mise, setMise] = useState('');
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);

  const fn = modeTest
    ? { ajusterScore: ajusterScoreTest, mettreAJourJoueur: mettreAJourJoueurTest }
    : { ajusterScore, mettreAJourJoueur };

  const solde = joueur?.score || 0;
  const miseMax = Math.floor(solde * CASINO.miseMaxRatio);

  const geleActif = joueur?.geleJusqua && new Date(joueur.geleJusqua) > new Date();

  const jourCourant = aujourdhuiStr();
  const beneficeJour = joueur?.casinoDateJour === jourCourant ? (joueur?.casinoBeneficeJour || 0) : 0;
  const plafondAtteint = beneficeJour >= CASINO.plafondBeneficeJournalier;

  async function jouer() {
    const miseNum = Number(mise);
    if (!miseNum || miseNum <= 0) return;
    if (miseNum > miseMax) return;
    if (miseNum > solde) return;

    setChargement(true);
    try {
      const victoire = Math.random() < 0.5;
      const gain = victoire
        ? Math.round(miseNum * CASINO.multiplicateurVictoire)
        : Math.round(miseNum * CASINO.multiplicateurDefaite);
      const delta = gain - miseNum;

      await fn.ajusterScore(pseudo, delta);

      const nouveauBenefice = (joueur?.casinoDateJour === jourCourant ? (joueur?.casinoBeneficeJour || 0) : 0) + Math.max(delta, 0);
      await fn.mettreAJourJoueur(pseudo, {
        casinoDateJour: jourCourant,
        casinoBeneficeJour: nouveauBenefice,
        nombrePartiesCasino: (joueur?.nombrePartiesCasino || 0) + 1,
      });

      setResultat({ victoire, delta, gain });
      setMise('');
    } finally {
      setChargement(false);
    }
  }

  if (estPartieTerminee) {
    return (
      <div className="casino-screen">
        <div className="mission-card">
          <p className="empty-state">🏁 La partie est terminée. Retrouve les statistiques finales dans l'onglet 📊.</p>
        </div>
      </div>
    );
  }

  if (geleActif) {
    return (
      <div className="casino-screen">
        <div className="mission-card">
          <p className="empty-state">🧊 Ton accès au Casino est gelé jusqu'au {new Date(joueur.geleJusqua).toLocaleString('fr-FR')}.</p>
        </div>
      </div>
    );
  }

  if (plafondAtteint) {
    return (
      <div className="casino-screen">
        <div className="mission-card">
          <p className="empty-state">🎰 Plafond journalier atteint (+{CASINO.plafondBeneficeJournalier} pts de bénéfice net aujourd'hui). Reviens demain !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="casino-screen">
      <div className="mission-card">
        <h2 className="dashboard-title">🎰 Pile ou Face</h2>
        <p className="solde-header">Solde : <strong>{solde} pts</strong> · Mise max autorisée : <strong>{miseMax} pts</strong> (20% du solde)</p>
        <p className="dashboard-note">Victoire : mise ×1.8 · Défaite : tu récupères 0.3× ta mise · Bénéfice net max/jour : {CASINO.plafondBeneficeJournalier} pts</p>

        <input
          type="number"
          className="form-select"
          placeholder={`Mise (max ${miseMax})`}
          value={mise}
          onChange={(e) => setMise(e.target.value)}
          min={1}
          max={miseMax}
        />

        <button
          className="btn btn-primary"
          onClick={jouer}
          disabled={chargement || !mise || Number(mise) <= 0 || Number(mise) > miseMax || Number(mise) > solde}
        >
          Lancer la pièce
        </button>

        {resultat && (
          <div className={`confirmation-box ${resultat.victoire ? 'resultat-victoire' : 'resultat-defaite'}`}>
            {resultat.victoire ? (
              <p>🎉 Victoire ! Tu gagnes {resultat.gain} pts (net : +{resultat.delta} pts)</p>
            ) : (
              <p>💸 Perdu. Tu récupères {resultat.gain} pts (net : {resultat.delta} pts)</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
