import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { doc, getDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  JOUEURS_SAISON_1, JOUEURS_SAISON_2_AJOUT, SAISON_2_DEBUT, saisonActuelle,
} from '../utils/constants';

export default function Login() {
  const { connecter } = useGame();
  const [selection, setSelection] = useState(null);
  const [confirmationPseudo, setConfirmationPseudo] = useState(null);
  const [dejaActif, setDejaActif] = useState(false);
  const saison = saisonActuelle();

  const joueursSaison2Bloques = saison < 2;

  async function handleChoix(pseudo, bloque) {
    if (bloque) {
      setSelection(pseudo);
      return;
    }
    // On vérifie si ce prénom montre déjà une activité de jeu (quelqu'un d'autre l'a peut-être
    // déjà choisi sur un autre téléphone) avant de valider définitivement.
    const snap = await getDoc(doc(collection(db, 'joueurs'), pseudo));
    const actif = snap.exists() && (snap.data().score !== 40 || snap.data().missionActive);
    setDejaActif(actif);
    setConfirmationPseudo(pseudo);
  }

  function confirmerChoix() {
    connecter(confirmationPseudo);
    setConfirmationPseudo(null);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="login-title">TRIBU</h1>
        <p className="login-subtitle">Choisis ton prénom. Ce choix est définitif pour tout le séjour.</p>

        <div className="login-group">
          <span className="login-group-label">Saison 1</span>
          <div className="login-grid">
            {JOUEURS_SAISON_1.map((p) => (
              <button key={p} className="login-btn" onClick={() => handleChoix(p, false)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="login-group">
          <span className="login-group-label">Saison 2 — dès le 10 août</span>
          <div className="login-grid">
            {JOUEURS_SAISON_2_AJOUT.map((p) => (
              <button
                key={p}
                className={`login-btn ${joueursSaison2Bloques ? 'login-btn-bloque' : ''}`}
                onClick={() => handleChoix(p, joueursSaison2Bloques)}
              >
                {p}
                {joueursSaison2Bloques && <span className="lock-icon">🔒</span>}
              </button>
            ))}
          </div>
        </div>

        {selection && joueursSaison2Bloques && (
          <div className="login-message">
            L'accès pour {selection} s'ouvre automatiquement le 10 août à minuit.
            Reviens à ce moment-là !
          </div>
        )}

        {confirmationPseudo && (
          <div className="modal-overlay" onClick={() => setConfirmationPseudo(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirmer ton choix</h3>
              <p>Tu vas jouer sous le prénom <strong>{confirmationPseudo}</strong>. Ce choix est définitif pour tout le séjour.</p>
              {dejaActif && (
                <p className="warning-text">
                  ⚠️ Attention : ce prénom montre déjà une activité de jeu (score différent du départ ou
                  mission en cours). Si tu n'es pas {confirmationPseudo}, ne continue pas — tu écraserais
                  la progression de cette personne.
                </p>
              )}
              <div className="mission-actions">
                <button className="btn btn-primary" onClick={confirmerChoix}>
                  Oui, c'est bien moi
                </button>
                <button className="btn btn-secondary" onClick={() => setConfirmationPseudo(null)}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
