import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";
// Création d'une route pour la page 404 (page introuvable)
const route404 = new Route("404", "Page introuvable", "/pages/404.html", []);
// Fonction pour récupérer la route correspondant à une URL donnée
const getRouteByUrl = (url) => {
  let currentRoute = null;
  // Parcours de toutes les routes pour trouver la correspondance
  allRoutes.forEach((element) => {
    if (element.url == url) {
      currentRoute = element;
    }
  });
  // Si aucune correspondance n'est trouvée, on retourne la route 404
  if (currentRoute != null) {
    return currentRoute;
  } else {
    return route404;
  }
};
// Fonction pour charger le contenu de la page
const LoadContentPage = async () => {
  const path = window.location.pathname;
  // Récupération de l'URL actuelle
  const actualRoute = getRouteByUrl(path);

  // Vérification des autorisations d'accès à la page
  const allRoleArray = actualRoute.authorize;

  if (allRoleArray.length > 0) {
    if (allRoleArray.includes("disconnected")) {
      if (isConnected()) {
        window.location.replace("/");
      }
    } else {
      const roleUser = getRole();
      console.log("🔒 Vérification des autorisations:");
      console.log("   Rôles requis:", allRoleArray);
      console.log("   Rôles utilisateur:", roleUser);

      // Vérifier si l'utilisateur a au moins un des rôles autorisés
      if (roleUser) {
        const userRolesArray = roleUser.split(",").map((role) => role.trim());
        const hasAuthorizedRole = allRoleArray.some((requiredRole) =>
          userRolesArray.includes(requiredRole),
        );

        console.log("   Rôles utilisateur (tableau):", userRolesArray);
        console.log("   Accès autorisé:", hasAuthorizedRole);

        if (!hasAuthorizedRole) {
          console.log("❌ Accès refusé - redirection vers l'accueil");
          window.location.replace("/");
        } else {
          console.log("✅ Accès autorisé");
        }
      } else {
        console.log("❌ Aucun rôle trouvé - redirection vers l'accueil");
        window.location.replace("/");
      }
    }
  }

  // Récupération du contenu HTML de la route
  const html = await fetch(actualRoute.pathHtml).then((data) => data.text());
  // Ajout du contenu HTML à l'élément avec l'ID "main-page"
  document.getElementById("main-page").innerHTML = html;
  // Ajout du contenu JavaScript
  if (actualRoute.pathJS != "") {
    // Création d'une balise script
    var scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", actualRoute.pathJS);
    // Ajout de la balise script au corps du document
    document.querySelector("body").appendChild(scriptTag);
  }
  // Changement du titre de la page
  document.title = actualRoute.title + " - " + websiteName;

  // Afficher et masquer les éléments en fonction du rôle de l'utilisateur
  showAndHideElementsForRoles();
};
// Fonction pour gérer les événements de routage (clic sur les liens)
const routeEvent = (event) => {
  event = event || window.event;
  event.preventDefault();
  // Mise à jour de l'URL dans l'historique du navigateur
  window.history.pushState({}, "", event.target.href);
  // Chargement du contenu de la nouvelle page
  LoadContentPage();
};
// Gestion de l'événement de retour en arrière dans l'historique du navigateur
window.onpopstate = LoadContentPage;
// Assignation de la fonction routeEvent à la propriété route de la fenêtre
window.route = routeEvent;

// Interception globale des clics sur les liens internes pour la navigation SPA
document.addEventListener("click", (e) => {
  const anchor = e.target.closest("a[href]");
  if (!anchor) return;

  const href = anchor.getAttribute("href");
  // Ignorer liens externes, ancres, fichiers ou modificateurs clavier
  const isExternal = anchor.host && anchor.host !== window.location.host;
  const hasModifier = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
  if (
    hasModifier ||
    isExternal ||
    href.startsWith("#") ||
    href.startsWith("http")
  )
    return;

  // Ne gérer que les routes internes de l'app
  if (href.startsWith("/")) {
    e.preventDefault();
    window.history.pushState({}, "", href);
    LoadContentPage();
  }
});
// Chargement du contenu de la page au chargement initial
LoadContentPage();
