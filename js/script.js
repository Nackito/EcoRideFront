const tokenCookieName = "accesstoken";
const RoleCookieName = "role"; // Cookie for user role, if needed
const apiUrl = "http://localhost:8000/api"; // Base URL for API requests

// Utiliser la délégation d'événements pour gérer les boutons de déconnexion
// Cela fonctionne même pour les éléments ajoutés dynamiquement
document.addEventListener("click", function (event) {
  // Vérifier si l'élément cliqué a la classe btn-logout
  if (
    event.target.classList.contains("btn-logout") ||
    event.target.id === "btn-logout-account" ||
    event.target.id === "btn-logout-nav"
  ) {
    event.preventDefault();
    signout();
  }
});

// Également garder l'ancienne méthode pour les boutons présents dès le chargement
document.addEventListener("DOMContentLoaded", function () {
  // Trouver tous les boutons de déconnexion (navbar et pages)
  const logoutButtons = document.querySelectorAll(".btn-logout");

  logoutButtons.forEach((button) => {
    if (button) {
      button.addEventListener("click", signout);
    }
  });
});

function getRole() {
  return getCookie(RoleCookieName);
}

function signout() {
  eraseCookie(tokenCookieName);
  eraseCookie(RoleCookieName); // Erase the role cookie if it exists
  window.location.reload(); // Reload the page to reflect the logout
}

function setToken(token) {
  setCookie(tokenCookieName, token, 7);
}

function getToken() {
  return getCookie(tokenCookieName);
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function isConnected() {
  if (getToken() == null && getToken() == undefined) {
    return false;
  } else {
    return true;
  }
}

// exemple à supprimer
/*if (isConnected()) {
  alert("Je suis connecté");
} else {
  alert("Je ne suis pas connecté");
}*/

/*
disconnected
connected (admin, employed, driver, passenger ou driverPassenger)
          - admin
          - employed
          - driver
          - passenger
          - driverPassenger

*/

function showAndHideElementsForRoles() {
  const userConnected = isConnected();
  const role = getRole();

  let allElementsToEdit = document.querySelectorAll("[data-show]");

  allElementsToEdit.forEach((element) => {
    // Récupérer la valeur de data-show et séparer les rôles par des espaces
    const allowedRoles = element.dataset.show
      .split(" ")
      .filter((role) => role.trim());

    let shouldHide = true;

    // Vérifier chaque rôle autorisé
    allowedRoles.forEach((allowedRole) => {
      switch (allowedRole) {
        case "disconnected":
          if (!userConnected) {
            shouldHide = false;
          }
          break;
        case "connected":
          if (userConnected) {
            shouldHide = false;
          }
          break;
        case "admin":
          if (userConnected && role === "admin") {
            shouldHide = false;
          }
          break;
        case "employed":
          if (userConnected && role === "employed") {
            shouldHide = false;
          }
          break;
        case "driver":
          if (userConnected && role === "driver") {
            shouldHide = false;
          }
          break;
        case "passenger":
          if (userConnected && role === "passenger") {
            shouldHide = false;
          }
          break;
        case "driver_passenger":
          if (userConnected && role === "driver_passenger") {
            shouldHide = false;
          }
          break;
      }
    });

    // Appliquer la visibilité
    if (shouldHide) {
      element.classList.add("d-none");
    } else {
      element.classList.remove("d-none");
    }
  });

  // Réattacher les event listeners aux nouveaux boutons de déconnexion
  attachLogoutListeners();
}

// Fonction pour attacher les event listeners aux boutons de déconnexion
function attachLogoutListeners() {
  const logoutButtons = document.querySelectorAll(".btn-logout");

  logoutButtons.forEach((button) => {
    if (button && !button.hasAttribute("data-logout-attached")) {
      button.addEventListener("click", signout);
      button.setAttribute("data-logout-attached", "true"); // Marquer comme attaché
    }
  });
}
