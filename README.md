# StatObs – Observation du sportif en EPS (Mes Apps EPS · version enseignant)

Application 100 % locale et 100 % hors ligne : aucune donnée n'est envoyée sur Internet. Thème jaune de l'application.

## Contenu du dépôt

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil : base élèves Mes Apps EPS, choix des observateurs et pratiquants, activité, observables (avec observables types par activité) |
| `panneau_saisie.html` | Saisie : un compteur par observable, onglets pour passer d'un pratiquant à l'autre |
| `statistiques.html` | Radar, synthèse, **bilan du coach** par pratiquant ; enregistrement et export .xlsx |
| `eps-core.js` | Base partagée « Mes Apps EPS » (v2.2, copie de celle du portail) |
| `eps-xlsx.js` | Lecture des sauvegardes StatObs (.xlsx) et partage du fichier exporté |
| `statobs-bilan.js` | Radar + bilan du coach (référentiel technique par activité) |
| `statobs.js`, `statobs.css` | Fonctions communes et thème jaune |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA : installation et fonctionnement hors ligne |
| `.nojekyll` | Demande à GitHub Pages de servir les fichiers tels quels |

## Base élèves et enregistrement (eps-core.js v2.2)

- La liste des élèves est lue **automatiquement** dans la base Mes Apps EPS du navigateur (même domaine `vinztoc.github.io`) : elle s'importe dans le portail Mes Apps EPS, jamais dans StatObs.
- Chaque séance est enregistrée dans Mes Apps EPS en **mode « lignes »** (`EPS.addLigne('statobs', …)`) : une ligne par pratiquant et par observateur. Elle apparaît donc aussi dans l'export général du portail.
- Bouton **Importer une sauvegarde StatObs (.xlsx)** : fichiers produits par StatObs Élèves ou export général StatObs (plusieurs fichiers à la fois). Seule la feuille « statobs » est lue, la liste des élèves n'est jamais modifiée ; un même fichier importé deux fois ne crée pas de doublon. Rattachement par Nom + Prénom (+ Classe, + Né(e) le si présente) ; les lignes d'élèves introuvables sont signalées.
- Bouton **Exporter les résultats (.xlsx)** : `StatObs_export_AAAA-MM-JJ.xlsx` (feuilles « Élèves », « statobs », « _meta »), réimportable dans Mes Apps EPS ou dans StatObs sur un autre appareil.

Colonnes de la feuille « statobs » : Nom, Prénom, Né(e) le, Classe, Date, Heure, Activité, Rôle, Observateur(s), Élève(s) observé(s), Durée, Actions positives / négatives / %, Profil, Point fort, Priorité, Objectifs, Bilan du coach, Observable n / Nb n.

## Bilan du coach

Le bilan est structuré en 6 parties : profil de la séance (niveau, taux d'actions positives, rythme, taux de réussite par geste), points forts, priorité de travail (causes probables, critères de réalisation, situation d'apprentissage), points de vigilance, objectifs chiffrés, mot du coach.
Référentiels intégrés : basket-ball, handball, football/futsal, volley-ball, badminton, tennis de table, tennis, rugby, ultimate, course de vitesse/haies/relais, sauts, lancers, course d'orientation, natation, demi-fond, gymnastique/acrosport, escalade, sports de combat, danse/cirque, musculation/step. Une activité non reconnue reçoit des conseils généraux.
Pour enrichir un référentiel : modifier le tableau `ACTIVITIES` de `statobs-bilan.js` (même fichier dans la version élèves).

## Identité de l'application

`manifest.webmanifest` porte `"id": "/StatObs/"`. Ne pas le remettre à `"./"` : sur `vinztoc.github.io`, un id `"./"` ou `"."` désigne la racine du domaine et toutes les applis qui l'utilisent sont confondues par le navigateur (ex. StatObs ouvert sous le nom « Gestion AS »).

## Mettre à jour l'application

Après modification d'un fichier, augmenter `const VERSION` dans `sw.js` (actuellement `'v3'`) et déposer les fichiers modifiés.
