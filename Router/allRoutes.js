import Route from "./Route.js";
//Définir ici vos routes
export const allRoutes = [
  new Route("/", "Accueil", "/pages/home.html", [], "/js/ride/searchRide.js"),
  new Route(
    "/offerseats",
    "Publier un trajet",
    "/pages/offerseats.html",
    [],
    "/js/ride/ride.js",
  ),
  new Route(
    "/ridesharing",
    "Resultats de recherche",
    "/pages/ridesharing.html",
    [],
    "/js/ride/resultSearch.js",
  ),
  new Route(
    "/signin",
    "Connexion",
    "/pages/auth/signin.html",
    ["disconnected"],
    "/js/auth/signin.js",
  ),
  new Route(
    "/signup",
    "Inscription",
    "/pages/auth/signup.html",
    ["disconnected"],
    "/js/auth/signup.js",
  ),
  new Route(
    "/account",
    "Mon profil",
    "/pages/auth/account.html",
    ["driver_passenger", "driver", "passenger", "employed", "admin", "user"],
    "/js/auth/account.js",
  ),
  new Route(
    "/detailride",
    "Détail du trajet",
    "/pages/detailride.html",
    [],
    "/js/ride/detailRide.js",
  ),
  new Route(
    "/personalinfo",
    "Mes informations personnelles",
    "/pages/profil/personalinfo.html",
    [
      "passenger",
      "driver",
      "employed",
      "driver_passenger",
      "user" /*, "admin"*/,
    ],
    "/js/profil/personalinfo.js",
  ),
  new Route(
    "/carpoolingpreferences",
    "Préférences de covoiturage",
    "/pages/profil/carpoolingpreferences.html",
    ["driver_passenger", "driver" /*, "admin"*/], // Autorisé aux conducteurs, passagers et employés
    "/js/profil/carpoolingpreferences.js",
  ),
  new Route(
    "/vehiclemanagement",
    "Gestion des véhicules",
    "/pages/profil/vehiclemanagement.html",
    ["driver_passenger", "driver" /*, "admin"*/], // Autorisé aux conducteurs, passagers et employés
    "/js/profil/vehiclemanagement.js",
  ),
  new Route(
    "/carpoolinghistory",
    "Historique de covoiturage",
    "/pages/profil/carpoolinghistory.html",
    ["driver_passenger", "driver", "passenger" /*, "admin"*/], // Autorisé aux conducteurs, passagers et employés
  ),
  new Route(
    "/carpoolingmanagement",
    "Gestion de covoiturage",
    "/pages/profil/carpoolingmanagement.html",
    ["driver_passenger", "driver" /*, "admin"*/], // Autorisé aux conducteurs, passagers et employés
    "/js/profil/carpoolingmanagement.js",
  ),
];
//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "EcoRide";
