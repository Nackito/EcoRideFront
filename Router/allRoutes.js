import Route from "./Route.js";
//Définir ici vos routes
export const allRoutes = [
  new Route("/", "Accueil", "/pages/home.html"),
  new Route("/offer-seats", "Publier un trajet", "/pages/offer-seats.html"),
  new Route(
    "/ride-sharing",
    "Resultats de recherche",
    "/pages/ride-sharing.html"
  ),
  new Route(
    "/signin",
    "Connexion",
    "/pages/auth/signin.html",
    "/js/auth/signin.js"
  ),
  new Route(
    "/signup",
    "Inscription",
    "/pages/auth/signup.html",
    "/js/auth/signup.js"
  ),
  new Route("/account", "Mon profil", "/pages/auth/account.html"),
  new Route("/detail-ride", "Détail du trajet", "/pages/detail-ride.html"),
  new Route(
    "/personal-info",
    "Mes informations personnelles",
    "/pages/profil/personal-info.html"
  ),
  new Route(
    "/carpooling-preferences",
    "Préférences de covoiturage",
    "/pages/profil/carpooling-preferences.html"
  ),
  new Route(
    "/vehicle-management",
    "Gestion des véhicules",
    "/pages/profil/vehicle-management.html"
  ),
];
//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "EcoRide";
