import { createContext, useContext, useEffect, useState } from 'react';
import { assurerJoueur, ecouterJoueur, ecouterTousJoueurs } from '../firebase/joueurs';
import { ecouterForceRefresh } from '../firebase/godmode';
import { saisonActuelle } from '../utils/constants';

const GameContext = createContext(null);

const STORAGE_KEY = 'tribu_pseudo';

export function GameProvider({ children }) {
  const [pseudo, setPseudoState] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [joueur, setJoueur] = useState(null);
  const [tousJoueurs, setTousJoueurs] = useState({});
  const [chargement, setChargement] = useState(true);
  const [saison, setSaison] = useState(() => saisonActuelle());

  // Bascule automatique de saison, vérifiée chaque minute
  useEffect(() => {
    const interval = setInterval(() => setSaison(saisonActuelle()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Force refresh déclenché par l'admin (God Mode)
  useEffect(() => {
    let premierAppel = true;
    const unsub = ecouterForceRefresh(() => {
      if (premierAppel) { premierAppel = false; return; }
      window.location.reload();
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!pseudo) { setChargement(false); return; }
    setChargement(true);
    assurerJoueur(pseudo).then(() => {
      const unsub = ecouterJoueur(pseudo, (data) => {
        setJoueur(data);
        setChargement(false);
      });
      return unsub;
    });
  }, [pseudo]);

  useEffect(() => {
    const unsub = ecouterTousJoueurs(setTousJoueurs);
    return unsub;
  }, []);

  function connecter(nouveauPseudo) {
    localStorage.setItem(STORAGE_KEY, nouveauPseudo);
    setPseudoState(nouveauPseudo);
  }

  function deconnecter() {
    localStorage.removeItem(STORAGE_KEY);
    setPseudoState(null);
    setJoueur(null);
  }

  const value = {
    pseudo, joueur, tousJoueurs, chargement, saison, connecter, deconnecter,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit être utilisé dans un GameProvider');
  return ctx;
}
