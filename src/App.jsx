import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Missions from './screens/Missions';
import Accusation from './screens/Accusation';
import Boutique from './screens/Boutique';
import Casino from './screens/Casino';
import Journal from './screens/Journal';
import Regles from './screens/Regles';
import AdminPin from './screens/admin/AdminPin';
import Tribunal from './screens/admin/Tribunal';
import GodMode from './screens/admin/GodMode';
import { ADMIN_PSEUDO } from './utils/constants';
import './App.css';

const ONGLETS = [
  { id: 'dashboard', label: 'Classement', icon: '🏆' },
  { id: 'missions', label: 'Missions', icon: '🎯' },
  { id: 'accusation', label: 'Accuser', icon: '🕵️' },
  { id: 'boutique', label: 'Boutique', icon: '🛒' },
  { id: 'casino', label: 'Casino', icon: '🎰' },
  { id: 'journal', label: 'Journal', icon: '📰' },
];

function AppContent() {
  const {
    pseudo, joueur, chargement, modeTest, pseudoTest, setPseudoTest,
    quitterModeTest, pseudoReelAdmin,
  } = useGame();
  const [onglet, setOnglet] = useState('dashboard');
  const [adminDeverrouille, setAdminDeverrouille] = useState(false);
  const [pinOuvert, setPinOuvert] = useState(false);
  const [reglesOuvertes, setReglesOuvertes] = useState(false);
  const [vueAdmin, setVueAdmin] = useState('tribunal'); // 'tribunal' | 'godmode'

  if (!pseudo) return <Login />;
  if (chargement || !joueur) {
    return <div className="login-screen"><p className="empty-state">Chargement...</p></div>;
  }

  // L'accès admin reste basé sur le VRAI pseudo AD, même en mode test — sinon incarner
  // TEST1/TEST2 ferait perdre l'accès au Tribunal et au God Mode.
  const estAdmin = pseudoReelAdmin === ADMIN_PSEUDO;

  const bandeauTest = modeTest && (
    <div className="bandeau-test">
      🧪 MODE TEST — tu incarnes
      <select
        className="bandeau-test-select"
        value={pseudoTest}
        onChange={(e) => setPseudoTest(e.target.value)}
      >
        <option value="TEST1">TEST1</option>
        <option value="TEST2">TEST2</option>
      </select>
      <button className="bandeau-test-quitter" onClick={quitterModeTest}>Quitter</button>
    </div>
  );

  const modaleRegles = reglesOuvertes && (
    <div className="modal-overlay" onClick={() => setReglesOuvertes(false)}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <Regles />
        <button className="btn btn-secondary" onClick={() => setReglesOuvertes(false)} style={{ marginTop: 16 }}>
          Fermer
        </button>
      </div>
    </div>
  );

  if (estAdmin && adminDeverrouille) {
    return (
      <div className="app-shell">
        {bandeauTest}
        <header className="app-header">
          <span className="app-header-title">TRIBU — Admin</span>
          <button className="btn-lien" onClick={() => setAdminDeverrouille(false)}>Quitter l'admin</button>
        </header>
        <div className="admin-tabs">
          <button className={vueAdmin === 'tribunal' ? 'admin-tab-active' : ''} onClick={() => setVueAdmin('tribunal')}>⚖️ Tribunal</button>
          <button className={vueAdmin === 'godmode' ? 'admin-tab-active' : ''} onClick={() => setVueAdmin('godmode')}>🛠️ God Mode</button>
        </div>
        <main className="app-main">
          {vueAdmin === 'tribunal' ? <Tribunal /> : <GodMode />}
        </main>
        {modaleRegles}
      </div>
    );
  }

  return (
    <div className="app-shell">
      {bandeauTest}
      <header className="app-header">
        <span className="app-header-title">TRIBU</span>
        <div className="app-header-actions">
          <button className="btn-regles" onClick={() => setReglesOuvertes(true)}>📖</button>
          <span className="app-header-score">{joueur.score || 0} pts</span>
        </div>
      </header>

      <main className="app-main">
        {onglet === 'dashboard' && <Dashboard />}
        {onglet === 'missions' && <Missions />}
        {onglet === 'accusation' && <Accusation />}
        {onglet === 'boutique' && <Boutique />}
        {onglet === 'casino' && <Casino />}
        {onglet === 'journal' && <Journal />}
      </main>

      <nav className="app-nav">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            className={`nav-btn ${onglet === o.id ? 'nav-btn-active' : ''}`}
            onClick={() => setOnglet(o.id)}
          >
            <span className="nav-icon">{o.icon}</span>
            <span className="nav-label">{o.label}</span>
          </button>
        ))}
        {estAdmin && (
          <button className="nav-btn" onClick={() => setPinOuvert(true)}>
            <span className="nav-icon">⚖️</span>
            <span className="nav-label">Admin</span>
          </button>
        )}
      </nav>

      {pinOuvert && (
        <div className="modal-overlay" onClick={() => setPinOuvert(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AdminPin onSucces={() => { setPinOuvert(false); setAdminDeverrouille(true); }} />
          </div>
        </div>
      )}

      {modaleRegles}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
