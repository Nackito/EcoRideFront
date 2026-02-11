# EcoRide Frontend

Interface utilisateur moderne pour la plateforme de covoiturage écologique EcoRide. Développée en JavaScript vanilla avec Bootstrap 5 dans une architecture SPA (Single Page Application).

## 🌱 À propos du projet

EcoRide est une plateforme de covoiturage axée sur la mobilité écologique, permettant aux utilisateurs de partager leurs trajets tout en réduisant leur empreinte carbone. Le frontend offre une expérience utilisateur fluide et responsive, optimisée pour tous les appareils.

## 🚀 Démarrage rapide

```bash
# 1. Cloner le projet
git clone [URL_DU_REPO]
cd EcoRideFront

# 2. Installer les dépendances
npm install

# 3. Compiler les styles SCSS
npm run sass

# 4. Lancer le serveur de développement
npm run dev
# ou directement avec live-server
live-server --port=3010
```

L'application sera accessible sur `http://localhost:3010`

## 📋 Prérequis

- **Node.js** 16+ 
- **npm** ou yarn
- **Serveur web local** (live-server recommandé)
- **Backend EcoRideBack** fonctionnel sur `http://localhost:8000`

## 🛠 Configuration de l'environnement de développement

### Architecture du projet

Le projet suit une approche de développement moderne avec une séparation claire des responsabilités :

```
EcoRide2/
├── EcoRideBack/           # API Symfony (Backend)
└── EcoRideFront/          # Application web (Frontend)
```

### Installation complète

#### 1. Installer les dépendances

```bash
npm install
```

Cette commande installe :
- **sass** : Compilateur SCSS
- **live-server** : Serveur de développement avec rechargement automatique
- **concurrently** : Exécution parallèle de scripts

#### 2. Configuration de l'API

Vérifiez que l'URL de l'API correspond à votre backend dans `js/script.js` :

```javascript
const apiUrl = "http://localhost:8000/api";
```

#### 3. Scripts de développement disponibles

```bash
# Compiler SCSS une fois
npm run sass

# Compiler SCSS en mode watch
npm run sass:watch

# Lancer le serveur de développement
npm run dev

# Démarrer live-server uniquement
npm start
```

## 📁 Architecture du projet

### Structure des répertoires

```
EcoRideFront/
├── index.html              # Point d'entrée de l'application
├── package.json            # Configuration npm et scripts
├── README.md               # Documentation du projet
├── js/                     # Scripts JavaScript modulaires
│   ├── script.js           # Fonctions globales et authentification
│   ├── auth/               # Scripts d'authentification
│   │   ├── signin.js       # Gestion de la connexion
│   │   ├── signup.js       # Gestion de l'inscription
│   │   └── account.js      # Gestion du profil utilisateur
│   └── ride/               # Scripts liés aux trajets
│       ├── searchRide.js   # Recherche de trajets
│       └── resultSearch.js # Affichage des résultats
├── pages/                  # Pages HTML de l'application
│   ├── 404.html           # Page d'erreur 404
│   ├── connexion.html     # Page de connexion
│   ├── detail-ride.html   # Détails d'un trajet
│   ├── home.html          # Page d'accueil
│   ├── offer-seats.html   # Formulaire d'offre de trajet
│   ├── ride-sharing.html  # Résultats de recherche
│   ├── auth/              # Pages d'authentification
│   │   ├── account.html   # Profil utilisateur
│   │   ├── signin.html    # Formulaire de connexion
│   │   └── signup.html    # Formulaire d'inscription
│   └── profil/            # Pages de gestion du profil
│       ├── carpooling-history.html
│       ├── carpooling-management.html
│       ├── personal-info.html
│       └── vehicle-management.html
├── Router/                 # Système de routage SPA
│   ├── allRoutes.js        # Configuration des routes
│   ├── Route.js            # Classe Route
│   └── Router.js           # Gestionnaire de navigation
├── scss/                   # Code source des styles
│   ├── main.scss           # Point d'entrée SCSS
│   └── _custom.scss        # Variables et styles personnalisés
└── styles/                 # Styles compilés (généré automatiquement)
    ├── main.css            # CSS principal compilé
    └── main.css.map        # Source map pour le débogage
```

### Principes d'organisation

- **Séparation des responsabilités** : Chaque script a une fonction spécifique
- **Routage modulaire** : Chargement dynamique des scripts selon la page
- **Styles maintenables** : SCSS avec variables et mixins réutilisables
- **Structure évolutive** : Architecture préparée pour de nouvelles fonctionnalités

## 🎨 Gestion des styles

### Technologies utilisées

- **Bootstrap 5.3.7** : Framework CSS responsive et moderne
- **Bootstrap Icons 1.13.1** : Bibliothèque d'icônes cohérente
- **SCSS (Sass)** : Préprocesseur CSS pour une meilleure organisation
- **Variables CSS personnalisées** : Thématisation et cohérence visuelle

### Workflow de compilation SCSS

```bash
# Développement : compilation avec surveillance des changements
npm run sass:watch

# Production : compilation optimisée une seule fois
npm run sass

# Vérification : voir les modifications en temps réel
# Les fichiers .scss sont automatiquement compilés vers styles/main.css
```

### Personnalisation du thème

Le fichier `scss/_custom.scss` contient les variables de personnalisation :

```scss
// Couleurs principales d'EcoRide
$primary: #45e928;    // Vert écologique principal
$secondary: #267917;  // Vert foncé secondaire
$dark: #1a1a1a;       // Gris sombre
$bg-dark: #080a09;    // Arrière-plan sombre

// Polices personnalisées
$font-family-sans-serif: "Hind Madurai", sans-serif;
$font-family-serif: "Kanit", serif;
```

## 🧭 Système de routage SPA

### Fonctionnement

L'application utilise un routage côté client pour offrir une expérience fluide sans rechargement de page. Chaque route peut avoir :

- Une **page HTML** associée
- Un **script JavaScript** spécifique
- Des **rôles requis** pour l'accès
- Un **titre personnalisé**

### Configuration des routes

```javascript
// Exemple de route dans Router/allRoutes.js
new Route("/account", "Mon profil", "/pages/auth/account.html", [
  "driver_passenger", "driver", "passenger"
], "/js/auth/account.js")
```

### Pages et fonctionnalités

#### Pages publiques
- `/` : Accueil avec formulaire de recherche
- `/connexion` : Authentification (connexion/inscription)
- `/ridesharing` : Résultats de recherche de trajets

#### Pages authentifiées
- `/account` : Profil utilisateur et paramètres
- `/offerseats` : Proposer un nouveau trajet
- `/personalinfo` : Informations personnelles
- `/vehiclemanagement` : Gestion des véhicules

## 🔌 Configuration et développement

### Environnement de développement

Le projet est configuré pour un développement local optimal :

1. **Frontend** : `http://localhost:3010` (live-server)
2. **Backend API** : `http://localhost:8000` (serveur PHP Symfony)
3. **Base de données** : MySQL local

### Workflow recommandé

```bash
# Terminal 1 : Compiler les styles en continu
npm run sass:watch

# Terminal 2 : Serveur de développement
live-server --port=3010

# Ou utiliser le script combiné
npm run dev
```

### Intégration avec le backend

L'application communique avec l'API backend via des requêtes AJAX sécurisées :

- **Authentification** : JWT tokens dans les headers
- **CORS** : Configuration pour le développement local
- **Validation** : Côté client et serveur
- **Gestion d'erreurs** : Feedback utilisateur approprié

## 🚀 Déploiement

### Préparation pour la production

```bash
# Compilation optimisée des styles
npm run sass

# Les fichiers à déployer :
# - Tous les fichiers HTML, JS, CSS
# - Assets et images
# - Configuration des routes
```

### Serveur web

L'application peut être servie par n'importe quel serveur web statique :
- Apache avec mod_rewrite pour le SPA
- Nginx avec try_files
- Services cloud (Netlify, Vercel, etc.)

## 📱 Fonctionnalités principales

### Recherche et filtrage
- Recherche géographique de trajets
- Filtres avancés (prix, écologie, note)
- Pagination des résultats
- Sauvegarde de session

### Authentification sécurisée
- JWT tokens avec expiration
- Gestion des rôles utilisateur
- Protection contre les attaques XSS
- Déconnexion automatique

### Interface responsive
- Design mobile-first
- Adaptation automatique aux écrans
- Interactions tactiles optimisées
- Performances sur tous les appareils
