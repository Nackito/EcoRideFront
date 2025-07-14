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
  new Route("/signin", "Connexion", "/pages/auth/signin.html"),
  new Route("/signup", "Inscription", "/pages/auth/signup.html"),
  new Route("/account", "Mon profil", "/pages/auth/account.html"),
  new Route("/detail-ride", "Détail du trajet", "/pages/detail-ride.html"),
];
//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "EcoRide";
