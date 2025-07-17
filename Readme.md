# EcoRide Frontend

Interface utilisateur pour l'application de covoiturage EcoRide, développée en HTML/CSS/JavaScript avec Bootstrap 5.

## 🚀 Installation rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
# ou
live-server --port=3000
```

L'application sera accessible sur `http://localhost:3000`

## 📋 Prérequis

- Node.js 16+
- npm ou yarn
- Serveur web local (live-server, http-server, etc.)

## 🔧 Installation détaillée

### 1. Installer les dépendances

```bash
npm install
```

### 2. Installer un serveur de développement (optionnel)

```bash
# Option 1 : live-server (rechargement automatique)
npm install -g live-server

# Option 2 : http-server
npm install -g http-server

# Option 3 : serve
npm install -g serve
```

### 3. Lancer l'application

```bash
# Avec live-server
live-server --port=3000

# Avec http-server
http-server -p 3000

# Avec serve
serve -s . -l 3000

# Avec Python (si installé)
python -m http.server 3000
```

## 📁 Structure du projet

```
EcoRideFront/
├── index.html              # Page d'accueil
├── package.json            # Dépendances npm
├── js/                     # Scripts JavaScript
│   ├── script.js           # Script principal
│   └── auth/               # Scripts d'authentification
│       ├── signin.js       # Connexion
│       └── signup.js       # Inscription
├── pages/                  # Pages HTML
│   ├── home.html           # Accueil
│   ├── connexion.html      # Page de connexion
│   ├── detail-ride.html    # Détails d'un trajet
│   ├── offer-seats.html    # Proposer un trajet
│   ├── ride-sharing.html   # Recherche de trajets
│   ├── auth/               # Pages d'authentification
│   └── profil/             # Pages de profil utilisateur
├── Router/                 # Système de routage SPA
│   ├── allRoutes.js        # Définition des routes
│   ├── Route.js            # Classe Route
│   └── Router.js           # Gestionnaire de routage
├── scss/                   # Styles SCSS (source)
│   ├── main.scss           # Fichier principal SCSS
│   └── _custom.scss        # Variables et mixins
└── styles/                 # Styles CSS compilés
    ├── main.css            # CSS principal
    └── main.css.map        # Source map
```

## 🎨 Styles et Thème

### Technologies utilisées

- **Bootstrap 5.3.7** - Framework CSS
- **Bootstrap Icons 1.13.1** - Icônes
- **SCSS** - Préprocesseur CSS

### Compilation SCSS

```bash
# Installer Sass globalement
npm install -g sass

# Compiler une fois
sass scss/main.scss styles/main.css

# Compilation avec watch (mode développement)
sass scss/main.scss styles/main.css --watch

# Compilation minifiée (production)
sass scss/main.scss styles/main.css --style compressed
```

## 🔌 Configuration API

### URL de l'API Backend

Modifiez l'URL de base dans vos fichiers JavaScript :

```javascript
// js/script.js ou fichiers de configuration
const API_BASE_URL = "http://localhost:8000/api";
```

## 🧭 Routage SPA

L'application utilise un système de routage côté client pour une expérience Single Page Application (SPA).

## 📱 Pages disponibles

### Pages publiques

- `/` - Page d'accueil
- `/connexion` - Connexion/Inscription
- `/ride-sharing` - Recherche de trajets

### Pages authentifiées

- `/offer-seats` - Proposer un trajet
- `/detail-ride/:id` - Détails d'un trajet
- `/profil/personal-info` - Informations personnelles
- `/profil/vehicle-management` - Gestion des véhicules
- `/profil/carpooling-history` - Historique des trajets

## 🚀 Lancement

Pour lancer l'application frontend :
