import { useEffect, useState } from 'react';
import { recupererStatistiquesSaison } from '../firebase/statistiques';

const LIBELLES_TITRES = {
  plusAccusateur: { emoji: '🕵️', label: 'Le Plus Accusateur', unite: 'accusation(s) envoyée(s)' },
  plusDemasque: { emoji: '🎯', label: 'Le Plus Démasqué', unite: 'fois démasqué(e)' },
  plusFuyard: { emoji: '🏃', label: 'Le Plus Fuyard', unite: 'mission(s) abandonnée(s)' },
  plusBosseur: { emoji: '💪', label: 'Le Plus Bosseur', unite: 'mission(s) réussie(s)' },
  plusFlambeur: { emoji: '🎰', label: 'Le Plus Flambeur', unite: 'partie(s) de Casino jouée(s)' },
};

function BlocClassementEtTitres({ stats }) {
  return (
    <>
      <div className="stats-classement">
        {stats.classementFinal.map((j, i) => (
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
        {Object.entries(stats.titres).map(([cle, titre]) => {
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
  );
}

function BlocDetailParJoueur({ detailParJoueur }) {
  return (
    <div className="stats-detail-liste">
      {Object.entries(detailParJoueur).map(([pseudo, d]) => (
        <div key={pseudo} className="stats-detail-carte">
          <div className="stats-detail-nom">{pseudo}</div>
          <div className="stats-detail-lignes">
            <span>Score final : <strong>{d.score} pts</strong></span>
            <span>Missions réussies : {d.missionsReussies}</span>
            <span>Missions abandonnées : {d.missionsAbandonnees}</span>
            <span>Accusations envoyées : {d.accusationsEnvoyees}</span>
            <span>Fois démasqué(e) : {d.foisDemasque}</span>
            <span>Parties de Casino : {d.partiesCasino}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Statistiques() {
  const [statsSaison1, setStatsSaison1] = useState(null);
  const [statsSaison2, setStatsSaison2] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([
      recupererStatistiquesSaison(1),
      recupererStatistiquesSaison(2),
    ]).then(([s1, s2]) => {
      setStatsSaison1(s1);
      setStatsSaison2(s2);
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
              (le 10 août à 10h, au démarrage de la Saison 2).
            </p>
          )}

          {statsSaison1 && <BlocClassementEtTitres stats={statsSaison1} />}
        </div>

        <div className="stats-saison-bloc">
          <h3 className="stats-saison-titre">Saison 2 — Résultat final</h3>

          {chargement && <p className="empty-state">Chargement...</p>}

          {!chargement && !statsSaison2 && (
            <p className="empty-state">
              Pas encore de statistiques — elles apparaîtront automatiquement à la fin de la partie
              (le 16 août à 12h).
            </p>
          )}

          {statsSaison2 && (
            <>
              <BlocClassementEtTitres stats={statsSaison2} />
              {statsSaison2.detailParJoueur && (
                <>
                  <h4 className="stats-detail-titre">Détail par joueur</h4>
                  <BlocDetailParJoueur detailParJoueur={statsSaison2.detailParJoueur} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
