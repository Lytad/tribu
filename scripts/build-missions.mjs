// Génère src/data/missions.json à partir des listes brutes ci-dessous.
// Chaque mission reçoit un id stable : S<saison>-<difficulte>-<numero>
import { writeFileSync } from 'fs';

const s1Faciles = `Placer le mot "pédiluve" de manière naturelle dans une conversation sérieuse.
Boire une gorgée dans le verre de quelqu'un d'autre sans qu'il ne s'en rende compte.*
Faire un compliment très précis et sérieux sur le coude ou le genou d'un des joueurs.
Réussir à faire un "High-five" à quelqu'un sans aucune raison valable.
Appeler un membre du groupe par le prénom d'un autre membre avec beaucoup d'assurance.
Prendre en photo l'orteil de quelqu'un sans qu'il s'en aperçoive.*
Faire semblant de chercher un objet dans ses poches pendant 1 minute complète pendant que quelqu'un parle.
Dire "C'est pas faux" à trois phrases complexes de suite.
Bailler de manière exagérée au moins 4 fois en moins de deux minutes.
Prononcer la phrase "On n'est pas bien là ?" en regardant le plafond.
Placer le mot "ornithorynque" de manière naturelle dans la conversation.
Faire un compliment très précis sur les chaussures de quelqu'un.
Se resservir en eau 3 fois en 10 minutes sans que personne ne le remarque.
Demander l'heure à quelqu'un alors que tu portes une montre ou as ton téléphone en main.
Renifler bruyamment et dire "ça sent le sapin" sans aucun contexte.
Proposer très sérieusement de faire une pause "étirement collectif" en plein milieu d'une discussion.
Complimenter quelqu'un sur sa "posture assise" avec le plus grand sérieux.
Répéter le dernier mot de chaque phrase que dit une personne pendant 2 minutes.
Faire remarquer à voix haute que "l'air est différent ici" sans justification.
Toucher discrètement le bras de trois personnes différentes en moins de 5 minutes, sans raison.
Demander à quelqu'un s'il a bien dormi alors qu'il est 15h.
Applaudir tout seul et brièvement après une phrase totalement anodine.
Dire "intéressant" d'un ton pensif après chaque remarque de quelqu'un pendant 3 minutes.
Regarder sa montre ou son téléphone toutes les 30 secondes pendant 2 minutes, sans raison apparente.
Faire une remarque sur la météo qui n'a aucun rapport avec le temps qu'il fait réellement.
Se lever et changer de chaise sans explication au milieu d'un repas.
Demander à quelqu'un de sentir tes mains en prétextant une odeur bizarre.
Utiliser l'expression "à l'ancienne" pour qualifier un objet moderne.
Faire un signe de croix discret avant de manger, sans commentaire.
Compter à voix basse jusqu'à 10 en fixant le plafond, devant quelqu'un.
Demander sérieusement à quelqu'un "T'as grandi non ?"
Prononcer "je dis ça, je dis rien" après une phrase totalement neutre.
Faire semblant d'avoir une notification sur ton téléphone et pousser un petit "oh" surpris.
Croiser les bras et hocher la tête lentement pendant que quelqu'un parle de quelque chose de banal.
Demander à quelqu'un s'il a changé de parfum, qu'il en ait changé ou non.
Frotter tes mains l'une contre l'autre en disant "bon..." avant de changer de sujet abruptement.
Utiliser le mot "rocambolesque" pour décrire un événement banal de la journée.
Faire un clin d'œil sérieux à quelqu'un après une phrase totalement neutre.
Dire "on en reparle" à propos d'un sujet totalement inventé qui n'a jamais été abordé.
Proposer d'ouvrir une fenêtre alors qu'il ne fait pas chaud, avec insistance légère.
Complimenter la "démarche" de quelqu'un avec un sérieux absolu.
Faire mine de prendre des notes mentales en disant "je note" après une remarque anodine.
Dire à quelqu'un "tu m'as manqué" alors que vous vous êtes vus la veille.
Demander à voix haute où est passé un objet qui est en réalité dans ta poche.
Pousser un soupir de soulagement exagéré après avoir posé un simple verre sur la table.
Faire une pause dramatique de 3 secondes avant de répondre à une question banale.
Toucher ton propre nez chaque fois qu'une personne précise prend la parole, pendant 5 minutes.
Dire "on va y arriver" à propos d'une tâche totalement anodine, comme si c'était un défi.
Demander à quelqu'un s'il a "pris le temps de respirer aujourd'hui" avec un ton de coach de vie.
Répondre "tout à fait d'accord" à une phrase que tu n'as pas vraiment écoutée.`;

const s1Moyennes = `Convaincre le groupe d'écouter une chanson très spécifique et ringarde jusqu'au bout.
Lancer un débat passionné sur la meilleure technique pour ranger le frigo, et le tenir 2 minutes.
Subtiliser un petit objet (briquet, clés) et le poser bien en évidence dans une autre pièce.*
Réussir à masser les épaules de quelqu'un pendant 10 secondes sans qu'il ne te repousse.
Raconter une anecdote totalement fausse sur ton enfance et la tenir jusqu'à ce que quelqu'un change de sujet.
S'étirer en faisant un bruit extrêmement bizarre et fort au beau milieu d'une phrase.
Faire croire que tu as une crampe au mollet et demander à quelqu'un de t'aider à étirer ta jambe.
Proposer un toast à table pour une raison totalement absurde (ex: "À l'invention de la fourchette").
Parler avec un léger accent (québécois, belge, etc.) pendant au moins 3 minutes.
Soutenir mordicus qu'un acteur très connu est mort alors qu'il est vivant.
Lancer un faux débat absurde sur le fait que le ketchup devrait être gardé au placard, et le tenir 2 minutes.
Convaincre quelqu'un d'écouter une musique très précise que tu as choisie à l'avance.
Faire croire que tu as perdu un objet important et organiser une "recherche" pendant 3 minutes.
Réussir à faire dire "exactement" trois fois à la même personne en moins de 5 minutes.
Inventer une règle de savoir-vivre totalement fausse et l'énoncer avec assurance devant le groupe.
Convaincre quelqu'un de goûter les yeux fermés un aliment en lui faisant croire que c'est autre chose.
Réussir à faire porter la responsabilité d'un petit incident (verre renversé, lumière éteinte) à quelqu'un d'autre.
Organiser un vote éclair sur un sujet totalement futile et t'assurer qu'il ait lieu.
Faire croire que tu connais une célébrité personnellement et donner de faux détails crédibles.
Convaincre le groupe de prendre une photo de groupe pour une raison inventée.
Réussir à échanger la place de deux objets sur une table sans que personne ne le remarque sur le moment.
Lancer une "mode" éphémère (une expression, un geste) et la faire reprendre par au moins une personne.
Faire croire que tu as mal quelque part de façon légère et t'en plaindre discrètement pendant 5 minutes.
Convaincre quelqu'un de t'aider à chercher tes clés alors qu'elles sont dans ta poche.
Réussir à faire dire à quelqu'un une phrase précise que tu as choisie, en la lui soufflant indirectement.
Proposer sérieusement de refaire la décoration d'une pièce, avec des arguments détaillés inventés.
Faire croire que tu as un talent caché improbable et le maintenir sans jamais le prouver.
Convaincre le groupe que l'horloge ou une montre retarde ou avance, alors que ce n'est pas le cas.
Raconter un rêve totalement inventé avec un luxe de détails convaincants.
Réussir à faire adopter une nouvelle façon de trinquer ou de saluer par au moins deux personnes.
Faire croire à quelqu'un que son téléphone a vibré alors que ce n'est pas le cas.
Convaincre le groupe de manger dans un ordre précis et inhabituel (dessert avant le plat, par exemple).
Inventer un mot totalement absurde et le placer trois fois dans la conversation comme s'il existait vraiment.
Faire croire que tu as vu quelque chose bouger dehors et créer un léger moment de suspense.
Réussir à convaincre quelqu'un de changer de place à table sous un faux prétexte.`;

const s1Difficiles = `Convaincre le groupe de changer complètement l'activité prévue pour l'après-midi ou la soirée.
Porter un vêtement (t-shirt, pull, lunettes) appartenant à un autre joueur pendant au moins 1 heure.*
Simuler une vraie peur panique soudaine face à un insecte imaginaire.
Faire en sorte que tous les membres présents se lèvent de leur chaise en même temps.
Simuler d'être réellement vexé par une remarque anodine pendant au moins 5 minutes (aller dans son coin, bouder).
Réussir à faire chanter au moins une phrase d'une chanson Disney à un autre joueur sans lui demander directement.
Convaincre le groupe entier de manger un repas dans un ordre totalement différent de d'habitude, sans expliquer pourquoi.
Faire croire pendant au moins 10 minutes que tu as perdu un objet de valeur (portefeuille, clés de voiture).
Réussir à faire porter à quelqu'un un accessoire ridicule (chapeau, écharpe) pendant 30 minutes sans qu'il proteste.
Organiser et faire accepter par le groupe un jeu totalement inventé avec des règles absurdes, pendant au moins 10 minutes.
Simuler une conversation téléphonique inventée de A à Z pendant au moins 3 minutes devant le groupe.
Convaincre quelqu'un de porter tes chaussures ou ta veste pendant une sortie, sous un faux prétexte.
Réussir à faire annuler ou reporter un plan prévu par le groupe grâce à un argument inventé.
Faire croire à tout le groupe qu'un objet du quotidien a une histoire ou une origine extraordinaire, et le maintenir toute la soirée.
Provoquer une "panne" générale volontaire (lumière, musique) et gérer la situation en gardant ton sérieux jusqu'à ce que quelqu'un s'en aperçoive.`;

const s2Faciles = `Fixer intensément le front (et non les yeux) de quelqu'un qui te parle pendant au moins 30 secondes.*
Faire semblant de trébucher sur un obstacle totalement invisible au milieu du salon.
Faire un clin d'œil très appuyé et gênant à quelqu'un à travers la pièce.
Prononcer le mot "Saperlipopette" lors d'un moment de frustration.
Toucher le nez de quelqu'un en disant "Pouet".
Demander à quelqu'un de répéter ce qu'il vient de dire trois fois de suite.
Applaudir tout seul pendant 3 secondes après une phrase banale de quelqu'un.
Déplacer discrètement la chaussure droite de quelqu'un dans une autre pièce.*
Faire un bruit d'animal très faible (ex: miaulement) et demander si quelqu'un d'autre l'a entendu.
Sourire de toutes ses dents sans raison pendant que quelqu'un raconte une histoire triste ou sérieuse.
Placer le mot "zeugma" dans une phrase sans que personne ne relève.
Complimenter très précisément les cils ou les sourcils de quelqu'un.
Demander à quelqu'un s'il a pris un coup de soleil, en plein hiver.
Faire une pause de 5 secondes avant de répondre "oui" à une question simple.
Prétendre chercher tes lunettes alors que tu ne portes pas de lunettes.
Renifler ta manche discrètement avec un air soucieux devant quelqu'un.
Dire "c'est du vécu" après une remarque anodine sur un sujet quelconque.
Proposer très sérieusement un "tour de table" pour donner son avis sur la température de la pièce.
Complimenter la façon dont quelqu'un tient sa fourchette ou son verre.
Faire semblant de recevoir un appel important et t'excuser pour "prendre l'air".
Demander à quelqu'un s'il a maigri, qu'il ait maigri ou non.
Regarder ta main comme si tu venais de te blesser, sans dire un mot, puis continuer normalement.
Toucher le coin de la table trois fois avant de t'asseoir, sans explication.
Dire "j'ai l'œil pour ça" à propos d'un sujet totalement banal.
Se frotter les mains en disant "alors, alors, alors" avant de changer de sujet.
Demander à quelqu'un de sentir un objet quelconque sans expliquer pourquoi.
Faire une remarque sur le "bon feeling" d'une pièce sans plus de précision.
Répéter "carrément" après chaque phrase que dit une personne précise, pendant 3 minutes.
Faire un signe discret de la main à quelqu'un comme si tu lui envoyais un message codé.
Prétendre avoir une poussière dans l'œil pendant 30 secondes de façon insistante.
Dire "ça reste entre nous" à propos d'une information totalement anodine.
Complimenter la qualité de la poignée de main de quelqu'un, avec sérieux.
Demander à quelqu'un s'il a changé de coiffure, qu'il l'ait fait ou non.
Faire mine de vérifier ton pouls pendant quelques secondes sans explication.
Utiliser l'expression "en mon âme et conscience" pour une déclaration banale.
Prétendre avoir un vertige léger en te levant, puis te rasseoir immédiatement.
Dire "je le sentais venir" après un événement totalement imprévisible et banal.
Faire un pas de côté inutile chaque fois qu'une personne précise se lève, pendant 10 minutes.
Complimenter la texture d'un vêtement de quelqu'un avec un sérieux exagéré.
Demander l'avis de quelqu'un sur un sujet que tu viens d'inventer sur le moment.
Faire une grimace discrète chaque fois qu'un mot précis est prononcé, pendant 5 minutes.
Proposer de "faire une photo souvenir" pour un moment complètement banal.
Répéter "c'est fou hein" après chaque remarque d'une personne, pendant 3 minutes.
Faire semblant de reconnaître une odeur de cuisine alors qu'il n'y a rien qui cuit.
Dire "à qui le dis-tu" à une phrase qui ne te concerne absolument pas.
Toucher ton oreille gauche à chaque fois qu'un joueur précis prend la parole, pendant 5 minutes.
Demander à quelqu'un s'il porte du parfum différent aujourd'hui.
Proposer de "faire une mini-pause hydratation collective" en plein milieu d'une activité.
Complimenter la démarche ou la façon de marcher de quelqu'un avec un sérieux absolu.
Faire une remarque sur le silence de la pièce quand ce n'est pas particulièrement silencieux.
Dire "c'est un signe" à propos d'un événement totalement anodin (une lumière qui clignote, un bruit).
Prétendre avoir déjà vécu exactement ce moment ("déjà-vu") à voix haute.
Faire semblant de compter quelque chose du regard dans la pièce, sans explication.
Demander à quelqu'un s'il fait de la musculation, qu'il en fasse ou non.
Utiliser le mot "kafkaïen" pour décrire une situation banale du quotidien.
Prétendre reconnaître une chanson qui n'est pas en train de jouer et fredonner un air.
Faire remarquer que "la lumière est particulière aujourd'hui" sans autre précision.
Dire "j'ai un pressentiment" avant un événement totalement prévisible.
Complimenter très sérieusement le "timing" de quelqu'un pour une action banale.
Faire semblant de reconnaître quelqu'un au loin et faire un signe de la main à un inconnu.
Proposer une "minute de gratitude collective" sans aucune raison particulière.
Demander à quelqu'un si tout va bien, d'un ton très inquiet, sans raison apparente.
Répéter le prénom de quelqu'un deux fois de suite au début de chaque phrase que tu lui adresses, pendant 5 minutes.
Faire une remarque énigmatique du type "on verra bien" sur un sujet totalement clair.
Prétendre entendre un bruit bizarre venant d'une autre pièce et aller "vérifier".
Complimenter la voix ou le ton de quelqu'un de façon très précise et sérieuse.
Faire un geste de la main façon "chef d'orchestre" en parlant, sans explication.
Dire "c'est marqué nulle part mais tout le monde le sait" à propos d'un sujet inventé.
Proposer de "faire un point météo" en plein milieu d'une conversation sérieuse.
Faire semblant de reconnaître un parfum précis dans l'air et le nommer à voix haute.
Toucher légèrement la table trois fois avant de répondre à une question.
Dire "c'est mon côté cartésien" après une remarque qui n'a rien de rationnel.
Prétendre avoir une sensation de déjà-entendu sur une phrase banale que quelqu'un vient de dire.
Faire un clin d'œil complice à quelqu'un après une phrase qui n'a rien de complice.
Complimenter la solidité de la poignée d'un sac ou d'un objet quelconque.
Proposer très sérieusement de "faire un débrief" après un moment totalement anodin.
Faire semblant de vérifier la solidité d'une chaise avant de t'asseoir, avec insistance.
Dire "je le savais" après un événement totalement imprévisible que tu n'aurais pas pu prévoir.
Demander à quelqu'un s'il a changé de dentifrice ou de marque de savon, sans raison.
Complimenter la régularité de la respiration de quelqu'un, avec un sérieux médical.
Faire remarquer que "l'ambiance a changé" dans une pièce sans que rien n'ait réellement changé.
Prétendre reconnaître un bruit de moteur dehors et commenter sa marque supposée.
Faire une pause théâtrale avant de dire "bonjour" en entrant dans une pièce.
Proposer de "synchroniser les montres" avant une activité totalement anodine.
Dire "ça sent le roussi" sans qu'il y ait la moindre odeur de brûlé.
Complimenter la propreté ou l'organisation d'un tiroir ou d'un sac de quelqu'un.
Faire semblant de reconnaître une personne dans la rue et l'appeler par un prénom inventé.
Prétendre avoir un doute sur l'heure alors que tu la connais parfaitement.
Répéter "logique" après chaque phrase d'une personne précise, pendant 3 minutes.
Faire remarquer que quelqu'un "a l'air fatigué" alors qu'il n'en a pas l'air du tout.
Proposer de "faire un tour de vérification" des lumières ou des portes sans raison.
Dire "c'est bon signe" à propos d'un événement totalement neutre.
Complimenter la précision du geste de quelqu'un pour une action banale (verser de l'eau, ouvrir une porte).
Faire une remarque sur "l'énergie du groupe" sans plus de précision, avec un ton mystique.
Prétendre reconnaître le bruit d'une voiture précise qui approche.
Toucher discrètement ton poignet gauche à chaque fois qu'un mot précis est prononcé.
Faire un signe de tête approbateur exagéré à chaque phrase d'une personne, pendant 3 minutes.
Dire "ça ne trompe pas" après une observation totalement anodine.
Proposer de "faire une pause silence" pour "mieux se concentrer" sans raison particulière.
Complimenter très sérieusement la façon dont quelqu'un plie une serviette.
Faire semblant d'avoir un frisson soudain et frotter tes bras, sans explication.
Prétendre que la pièce est plus froide ou plus chaude que d'habitude, sans preuve.
Dire "il y a quelque chose dans l'air" avec un ton mystérieux, sans suite.
Faire remarquer que "le temps passe vite" à un moment totalement quelconque.
Complimenter la capacité de quelqu'un à "bien s'organiser" pour une tâche banale.
Proposer un "check collectif" (frapper dans les mains) pour valider une décision anodine.
Faire semblant de reconnaître une musique au loin qui n'existe pas.
Dire "ça me rappelle quelque chose" à propos d'un objet totalement banal.
Toucher trois fois le dossier d'une chaise avant de t'y asseoir.
Complimenter la "présence" de quelqu'un dans une pièce, de façon très sérieuse.
Faire une remarque sur le fait que "quelque chose a bougé" sans qu'il y ait de mouvement visible.
Proposer de "faire silence deux secondes" pour "écouter la maison".
Dire "je capte des ondes bizarres" en entrant dans une pièce, sans suite.
Faire semblant de reconnaître un parfum de nourriture précis venant de loin.
Complimenter la force de poignée de quelqu'un en lui serrant la main, avec un sérieux exagéré.
Demander à quelqu'un s'il a bien mangé aujourd'hui, d'un ton très concerné.
Faire un geste discret de "croisement de doigts" avant qu'une personne parle, sans explication.
Dire "c'est écrit" à propos d'un événement totalement banal et non prévisible.
Proposer de "faire un point" sur l'ambiance générale du groupe sans raison précise.
Complimenter la manière dont quelqu'un range ses affaires, avec un sérieux de spécialiste.
Faire remarquer un "détail suspect" totalement inventé sur un objet du quotidien.
Prétendre ressentir une petite douleur au poignet en portant un objet léger.
Dire "je le sens mal" à propos d'un événement totalement neutre et sans enjeu.
Faire une pause avant de répondre "peut-être" à une question qui demande un oui ou un non clair.
Complimenter très sérieusement la rapidité avec laquelle quelqu'un a fait une tâche banale.
Proposer de "faire une ronde" dans la maison sans raison particulière.
Faire semblant de reconnaître une plante précise et donner un faux nom scientifique avec assurance.
Dire "ça y est, je le tiens" à propos d'une pensée totalement banale.
Complimenter le rythme de la voix de quelqu'un pendant qu'il parle.
Faire remarquer que "la lumière a baissé" alors que rien n'a changé.
Proposer un "tour de contrôle" des fenêtres avant de sortir, sans raison particulière.
Dire "c'est du détail mais ça compte" à propos d'un fait totalement insignifiant.
Faire semblant de vérifier la météo sur ton téléphone alors qu'il est éteint.
Complimenter la stabilité de la main de quelqu'un en tenant un objet.
Faire une remarque sur "un courant d'air bizarre" sans qu'il y en ait un.
Proposer de "faire un tour de synchronisation" avant de partir quelque part ensemble.
Dire "ça ne m'étonne qu'à moitié" après un événement totalement anodin.
Complimenter la précision d'un geste de découpe ou de service à table.
Faire semblant de reconnaître le bruit d'un objet qui tombe dans une autre pièce.
Dire "c'est le calme avant la tempête" à propos d'un moment totalement paisible.
Proposer une "pause silence" de 10 secondes pour "recentrer le groupe".
Complimenter très sérieusement l'équilibre de quelqu'un en marchant sur un sol plat.
Faire remarquer un changement de "vibe" dans la pièce sans qu'il y en ait un réel.
Prétendre voir un reflet bizarre dans une vitre ou un miroir et le commenter brièvement.
Dire "il y a de l'électricité dans l'air" sans aucun événement particulier.
Faire un geste de "protection" (main sur le cœur) après une phrase totalement banale.
Complimenter la clarté d'élocution de quelqu'un, avec un ton très professionnel.
Proposer de "faire un debrief météo" pour la journée sans raison particulière.
Faire semblant de reconnaître un logo ou une marque au loin et la commenter faussement.
Dire "je le note mentalement" après une information totalement insignifiante.
Toucher discrètement ton front à chaque fois qu'un sujet précis est abordé.
Complimenter très sérieusement la façon dont quelqu'un tient son téléphone.
Faire remarquer que "le sol vibre légèrement" sans aucune raison.
Proposer de "faire un tour d'horizon" des sujets abordés depuis le début de la soirée, sans raison.
Dire "ça se voit sur ton visage" à quelqu'un qui n'exprime rien de particulier.
Faire semblant de reconnaître un bruit d'oiseau précis dehors et lui donner un faux nom.
Complimenter la qualité du silence d'une pièce, avec un ton très sérieux.
Proposer de "faire un point sur l'énergie collective" sans explication.
Dire "j'ai comme un doute" à propos d'un fait totalement établi et certain.
Faire une remarque sur "une odeur de changement" dans l'air, sans suite.
Complimenter très sérieusement la rectitude de la posture de quelqu'un assis.
Prétendre reconnaître le bruit d'une porte précise qui s'ouvre ailleurs dans la maison.
Faire un signe discret de "silence" (doigt sur la bouche) sans raison, puis reprendre normalement.
Dire "il y a un truc qui cloche" à propos d'une situation totalement normale.
Proposer un "tour de remerciement collectif" pour une chose totalement anodine.`;

const s2Moyennes = `Critiquer ouvertement un plat ou un aliment que tout le monde adore ("La pizza c'est surcoté").
Réussir à prendre un selfie avec chaque membre du groupe (un par un) en moins de 10 minutes.*
Convaincre quelqu'un de goûter une combinaison de nourriture étrange (ex: chips et confiture).
Cacher discrètement le téléphone de quelqu'un sous un coussin pendant qu'il est dans la pièce.
Parler de soi à la troisième personne pendant au moins 5 minutes.
Lancer un jeu de mots ou une blague nulle et être le seul à rire aux éclats pendant 30 secondes.
Faire croire que tu as reçu un message très choquant, fixer ton téléphone les yeux écarquillés, puis refuser d'en parler.
Réussir à nourrir quelqu'un à la bouche (lui donner un bout de pain, une chips).*
Insister lourdement pour que le groupe regarde une vidéo YouTube de plus de 5 minutes très ennuyeuse.
Donner un surnom affectueux très étrange ("Mon petit poney", "Ma loutre") à quelqu'un et l'utiliser 5 fois dans l'heure.
Convaincre le groupe qu'un objet du quotidien porte-bonheur ou malheur, et le faire respecter par au moins deux personnes.
Organiser un vote à main levée sur un sujet totalement futile et t'assurer que tout le monde participe.
Faire croire que tu as un rendez-vous important et t'éclipser 5 minutes de façon suspecte.
Réussir à échanger deux objets identiques appartenant à deux joueurs différents sans qu'ils s'en aperçoivent.
Lancer une rumeur totalement inventée sur un événement futur et voir jusqu'où elle circule.
Convaincre quelqu'un de porter un objet incongru (bonnet, lunettes de soleil) à l'intérieur pendant 15 minutes.
Faire croire à tout le groupe qu'il manque une personne alors que tout le monde est présent.
Réussir à faire dire "carrément" à trois personnes différentes dans la même conversation.
Organiser une "cérémonie" improvisée et absurde autour d'un objet quelconque (une télécommande, une plante).
Convaincre le groupe de manger dans un ordre ou une disposition inhabituelle, sans donner de vraie raison.
Faire croire que tu as vu quelqu'un dehors alors qu'il n'y a personne, et maintenir le mystère 5 minutes.
Réussir à faire adopter un geste de salutation inventé par au moins deux personnes du groupe.
Convaincre quelqu'un que son plat a un ingrédient qu'il n'a pas réellement.
Organiser un faux "tirage au sort" truqué à l'avance pour une tâche quelconque.
Faire croire que la connexion internet ou le wifi a un problème alors que tout fonctionne normalement.
Réussir à convaincre deux personnes de changer de place sans qu'elles réalisent que c'est toi qui l'as orchestré.
Raconter une "prédiction" totalement inventée sur la soirée et la faire "se réaliser" en la provoquant toi-même.
Convaincre le groupe qu'un bruit extérieur anodin est en fait quelque chose de précis et improbable.
Faire croire à quelqu'un qu'il a un talent caché en le complimentant à outrance sur une tâche banale.
Réussir à faire dire "en même temps" à trois personnes différentes en moins de 10 minutes.
Organiser un jeu improvisé et convaincre au moins 3 joueurs d'y participer sans en révéler la règle cachée.
Faire croire que tu as un rhume ou une petite maladie et tousser discrètement toute la soirée.
Convaincre quelqu'un d'essayer une nouvelle façon de s'asseoir ou de se tenir "pour la santé du dos".
Réussir à faire circuler un objet dans le groupe sans que la majorité comprenne pourquoi.
Faire croire que le groupe a déjà vécu exactement cette soirée, façon "déjà-vu" collectif.
Organiser une "minute de silence" pour un objet cassé ou perdu qui n'a en réalité jamais existé.
Convaincre le groupe que quelqu'un d'absent a laissé un message important, totalement inventé.
Réussir à faire dire "logique" à une personne précise trois fois dans la soirée.
Faire croire à quelqu'un que tu as trouvé quelque chose qui lui appartient, alors que ce n'est pas le cas.
Organiser un "concours" improvisé sans règles claires et convaincre le groupe d'y jouer sérieusement.
Convaincre quelqu'un que la lumière ou le chauffage de la pièce a un problème, alors que tout fonctionne bien.
Réussir à faire raconter à quelqu'un une histoire personnelle en lui posant des questions très ciblées.
Faire croire au groupe qu'il y a une "tradition" familiale ou de groupe totalement inventée, et la faire respecter.
Organiser un échange de cadeaux surprise fictif et convaincre au moins une personne d'y "participer" activement.
Convaincre quelqu'un de goûter un plat en lui donnant une fausse origine ou un faux nom exotique.
Réussir à faire dire "c'est clair" à une personne précise trois fois de suite dans la conversation.
Faire croire que tu as entendu une information de dernière minute et la partager avec un sérieux absolu.
Organiser un "brief" totalement inutile avant une activité banale (regarder un film, manger).
Convaincre le groupe qu'un objet a une valeur sentimentale qu'il n'a jamais eue.
Réussir à faire deviner un mot ou une expression à quelqu'un sans jamais le prononcer, sur toute une soirée.
Faire croire que ton téléphone a un problème de batterie alors qu'il est chargé à 100%.
Organiser un "sondage" oral improvisé sur un sujet totalement absurde et noter les réponses sérieusement.
Convaincre quelqu'un que la nourriture qu'il mange vient d'un endroit précis totalement inventé.
Réussir à faire dire "à la base" à deux personnes différentes en moins de 10 minutes.
Faire croire au groupe qu'il manque un ingrédient essentiel dans un plat alors que tout est complet.
Organiser une "pause photo souvenir" collective pour un moment totalement anodin de la soirée.
Convaincre quelqu'un d'échanger de verre avec toi sous un prétexte inventé.
Réussir à faire dire "littéralement" à une personne précise trois fois dans la conversation.
Faire croire que tu as un message urgent à envoyer et le "envoyer" de façon très théâtrale.
Organiser un jeu de rôle improvisé où tout le monde doit parler d'une certaine façon, sans donner la vraie raison.
Convaincre le groupe qu'une chanson précise "porte chance" pour la soirée et la faire jouer.
Réussir à faire deviner à quelqu'un un chiffre précis en posant des questions détournées.
Faire croire à quelqu'un que sa chaise ou son siège est instable, alors qu'il ne l'est pas.
Organiser un échange de rôles temporaire (qui sert à boire, qui débarrasse) sous un faux prétexte.
Convaincre quelqu'un que tu as prédit un événement banal juste avant qu'il n'arrive.
Réussir à faire dire "franchement" à trois personnes différentes dans la même soirée.
Faire croire que le groupe a raté un moment important en ton absence, totalement inventé.
Organiser un vote secret sur un sujet totalement futile et en révéler faussement le résultat.
Convaincre quelqu'un que l'odeur d'un plat est différente de d'habitude, alors qu'elle est identique.
Réussir à faire porter la responsabilité d'une petite blague à une personne innocente.
Faire croire à quelqu'un que tu as vu un message le concernant sur son téléphone, sans jamais préciser lequel.
Organiser un "rituel" avant de manger et convaincre au moins deux personnes de le suivre.
Convaincre le groupe qu'un objet précis "porte malheur" ce soir-là et le faire éviter par plusieurs personnes.
Réussir à faire dire "clairement" à une personne précise trois fois en moins de 10 minutes.
Faire croire à quelqu'un que son plat préféré a changé de recette, alors que rien n'a changé.
Organiser un "brief météo" fictif avant une sortie et le faire prendre au sérieux par au moins une personne.
Convaincre quelqu'un que tu as un sixième sens en devinant juste des petites choses préparées à l'avance.
Réussir à faire deviner un objet à quelqu'un uniquement par des questions "oui/non", sans qu'il sache que c'est un jeu.
Faire croire au groupe qu'il y a une odeur de gaz ou de brûlé très légère, sans qu'il y en ait vraiment.
Organiser une "cérémonie de fin de soirée" absurde et convaincre au moins deux personnes d'y participer.
Convaincre quelqu'un que son assiette a été échangée avec celle d'un autre, alors que ce n'est pas vrai.
Réussir à faire dire "pas de souci" à trois personnes différentes dans la même conversation.
Faire croire à quelqu'un que tu connais un secret sur lui/elle sans jamais le révéler.
Organiser un "compte à rebours" avant une action banale (ouvrir un cadeau, servir un plat) sans expliquer pourquoi.
Convaincre le groupe que la maison ou le lieu a une légende ou une histoire totalement inventée.
Réussir à faire dire "c'est ouf" à deux personnes différentes en moins de 10 minutes.
Faire croire à quelqu'un qu'il a manqué un épisode important d'une conversation alors qu'il était présent.
Organiser un jeu de mémoire improvisé et convaincre le groupe d'y jouer sans expliquer la vraie règle cachée.
Convaincre quelqu'un que le plat qu'il mange est légèrement épicé alors qu'il ne l'est pas du tout.
Réussir à faire porter un chapeau, une casquette ou un bonnet à quelqu'un sous prétexte de "photo souvenir".
Faire croire au groupe qu'un objet a disparu et organiser une fausse enquête pendant 5 minutes.
Organiser une "dégustation à l'aveugle" improvisée et convaincre au moins deux personnes d'y participer.
Convaincre quelqu'un que tu as entendu parler de lui/elle en bien par une tierce personne inventée.
Réussir à faire dire "j'avoue" à trois personnes différentes dans la même soirée.
Faire croire à quelqu'un qu'il/elle a de la nourriture sur le visage ou les vêtements, alors que ce n'est pas le cas.
Organiser un "quiz" improvisé sur des questions totalement inventées et le faire prendre au sérieux.
Convaincre le groupe qu'un vêtement précis "porte chance" ce soir-là.
Réussir à faire deviner ton "objet fétiche" à quelqu'un sans jamais lui dire directement lequel c'est.
Faire croire à quelqu'un que la musique jouée a changé de volume, alors qu'il n'a pas changé.
Organiser une "pause debout collective" sous prétexte de "faire circuler l'énergie", sans autre explication.
Convaincre quelqu'un qu'un objet du quotidien a une fonction cachée totalement inventée.
Réussir à faire dire "en soi" à deux personnes différentes dans la même conversation.
Faire croire au groupe qu'il manque une chaise ou une place alors que tout est complet.
Organiser un "tirage au sort" pour désigner qui débarrasse, en le truquant discrètement à ton avantage.
Convaincre quelqu'un que tu as vu son reflet bouger différemment dans un miroir.
Réussir à faire dire "au final" à trois personnes différentes en moins de 15 minutes.
Faire croire à quelqu'un que la porte d'entrée ou une fenêtre est restée ouverte, alors qu'elle est fermée.
Organiser un échange discret de couverts entre deux convives sans qu'ils le remarquent.
Convaincre le groupe qu'une chanson précise doit absolument être écoutée "pour la bonne ambiance", sans autre justification.
Réussir à faire deviner un lieu précis à quelqu'un uniquement par des indices détournés, sans qu'il sache que c'est un jeu.
Faire croire à quelqu'un que son verre est presque vide alors qu'il est encore plein, pour le pousser à se resservir.
Organiser un "débrief" sérieux d'un jeu ou d'une activité totalement anodine, comme s'il y avait des enjeux réels.
Convaincre quelqu'un qu'il a laissé une lumière allumée ailleurs dans la maison, alors que ce n'est pas vrai.
Réussir à faire dire "au fond" à deux personnes différentes dans la même soirée.
Convaincre quelqu'un que la télécommande ou un appareil fonctionne différemment "quand on le tient d'une certaine façon".`;

const s2Difficiles = `Déclencher une fausse dispute sérieuse avec ta copine/ton copain et tenir le malaise pendant 3 minutes.
Convaincre le groupe entier de faire une minute de silence pour une raison absurde.
Mettre ses vêtements à l'envers (coutures apparentes) et agir totalement normalement jusqu'à ce qu'on te le fasse remarquer.*
Faire avouer un secret (même petit ou honteux) à quelqu'un devant tout le monde.
Réussir à faire un câlin de plus de 15 secondes à un ami (hors copine) sans qu'il ne se dégage.
Organiser un vote à main levée pour prendre une décision complètement ridicule (ex: "Qui est pour qu'on respire uniquement par le nez pendant 10 min ?").
S'allonger par terre au milieu du salon et refuser de se lever pendant 5 minutes en prétextant "faire corps avec la Terre".
Convaincre quelqu'un de te prêter sa brosse à dents (sans l'utiliser évidemment).
Convaincre le groupe entier de changer complètement le menu ou le programme prévu pour le repas.
Réussir à faire porter un vêtement à toi pendant plus d'une heure à quelqu'un sans qu'il le remarque en premier.
Simuler une vraie brouille avec un membre du groupe et maintenir la distance pendant au moins 15 minutes.
Convaincre au moins trois personnes du groupe de participer à un faux rituel que tu inventes sur le moment.
Faire croire à tout le groupe qu'un événement extérieur important a lieu (coupure de courant prévue, visite surprise) et gérer la réaction pendant 10 minutes.
Réussir à faire dire à quelqu'un, sans lui demander directement, une phrase précise que tu as choisie à l'avance.
Organiser une fausse "urgence" mineure (objet cassé, petit incident) et gérer la situation avec un sérieux total pendant 5 minutes.
Convaincre le groupe entier de porter un même accessoire (bonnet, lunettes) en même temps, pour une "photo".
Simuler une amnésie légère sur un sujet précis et maintenir le mensonge face aux questions du groupe pendant 10 minutes.
Réussir à échanger discrètement les téléphones de deux joueurs pendant au moins 20 minutes sans qu'ils s'en aperçoivent.
Convaincre quelqu'un de participer à un faux entretien d'embauche improvisé, sans lui expliquer que c'est un jeu.
Faire porter la responsabilité d'une mission Tribu à quelqu'un d'innocent et le faire accuser publiquement.
Organiser une fausse "surprise" annoncée à l'avance et maintenir le suspense pendant toute une soirée.
Convaincre le groupe entier de manger le dessert avant l'entrée sans jamais donner de vraie raison.
Réussir à faire dire à voix haute à quelqu'un une théorie complètement absurde comme si elle était vraie, devant tout le groupe.
Simuler une petite blessure (cheville, poignet) et te faire porter assistance par au moins deux personnes pendant 10 minutes.
Convaincre quelqu'un d'échanger de vêtement complet (pas juste un accessoire) avec toi pendant au moins 30 minutes.
Organiser un faux "appel vidéo" avec une personne inventée et le maintenir de façon crédible pendant 5 minutes devant le groupe.
Réussir à faire pleurer de rire tout le groupe en même temps grâce à une seule phrase ou action précise.
Convaincre le groupe entier de participer à un "défi collectif" totalement inventé sans qu'ils sachent que c'est une mission.
Faire croire à quelqu'un que vous vous êtes déjà rencontrés avant, dans un contexte totalement inventé et détaillé.
Organiser une fausse cérémonie de remise de prix improvisée et convaincre le groupe d'y participer sérieusement pendant 10 minutes.
Réussir à convaincre deux joueurs différents de te confier chacun un secret, dans la même soirée.
Simuler une timidité extrême et inhabituelle pendant au moins 20 minutes face à un ami proche.
Convaincre le groupe entier qu'il manque une personne qui n'a en réalité jamais été invitée.
Organiser un faux sondage "à l'aveugle" où tu manipules discrètement le résultat final devant tout le monde.
Réussir à faire chanter une chanson entière (couplet + refrain) à quelqu'un devant le groupe sans le lui demander directement.
Convaincre quelqu'un de participer à un "défi de silence" d'au moins 5 minutes sans lui révéler que c'est un jeu.
Faire croire à tout le groupe que la soirée a été filmée ou enregistrée en secret, et gérer les réactions pendant 5 minutes.
Organiser un échange complet de rôles avec un autre joueur (façon de parler, attitude) pendant au moins 30 minutes.
Réussir à convaincre le groupe entier de porter un toast à une personne absente pour une raison inventée et émouvante.
Simuler une grande fierté ou émotion soudaine face à un événement totalement banal, devant tout le groupe, pendant 5 minutes.
Convaincre quelqu'un de participer à un "test de confiance" improvisé (les yeux fermés, guidé par la voix).
Organiser une fausse annonce importante (façon discours) et la tenir avec un sérieux total devant tout le groupe.
Réussir à faire dire "je te le confirme" à quelqu'un à propos d'une information totalement inventée par toi.
Convaincre le groupe entier de refaire une activité de la soirée "pour de vrai cette fois", sans raison logique.
Simuler un excès de fatigue soudain et convaincre le groupe de changer le programme de la soirée pour cette raison.
Réussir à faire porter un déguisement improvisé (avec objets du quotidien) à quelqu'un pendant au moins 20 minutes.
Organiser une fausse "conférence" improvisée sur un sujet absurde et la tenir avec sérieux pendant 5 minutes devant le groupe.
Convaincre deux joueurs de faire la paix après une "dispute" que tu as toi-même inventée entre eux.
Réussir à faire dire au groupe entier une phrase précise en chœur, sans jamais leur demander directement de le faire.
Simuler une déclaration d'amitié très solennelle envers quelqu'un du groupe et la tenir avec sérieux pendant au moins 2 minutes.`;

function parseBlock(text, saison, difficulte, points) {
  return text
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const requiresProof = line.endsWith('*');
      const texte = requiresProof ? line.slice(0, -1).trim() : line;
      return {
        id: `S${saison}-${difficulte.toUpperCase().slice(0,1)}-${idx + 1}`,
        saison,
        difficulte, // 'facile' | 'moyenne' | 'difficile'
        points,
        texte,
        preuveRequise: requiresProof,
        statut: 'disponible', // 'disponible' | 'active' | 'brulee'
        joueurActuel: null,
      };
    });
}

const missions = [
  ...parseBlock(s1Faciles, 1, 'facile', 10),
  ...parseBlock(s1Moyennes, 1, 'moyenne', 20),
  ...parseBlock(s1Difficiles, 1, 'difficile', 40),
  ...parseBlock(s2Faciles, 2, 'facile', 10),
  ...parseBlock(s2Moyennes, 2, 'moyenne', 20),
  ...parseBlock(s2Difficiles, 2, 'difficile', 40),
];

// Vérification des comptes annoncés dans le cahier des charges
const counts = {
  s1f: missions.filter(m => m.saison===1 && m.difficulte==='facile').length,
  s1m: missions.filter(m => m.saison===1 && m.difficulte==='moyenne').length,
  s1d: missions.filter(m => m.saison===1 && m.difficulte==='difficile').length,
  s2f: missions.filter(m => m.saison===2 && m.difficulte==='facile').length,
  s2m: missions.filter(m => m.saison===2 && m.difficulte==='moyenne').length,
  s2d: missions.filter(m => m.saison===2 && m.difficulte==='difficile').length,
};
console.log('Comptes:', counts, 'Total:', missions.length);

writeFileSync(new URL('../src/data/missions.seed.json', import.meta.url), JSON.stringify(missions, null, 2));
console.log('Fichier écrit: src/data/missions.seed.json');
