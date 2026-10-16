# S.B.M. Décor Stylisé — l’atelier et le studio 3D

Site français multipage pour SBM à Luriecq, destiné aux particuliers et aux professionnels. Le configurateur compose un escalier original en 3D puis transmet ses choix à un dossier de demande de devis.

## Développement

Node.js 20.19+ ou 22.12+.

```sh
npm ci
npm run dev
```

Le site utilise `/sbm/`, le même préfixe que GitHub Pages. Les ressources, les polices et le moteur 3D sont servis localement ; aucune clé API ou connexion MCP n’est nécessaire pour visiter ou lancer le site.

```sh
npm run build
npm test
```

Les tests Playwright compilent le site puis démarrent un serveur de production sur le port 4175. Chromium système est détecté dans le cloud. Ailleurs : `npx playwright install chromium`, ou définir `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

## Pages

- `index.html` : atelier, collection des quatre modèles et accès aux univers.
- `particuliers.html` : rénovation, construction et projets de maison.
- `professionnels.html` : entreprises, commerces, architectes et usages du lieu.
- `matieres.html` : palettes, matières et liens avec présélection dans le studio.
- `configurateur.html` : création d’une intention personnalisée.
- `devis.html` : dossier préparatoire et variantes à faire chiffrer.
- `mentions-legales.html` et `confidentialite.html` : identité, sources et fonctionnement réel du site.

## Configurateur

Quatre formes (droit, quart tournant, demi-tournant, hélicoïdal), structures acier ou bois, marches chêne/noyer/frêne/acier/pierre, huit couleurs proposées et teinte libre, trois aspects métalliques, quatre garde-corps, contremarches, LED, sens et dimensions indicatives. Les choix sont validés par une liste autorisée dans `catalog.js`, repris dans l’URL sans données personnelles, partageables et conservés entre le studio et le dossier.

Géométries, grain bois et textures minérales sont générés localement. Les rendus `public/models/` proviennent de notre propre moteur ; ils ne représentent pas des chantiers S.B.M. Le modèle est une intention artistique, pas un plan technique ou une preuve de conformité. Les échantillons, dimensions, usages, matériaux et conditions définitifs demandent une étude de l’atelier.

Le rendu se suspend hors écran ou onglet masqué. La rotation automatique est facultative ; les mouvements réduits sont respectés. Souris, clavier et boutons sont proposés ; la manipulation tactile est activée en vue immersive pour préserver le défilement de la page. Une illustration remplace WebGL en cas d’indisponibilité, et le choix des options et le dossier restent utilisables.

## Demande de devis

L’utilisateur a confirmé un **devis sur étude**, sans grille de tarifs. Aucun prix n’est inventé. La demande reprend la configuration et permet de demander plusieurs variantes de matériaux.

L’adresse e-mail professionnelle n’a pas encore été fournie. Le formulaire prépare donc un **dossier local**, sans envoi automatique : coordonnées, contexte, calendrier souhaité, budget éventuel et commentaires. Il peut être téléchargé en TXT, copié ou imprimé/enregistré en PDF depuis le navigateur. Le visiteur appelle ensuite le 04 77 50 15 65 pour convenir de sa transmission. Ne pas afficher un faux statut « envoyé » ou « demande reçue ».

Les coordonnées ne sont placées ni dans les liens de configuration, ni dans un stockage local ou une base de données. Les exports sont désactivés si le formulaire est modifié après génération, jusqu’à sa nouvelle préparation. La confidentialité décrit l’historique des URLs de configuration, les fichiers exportés et l’autoremplissage éventuel du navigateur. Aucun suivi publicitaire ni mesure d’audience.

## Validation et publication

Les tests vérifient le rendu réel (formes/matières/options), les commandes clavier, les liens et états partagés, le dossier complet et son contenu téléchargé, la validation client pro/particulier, les URL invalides, le repli sans WebGL, les mouvements réduits et le mobile. Aucun service externe n’est nécessaire pour les exécuter.

`.github/workflows/pages.yml` installe les dépendances et Chromium, exécute les tests puis publie `dist` à chaque envoi sur `main`. Dans GitHub : **Settings → Pages → Source → GitHub Actions**. Adresse : https://malolunier42-boop.github.io/sbm/.

## Identité et sources

Sources officielles consultées le 16 octobre 2026 : Recherche d’entreprises, BODACC et politique officielle GitHub. SBM, SAS, SIREN 334201639, SIRET siège 33420163900039, RCS Saint-Étienne 334201639, TVA FR28334201639. Siège ZI La Gravoux, boulevard de l’Europe, 42380 Luriecq. Société créée le 26 novembre 1985. Capital de 400 000 € publié en 2012, présenté comme historique. Malo Lunier est responsable de publication communiqué par le responsable du projet. Téléphone et horaires proviennent de la fiche d’établissement transmise.

Détails : `docs/company-research.md` et mentions légales. L’utilisateur indique créer des escaliers pour entreprises et particuliers. Aucun avis, certification, assurance, prix ou délai n’a été inventé. Manrope et DM Sans : OFL 1.1 ; Three.js : MIT, notices conservées.

## Détails de l’expérience

`experience.js` fournit les menus déroulants partagés, leur navigation clavier, le menu mobile, la progression de lecture et les apparitions des titres et cartes au défilement. Les effets se désactivent avec la préférence de mouvement réduit ; les contenus restent lisibles sans JavaScript et à l’impression. `site.css` compose les couches de styles dans un ordre unique pour toutes les pages, avec les détails arrondis de `experience.css`. Les fonctionnalités métier et les choix du configurateur restent indépendants de ces effets.
