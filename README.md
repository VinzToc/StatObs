# Observation & Statistiques du sportif (PWA)

Application d'observation en EPS : saisie des actions, chronomètre, statistiques et envoi vers Google Sheets.
Fonctionne hors ligne une fois installée.

## Contenu du dépôt

| Fichier | Rôle |
|---|---|
| `index.html`, `panneau_saisie.html`, `statistiques.html` | Les 3 pages de l'application |
| `manifest.webmanifest` | Nom, icônes, couleurs, mode « application » |
| `sw.js` | Service worker (cache hors ligne) |
| `pwa.js` | Enregistrement du service worker, bouton d'installation, renvoi des données en attente |
| `icons/` | Icônes 192, 512, maskable et iOS |
| `.nojekyll` | Demande à GitHub Pages de servir les fichiers tels quels |

## Déploiement sur GitHub Pages

1. Créer un dépôt public sur GitHub (ex. `observation-eps`).
2. Y déposer **tous** les fichiers de ce dossier, à la racine du dépôt (bouton *Add file → Upload files*, en incluant le dossier `icons` et le fichier `.nojekyll`).
3. *Settings → Pages → Build and deployment* : Source = **Deploy from a branch**, Branch = **main**, dossier **/ (root)**, puis *Save*.
4. Après 1 à 2 minutes, l'application est en ligne sur `https://<votre-compte>.github.io/<nom-du-depot>/`.

## Installation sur l'appareil

- **Android / Chrome** : bouton « Installer l'application » sur la page d'accueil, ou menu ⋮ → *Installer l'application*.
- **iPhone / iPad (Safari)** : bouton Partager → *Sur l'écran d'accueil*.
- **Ordinateur (Chrome / Edge)** : icône d'installation dans la barre d'adresse.

Ouvrir l'application **une première fois avec une connexion** : c'est ce qui la met en cache pour un usage hors ligne.

## Mettre à jour l'application

Après avoir modifié un fichier, ouvrir `sw.js` et changer `const VERSION = 'v1'` en `'v2'` (puis `'v3'`…), puis déposer les fichiers modifiés. Les appareils récupèrent la nouvelle version au lancement suivant (parfois au deuxième).

## Points à connaître

- **Google Sheets** : l'URL du Web App est dans `statistiques.html` (constante `WEB_APP_URL`). Si la séance est terminée sans réseau, l'envoi est mis en attente et repart automatiquement au retour de la connexion.
- **Chart.js** (graphique radar) est chargé depuis cdnjs puis mis en cache. Pour le rendre 100 % local, télécharger `chart.min.js` (v3.9.1) dans un dossier `libs/`, changer le `src` dans `statistiques.html`, et ajouter `libs/chart.min.js` à la liste `CORE` de `sw.js`.
- Les données de séance sont stockées dans le navigateur (`localStorage`) de l'appareil utilisé.
