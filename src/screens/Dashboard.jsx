import { useGame } from '../context/GameContext';

const TITRES = [
  { seuil: 0, titre: '👑 Survole le game, intouchable.' },
  { seuil: 1, titre: '🔥 Fait trembler la concurrence.' },
  { seuil: 2, titre: '😎 Dans le coup, tranquille.' },
  { seuil: -1, titre: '🫠 Est en train de se faire plumer.' },
];

export default function Dashboard() {
  const { pseudo, tousJoueurs } = useGame();

  const classement = Object.entries(tousJoueurs)
    .map(([p, data]) => ({ pseudo: p, score: data.score || 0 }))
    .sort((a, b) => b.score - a.score);

  function titrePour(index, total) {
    if (index === 0) return TITRES[0].titre;
    if (index === total - 1 && total > 1) return TITRES[3].titre;
    if (index === 1) return TITRES[1].titre;
    return TITRES[2].titre;
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Classement</h2>
      <div className="classement-list">
        {classement.map((j, i) => (
          <div
            key={j.pseudo}
            className={`classement-item ${j.pseudo === pseudo ? 'classement-item-moi' : ''}`}
          >
            <div className="classement-rang">#{i + 1}</div>
            <div className="classement-infos">
              <div className="classement-nom">{j.pseudo}</div>
              <div className="classement-phrase">{titrePour(i, classement.length)}</div>
            </div>
            <div className="classement-score">{j.score} pts</div>
          </div>
        ))}
        {classement.length === 0 && (
          <p className="empty-state">En attente des premiers joueurs...</p>
        )}
      </div>
      <p className="dashboard-note">
        Les points affichés évoluent en direct mais restent soumis à validation définitive au Tribunal du soir.
      </p>
    </div>
  );
}
