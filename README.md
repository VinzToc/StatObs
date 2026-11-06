# StatObs – Observation du sportif en EPS (Mes Apps EPS · version enseignant)

Application 100 % locale et 100 % hors ligne : aucune donnée n'est envoyée sur Internet. Thème jaune de l'application.

## Contenu du dépôt

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil : base élèves Mes Apps EPS, choix des observateurs et pratiquants, activité, observables (avec observables types par activité) |
| `panneau_saisie.html` | Saisie : un compteur par observable, onglets pour passer d'un pratiquant à l'autre |
| `statistiques.html` | Radar, synthèse, **bilan du coach** par pratiquant ; enregistrement et export .xlsx |
| `eps-core.js` | Base élèves partagée « Mes Apps EPS » (IndexedDB), **inchangée** |
| `eps-xlsx.js` | Lecture du fichier Mes Apps EPS (.xlsx) et écriture au format type |
| `statobs-bilan.js` | Radar + bilan du coach (référentiel technique par activité) |
| `statobs.js`, `statobs.css` | Fonctions communes et thème jaune |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA : installation et fonctionnement hors ligne |
| `.nojekyll` | Demande à GitHub Pages de servir les fichiers tels quels |

## Base élèves

À l'ouverture, StatObs lit automatiquement la base `MesAppsEPS` de l'appareil (même compte GitHub Pages que Mes Apps EPS).
Si elle est vide, le bloc « Base élèves » est surligné : charger le fichier **Mes_Apps_EPS_AAAA-MM-JJ.xlsx** (feuille « Élèves ») ou l'export Pronote (.csv).

## Export

Le bouton **Exporter les résultats (.xlsx)** produit `Mes_Apps_EPS_StatObs_AAAA-MM-JJ.xlsx`, au format du fichier type :

- feuille **Élèves** : Nom, Prénom, Né(e) le, Classe, Régime ;
- feuille **statobs** (mode « lignes ») : une ligne par élève et par séance — Nom, Prénom, Né(e) le, Classe, Date, Heure, Activité, Rôle, Observateur(s), Élève(s) observé(s), Durée, Actions positives / négatives / %, Profil, Point fort, Priorité, Objectifs, Bilan du coach, puis Observable n / Nb n ;
- feuille cachée **_meta** : `statobs | statobs | lignes`.

Le résumé de chaque séance reste aussi enregistré dans la base partagée (`ext.statobs`), comme avant.

## Bilan du coach

Le bilan est structuré en 6 parties : profil de la séance (niveau, taux d'actions positives, rythme, taux de réussite par geste), points forts, priorité de travail (causes probables, critères de réalisation, situation d'apprentissage), points de vigilance, objectifs chiffrés, mot du coach.
Référentiels intégrés : basket-ball, handball, football/futsal, volley-ball, badminton, tennis de table, tennis, rugby, ultimate, course de vitesse/haies/relais, sauts, lancers, course d'orientation, natation, demi-fond, gymnastique/acrosport, escalade, sports de combat, danse/cirque, musculation/step. Une activité non reconnue reçoit des conseils généraux.
Pour enrichir un référentiel : modifier le tableau `ACTIVITIES` de `statobs-bilan.js` (même fichier dans la version élèves).

## Remplacement de l'ancienne version publiée

Cette version remplace celle du dépôt `VinzToc/StatObs` (thème violet, Chart.js en ligne, `pwa.js`). `pwa.js` n'est plus utilisé et peut être supprimé ; le nouveau `sw.js` efface l'ancien cache `observation-eps-v1` au premier lancement.

## Mettre à jour l'application

Après modification d'un fichier, augmenter `const VERSION` dans `sw.js` (actuellement `'v2'`) et déposer les fichiers modifiés.
