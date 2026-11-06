/* statobs-bilan.js — radar SVG + « bilan du coach » spécifique à l'activité pratiquée.
   Référentiel technique par APSA (critères de réalisation, causes d'erreur, situations
   d'apprentissage). 100 % local, aucune bibliothèque. Partagé par StatObs (enseignant)
   et StatObs Élèves. */
(function () {
  'use strict';
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CA = {
    1: 'CA1 · Réaliser une performance motrice maximale mesurable',
    2: 'CA2 · Adapter ses déplacements à des environnements variés',
    3: 'CA3 · Réaliser une prestation corporelle destinée à être vue et appréciée',
    4: 'CA4 · Conduire et maîtriser un affrontement collectif ou interindividuel',
    5: 'CA5 · Réaliser et orienter son activité physique pour développer ses ressources'
  };

  /* Entrée d'observable : k = mots-clés ; cue = critères de réalisation ; err = causes probables
     de l'échec ; drill = situation d'apprentissage ; why = enjeu (pourquoi c'est un point fort). */
  const E = (k, why, cue, err, drill) => ({ k: k.map(norm), why, cue, err, drill });

  const ACTIVITIES = [
    { id: 'basket', nom: 'Basket-ball', ca: 4, k: ['basket'],
      principe: 'conserver collectivement le ballon pour progresser jusqu\'à une zone de tir favorable, puis se replier immédiatement entre son adversaire et son panier',
      consigne: 'Avant de recevoir, regarde le panier ; après avoir passé, bouge (passe et va).',
      suggest: [['Tir réussi', '+'], ['Tir raté', '-'], ['Passe décisive', '+'], ['Perte de balle', '-'], ['Rebond capté', '+'], ['Marcher / faute', '-']],
      obs: [
        E(['perte', 'perdu', 'balleperdue', 'turnover'], 'il sécurise la possession de son équipe',
          'porteur tête levée, passe courte (4-5 m) vers un partenaire démarqué, protection du ballon avec le corps face à la pression',
          'passe forcée vers un partenaire marqué, dribble dans la défense tête baissée, absence de solution de passe proche',
          'Conservation 4 c 2 dans un carré de 10 m : le porteur dispose de 3 secondes pour passer, deux solutions de passe doivent toujours être proposées.'),
        E(['layup', 'doublepas'], 'il sait conclure près du cercle en course',
          'double pas droite-gauche (côté droit), montée du genou opposé à la main de tir, ballon protégé à deux mains puis déposé haut sur la planche',
          'pieds mal coordonnés, ballon lancé trop fort ou sans utiliser la planche, course d\'élan trop rapide',
          'Série de double pas sans ballon, puis avec ballon, à partir d\'un dribble de 2 rebonds ; viser le petit carré de la planche (10 réussis par côté).'),
        E(['lancerfranc'], 'il est fiable lorsqu\'il tire sans opposition',
          'pieds écartés largeur d\'épaules, routine identique à chaque tir, coude sous le ballon, poussée des jambes puis extension du bras et poignet cassé',
          'routine absente, tir uniquement avec les bras, trajectoire trop tendue',
          'Routine fixe (3 dribbles, respiration, tir) : séries de 10 lancers francs en notant le score pour suivre sa progression.'),
        E(['tir', 'shoot', 'panier', 'marque'], 'il convertit les situations de tir en points',
          'appuis stables orientés vers le cercle, coude sous le ballon, extension complète jambes-bras et poignet cassé vers le cercle (« main dans le panier »), tir pris démarqué en zone proche',
          'tirs pris trop loin, en déséquilibre ou sous pression défensive ; bras seuls sans poussée des jambes ; trajectoire trop tendue',
          'Tir en 5 positions autour de la raquette (5 réussis par position avant de reculer), puis tir après réception de passe ; règle en match : ne tirer que démarqué en zone favorable.'),
        E(['passedecisive', 'assist'], 'il crée des occasions pour ses partenaires',
          'fixer son défenseur avant de passer, passe tendue vers le partenaire qui coupe vers le panier',
          'passe donnée trop tôt (défenseur non fixé) ou trop tard (partenaire repris)',
          '2 c 1 en continu sur demi-terrain : le porteur attaque le défenseur, passe uniquement quand celui-ci s\'engage sur lui.'),
        E(['passe'], 'il fait circuler le ballon et fait vivre le jeu collectif',
          'passe à deux mains poitrine ou à terre, tendue, vers un partenaire démarqué ; regard sur la cible avant la passe ; distance courte',
          'passes lobées ou forcées vers un partenaire marqué, décision tardive, porteur tête baissée',
          'Jeu des 10 passes en 3 c 2 sur demi-terrain : interdit de rendre au passeur, les non-porteurs se démarquent en appui ou en soutien.'),
        E(['dribble', 'conduite'], 'il fait progresser le ballon et se sort de la pression',
          'dribble avec la main éloignée du défenseur, ballon sous la hanche, tête levée, utilisé pour avancer ou éliminer',
          'dribble tête baissée, sur place (inutile) ou trop haut, reprise de dribble',
          'Parcours de dribble main droite / main gauche avec annonce de couleurs par l\'enseignant (tête levée obligatoire), puis 1 c 1 dans un couloir.'),
        E(['rebond'], 'il récupère des ballons et offre des secondes chances',
          'écran de retrait (dos à l\'adversaire, fesses basses), bras hauts, saut au point le plus haut, réception à deux mains coudes écartés',
          'reste spectateur après le tir, saute trop tôt, ne bloque pas son adversaire',
          '1 c 1 au rebond : l\'enseignant tire, le défenseur doit faire écran 2 secondes avant d\'aller chercher le ballon.'),
        E(['interception', 'vol', 'recuperation', 'contre'], 'il gêne la circulation adverse et récupère des ballons',
          'placement entre son adversaire et le panier, bras actifs dans les lignes de passe, anticipation de la trajectoire',
          'défense trop éloignée, attente du ballon au lieu de lire les passes',
          'Jeu à 3 c 3 : chaque interception vaut 1 point ; défense « un bras dans la ligne de passe ».'),
        E(['marcher', 'reprise', 'faute', 'contact', 'violation'], 'il respecte le règlement et défend sans faute',
          'arrêt simultané ou en 1-2 après dribble et réception ; en défense, glissements latéraux sans croiser les pieds, mains hautes',
          'appuis non maîtrisés à la réception (marcher), défense en retard qui touche les bras ou bouscule',
          'Ateliers d\'arrêts 1-2 / arrêt simultané après réception en course ; défense « mains derrière le dos » pour apprendre à défendre avec les pieds.'),
        E(['demarquage', 'demarque', 'appel', 'smarquer'], 'il se rend disponible et offre des solutions',
          'déplacement vers un espace libre, appel visible (main tendue), à distance de passe, après un changement de rythme',
          'reste caché derrière son défenseur ou trop loin du porteur',
          '3 c 3 avec obligation d\'appel de balle main tendue ; le porteur ne peut passer qu\'à un partenaire qui appelle.'),
        E(['repli', 'defense', 'defend'], 'il se replie et protège son panier',
          'repli immédiat à la perte du ballon, se placer entre son adversaire et le panier, bras actifs',
          'repli tardif, défense « au ballon » qui oublie son adversaire direct',
          'Transition 3 c 3 → 3 c 2 : à la perte de balle, le dernier attaquant doit toucher la ligne de fond avant de défendre.')
      ] },

    { id: 'hand', nom: 'Handball', ca: 4, k: ['hand'],
      principe: 'progresser rapidement vers la cible, créer le surnombre pour tirer en position favorable et se replier pour défendre la zone',
      consigne: 'Attaque l\'intervalle entre deux défenseurs ; si tu es fixé, passe au partenaire libre.',
      suggest: [['But marqué', '+'], ['Tir raté / arrêté', '-'], ['Passe réussie', '+'], ['Perte de balle', '-'], ['Interception', '+'], ['Marcher / zone', '-']],
      obs: [
        E(['perte', 'balleperdue'], 'il sécurise la possession',
          'passe courte et tendue vers un partenaire démarqué, réception à deux mains « en coupe »',
          'passes en cloche, passe vers un partenaire marqué, réception non préparée',
          'Conservation 4 c 2, 3 secondes maximum par possession, puis progression vers une cible.'),
        E(['zone', 'empiete'], 'il respecte la zone et tire en suspension',
          'impulsion avant la ligne des 6 m, tir en suspension au-dessus de la zone, réception dans la zone après le tir',
          'impulsion trop tardive, course qui s\'arrête dans la zone',
          'Marquer au sol une ligne d\'impulsion à 7 m ; tirs en suspension après 3 pas, en variant les angles.'),
        E(['tir', 'but', 'marque'], 'il conclut efficacement les actions',
          'bras armé haut en arrière, appui du pied opposé au bras de tir, tir en suspension ou à l\'appui, viser les coins à l\'opposé du gardien',
          'tir de loin sans fixation, tir dans le gardien, armé bas et lent',
          'Tirs sur cibles placées dans les coins du but, puis tirs en 1 c 1 face au gardien ; en match, tir pris seulement après fixation ou en surnombre.'),
        E(['passe'], 'il fait vivre le collectif et accélère le jeu',
          'passe à une main, bras armé haut, coup de poignet, vers l\'avant d\'un partenaire en course',
          'passes lobées, latérales sans progression, passes vers un partenaire marqué',
          'Montée de balle à 3 sans dribble (passes et courses), puis 3 c 2 vers le but.'),
        E(['dribble'], 'il fait progresser le ballon quand aucune passe n\'est possible',
          'dribble à hauteur de hanche, tête levée, utilisé uniquement pour avancer',
          'dribble systématique qui ralentit le jeu et isole le porteur',
          'Jeu « 1 dribble maximum » pour développer la passe et le démarquage.'),
        E(['marcher', 'reprise', 'faute', 'contact', '2minutes'], 'il défend dans le respect des règles',
          'respect des 3 pas et 3 secondes ; en défense, contact frontal avec les bras pliés, sans ceinturer',
          'précipitation à la réception, défense en retard (poussée, ceinturage)',
          'Ateliers « réception en course + 3 pas + tir », défense en duel avec bras pliés sur un couloir.'),
        E(['interception', 'recuperation'], 'il récupère le ballon et lance la contre-attaque',
          'placement entre le porteur et le but, lecture des trajectoires, bras actifs',
          'défense passive qui attend le tir',
          'Défense en « harcèlement » : 2 défenseurs avancés doivent intercepter, chaque récupération = contre-attaque.'),
        E(['arret', 'gardien', 'parade'], 'il sécurise la cible',
          'position de base (genoux fléchis, mains à hauteur de tête), sortie sur l\'angle de tir, réaction vers le ballon',
          'reste collé à sa ligne, réaction tardive, ferme les yeux',
          'Séries de tirs à vitesse progressive sur un côté puis l\'autre, travail du placement sur l\'angle.'),
        E(['contreattaque', 'montee', 'repli'], 'il joue les transitions',
          'course immédiate vers l\'avant à la récupération ; à la perte, repli en courant vers sa zone',
          'temps de réaction lent, regarde l\'action au lieu de courir',
          'Jeu à 4 c 4 avec bonus : but marqué en moins de 5 secondes après récupération = 2 points.')
      ] },

    { id: 'foot', nom: 'Football / Futsal', ca: 4, k: ['foot', 'futsal', 'soccer'],
      principe: 'conserver et faire progresser le ballon par le jeu de passes pour se créer une occasion de tir, puis se replier et récupérer vite',
      consigne: 'Contrôle orienté vers l\'espace libre, puis tête levée avant de passer ou de tirer.',
      suggest: [['Passe réussie', '+'], ['Contrôle réussi', '+'], ['Tir cadré', '+'], ['Perte de balle', '-'], ['Récupération', '+'], ['Faute', '-']],
      obs: [
        E(['perte', 'balleperdue'], 'il conserve le ballon sous pression',
          'contrôle orienté pour s\'éloigner de la pression, protection du ballon avec le corps, passe simple au partenaire le plus proche',
          'conduite tête baissée, dribble de trop, contrôle qui échappe',
          'Rondo 4 c 1 puis 5 c 2 : 2 touches maximum, le défenseur qui récupère échange avec le fautif.'),
        E(['controle', 'reception'], 'il se met dans de bonnes conditions dès la réception',
          'surface de contact relâchée (intérieur du pied, cuisse, poitrine), contrôle orienté vers l\'espace où l\'on veut jouer',
          'surface trop raide, ballon qui rebondit loin, contrôle « mort » sous les pieds',
          'Passes à deux à 8-10 m : contrôle orienté à droite puis à gauche de plots, enchaîné avec une passe.'),
        E(['tir', 'frappe', 'but', 'cadre'], 'il se montre dangereux devant le but',
          'pied d\'appui à côté du ballon et orienté vers la cible, frappe du cou-de-pied cheville verrouillée, buste au-dessus du ballon',
          'buste en arrière (ballon qui monte), pied d\'appui trop loin, frappe précipitée',
          'Frappes après une passe en retrait, sur deux mini-cibles dans les coins ; puis 1 c 1 + gardien.'),
        E(['passe'], 'il fait circuler le ballon et organise le jeu',
          'passe de l\'intérieur du pied, pied d\'appui à côté du ballon pointé vers la cible, cheville verrouillée, ballon frappé au centre',
          'pointe de pied, passe sans regarder, passe dans les pieds d\'un partenaire marqué',
          'Carré de passes à 4 avec déplacement après la passe, 2 touches ; puis jeu à 4 c 2 en zone.'),
        E(['dribble', 'conduite', 'elimination'], 'il élimine et fait progresser le ballon',
          'conduite de balle avec des touches courtes, tête levée, changement de rythme et de direction pour éliminer',
          'touches trop longues, tête baissée, dribble dans une zone surchargée',
          'Slalom de conduite avec changements de rythme, puis 1 c 1 dans un couloir avec but à franchir en conduite.'),
        E(['recuperation', 'interception', 'tacle'], 'il récupère des ballons',
          'cadrer le porteur de côté, rester sur ses appuis, intervenir quand le ballon s\'éloigne du pied adverse',
          'se jette, défend de face sans cadrer',
          '1 c 1 défensif : le défenseur doit pousser l\'attaquant vers la touche avant d\'intervenir.'),
        E(['faute', 'mainvolontaire', 'horsjeu', 'carton'], 'il joue dans le respect des règles',
          'intervenir sur le ballon et non sur l\'adversaire, rester debout, temporiser',
          'intervention en retard, défense en poussant, appel de balle hors-jeu',
          'Jeu à effectif réduit où toute faute donne un penalty : apprendre à défendre en temporisant.'),
        E(['demarquage', 'appel'], 'il se rend disponible',
          'appel en profondeur ou en soutien, dans le dos ou hors de la ligne du défenseur, au bon moment',
          'reste dans l\'ombre du défenseur, appels trop tôt',
          'Jeu à 3 c 3 avec but par passe dans une zone : on ne marque que sur appel en profondeur.')
      ] },

    { id: 'volley', nom: 'Volley-ball', ca: 4, k: ['volley'],
      principe: 'construire l\'attaque en trois touches (réception – passe – renvoi offensif) pour rompre l\'échange dans une zone libre adverse',
      consigne: 'Sois sous le ballon avant de le toucher : déplace-toi d\'abord, frappe ensuite.',
      suggest: [['Service réussi', '+'], ['Réception orientée', '+'], ['Attaque gagnante', '+'], ['Faute de service', '-'], ['Faute directe', '-'], ['Ballon non joué', '-']],
      obs: [
        E(['service'], 'il met le ballon en jeu et met la pression',
          'pied opposé au bras de frappe devant, lancer bas et devant l\'épaule, frappe main ferme au centre du ballon, bras qui accompagne vers la cible',
          'lancer instable, main molle, frappe sous le ballon (ballon dans le filet ou trop long)',
          'Service à mi-distance puis en reculant d\'un pas à chaque série de 5 réussis ; viser des zones au sol.'),
        E(['reception', 'manchette'], 'il fait la première touche et lance la construction',
          'jambes fléchies sous le ballon, bras tendus et serrés (plan de frappe), poussée des jambes, ballon orienté haut vers le passeur',
          'frappe avec les bras qui balancent, mauvais placement (ballon pris sur le côté), jambes tendues',
          'Lancer à deux mains par un partenaire → manchette haute vers une cible (cerceau) près du filet ; puis réception de service.'),
        E(['passe', 'touche', 'passehaute'], 'il organise l\'attaque de son équipe',
          'mains en coupe au-dessus du front, doigts écartés, ballon pris haut, poussée simultanée des jambes et des bras',
          'ballon pris trop bas (contre la poitrine), mains sèches, joueur non placé sous le ballon',
          'Jongles en passe haute contre un mur ou à deux, puis passe vers un attaquant placé au filet.'),
        E(['attaque', 'smash', 'renvoi', 'pointgagne', 'gagnant'], 'il conclut l\'échange et marque des points',
          'renvoi offensif vers une zone libre (fond ou espace entre deux joueurs), frappe haute et vers le bas',
          'renvoi facile au centre du terrain adverse, frappe sans regarder l\'organisation adverse',
          'Match 2 c 2 sur terrain long et étroit avec zones bonus au fond : renvoi en zone libre = 2 points.'),
        E(['bloc', 'contre'], 'il gêne les attaques adverses',
          'saut bras tendus au-dessus du filet, mains ouvertes et orientées vers le terrain adverse, timing après l\'attaquant',
          'saute trop tôt, touche le filet',
          'Attaque lancée sur caisse : le bloqueur travaille le timing (saut juste après l\'attaquant).'),
        E(['faute', 'filet', 'dehors', 'sortie', 'portee', 'doublecontact', 'nonjoue', 'tombe'], 'il limite les fautes directes',
          'déplacement préalable sous le ballon, communication (« j\'ai »), surface de frappe stable',
          'ballon non joué faute de communication, frappe trop forte, contact du filet',
          'Match à 3 c 3 avec obligation de trois touches et d\'annonce « j\'ai » avant chaque contact.'),
        E(['deplacement', 'placement', 'replacement'], 'il anticipe et se place',
          'position d\'attente fléchie, déplacement en pas chassés vers la zone de chute du ballon avant la frappe',
          'attend le ballon debout, jambes tendues',
          'Lecture de trajectoire : l\'élève doit attraper le ballon lancé à deux mains au-dessus du front avant de le jouer.')
      ] },

    { id: 'bad', nom: 'Badminton', ca: 4, k: ['badminton', 'bad'],
      principe: 'déplacer l\'adversaire en jouant long et court pour créer un espace libre où conclure',
      consigne: 'Après chaque frappe, reviens au centre du terrain en pas chassés.',
      suggest: [['Dégagé long', '+'], ['Amorti / jeu court', '+'], ['Smash gagnant', '+'], ['Volant dehors', '-'], ['Volant dans le filet', '-'], ['Retour au centre oublié', '-']],
      obs: [
        E(['service'], 'il met le volant en jeu avec précision',
          'service revers court au ras du filet ou service long et haut au fond du couloir ; volant lâché devant soi, frappe sous la taille',
          'service trop haut (smashable) ou trop court, frappe au-dessus de la taille',
          'Service sur cibles (cerceaux) placées au fond et devant ; 10 services, compter les cibles atteintes.'),
        E(['degage', 'clear', 'long', 'fond'], 'il repousse l\'adversaire au fond du terrain',
          'placement de profil, coude haut armé derrière la tête, frappe au point le plus haut devant soi, rotation des épaules',
          'frappe à plat sans armé, volant pris trop bas ou derrière la tête, prise de raquette en « poêle à frire »',
          'Échanges de dégagés en « couloir » à deux : le volant doit tomber dans la zone de fond (au-delà de la ligne de service long).'),
        E(['amorti', 'jeucourt', 'contreamorti'], 'il joue juste derrière le filet et crée des écarts',
          'même préparation que le dégagé, puis frappe freinée (raquette qui « caresse » le volant)',
          'geste différent qui trahit l\'intention, volant trop long ou dans le filet',
          'Alternance dégagé / amorti sur le même armé : le partenaire doit annoncer la zone de chute.'),
        E(['smash', 'rupture', 'pointgagne', 'gagnant'], 'il conclut les échanges',
          'volant pris haut et devant, frappe vers le bas avec rotation du poignet, ciblage des côtés ou du corps',
          'smash pris trop loin du filet ou sur un volant bas',
          'Montée au filet sur volant lancé haut : smash vers une zone ciblée, puis replacement.'),
        E(['deplacement', 'replacement', 'centre', 'retour'], 'il couvre bien son terrain',
          'retour au centre après chaque frappe, pas chassés, fente avant sur le jeu court, appuis actifs (petit sautillement d\'attente)',
          'reste là où il a frappé, pieds plats, court en croisant les jambes',
          'Déplacements « fantômes » vers les 6 zones du terrain sur signal, retour au centre obligatoire.'),
        E(['faute', 'dehors', 'sortie', 'filet', 'rate'], 'il réduit les fautes directes',
          'frappe sous contrôle avec une marge (viser 50 cm à l\'intérieur des lignes), prise universelle',
          'frappe trop forte ou précipitée, mauvais placement sous le volant',
          'Échanges coopératifs : objectif 20 frappes sans faute, puis match en points « faute directe = 2 points à l\'adversaire ».')
      ] },

    { id: 'tt', nom: 'Tennis de table', ca: 4, k: ['tennisdetable', 'pingpong', 'ping'],
      principe: 'varier vitesse, placement et effet de la balle pour mettre l\'adversaire en difficulté, puis attaquer la balle haute',
      consigne: 'Reste fléchi à 50 cm de la table et frappe la balle au sommet du rebond.',
      suggest: [['Coup droit réussi', '+'], ['Revers réussi', '+'], ['Point gagnant', '+'], ['Faute de service', '-'], ['Balle dans le filet', '-'], ['Balle sortie', '-']],
      obs: [
        E(['service'], 'il prend l\'initiative dès le service',
          'balle lancée verticalement à 16 cm minimum depuis la paume ouverte, frappe derrière la ligne de fond, premier rebond dans son camp',
          'lancer non réglementaire, rebond direct chez l\'adversaire, service trop haut',
          'Services sur cibles (feuilles placées sur la table adverse), en variant court et long.'),
        E(['coupdroit', 'top', 'droit'], 'il attaque avec son coup fort',
          'pied gauche devant (droitier), rotation du buste, raquette qui monte de bas en haut et finit devant le front',
          'frappe du bras seul, balle prise trop tard, raquette ouverte',
          'Panier de balles : séries de 20 coups droits en diagonale, puis enchaînement revers / coup droit.'),
        E(['revers'], 'il est solide en revers',
          'raquette devant le ventre, coude en avant, frappe courte vers l\'avant avec le poignet',
          'coude collé au corps, recul trop important',
          'Échanges revers sur revers en diagonale : 30 balles sans faute.'),
        E(['remise', 'echange', 'regularite'], 'il est régulier dans l\'échange',
          'balle prise au sommet du rebond, geste court, replacement après chaque frappe',
          'frappe trop forte, joueur collé ou trop loin de la table',
          'Échanges coopératifs de 20 balles, puis jeu avec cible (moitié de table imposée).'),
        E(['pointgagne', 'gagnant', 'smash', 'rupture'], 'il conclut les échanges',
          'repérer la balle haute ou courte, avancer et frapper vers une zone éloignée de l\'adversaire',
          'attaque sur balle basse, précipitation',
          'Jeu à thème : le relanceur envoie volontairement une balle haute toutes les 4 balles, l\'attaquant doit conclure.'),
        E(['faute', 'filet', 'sortie', 'dehors', 'rate'], 'il limite les fautes directes',
          'raquette légèrement fermée, balle frappée au sommet, frappe dosée',
          'raquette trop ouverte (balle longue), frappe tardive (balle dans le filet)',
          'Match en 11 points où chaque faute directe coûte 2 points : apprendre à sécuriser.')
      ] },

    { id: 'tennis', nom: 'Tennis', ca: 4, k: ['tennis'],
      principe: 'tenir l\'échange en fond de court, déplacer l\'adversaire puis attaquer la balle courte',
      consigne: 'Prépare ta raquette tôt, frappe devant toi, reviens au centre.',
      suggest: [['Coup droit réussi', '+'], ['Revers réussi', '+'], ['Service réussi', '+'], ['Double faute', '-'], ['Faute directe', '-'], ['Montée au filet', '+']],
      obs: [
        E(['service', 'doublefaute'], 'il met la balle en jeu de façon fiable',
          'lancer légèrement devant, au-dessus de l\'épaule avant, frappe bras tendu au point le plus haut',
          'lancer trop bas ou derrière, frappe crispée',
          'Service à mi-court puis recul progressif ; viser les carrés de service.'),
        E(['coupdroit', 'droit'], 'il domine en coup droit',
          'préparation précoce, appui avant, frappe devant le corps, accompagnement par-dessus l\'épaule',
          'préparation tardive, balle frappée à côté ou derrière le corps',
          'Balles lancées puis échanges en diagonale coup droit : 15 balles dans la zone de fond.'),
        E(['revers'], 'il est solide en revers',
          'épaules de profil, frappe devant, prise adaptée (deux mains possible), accompagnement',
          'face au filet, coude en avant qui casse le geste',
          'Échanges revers en diagonale, puis enchaînements revers / coup droit.'),
        E(['filet', 'volee', 'montee'], 'il sait conclure au filet',
          'raquette devant, geste court en bloc, appui croisé',
          'geste trop ample, montée sur une balle non préparante',
          'Approche + volée sur balle courte lancée par l\'enseignant.'),
        E(['faute', 'dehors', 'sortie', 'rate'], 'il limite les fautes directes',
          'marges au-dessus du filet, zones de sécurité, frappe dosée',
          'frappe trop forte, mauvais placement par rapport à la balle',
          'Échanges coopératifs de 10 balles sans faute avant de jouer le point.')
      ] },

    { id: 'rugby', nom: 'Rugby', ca: 4, k: ['rugby'],
      principe: 'avancer collectivement en conservant le ballon, en soutien du porteur, et plaquer pour récupérer',
      consigne: 'Porteur : avance et cherche l\'intervalle. Partenaires : soutien derrière, à 2-3 m.',
      suggest: [['Avancée / franchissement', '+'], ['Passe réussie', '+'], ['Plaquage réussi', '+'], ['En-avant', '-'], ['Perte de balle', '-'], ['Soutien absent', '-']],
      obs: [
        E(['enavant', 'enavant'], 'il maîtrise la circulation vers l\'arrière',
          'passe latérale ou vers l\'arrière, ballon tenu à deux mains, réception mains devant la poitrine',
          'passe précipitée vers l\'avant, réception avec le corps',
          'Course en ligne à 3 avec passes successives vers l\'arrière, distance croissante.'),
        E(['passe'], 'il fait vivre le ballon',
          'ballon tenu à deux mains, passe à hauteur de poitrine devant le receveur, porteur qui fixe avant de passer',
          'passe sans fixation, passe dans le dos du receveur',
          '2 c 1 dans un couloir : fixer le défenseur puis passer.'),
        E(['plaquage', 'plaquer'], 'il défend avec efficacité et courage',
          'tête sur le côté (joue contre fesse), épaule au niveau des cuisses, bras qui encerclent et serrent, jambes qui poussent',
          'tête devant, plaquage haut, bras qui ne serrent pas',
          'Progression de plaquage à genoux, puis accroupi, puis debout au ralenti sur sac.'),
        E(['avancee', 'franchissement', 'percee', 'essai'], 'il fait avancer son équipe',
          'course droite vers l\'intervalle, changement d\'appui, ballon protégé',
          'course latérale qui n\'avance pas, porteur isolé',
          '1 c 1 puis 2 c 1 dans un couloir : marquer en franchissant la ligne.'),
        E(['soutien'], 'il soutient le porteur',
          'se placer derrière le porteur à 2-3 m, prêt à recevoir ou à rentrer au contact',
          'reste devant le porteur (hors-jeu) ou trop loin',
          'Jeu à 4 c 4 : un essai ne compte que si deux partenaires sont en soutien.'),
        E(['perte', 'balleperdue', 'faute'], 'il conserve le ballon au contact',
          'ballon protégé contre le corps, chute en se tournant vers son camp, présentation du ballon',
          'ballon tenu à une main, chute face à l\'adversaire',
          'Au contact : porter le ballon, tomber et le présenter à un partenaire en 2 secondes.')
      ] },

    { id: 'ultimate', nom: 'Ultimate', ca: 4, k: ['ultimate', 'frisbee'],
      principe: 'faire progresser le disque par des passes vers des partenaires démarqués, sans contact, avec un fair-play auto-arbitré',
      consigne: 'Le non-porteur crée un espace par un appel puis une contre-course ; le porteur pivote.',
      suggest: [['Passe réussie', '+'], ['Réception', '+'], ['Point marqué', '+'], ['Disque perdu', '-'], ['Marcher', '-'], ['Interception', '+']],
      obs: [
        E(['perte', 'perdu', 'drop', 'tombe'], 'il sécurise la possession',
          'passe courte et plate vers un partenaire démarqué, réception « pince de crocodile » à deux mains',
          'lancer forcé, disque qui « flotte » ou part en biais, réception à une main',
          'Conservation 4 c 2 : 10 passes pour marquer 1 point.'),
        E(['passe', 'revers', 'coupdroit', 'lancer'], 'il fait progresser le disque',
          'revers : disque tenu à plat, épaule vers la cible, rotation du buste et coup de poignet ; disque lâché à l\'horizontale',
          'disque incliné, lancer du bras seul, cible non regardée',
          'Passes à deux à 5 m puis 10 m (revers, puis coup droit), puis passe en course.'),
        E(['reception', 'attrape'], 'il est fiable à la réception',
          'regard sur le disque, réception à deux mains (pince de crocodile) ou à une main au-dessus de la tête',
          'mains tendues trop tôt, regard sur le défenseur',
          'Réceptions en course sur lancers variés, puis 1 c 1 au disque.'),
        E(['marcher', 'pivot', 'faute', 'contact'], 'il respecte les règles du jeu',
          'arrêt dans les 3 appuis après réception, pied de pivot fixe, aucun contact',
          'course qui se prolonge après réception, contact en défense',
          'Ateliers réception en course + arrêt + pivot + passe.'),
        E(['interception', 'defense', 'recuperation'], 'il récupère le disque',
          'placement côté disque, à un bras de l\'attaquant, lecture de la trajectoire',
          'défense collée qui provoque des contacts',
          'Jeu 3 c 3 : chaque interception = 1 point.'),
        E(['appel', 'demarquage', 'point', 'but', 'marque'], 'il se démarque et conclut',
          'appel en profondeur puis retour (contre-course), au moment où le porteur peut lancer',
          'appels simultanés de tous les joueurs, statisme',
          'Jeu à thème : on ne marque que sur une passe reçue après contre-course.')
      ] },

    { id: 'vitesse', nom: 'Course de vitesse / haies / relais', ca: 1, k: ['vitesse', 'sprint', 'haie', 'relais', '50m', '60m', '80m', '100m'],
      principe: 'produire la vitesse maximale le plus vite possible et la maintenir jusqu\'à la ligne, en restant relâché',
      consigne: 'Pousse fort sur le sol, genoux hauts, bras qui travaillent d\'avant en arrière, et cours au-delà de la ligne.',
      suggest: [['Départ réactif', '+'], ['Course droite et relâchée', '+'], ['Franchissement sans ralentir', '+'], ['Faux départ', '-'], ['Ralentissement avant la ligne', '-'], ['Transmission manquée', '-']],
      obs: [
        E(['depart', 'reaction', 'fauxdepart'], 'il démarre vite',
          'position de départ stable, poids sur la jambe avant, poussée complète et buste incliné sur les premiers appuis',
          'anticipation (faux départ), redressement immédiat du buste',
          'Départs réactifs sur signaux sonores variés (sifflet, clap) sur 10 m, dans différentes positions.'),
        E(['transmission', 'relais', 'temoin'], 'il transmet sans perdre de vitesse',
          'receveur qui part sur la marque, main tendue en arrière paume ouverte, donneur qui annonce « hop » et pose le témoin',
          'receveur qui part trop tôt ou se retourne, transmission hors zone',
          'Transmissions en marchant puis en trottinant, puis à vitesse maximale avec marque au sol réglée.'),
        E(['haie', 'franchissement', 'attaque'], 'il franchit sans casser sa vitesse',
          'attaque jambe tendue loin devant, buste vers l\'avant, retour de la jambe d\'esquive sur le côté, réception active',
          'saut au-dessus de la haie (temps de suspension trop long), piétinement avant la haie',
          'Franchissements de haies basses en rythme 3 appuis, puis réglage de l\'intervalle.'),
        E(['frequence', 'foulee', 'relache', 'droite', 'gainage'], 'il court efficacement',
          'course sur l\'avant-pied, genoux hauts, bras à 90° qui travaillent dans l\'axe, visage relâché, trajectoire droite',
          'crispation, course talons, bras qui croisent devant le corps',
          'Gammes athlétiques (montées de genoux, talons-fesses, foulées bondissantes) puis lignes droites en relâchement.'),
        E(['ralenti', 'ralentit', 'ligne', 'finish', 'arrivee'], 'il court jusqu\'au bout',
          'course jusqu\'à 5 m après la ligne, buste en avant au passage',
          'saut ou ralentissement avant la ligne, regard sur les adversaires',
          'Sprints avec ligne d\'arrivée fictive 5 m après la vraie ligne.')
      ] },

    { id: 'sauts', nom: 'Sauts athlétiques', ca: 1, k: ['saut', 'hauteur', 'longueur', 'triplesaut', 'pentabond', 'multibond'],
      principe: 'transformer une course d\'élan régulière et accélérée en impulsion efficace',
      consigne: 'Élan toujours identique, accélération sur les derniers appuis, impulsion active vers le haut.',
      suggest: [['Impulsion active', '+'], ['Course d\'élan régulière', '+'], ['Réception équilibrée', '+'], ['Saut mordu', '-'], ['Piétinement avant planche', '-'], ['Réception en arrière', '-']],
      obs: [
        E(['mordu', 'planche', 'nul', 'elan', 'pietine', 'etalonnage'], 'il maîtrise sa course d\'élan',
          'élan étalonné (marque de départ fixe), nombre d\'appuis constant, accélération progressive',
          'élan trop long ou variable, regard sur la planche qui fait piétiner',
          'Étalonnage : courir l\'élan à l\'envers depuis la planche, poser une marque, répéter 3 fois sans sauter.'),
        E(['impulsion', 'appel', 'detente'], 'il produit une impulsion efficace',
          'pied d\'appel posé à plat et actif, genou libre qui monte, bras qui accompagnent vers le haut, regard au loin',
          'appel en freinant (talon), jambe libre passive, buste en arrière',
          'Foulées bondissantes et sauts sur 5 appuis, puis sauts avec élan réduit sur un obstacle bas.'),
        E(['reception', 'chute'], 'il termine son saut en équilibre',
          'jambes lancées vers l\'avant, réception pieds joints puis bassin vers l\'avant',
          'retombée en arrière, réception sur un pied',
          'Sauts avec élan réduit en visant une marque, réception pieds joints, bassin vers l\'avant.')
      ] },

    { id: 'lancers', nom: 'Lancers athlétiques', ca: 1, k: ['lancer', 'javelot', 'poids', 'disque', 'vortex', 'medecineball'],
      principe: 'transmettre au projectile la vitesse produite par les jambes et le tronc, du bas vers le haut',
      consigne: 'Les jambes d\'abord, le bras en dernier : lance « avec tout le corps ».',
      suggest: [['Lancer complet (jambes-tronc-bras)', '+'], ['Angle de sortie correct', '+'], ['Bloc de l\'appui avant', '+'], ['Lancer du bras seul', '-'], ['Lancer mordu', '-'], ['Engin à plat / mal orienté', '-']],
      obs: [
        E(['bras', 'seul', 'chaine', 'complet', 'jambes'], 'il utilise toute la chaîne de lancer',
          'enchaînement poussée de jambe arrière → rotation du bassin → épaule → bras → poignet, appui avant bloqué',
          'bras qui part en premier, pieds alignés face au lancer',
          'Lancers de médecine-ball à deux mains puis à une main depuis une position de profil, appui avant bloqué.'),
        E(['angle', 'trajectoire', 'sortie', 'plat', 'engin'], 'il donne une trajectoire efficace',
          'engin lâché à environ 35-40°, au-dessus de l\'épaule, devant le pied avant',
          'lancer trop à plat ou trop haut',
          'Lancers au-dessus d\'un élastique tendu à 2,5 m à 3 m devant le lanceur.'),
        E(['mordu', 'nul', 'faute', 'equilibre', 'bloc', 'appui'], 'il reste maître de son équilibre',
          'blocage de l\'appui avant, jambe arrière qui ramène pour se rattraper, rester derrière la ligne',
          'élan trop rapide, perte d\'équilibre vers l\'avant',
          'Lancers avec élan de 3 pas rythmés, obligation de rester 2 s équilibré derrière la ligne.')
      ] },

    { id: 'orientation', nom: 'Course d\'orientation', ca: 2, k: ['orientation', 'courseorientation'],
      principe: 'choisir et suivre un itinéraire fiable en orientant sa carte et en utilisant des lignes directrices',
      consigne: 'Carte toujours orientée, pouce sur ta position, annonce l\'itinéraire avant de partir.',
      suggest: [['Poste trouvé', '+'], ['Carte orientée', '+'], ['Itinéraire annoncé', '+'], ['Erreur de poste', '-'], ['Arrêt / hésitation', '-'], ['Carte mal orientée', '-']],
      obs: [
        E(['carte', 'oriente', 'orientation', 'pouce'], 'il lit et oriente sa carte',
          'carte orientée avec le terrain (ou la boussole), pouce qui suit la progression, repérage des points remarquables',
          'carte tenue dans le sens de lecture, perte du fil du parcours',
          'Parcours en étoile sur un petit secteur : retour au centre après chaque poste, carte orientée vérifiée par un partenaire.'),
        E(['poste', 'balise', 'trouve', 'erreur', 'perdu'], 'il trouve ses postes',
          'repérer un point d\'attaque proche du poste, ralentir à l\'approche, vérifier le code',
          'course trop rapide sans repère, confusion de poste',
          'Parcours « point d\'attaque » : l\'élève annonce son point d\'attaque à l\'enseignant avant chaque poste.'),
        E(['itineraire', 'choix', 'lignedirectrice'], 'il fait de bons choix d\'itinéraire',
          'utiliser des lignes directrices (chemins, murs, lisières), anticiper le poste suivant',
          'ligne droite systématique à travers des zones difficiles',
          'Comparer à deux deux itinéraires pour le même poste, puis chronométrer chacun.'),
        E(['hesitation', 'arret'], 'il progresse avec continuité',
          'lire le poste suivant en arrivant au poste, mémoriser des tronçons',
          'arrêts fréquents pour relire la carte',
          'Parcours mémorisé : lire le tronçon, laisser la carte au départ et rejoindre le poste.')
      ] },

    { id: 'natation', nom: 'Natation', ca: 1, k: ['natation', 'nage', 'crawl', 'brasse', 'dos', 'sauvetage'],
      principe: 'réduire les résistances à l\'avancement (corps aligné et gainé) et augmenter la propulsion (appuis longs et dirigés vers l\'arrière)',
      consigne: 'Allonge-toi, souffle dans l\'eau et pousse l\'eau jusqu\'à la cuisse.',
      suggest: [['Coulée gainée', '+'], ['Respiration rythmée', '+'], ['Virage efficace', '+'], ['Tête relevée', '-'], ['Arrêt / reprise d\'appui', '-'], ['Jambes qui coulent', '-']],
      obs: [
        E(['coulee', 'glisse', 'alignement', 'gainage'], 'il glisse et réduit les résistances',
          'bras tendus au-dessus de la tête, mains l\'une sur l\'autre, tête entre les bras, corps gainé',
          'tête relevée, bras écartés, corps relâché',
          'Coulées ventrales après poussée au mur : distance mesurée, objectif 5 m.'),
        E(['respiration', 'souffle', 'expiration', 'tete'], 'il respire sans perturber la nage',
          'expiration complète dans l\'eau, inspiration rapide sur le côté (crawl) ou devant (brasse) sans relever la tête',
          'apnée puis respiration tête relevée, souffle bloqué',
          'Nage avec respiration tous les 3 temps, puis éducatif « rattrapé » avec respiration latérale.'),
        E(['virage', 'culbute', 'mur'], 'il enchaîne les longueurs sans perte de temps',
          'approche sans ralentir, rotation compacte, pieds au mur, poussée et coulée',
          'arrêt au mur, reprise d\'appui sur le sol',
          'Virages simplifiés (virage « bascule ») en série, puis culbutes dans l\'eau profonde.'),
        E(['jambes', 'battement', 'ciseau'], 'il propulse efficacement avec les jambes',
          'battements à partir de la hanche, jambes presque tendues, chevilles souples',
          'pédalage (genoux qui plient), jambes qui coulent',
          'Battements avec planche, puis sur le dos bras le long du corps.'),
        E(['arret', 'pied', 'appui', 'reprise'], 'il nage en continuité',
          'rythme régulier, respiration maîtrisée, gestion de l\'allure',
          'départ trop rapide, panique respiratoire',
          'Nage continue 4 × 50 m à allure régulière, temps de passage annoncés.')
      ] },

    { id: 'demifond', nom: 'Demi-fond / course en durée', ca: 5, k: ['demifond', 'endurance', 'courseenduree', 'cross', 'vma', '800', '1000', '1500', 'course'],
      principe: 'tenir une allure choisie et régulière, en lien avec sa VMA et ses sensations, puis accélérer au bon moment',
      consigne: 'Écoute ta respiration : tu dois pouvoir parler en courant à allure d\'endurance.',
      suggest: [['Temps de passage respecté', '+'], ['Foulée relâchée', '+'], ['Accélération finale', '+'], ['Départ trop rapide', '-'], ['Marche / arrêt', '-'], ['Écart d\'allure', '-']],
      obs: [
        E(['passage', 'allure', 'regulier', 'ecart', 'plot'], 'il gère son allure avec précision',
          'passage aux plots au coup de sifflet, allure stable dès le départ, repères de temps',
          'départ trop rapide puis chute d\'allure, regard sur les autres',
          'Course au plot : plots tous les 25 m, l\'élève doit passer à chaque signal sonore à son allure cible (% VMA).'),
        E(['depart', 'tropvite'], 'il démarre à la bonne allure',
          'départ contrôlé, allure de croisière dès les 100 premiers mètres',
          'emballement au départ, essoufflement précoce',
          'Départs à allure imposée sur 200 m, l\'enseignant donne l\'écart au temps cible.'),
        E(['marche', 'arret'], 'il court en continuité',
          'allure plus lente mais continue, respiration régulière',
          'allure supérieure à ses capacités, manque de repères',
          'Fractionné 30 s course / 30 s marche puis allongement progressif des phases de course.'),
        E(['foulee', 'relache', 'posture'], 'il court économiquement',
          'buste droit, épaules basses, pose de pied sous le centre de gravité, bras relâchés',
          'crispation des épaules, foulée trop longue (attaque talon)',
          'Éducatifs de foulée, puis course en relâchement sur 2 minutes.'),
        E(['acceleration', 'final', 'sprint'], 'il sait finir fort',
          'accélération progressive sur les 100 derniers mètres',
          'réserve gaspillée en début de course',
          'Course de 3 minutes avec accélération imposée dans les 30 dernières secondes.')
      ] },

    { id: 'gym', nom: 'Gymnastique / Acrosport', ca: 3, k: ['gym', 'acrosport', 'acro', 'agres', 'sol', 'trampoline'],
      principe: 'réaliser des éléments maîtrisés, gainés et esthétiques, enchaînés avec fluidité et en sécurité',
      consigne: 'Gaine-toi, tends les pointes et tiens tes réceptions 3 secondes.',
      suggest: [['Élément maîtrisé', '+'], ['Réception stabilisée', '+'], ['Corps gainé / pointes tendues', '+'], ['Chute / déséquilibre', '-'], ['Parade absente', '-'], ['Enchaînement interrompu', '-']],
      obs: [
        E(['reception', 'stabilis', 'tenue'], 'il termine ses éléments en contrôle',
          'réception jambes fléchies puis tendues, bras en avant, regard fixé, tenue 3 secondes',
          'réception déséquilibrée, pas de rattrapage',
          'Sauts au mini-trampoline ou au sol avec réception figée 3 s sur une marque.'),
        E(['gainage', 'gaine', 'pointe', 'aligne', 'tendu'], 'il présente un corps esthétique et solide',
          'corps aligné, abdominaux et fessiers serrés, jambes et pointes tendues',
          'cambrure, jambes pliées, relâchement',
          'Circuit de gainage (planches, chandelle, « banane ») puis éléments avec un critère de tenue.'),
        E(['chute', 'desequilibre', 'tombe', 'rate'], 'il réalise ses éléments en sécurité',
          'élément adapté à son niveau, placement des appuis, parade active',
          'élément trop difficile, élan insuffisant ou trop important',
          'Revenir à l\'élément de niveau inférieur avec parade, puis réduire l\'aide progressivement.'),
        E(['parade', 'pareur', 'securite'], 'il assure la sécurité de ses partenaires',
          'pareur placé près, mains prêtes au niveau du bassin ou des épaules, regard sur le gymnaste',
          'pareur trop loin, inattentif',
          'Rôle de pareur évalué : annonce « prêt » avant chaque passage.'),
        E(['porteur', 'voltigeur', 'pyramide', 'figure'], 'il construit les figures collectives',
          'porteur : dos plat, appuis stables ; voltigeur : appuis sur les zones osseuses (bassin, épaules), gainage',
          'dos rond du porteur, appuis sur le ventre ou les reins',
          'Montage / démontage décomposés en 3 temps annoncés, figure tenue 3 s.'),
        E(['element', 'maitrise', 'enchainement', 'liaison', 'fluid'], 'il enchaîne avec maîtrise',
          'liaisons sans arrêt, amplitude, rythme, éléments réalisés dans leur forme complète',
          'arrêts entre les éléments, oubli de l\'ordre',
          'Mémoriser l\'enchaînement par blocs de 2 éléments liés, puis le passer en entier.')
      ] },

    { id: 'escalade', nom: 'Escalade', ca: 2, k: ['escalade', 'grimpe', 'bloc', 'mur'],
      principe: 'grimper avec les jambes en économisant les bras, en lisant la voie, et en assurant la sécurité mutuelle',
      consigne: 'Pousse sur tes pieds, garde les bras tendus et repose-toi bras tendu avant les passages durs.',
      suggest: [['Pieds placés avec précision', '+'], ['Bras tendus / repos', '+'], ['Mousquetonnage correct', '+'], ['Tirer sur les bras', '-'], ['Pied qui glisse', '-'], ['Erreur d\'assurage', '-']],
      obs: [
        E(['pied', 'jambe', 'pousse'], 'il grimpe avec les jambes',
          'pied posé avec précision sur la prise (pointe ou carre interne), regard sur le pied, poussée des jambes pour monter',
          'pieds posés à l\'aveugle, montée en tirant sur les bras',
          'Traversée « pieds silencieux » : poser les pieds sans aucun bruit sur les prises.'),
        E(['brastendu', 'bras', 'repos', 'tire', 'tirer'], 'il économise son énergie',
          'bras tendus, bassin près du mur, repos sur bras tendu en secouant l\'autre main',
          'bras fléchis en permanence, bassin loin du mur',
          'Traversée bras tendus obligatoires, puis voie avec 2 repos imposés.'),
        E(['assurage', 'assure', 'noeud', 'mousquet', 'controle'], 'il assure la sécurité',
          'nœud en huit vérifié par le binôme, corde tendue, main sous le frein en permanence (assurage à 5 temps), mousquetonnage dans le bon sens',
          'main qui lâche la corde, corde molle, vérification oubliée',
          'Contrôle croisé systématique avant chaque montée ; assurage en « parade d\'assurage » par un troisième élève.'),
        E(['chute', 'zip', 'glisse', 'lache'], 'il reste stable sur le mur',
          'pied posé précisément et chargé, trois appuis stables avant chaque mouvement',
          'mouvements précipités, pied posé sur le bord de la prise',
          'Grimper avec la règle « 3 appuis toujours stables » sur une voie facile.'),
        E(['lecture', 'voie', 'cotation', 'reussi', 'sommet', 'enchaine'], 'il lit et réussit ses voies',
          'observation de la voie au sol (repérer prises et repos), choix d\'une voie adaptée',
          'départ sans observer, voie trop difficile',
          'Lecture à voix haute de la voie avant de grimper, puis comparaison avec la réalisation.')
      ] },

    { id: 'combat', nom: 'Sports de combat / opposition', ca: 4, k: ['boxe', 'savate', 'judo', 'lutte', 'combat', 'escrime', 'karate'],
      principe: 'toucher ou déséquilibrer l\'adversaire tout en se protégeant, dans le respect strict des règles et de l\'intégrité du partenaire',
      consigne: 'Garde toujours ta garde (ou ta posture) et frappe / attaque puis sors de la distance.',
      suggest: [['Touche valable', '+'], ['Esquive / parade', '+'], ['Déplacement en garde', '+'], ['Touché subi', '-'], ['Garde basse', '-'], ['Faute / touche non contrôlée', '-']],
      obs: [
        E(['deplacement', 'distance'], 'il maîtrise la distance',
          'pas chassés sans croiser les jambes, appuis légers',
          'pieds plats, croisement des jambes',
          'Jeu du miroir en garde : suivre le partenaire en restant à distance de touche.'),
        E(['garde', 'protection', 'subi', 'recu'], 'il se protège efficacement',
          'mains hautes, coudes serrés, menton rentré, profil',
          'garde qui baisse à l\'attaque, face à l\'adversaire',
          'Assaut « garde obligatoire » : toute touche reçue garde basse coûte 2 points.'),
        E(['esquive', 'parade', 'contre'], 'il sait défendre et riposter',
          'parade ou esquive suivie d\'une riposte immédiate',
          'défense sans riposte, recul passif',
          'Atelier attaque / parade / riposte à vitesse progressive.'),
        E(['faute', 'controle', 'avertissement', 'interdit'], 'il respecte son partenaire',
          'touche contrôlée sur les cibles autorisées',
          'touche appuyée, cible interdite',
          'Assaut en « touche-arrêt » : chaque touche doit être annoncée et contrôlée.'),
        E(['touche', 'attaque', 'marque', 'point', 'projection'], 'il marque des points',
          'attaque à bonne distance, enchaînement rapide, retour immédiat en garde',
          'attaque hors distance, coup isolé et prévisible',
          'Assauts à thème : enchaînements de 2 touches imposés, retour en garde contrôlé.')
      ] },

    { id: 'danse', nom: 'Danse / Arts du cirque', ca: 3, k: ['danse', 'cirque', 'jonglage', 'chore'],
      principe: 'communiquer une intention au public par un mouvement maîtrisé, dans l\'espace, le temps et l\'énergie',
      consigne: 'Regard placé, mouvements amples et précis, et tiens tes arrêts.',
      suggest: [['Mouvement amplifié', '+'], ['Regard / présence', '+'], ['Synchronisation', '+'], ['Oubli / hésitation', '-'], ['Désynchronisation', '-'], ['Chute d\'objet', '-']],
      obs: [
        E(['ampl', 'precis', 'energie'], 'il donne de l\'ampleur et de la précision',
          'mouvements engagés jusqu\'aux extrémités, contrastes d\'énergie',
          'gestes retenus, timidité',
          'Reprendre une phrase en l\'amplifiant puis en la réduisant pour ressentir le contraste.'),
        E(['regard', 'presence', 'concentration'], 'il capte l\'attention du public',
          'regard posé, début et fin immobiles, concentration',
          'regard au sol, rires, attitude hors du rôle',
          'Passages devant un demi-groupe avec consigne « regard + immobilité 3 s ».'),
        E(['synchro', 'unisson', 'temps', 'rythme'], 'il danse ensemble avec le groupe',
          'repères musicaux communs, écoute visuelle des partenaires',
          'précipitation, comptes non partagés',
          'Travail en canon puis à l\'unisson sur des comptes annoncés.'),
        E(['oubli', 'hesit', 'chute', 'objet', 'rate'], 'il est fiable dans sa prestation',
          'mémorisation par blocs, repères spatiaux',
          'enchaînement non mémorisé, stress',
          'Répétitions par blocs avec un partenaire qui souffle les repères.')
      ] },

    { id: 'muscu', nom: 'Musculation / Step / Circuit training', ca: 5, k: ['muscu', 'step', 'crossfit', 'circuit', 'renforcement', 'cardio', 'yoga', 'pilates'],
      principe: 'réaliser des exercices dans une posture sécuritaire, avec une charge et un rythme adaptés à son mobile personnel',
      consigne: 'Dos droit, gainage actif, souffle à l\'effort et amplitude contrôlée.',
      suggest: [['Posture sécuritaire', '+'], ['Amplitude complète', '+'], ['Respiration maîtrisée', '+'], ['Dos rond / cambré', '-'], ['Rythme non tenu', '-'], ['Mouvement saccadé', '-']],
      obs: [
        E(['dos', 'posture', 'placement', 'gainage', 'cambre', 'rond'], 'il travaille en sécurité',
          'dos neutre, abdominaux engagés, genoux dans l\'axe des pieds',
          'charge trop lourde, fatigue',
          'Exercice au poids de corps devant un miroir ou filmé, avec un partenaire qui observe 3 critères.'),
        E(['amplitude', 'saccade', 'controle'], 'il exploite toute l\'amplitude du mouvement',
          'mouvement complet et contrôlé (descente lente, montée dynamique)',
          'demi-mouvements pour aller plus vite',
          'Tempo imposé 3 s descente / 1 s montée.'),
        E(['respiration', 'souffle'], 'il gère sa respiration',
          'expiration sur la phase d\'effort, inspiration au retour',
          'blocage respiratoire',
          'Compter à voix haute pendant l\'effort pour éviter l\'apnée.'),
        E(['rythme', 'cadence', 'tempo', 'pas', 'musique'], 'il tient le rythme',
          'cadence régulière, repères musicaux (step) ou chronométrés',
          'départ trop rapide, perte du rythme en fin de série',
          'Séries chronométrées à cadence imposée, ajuster la charge pour tenir la série.')
      ] }
  ];

  /* Référentiel transversal (si l'observable n'est pas reconnu dans l'activité) */
  const GENERIC = [
    E(['perte', 'perdu', 'balleperdue'], 'il sécurise la possession', 'choix simple et sûr, regard avant d\'agir', 'précipitation, choix forcé', 'Situation de conservation en surnombre (4 c 2), temps de possession limité.'),
    E(['passe'], 'il fait vivre le jeu collectif', 'regard sur la cible avant la passe, passe tendue vers un partenaire démarqué', 'passe forcée vers un partenaire marqué, décision tardive', 'Jeu des 10 passes en surnombre, puis à effectif égal.'),
    E(['tir', 'frappe', 'but', 'marque', 'point', 'gagn'], 'il conclut les actions', 'appuis stables, orientation vers la cible, action réalisée en position favorable', 'action prise en déséquilibre ou trop loin', 'Répétitions sans opposition, puis avec opposition progressive.'),
    E(['service'], 'il met le jeu en route avec fiabilité', 'routine stable, geste maîtrisé, cible choisie', 'précipitation, geste non stabilisé', 'Séries de 10 sur cibles avec comptage.'),
    E(['reception', 'controle'], 'il est fiable à la réception', 'placement préalable, surface de contact relâchée', 'placement tardif', 'Réceptions en situation simplifiée puis en jeu.'),
    E(['faute', 'erreur', 'rate', 'manque', 'dehors', 'sortie'], 'il limite les erreurs', 'action dosée avec une marge de sécurité, placement préalable', 'précipitation, prise de risque excessive', 'Jeu où chaque faute directe compte double.'),
    E(['interception', 'recuperation', 'defense', 'contre'], 'il récupère et défend', 'placement entre l\'adversaire et la cible, anticipation', 'défense passive ou en retard', 'Opposition à thème où chaque récupération rapporte un bonus.'),
    E(['deplacement', 'replacement', 'placement'], 'il est bien placé', 'replacement après chaque action, appuis actifs', 'statisme, regard sur l\'action passée', 'Déplacements sur signal avec retour à une position de base.'),
    E(['appel', 'demarquage', 'communication', 'annonce'], 'il communique et se rend disponible', 'appel visible et sonore, au bon moment', 'appel absent ou trop tardif', 'Jeu où l\'action n\'est valide que si elle est annoncée.'),
    E(['equilibre', 'chute', 'tenue', 'stabil'], 'il reste maître de son corps', 'appuis stables, gainage, regard fixé', 'gainage insuffisant, précipitation', 'Exercices de tenue 3 s après chaque action.')
  ];

  function detect(activite) {
    const n = norm(activite);
    if (!n) return null;
    for (const a of ACTIVITIES) if (a.k.some(k => n.includes(norm(k)))) {
      if (a.id === 'tennis' && n.includes('table')) continue;
      return a;
    }
    return null;
  }
  const match = (label, list) => { const n = norm(label); return list.find(e => e.k.some(k => k && n.includes(k))) || null; };

  /* ── Radar SVG ── */
  function wrap(label, max) {
    const out = []; let line = '';
    String(label).split(/\s+/).forEach(w => {
      if (line && (line + ' ' + w).length > max) { out.push(line); line = w; } else line = line ? line + ' ' + w : w;
    });
    if (line) out.push(line);
    return out;
  }
  function bars(acts, top) {
    return acts.map(a => {
      const col = a.polarity === 'negative' ? 'var(--neg)' : 'var(--pos)';
      return `<div style="display:flex;align-items:center;gap:8px;margin:10px 0"><span style="flex:0 0 38%;text-align:right;font-weight:600">${esc(a.label)}</span>` +
        `<div style="flex:1;background:#f3ecc9;border-radius:8px"><div style="width:${a.count / top * 100}%;min-width:3px;height:22px;border-radius:8px;background:${col}"></div></div><b>${a.count}</b></div>`;
    }).join('');
  }
  function radar(acts) {
    const n = acts.length, W = 440, H = 400, cx = 220, cy = 200, R = 98;
    const max = Math.max(1, ...acts.map(a => a.count));
    const step = max <= 5 ? 1 : Math.ceil(max / 5), rings = Math.ceil(max / step), top = rings * step;
    if (n < 3) return bars(acts, top);
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n, pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Graphique radar des observables">`;
    for (let k = 1; k <= rings; k++) {
      s += `<polygon points="${acts.map((_, i) => pt(i, R * k / rings).map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#e6dca8"/>`;
      const [tx, ty] = pt(0, R * k / rings);
      s += `<text x="${(tx + 4).toFixed(1)}" y="${ty.toFixed(1)}" font-size="11" fill="#8a8366">${k * step}</text>`;
    }
    acts.forEach((_, i) => { const [x, y] = pt(i, R); s += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e6dca8"/>`; });
    const poly = acts.map((a, i) => pt(i, R * a.count / top));
    s += `<polygon points="${poly.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="rgba(255,196,0,.3)" stroke="#E0A800" stroke-width="2.5" stroke-linejoin="round"/>`;
    acts.forEach((a, i) => {
      const col = a.polarity === 'negative' ? '#d63a4f' : '#1fa65a';
      s += `<circle cx="${poly[i][0].toFixed(1)}" cy="${poly[i][1].toFixed(1)}" r="6" fill="${col}" stroke="#fff" stroke-width="2"/>`;
      const [x, y] = pt(i, R + 18), c = Math.cos(ang(i)), sn = Math.sin(ang(i));
      const anchor = c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle';
      const lines = wrap(a.label, 11).concat(['×' + a.count]);
      const y0 = y - (lines.length - 1) * 17 * (sn < -0.3 ? 1 : sn > 0.3 ? 0 : 0.5) + 4;
      s += `<text x="${x.toFixed(1)}" y="${y0.toFixed(1)}" text-anchor="${anchor}" font-size="15" font-weight="700" fill="${col}">` +
        lines.map((t, j) => `<tspan x="${x.toFixed(1)}" dy="${j ? 17 : 0}"${j === lines.length - 1 ? ' fill="#1f2330"' : ''}>${esc(t)}</tspan>`).join('') + '</text>';
    });
    return s + '</svg>';
  }

  /* ── Bilan du coach ── */
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const fr = n => String(Math.round(n * 10) / 10).replace('.', ',');
  const fois = n => n + ' fois';
  const first = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  /* acts : [{label, count, polarity}] ; ms : durée de la séance en millisecondes */
  function coach({ nom, activite, acts, ms }) {
    const act = detect(activite);
    const lib = act ? act.obs : [];
    const A = acts.map(a => Object.assign({}, a, { e: match(a.label, lib) || match(a.label, GENERIC) }));
    const P = A.filter(a => a.polarity === 'positive'), N = A.filter(a => a.polarity === 'negative');
    const sp = P.reduce((s, a) => s + a.count, 0), sn = N.reduce((s, a) => s + a.count, 0), tot = sp + sn;
    const min = Math.max(ms || 0, 0) / 60000;
    const ratio = tot ? sp / tot : 0;

    /* Taux de réussite par geste (observable + et – qui portent sur le même geste) */
    const pairs = [];
    const keyOf = a => a.e ? a.e.k[0] : norm(a.label).replace(/(reussie?s?|ratee?s?|manquee?s?|gagnante?s?|perdue?s?|positif|negatif|correcte?s?|incorrecte?s?)/g, '');
    const groups = {};
    A.forEach(a => { const k = keyOf(a); (groups[k] = groups[k] || []).push(a); });
    Object.values(groups).forEach(g => {
      const p = g.filter(a => a.polarity === 'positive'), n = g.filter(a => a.polarity === 'negative');
      if (p.length && n.length) {
        const ok = p.reduce((s, a) => s + a.count, 0), ko = n.reduce((s, a) => s + a.count, 0);
        if (ok + ko) pairs.push({ label: p[0].e ? (p[0].e === n[0].e ? first(p[0].label.split(/\s+/)[0]) : p[0].label) : p[0].label, ok, n: ok + ko, r: ok / (ok + ko) });
      }
    });

    /* 1. Profil */
    let niveau, profil;
    if (P.length && N.length && tot) {
      if (ratio >= 0.75) { niveau = 'Maîtrise'; profil = 'les actions efficaces dominent nettement : la prestation est de bon niveau et doit maintenant être confirmée face à une opposition plus forte.'; }
      else if (ratio >= 0.55) { niveau = 'Efficace'; profil = 'les réussites l\'emportent sur les erreurs : la base technique est en place, il faut maintenant la fiabiliser pour réduire les pertes d\'efficacité.'; }
      else if (ratio >= 0.40) { niveau = 'En construction'; profil = 'réussites et erreurs s\'équilibrent : les gestes sont connus mais pas encore stabilisés, surtout sous pression.'; }
      else { niveau = 'En difficulté'; profil = 'les erreurs dominent : il faut simplifier les choix et revenir à des situations d\'apprentissage moins exigeantes pour reconstruire la réussite.'; }
    } else if (tot) { niveau = 'Observation ciblée'; profil = N.length ? 'seuls des comportements à corriger étaient observés : l\'objectif est d\'en réduire la fréquence.' : 'seules des actions positives étaient observées : l\'objectif est d\'en augmenter le volume et la variété.'; }
    else { niveau = 'Non observé'; profil = 'aucune action n\'a été relevée : le bilan doit être refait sur une nouvelle observation.'; }

    const cad = min >= 0.5 ? tot / min : null;
    const kpis = [['Actions observées', String(tot)]];
    if (P.length && N.length) kpis.push(['Actions positives', `${sp} (${pct(sp, tot)} %)`], ['Actions négatives', `${sn} (${pct(sn, tot)} %)`]);
    if (cad != null) kpis.push(['Rythme', `${fr(cad)} action${cad >= 2 ? 's' : ''} / min`]);
    pairs.forEach(p => kpis.push([`Réussite · ${p.label}`, `${p.ok} / ${p.n} (${pct(p.ok, p.n)} %)`]));

    const notes = [];
    if (tot && tot < 6) notes.push('Peu d\'actions relevées : ce bilan est une tendance à confirmer sur une observation plus longue.');
    if (cad != null && cad < 0.5 && min >= 3) notes.push('Le rythme d\'implication est faible : l\'élève participe peu au jeu, l\'engagement est un premier levier de progrès.');
    else if (cad != null && cad >= 3) notes.push('Très forte implication dans l\'action : l\'élève est au cœur du jeu.');

    /* 2. Points forts */
    const forces = [...P].filter(a => a.count > 0).sort((a, b) => b.count - a.count).slice(0, 3).map(a => ({
      label: a.label, count: a.count,
      txt: a.e ? `${first(a.e.why)}. Critère technique validé : ${a.e.cue}.` : 'Action positive régulièrement réussie : elle constitue un point d\'appui pour la suite.'
    }));
    pairs.filter(p => p.n >= 3).forEach(p => {
      const f = forces.find(x => norm(x.label).startsWith(norm(p.label))); if (!f) return;
      if (p.r >= 0.6) f.txt += ` Efficacité : ${pct(p.ok, p.n)} % de réussite.`;
      else f.txt = f.txt.replace('Critère technique validé', 'Geste tenté et parfois réussi, à fiabiliser (' + pct(p.ok, p.n) + ' % de réussite). Critère à stabiliser');
    });

    /* 3. Priorité de travail */
    let prio = null;
    const negSorted = [...N].filter(a => a.count > 0).sort((a, b) => b.count - a.count);
    const weakPair = pairs.filter(p => p.r < 0.5 && p.n >= 3).sort((a, b) => a.r - b.r)[0];
    if (negSorted.length) {
      const a = negSorted[0], e = a.e;
      prio = { label: a.label, constat: `« ${a.label} » relevé ${fois(a.count)}, soit ${pct(a.count, tot)} % des actions observées${cad != null ? ` (environ une toutes les ${fr(min / a.count)} min)` : ''}.`,
        causes: e ? first(e.err) + '.' : 'Action encore mal maîtrisée, souvent par précipitation ou par mauvais placement.',
        criteres: e ? first(e.cue) + '.' : 'Ralentir l\'exécution, se placer avant d\'agir, vérifier le résultat de chaque action.',
        exercice: e ? e.drill : `Isoler « ${a.label} » dans une situation simplifiée (opposition réduite, espace aménagé), puis le réintroduire progressivement en situation de jeu.` };
    } else if (weakPair) {
      const a = P.find(x => keyOf(x) && norm(x.label).startsWith(norm(weakPair.label))) || P[0], e = a && a.e;
      prio = { label: weakPair.label, constat: `Réussite de ${pct(weakPair.ok, weakPair.n)} % seulement sur « ${weakPair.label} » (${weakPair.ok} sur ${weakPair.n}).`,
        causes: e ? first(e.err) + '.' : 'Geste encore instable.', criteres: e ? first(e.cue) + '.' : 'Stabiliser le geste avant de chercher la vitesse.', exercice: e ? e.drill : 'Répétitions en situation simplifiée.' };
    } else {
      const absent = P.filter(a => a.count === 0)[0] || [...P].sort((a, b) => a.count - b.count)[0];
      if (absent) {
        const e = absent.e;
        prio = { label: absent.label, constat: absent.count ? `« ${absent.label} » est l\'action positive la moins fréquente (${fois(absent.count)}).` : `« ${absent.label} » n'a jamais été observé pendant la séance.`,
          causes: e ? `Ce geste est peu tenté ou pas encore disponible en situation : ${e.err}.` : 'Action peu tentée ou pas encore disponible en situation.',
          criteres: e ? first(e.cue) + '.' : 'Identifier le moment favorable pour réaliser cette action.', exercice: e ? e.drill : `Situation à thème où « ${absent.label} » rapporte des points bonus.` };
      }
    }

    /* 4. Points de vigilance */
    const vig = [];
    negSorted.slice(1).forEach(a => vig.push(`« ${a.label} » (${fois(a.count)}) : ${a.e ? 'à corriger — ' + a.e.cue : 'à surveiller lors de la prochaine séance'}.`));
    P.filter(a => a.count === 0 && (!prio || prio.label !== a.label)).forEach(a => vig.push(`« ${a.label} » n'a pas été observé : ${a.e ? 'à oser davantage — ' + a.e.cue : 'à rechercher davantage en situation'}.`));
    N.filter(a => a.count === 0).forEach(a => vig.push(`« ${a.label} » n'a pas été relevé : très bonne maîtrise sur ce point, à conserver.`));

    /* 5. Objectifs mesurables */
    const obj = [];
    if (negSorted.length) { const a = negSorted[0]; obj.push(`Réduire « ${a.label} » : passer de ${a.count} à ${Math.max(0, Math.floor(a.count * 0.6))} maximum sur une séance de même durée.`); }
    if (weakPair) obj.push(`Atteindre au moins ${Math.min(80, Math.max(50, Math.ceil((weakPair.r * 100 + 15) / 5) * 5))} % de réussite sur « ${weakPair.label} » (actuellement ${pct(weakPair.ok, weakPair.n)} %).`);
    if (P.length && N.length && tot) {
      const target = ratio < 0.4 ? 50 : ratio < 0.55 ? 60 : ratio < 0.75 ? 75 : Math.min(95, pct(sp, tot) + 5);
      obj.push(`Porter la part d'actions positives à ${target} % (actuellement ${pct(sp, tot)} %).`);
    }
    const abs = P.find(a => a.count === 0);
    if (abs) obj.push(`Réussir au moins 2 fois « ${abs.label} » pendant la prochaine séance.`);
    else if (forces[0]) obj.push(`Maintenir « ${forces[0].label} » à au moins ${forces[0].count} réussites face à un adversaire de niveau équivalent ou supérieur.`);
    if (!obj.length) obj.push('Refaire une observation complète pour fixer des objectifs chiffrés.');

    /* 6. Mot du coach */
    const lvlTip = { 'Maîtrise': 'Tu peux maintenant te fixer des défis plus élevés : jouer contre plus fort, prendre davantage d\'initiatives.',
      'Efficace': 'Le travail porte ses fruits : concentre-toi sur la régularité, c\'est elle qui fera la différence.',
      'En construction': 'Fais des choix plus simples : une action réussie vaut mieux qu\'une action spectaculaire ratée.',
      'En difficulté': 'Ralentis, prends le temps de te placer avant d\'agir et réussis d\'abord les gestes simples.' }[niveau] || '';
    const mot = act ? `En ${act.nom.toLowerCase()}, la clé est de ${act.principe}. ${act.consigne} ${lvlTip}`.trim()
      : `${lvlTip} Choisis un seul critère à améliorer à la prochaine séance et demande à ton observateur de le suivre.`.trim();

    return { nom, activite, act, niveau, profil, kpis, notes, forces, prio, vig, obj, mot, sp, sn, tot, ratio, pairs,
      caLabel: act ? CA[act.ca] : '' };
  }

  function toHTML(r) {
    const li = a => a.map(t => `<li>${t}</li>`).join('');
    let h = `<div class="coach"><div class="coach-head"><span class="coach-ico">🏅</span><div><b>Bilan du coach${r.act ? ' · ' + esc(r.act.nom) : ''}</b>` +
      `<small>${r.act ? esc(r.caLabel) : 'Activité « ' + esc(r.activite) + ' » non reconnue : conseils généraux'}</small></div></div>`;
    h += `<section class="cs p"><h4>1. Profil de la séance</h4><p><span class="lvl lvl-${norm(r.niveau)}">${esc(r.niveau)}</span> ${esc(r.nom)} : ${esc(r.profil)}</p>` +
      `<div class="kpis">${r.kpis.map(k => `<div><span>${esc(k[0])}</span><b>${esc(k[1])}</b></div>`).join('')}</div>` +
      (r.notes.length ? `<p class="note">${r.notes.map(esc).join(' ')}</p>` : '') + '</section>';
    h += `<section class="cs s"><h4>2. Points forts</h4>` + (r.forces.length
      ? `<ul>${li(r.forces.map(f => `<b>${esc(f.label)}</b> (${f.count} fois) — ${esc(f.txt)}`))}</ul>`
      : '<p>Aucune action positive n\'a encore été réussie : la priorité est de construire une première réussite.</p>') + '</section>';
    if (r.prio) h += `<section class="cs c"><h4>3. Priorité de travail : ${esc(r.prio.label)}</h4><p>${esc(r.prio.constat)}</p><dl>` +
      `<dt>Causes probables</dt><dd>${esc(r.prio.causes)}</dd><dt>Critères de réalisation</dt><dd>${esc(r.prio.criteres)}</dd>` +
      `<dt>Situation d'apprentissage proposée</dt><dd>${esc(r.prio.exercice)}</dd></dl></section>`;
    if (r.vig.length) h += `<section class="cs w"><h4>4. Points de vigilance</h4><ul>${li(r.vig.map(esc))}</ul></section>`;
    h += `<section class="cs o"><h4>5. Objectifs pour la prochaine séance</h4><ol>${li(r.obj.map(esc))}</ol></section>`;
    h += `<section class="cs k"><h4>6. Le mot du coach</h4><p>« ${esc(r.mot)} »</p></section></div>`;
    return h;
  }

  function toText(r) {
    const L = [];
    L.push(`PROFIL : ${r.niveau} — ${r.profil}`);
    L.push('Chiffres : ' + r.kpis.map(k => `${k[0]} ${k[1]}`).join(' ; ') + '.');
    if (r.notes.length) L.push(r.notes.join(' '));
    L.push('POINTS FORTS : ' + (r.forces.length ? r.forces.map(f => `${f.label} (${f.count}) — ${f.txt}`).join(' ') : 'aucune action positive réussie.'));
    if (r.prio) L.push(`PRIORITÉ : ${r.prio.label}. ${r.prio.constat} Causes probables : ${r.prio.causes} Critères : ${r.prio.criteres} Exercice : ${r.prio.exercice}`);
    if (r.vig.length) L.push('VIGILANCE : ' + r.vig.join(' '));
    L.push('OBJECTIFS : ' + r.obj.map((o, i) => `${i + 1}) ${o}`).join(' '));
    L.push('MOT DU COACH : ' + r.mot);
    return L.join('\n');
  }

  /* Objet « séance terminée » → données du joueur pid */
  function actsOf(f, pid) {
    const c = (f.counts && f.counts[pid]) || {};
    return f.items.map((label, i) => ({ label, count: c['item' + (i + 1)] || 0, polarity: f.polarity[i] || 'positive' }));
  }
  const msOf = f => f.durationMs || ((f.timestamp && f.id) ? f.timestamp - f.id : 0);

  /* ── Ligne de la feuille « statobs » (mode lignes du fichier Mes Apps EPS) ── */
  const p2 = n => String(n).padStart(2, '0');
  const dateOf = f => { const d = new Date(f.id); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
  const timeOf = f => { const d = new Date(f.id); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
  const FIXED = ['Date', 'Heure', 'Activité', 'Rôle', 'Observateur(s)', 'Élève(s) observé(s)', 'Durée',
    'Actions positives', 'Actions négatives', 'Actions positives (%)', 'Profil', 'Point fort', 'Priorité', 'Objectifs', 'Bilan du coach'];
  const header = nObs => FIXED.concat(...Array.from({ length: nObs }, (_, i) => [`Observable ${i + 1}`, `Nb ${i + 1}`]));

  /* role : 'Pratiquant' | 'Observateur' ; who = { observateurs: 'texte', observes: 'texte' } */
  function sheetCells(f, pid, role, who) {
    const base = [dateOf(f), timeOf(f), f.activite, role, who.observateurs || '', who.observes || '', f.duration || ''];
    if (role !== 'Pratiquant') return base;
    const acts = actsOf(f, pid), r = coach({ nom: '', activite: f.activite, acts, ms: msOf(f) });
    const both = acts.some(a => a.polarity === 'positive') && acts.some(a => a.polarity === 'negative');
    return base.concat([r.sp, r.sn, both && r.tot ? pct(r.sp, r.tot) : '', r.niveau,
      r.forces[0] ? `${r.forces[0].label} (${r.forces[0].count})` : '', r.prio ? r.prio.label : '',
      r.obj.map((o, i) => `${i + 1}) ${o}`).join('\n'), toText(r)],
      ...acts.map(a => [`${a.label} (${a.polarity === 'negative' ? '−' : '+'})`, a.count]));
  }

  window.StatObsBilan = { ACTIVITIES, CA, detect, radar, coach, toHTML, toText, actsOf, msOf, header, sheetCells, dateOf, norm, esc };
})();
