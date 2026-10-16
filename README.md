# S.B.M. Décor Stylisé

Site vitrine français pour SBM à Luriecq : direction artistique forêt/cuivre/ivoire, modèle original d’escalier 3D interactif, trois finitions, vues prédéfinies, exploration immersive, galerie filtrable, FAQ, contact et pages légales.

## Lancer le site

Prérequis : Node.js 20.19+ ou 22.12+.

```sh
npm ci
npm run dev
```

Le chemin de base est `/sbm/`, comme sur GitHub Pages. Le serveur Vite affiche son adresse dans le terminal.

## Build et tests

```sh
npm run build
npm test
```

Les tests Playwright démarrent un serveur de production sur le port 4175. Dans l’environnement cloud, Chromium système est détecté. Sur une autre machine, installer le navigateur de test avec `npx playwright install chromium`, ou définir `PLAYWRIGHT_CHROMIUM_EXECUTABLE` vers un Chromium existant.

Les vérifications portent sur le rendu 3D réel et ses changements de matière, le clavier, les interactions mobiles, les filtres, les fenêtres modales, les pages légales, les mouvements réduits et le remplacement visuel sans WebGL. Les tests ne nécessitent aucun service externe.

## Publication

Le workflow `.github/workflows/pages.yml` construit et publie `dist` à chaque envoi sur `main`. Dans GitHub, choisir **Settings → Pages → Source → GitHub Actions**. Le site cible est `https://malolunier42-boop.github.io/sbm/`.

Trois pages sont exportées : accueil, `mentions-legales.html`, `confidentialite.html`. Les assets utilisent le préfixe `/sbm/`. Aucun serveur Node, compte, clé API, MCP ou formulaire externe n’est nécessaire en production.

## Données et contenus

- **Annuaire des entreprises / API officielle Recherche d’entreprises**, consultée le 16 octobre 2026 : SBM (SAS), SIREN 334201639, SIRET siège 33420163900039, siège ZI La Gravoux, boulevard de l’Europe, 42380 Luriecq, création société 26 novembre 1985, TVA FR28334201639.
- **Fiche Google transmise par l’utilisateur** : nom commercial, présentation de l’activité, téléphone 04 77 50 15 65, horaires. Le siège officiel précise l’adresse de secteur initialement donnée.
- **Utilisateur** : Malo Lunier, responsable de publication. Cette fonction n’est pas assimilée à la présidence de la société.
- Sources et crédits détaillés dans les mentions légales. Le capital social, l’immatriculation précise et le courriel professionnel restent à confirmer ; ne pas les inventer.

Le modèle 3D et les visuels sont des études artistiques originales, explicitement identifiées comme inspirations. Ils ne présentent pas de réalisations de l’entreprise et ne sont ni des plans techniques ni des devis. Le site historique n’a pas pu être chargé pour récupérer des photos réelles.

## Conception technique

HTML/CSS/JavaScript avec Vite et Three.js chargé dans un module séparé. Le modèle est produit localement avec géométries et texture bois procédurales : aucune image, fonte ou bibliothèque distante n’est chargée à la visite. Le rendu s’arrête hors écran, onglet masqué et lorsque la scène est immobile ; la rotation automatique est facultative et respecte la préférence de mouvement réduit. Le défilement tactile reste libre ; les gestes de manipulation sont activés en vue immersive. Les commandes clavier et boutons offrent une alternative au glissement.

Aucun cookie applicatif, stockage local, mesure d’audience ou formulaire de collecte. Google Maps s’ouvre uniquement sur demande. Polices Manrope et DM Sans sous OFL 1.1, Three.js sous MIT ; notices dans les pages légales et `public/fonts/`.
