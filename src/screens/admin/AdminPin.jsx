import { useState } from 'react';
import { ADMIN_PIN } from '../../utils/constants';

export default function AdminPin({ onSucces }) {
  const [pin, setPin] = useState('');
  const [erreur, setErreur] = useState(false);

  function valider() {
    if (pin === ADMIN_PIN) {
      onSucces();
    } else {
      setErreur(true);
      setPin('');
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2 className="login-title">🔐 Accès Admin</h2>
        <input
          type="password"
          className="form-select"
          placeholder="Code PIN"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setErreur(false); }}
          onKeyDown={(e) => e.key === 'Enter' && valider()}
        />
        {erreur && <p className="warning-text">Code incorrect.</p>}
        <button className="btn btn-primary" onClick={valider}>Valider</button>
      </div>
    </div>
  );
}
