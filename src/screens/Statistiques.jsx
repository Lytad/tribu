import { useEffect, useState } from 'react';
import { recupererStatistiquesSaison } from '../firebase/statistiques';

const LIBELLES_TITRES = {
  plusAccusateur: { emoji: '🕵️', label: 'Le Plus Accusateur', unite: 'accusation(s) envoyée(s)' },
  plusDemasque: { emoji: '🎯', label: 'Le Plus Démasqué', unite: 'fois démasqué(e)' },
  plusFuyard: { emoji: '🏃', label: 'Le Plus Fuyard', unite: 'mission(s) abandonnée(s)' },
  plusBosseur: { emoji: '💪', label: 'Le Plus Bosseur', unite: 'mission(s) réussie(s)' },
  plusFlambeur: { emoji: '🎰', label: 'Le Plus Flambeur', unite: 'partie(s) de Casino jouée(s)' },
};

export default function Statistiques() {
  const [statsSaison1, setStatsSaison1] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    recupererStatistiquesSaison(1).then((stats) => {
      setStatsSaison1(stats);
      setChargement(false);
    });
  }, []);

  return (
    <div className="stats-screen">
      <h2 className="dashboard-title">📊 Statistiques</h2>
      <p className="dashboard-note">Le palmarès des saisons terminées.</p>

      <div className="stats-liste">
        <div className="stats-saison-bloc">
          <h3 className="stats-saison-titre">Saison 1</h3>

          {chargement && <p className="empty-state">Chargement...</p>}

          {!chargement && !statsSaison1 && (
            <p className="empty-state">
              Pas encore de statistiques — elles apparaîtront automatiquement à la fin de la Saison 1
              (le 10 août, au démarrage de la Saison 2).
            </p>
          )}

          {statsSaison1 && (
            <>
              <div className="stats-classement">
                {statsSaison1.classementFinal.map((j, i) => (
                  <div key={j.pseudo} className="stats-classement-item">
                    <span className="stats-classement-rang">
                      {i === 0 ? '👑' : `#${i + 1}`}
                    </span>
                    <span className="stats-classement-nom">{j.pseudo}</span>
                    <span className="stats-classement-score">{j.score} pts</span>
                  </div>
                ))}
              </div>

              <div className="stats-titres">
                {Object.entries(statsSaison1.titres).map(([cle, titre]) => {
                  const libelle = LIBELLES_TITRES[cle];
                  if (!libelle || !titre.pseudo || titre.valeur <= 0) return null;
                  return (
                    <div key={cle} className="stats-titre-carte">
                      <span className="stats-titre-emoji">{libelle.emoji}</span>
                      <div>
                        <div className="stats-titre-label">{libelle.label}</div>
                        <div className="stats-titre-valeur">
                          <strong>{titre.pseudo}</strong> — {titre.valeur} {libelle.unite}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
