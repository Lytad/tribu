import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { assurerJoueur, ecouterJoueur, ecouterTousJoueurs } from '../firebase/joueurs';
import { ecouterForceRefresh } from '../firebase/godmode';
import { ajouterEvenement } from '../firebase/evenements';
import { ecouterJoueurTest, ecouterTousJoueursTest } from '../firebase/sandbox';
import { saisonActuelle, ADMIN_PSEUDO } from '../utils/constants';

const GameContext = createContext(null);

const STORAGE_KEY = 'tribu_pseudo';

export function GameProvider({ children }) {
  const [pseudo, setPseudoState] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [joueur, setJoueur] = useState(null);
  const [tousJoueurs, setTousJoueurs] = useState({});
  const [chargement, setChargement] = useState(true);
  const [saison, setSaison] = useState(() => saisonActuelle());
  const dernierLeaderRef = useRef(null);

  // Mode test (Bac à Sable) : bascule toute l'app sur les données isolées de test.
  // pseudoTest indique lequel des deux joueurs fictifs (TEST1/TEST2) l'admin incarne.
  const [modeTest, setModeTest] = useState(false);
  const [pseudoTest, setPseudoTestState] = useState('TEST1');

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

  // Chargement du joueur réel — désactivé pendant le mode test
  useEffect(() => {
    if (modeTest) return;
    if (!pseudo) { setChargement(false); return; }
    setChargement(true);
    assurerJoueur(pseudo).then(() => {
      const unsub = ecouterJoueur(pseudo, (data) => {
        setJoueur(data);
        setChargement(false);
      });
      return unsub;
    });
  }, [pseudo, modeTest]);

  // Chargement du joueur de test — actif uniquement en mode test
  useEffect(() => {
    if (!modeTest) return;
    setChargement(true);
    const unsub = ecouterJoueurTest(pseudoTest, (data) => {
      setJoueur(data);
      setChargement(false);
    });
    return unsub;
  }, [modeTest, pseudoTest]);

  useEffect(() => {
    if (modeTest) return;
    const unsub = ecouterTousJoueurs(setTousJoueurs);
    return unsub;
  }, [modeTest]);

  useEffect(() => {
    if (!modeTest) return;
    const unsub = ecouterTousJoueursTest(setTousJoueurs);
    return unsub;
  }, [modeTest]);

  // Détection du changement de leader — uniquement depuis le compte AD et hors mode test,
  // pour éviter que chaque téléphone connecté ne génère le même événement en double.
  useEffect(() => {
    if (pseudo !== ADMIN_PSEUDO || modeTest) return;
    const classement = Object.entries(tousJoueurs)
      .map(([p, data]) => ({ pseudo: p, score: data.score || 0 }))
      .sort((a, b) => b.score - a.score);
    if (classement.length === 0) return;
    const leaderActuel = classement[0].pseudo;
    if (dernierLeaderRef.current === null) {
      // Premier calcul depuis l'ouverture de l'app : on mémorise sans déclencher d'événement,
      // pour ne pas spammer le Journal à chaque rechargement de page.
      dernierLeaderRef.current = leaderActuel;
      return;
    }
    if (leaderActuel !== dernierLeaderRef.current) {
      dernierLeaderRef.current = leaderActuel;
      ajouterEvenement(`${leaderActuel} est passé(e) en tête du classement !`);
    }
  }, [tousJoueurs, pseudo, modeTest]);

  function connecter(nouveauPseudo) {
    localStorage.setItem(STORAGE_KEY, nouveauPseudo);
    setPseudoState(nouveauPseudo);
  }

  function deconnecter() {
    localStorage.removeItem(STORAGE_KEY);
    setPseudoState(null);
    setJoueur(null);
  }

  async function entrerModeTest() {
    setModeTest(true);
    setPseudoTestState('TEST1');
  }

  function quitterModeTest() {
    setModeTest(false);
  }

  function setPseudoTest(nouveauPseudoTest) {
    setPseudoTestState(nouveauPseudoTest);
  }

  const value = {
    pseudo: modeTest ? pseudoTest : pseudo,
    joueur,
    tousJoueurs,
    chargement,
    saison: modeTest ? 1 : saison,
    connecter,
    deconnecter,
    modeTest,
    pseudoTest,
    entrerModeTest,
    quitterModeTest,
    setPseudoTest,
    pseudoReelAdmin: pseudo, // conserve le vrai pseudo (AD) pour savoir qui a le droit d'activer/quitter
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit être utilisé dans un GameProvider');
  return ctx;
}
