// Dates de bascule des saisons (heure locale du joueur)
export const SAISON_1_DEBUT = new Date('2026-08-06T00:00:00');
export const SAISON_2_DEBUT = new Date('2026-08-10T00:00:00');

export const JOUEURS_SAISON_1 = ['Mattia', 'Hilaire', 'AD'];
export const JOUEURS_SAISON_2_AJOUT = ['Tiphaine', 'Alex', 'Léane'];
export const TOUS_JOUEURS = [...JOUEURS_SAISON_1, ...JOUEURS_SAISON_2_AJOUT];

export const ADMIN_PSEUDO = 'AD';
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '457894';

// Points liés au cycle de mission
export const POINTS = {
  facile: 10,
  moyenne: 20,
  difficile: 40,
  passer: -2,
  abandonner: -5,
  effetDeLevierCout: -15,
  fausseAccusation: -10,
  accuseMalus: -10,
  amnesieCout: 25,
  indiceCout: 15,
  gelCout: 30,
  ralentissementCout: 30,
  sabotageCout: 40,
  usurpationCout: 35,
  delitInitieMalus: -30,
};

// Casino
export const CASINO = {
  miseMaxRatio: 0.2, // 20% du solde
  multiplicateurVictoire: 1.8,
  multiplicateurDefaite: 0.3,
  plafondBeneficeJournalier: 30,
};

// Fenêtres horaires (heures locales, 0-23)
export const HEURE_FIN_ACCUSATIONS = 20.5; // 20h30
export const HEURE_DEBUT_TRIBUNAL = 21;
export const HEURE_FIN_TRIBUNAL = 24;

export function saisonActuelle(date = new Date()) {
  if (date >= SAISON_2_DEBUT) return 2;
  if (date >= SAISON_1_DEBUT) return 1;
  return 0; // pas encore commencé
}

export function heureDecimale(date = new Date()) {
  return date.getHours() + date.getMinutes() / 60;
}
