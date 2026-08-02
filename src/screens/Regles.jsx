import { useState } from 'react';

const SECTIONS = [
  {
    id: 'concept',
    titre: '🎯 Le concept & le but du jeu',
    contenu: (
      <>
        <p>
          Tribu est un jeu de manipulation, de bluff et de contre-espionnage grandeur nature
          qui se joue en vrai, tout au long des vacances. Chaque joueur reçoit des missions
          secrètes à accomplir sans se faire remarquer — pendant que les autres essaient de
          deviner ce que tout le monde manigance.
        </p>
        <p>
          Le jeu se joue depuis le téléphone. Tous les téléphones sont connectés en temps
          réel : dès qu'un score change, tout le monde le voit instantanément.
        </p>
        <p><strong>Le but :</strong> accumuler le plus de points possible, jusqu'à la fin du séjour, en :</p>
        <ul>
          <li>Réalisant des missions secrètes sans se faire démasquer</li>
          <li>Repérant et dénonçant les missions des autres joueurs</li>
          <li>Jouant intelligemment avec les objets de la boutique et le casino</li>
        </ul>
        <p>
          Le classement évolue en direct, mais les points ne sont validés officiellement que
          chaque soir, lors du Tribunal.
        </p>
        <p>
          <strong>Le prénom se choisit une seule fois</strong>, au tout premier lancement de
          l'application. Ce choix est définitif pour tout le séjour : impossible d'en changer
          ensuite.
        </p>
      </>
    ),
  },
  {
    id: 'calendrier',
    titre: '📅 Le calendrier',
    contenu: (
      <>
        <p><strong>Saison 1 (du 6 au 9 août)</strong> — Mattia, Hilaire et AD s'affrontent en petit comité.</p>
        <p><strong>Saison 2 (du 10 au 16 août)</strong> — Tiphaine, Alex et Léane rejoignent la partie. Le jeu s'ouvre automatiquement à minuit le 10 août, sans aucune action nécessaire.</p>
        <p>Chaque nouveau joueur démarre avec un solde de départ de <strong>40 points</strong>.</p>
      </>
    ),
  },
  {
    id: 'missions',
    titre: '🕵️ Les missions',
    contenu: (
      <>
        <p>L'application propose une mission secrète à réaliser dans la vie réelle, sans que les autres ne s'en rendent compte — ou en réussissant à leur faire croire autre chose.</p>
        <p><strong>Trois niveaux de difficulté :</strong></p>
        <ul>
          <li>🟢 Facile — 10 points</li>
          <li>🟠 Moyenne — 20 points</li>
          <li>🔴 Difficile — 40 points</li>
        </ul>
        <p><strong>Le déroulement d'une mission :</strong></p>
        <ul>
          <li><strong>Proposée</strong> — l'application affiche une mission.</li>
          <li><strong>Passer (-2 pts)</strong> — si elle ne plaît pas, on peut la zapper pour en recevoir une autre. Elle reste disponible pour tout le monde, y compris pour soi-même plus tard.</li>
          <li><strong>Accepter</strong> — la mission devient active et doit être réalisée.</li>
          <li><strong>Abandonner (-5 pts)</strong> — si la mission s'avère impossible, on l'abandonne et on en reçoit une nouvelle.</li>
          <li><strong>Mission accomplie</strong> — une fois réalisée, les points s'ajoutent immédiatement au score (en attente de validation au Tribunal).</li>
        </ul>
        <p><strong>⚡ L'Effet de Levier (-15 pts) :</strong> au moment d'accepter une mission, on peut payer 15 points pour l'activer. Réussite : les points sont doublés. Échec ou abandon : les points normaux sont perdus, en plus des 15 déjà dépensés.</p>
        <p><strong>📷 Attention aux preuves :</strong> certaines missions nécessitent une preuve (photo, vidéo) ou un témoin pour être validées. Sans preuve suffisante, l'admin peut invalider la mission au Tribunal : les points gagnés sont perdus, sans pénalité supplémentaire — mais la mission reste définitivement perdue pour tout le monde.</p>
        <p><strong>Une mission abandonnée</strong> redevient disponible pour tous les autres joueurs, mais jamais pour la personne qui vient de l'abandonner. Un compteur du nombre d'abandons est affiché à titre d'avertissement pour les joueurs suivants.</p>
        <p>Chaque mission n'existe qu'une seule fois : une fois réussie (ou démasquée au Tribunal), elle disparaît définitivement et ne sera plus jamais proposée à personne.</p>
      </>
    ),
  },
  {
    id: 'contre-espionnage',
    titre: '🔍 Le contre-espionnage',
    contenu: (
      <>
        <p>Le jeu ne se limite pas à réaliser ses propres missions : il faut aussi ouvrir l'œil sur ce que font les autres. Chaque journée de jeu se déroule de 20h30 à 20h30 le lendemain.</p>
        <p><strong>« J'ai cramé quelqu'un »</strong> — si on pense avoir deviné la mission de quelqu'un, ce bouton est disponible toute la journée jusqu'à 20h30. On sélectionne sa cible, on décrit en une phrase la mission qu'on pense avoir démasquée, et on valide.</p>
        <ul>
          <li>L'accusation est envoyée silencieusement — personne ne le sait, pas même la personne visée.</li>
          <li>Aucun point n'est perdu ou gagné à ce stade : tout se joue au Tribunal du soir.</li>
          <li>Passé 20h30, le bouton se grise : impossible d'accuser en dernière minute.</li>
        </ul>
        <p><strong>⚠️ Le bluff oral :</strong> deviner ou accuser quelqu'un à voix haute fait aussi partie du jeu — mais attention, cela ne compte pour rien tant que ce n'est pas formalisé dans l'app avant 20h30. Une accusation orale peut être un vrai coup de bluff (vraie ou fausse), donc restez prudents sur ce que vous révélez ou croyez deviner à voix haute.</p>
      </>
    ),
  },
  {
    id: 'boutique',
    titre: '🛒 Le Marché Noir',
    contenu: (
      <>
        <p>Les points sont aussi une monnaie d'échange. La boutique propose six objets tactiques pour s'avantager ou gêner ses adversaires — tous conçus pour rester fair-play : le coût reflète la force de l'effet.</p>
        <p><strong>🧠 Amnésie — 25 pts</strong><br />
          Active une protection pour toute la journée. Si une accusation contre soi s'avère juste au Tribunal de ce soir, on peut choisir de l'annuler : personne ne gagne ni ne perd de points sur cette accusation-là. Si plusieurs accusations visent la même personne le même jour, c'est à elle de choisir laquelle annuler. Une seule Amnésie active à la fois.
        </p>
        <p><strong>🔍 Indice — 15 pts</strong><br />
          Révèle uniquement la difficulté (facile / moyenne / difficile) de la mission active d'un joueur, sans révéler son texte. L'information reste connue de l'acheteur seul.
        </p>
        <p><strong>🧊 Gel des Avoirs — 30 pts</strong><br />
          Bloque l'accès au Casino d'un joueur ciblé pendant 24 heures.
        </p>
        <p><strong>🐌 Ralentissement — 30 pts</strong><br />
          La prochaine mission piochée par un joueur ciblé sera forcément difficile. Il pourra toujours l'abandonner normalement.
        </p>
        <p><strong>💣 Sabotage — 40 pts</strong><br />
          Force instantanément un joueur ciblé à défausser sa mission actuelle pour une mission aléatoire.
        </p>
        <p><strong>🎭 Usurpation — 35 pts</strong><br />
          Révèle publiquement dans le Journal la difficulté de la mission active d'un joueur ciblé. Personne ne saura qui a acheté cet objet contre lui.
        </p>
      </>
    ),
  },
  {
    id: 'casino',
    titre: '🎰 Le Casino',
    contenu: (
      <>
        <p>Un simple pile ou face pour faire fructifier son solde de points — avec des règles strictes pour éviter la ruine totale.</p>
        <ul>
          <li><strong>Mise maximale</strong> — impossible de miser plus de 20 % de son solde actuel.</li>
          <li><strong>Victoire</strong> — la mise est multipliée par 1,8.</li>
          <li><strong>Défaite</strong> — seulement 0,3 fois la mise est récupérée.</li>
          <li><strong>Plafond journalier</strong> — dès +30 points de bénéfice net dans la journée, le Casino ferme ses portes jusqu'au lendemain.</li>
        </ul>
        <p>Le score ne peut jamais descendre sous 0 point, quel que soit le nombre de malus cumulés.</p>
      </>
    ),
  },
  {
    id: 'tribunal',
    titre: '⚖️ Le Tribunal du Soir',
    contenu: (
      <>
        <p>Chaque soir entre 21h00 et minuit, tout le monde se réunit pour le moment clé du jeu.</p>
        <p><strong>Le débrief :</strong> les missions réussies ou abandonnées de la journée sont révélées publiquement — on découvre qui faisait quoi. Les missions en cours ou futures restent strictement secrètes.</p>
        <p><strong>La validation collective :</strong> pour toute mission déclarée réussie, le groupe peut la contester même si aucune preuve n'était formellement requise. Si personne ne confirme l'avoir vue ou n'y croit, l'admin peut l'invalider : les points gagnés sont retirés, sans pénalité supplémentaire — mais la mission reste définitivement perdue pour tout le monde.</p>
        <p><strong>Le jugement des accusations :</strong> pour chaque accusation en attente, l'admin la lit à voix haute. L'accusé doit révéler sa véritable mission en cours. Plusieurs issues sont possibles :</p>
        <ul>
          <li><strong>Fausse accusation</strong> — l'accusateur s'est trompé : il perd 10 points. L'accusé garde sa mission secrète active, rien ne change pour lui.</li>
          <li><strong>Accusation validée</strong> — l'accusateur a vu juste ! L'accusé perd les points de la mission qu'il pensait valider, plus un malus de 10 points. L'accusateur remporte le pactole complet (points de la mission + 10).</li>
          <li><strong>Accusation validée sur mission abandonnée</strong> — si l'accusé avait vraiment la bonne mission mais l'a abandonnée avant le Tribunal, l'accusateur touche un bonus fixe de 10 points (la mission n'ayant rapporté aucun point à l'accusé, déjà pénalisé par l'abandon).</li>
          <li><strong>Annulée par Amnésie</strong> — si l'accusé avait activé une Amnésie ce jour-là, il peut choisir d'annuler l'accusation : personne ne gagne ni ne perd de points.</li>
          <li><strong>Délit d'initié (triche avérée)</strong> — si deux joueurs se sont concertés en douce, l'admin peut annuler l'accusation et infliger -30 points aux deux tricheurs.</li>
        </ul>
        <p>Si deux joueurs accusent la même personne le même jour, seule la première accusation (par ordre d'arrivée) compte pour le pactole — les suivantes sont traitées comme redondantes, sans gain ni perte pour cet accusateur.</p>
        <p>Si le Tribunal n'a pas pu se tenir un soir, rien n'est perdu : toutes les missions et accusations en attente sont automatiquement reportées au lendemain.</p>
      </>
    ),
  },
  {
    id: 'classement',
    titre: '🏆 Le Classement & le Journal',
    contenu: (
      <>
        <p>Le classement général évolue en temps réel, à la seconde où quelqu'un valide une mission ou joue au Casino — ces points restant néanmoins soumis à la validation définitive du Tribunal.</p>
        <p>Il attribue aussi des titres honorifiques… et humiliants, selon la position :</p>
        <ul>
          <li>👑 1er de la partie — « Survole le game, intouchable. »</li>
          <li>🫠 Dernier de la partie — « Est en train de se faire plumer. »</li>
        </ul>
        <p><strong>Le Journal</strong> est un fil d'actualité public que tout le monde peut consulter : certains événements y apparaissent de façon anonyme (une mission réussie ou abandonnée, une protection activée, une accusation validée...), d'autres nomment directement le joueur concerné (rejoindre la partie, passer en tête du classement, être démasqué, subir un Gel/Sabotage/Ralentissement/Usurpation). Il reste consultable à tout moment et garde tout l'historique de la partie.</p>
      </>
    ),
  },
];

export default function Regles() {
  const [sectionOuverte, setSectionOuverte] = useState(SECTIONS[0].id);

  function toggleSection(id) {
    setSectionOuverte((actuel) => (actuel === id ? null : id));
  }

  return (
    <div className="regles-screen">
      <h2 className="dashboard-title">📖 Règles du jeu</h2>
      <p className="dashboard-note">
        Un doute pendant la partie ? Retrouvez ici toutes les règles, classées par thème.
      </p>

      <div className="regles-liste">
        {SECTIONS.map((section) => {
          const estOuverte = sectionOuverte === section.id;
          return (
            <div key={section.id} className="regles-section">
              <button
                className="regles-section-titre"
                onClick={() => toggleSection(section.id)}
              >
                <span>{section.titre}</span>
                <span className="regles-chevron">{estOuverte ? '−' : '+'}</span>
              </button>
              {estOuverte && (
                <div className="regles-section-contenu">
                  {section.contenu}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
