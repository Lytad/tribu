import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { creerAccusation } from '../firebase/accusations';
import { TOUS_JOUEURS, heureDecimale, HEURE_FIN_ACCUSATIONS } from '../utils/constants';

export default function Accusation() {
  const { pseudo, tousJoueurs } = useGame();
  const [cible, setCible] = useState('');
  const [description, setDescription] = useState('');
  const [envoyee, setEnvoyee] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const heureActuelle = heureDecimale();
  const fenetreOuverte = heureActuelle < HEURE_FIN_ACCUSATIONS;

  const autresJoueurs = Object.keys(tousJoueurs).filter((p) => p !== pseudo && TOUS_JOUEURS.includes(p));

  async function envoyer() {
    if (!cible || !description.trim()) return;
    setEnvoi(true);
    try {
      await creerAccusation({ accusateur: pseudo, accuse: cible, description: description.trim() });
      setEnvoyee(true);
      setCible('');
      setDescription('');
    } finally {
      setEnvoi(false);
    }
  }

  if (!fenetreOuverte) {
    return (
      <div className="accusation-screen">
        <div className="mission-card">
          <p className="empty-state">🔒 Les accusations sont closes pour aujourd'hui (fermeture à 20h30).</p>
          <p className="dashboard-note">Rendez-vous demain pour une nouvelle chance de démasquer quelqu'un !</p>
        </div>
      </div>
    );
  }

  if (envoyee) {
    return (
      <div className="accusation-screen">
        <div className="mission-card">
          <p className="empty-state">✅ Ton accusation a été envoyée silencieusement. Elle sera examinée au Tribunal de ce soir.</p>
          <button className="btn btn-primary" onClick={() => setEnvoyee(false)}>Faire une autre accusation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="accusation-screen">
      <div className="mission-card">
        <h2 className="dashboard-title">🕵️ J'ai cramé quelqu'un</h2>
        <p className="dashboard-note">Personne ne perd de points à ce stade. L'accusation reste secrète jusqu'au Tribunal.</p>

        <label className="form-label">Qui soupçonnes-tu ?</label>
        <select className="form-select" value={cible} onChange={(e) => setCible(e.target.value)}>
          <option value="">-- Choisir --</option>
          {autresJoueurs.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        <label className="form-label">Quelle mission penses-tu qu'il/elle fait ?</label>
        <textarea
          className="form-textarea"
          placeholder="Décris la mission supposée..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <button
          className="btn btn-danger"
          onClick={envoyer}
          disabled={!cible || !description.trim() || envoi}
        >
          Envoyer l'accusation
        </button>
      </div>
    </div>
  );
}
