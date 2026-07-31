import { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  JOUEURS_SAISON_1, JOUEURS_SAISON_2_AJOUT, SAISON_2_DEBUT, saisonActuelle,
} from '../utils/constants';

export default function Login() {
  const { connecter } = useGame();
  const [selection, setSelection] = useState(null);
  const saison = saisonActuelle();

  const joueursSaison2Bloques = saison < 2;

  function handleChoix(pseudo, bloque) {
    if (bloque) {
      setSelection(pseudo);
      return;
    }
    connecter(pseudo);
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
      </div>
    </div>
  );
}
