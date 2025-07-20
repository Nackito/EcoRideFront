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
// Fonction pour récupérer les informations utilisateur
getInfoUser();
function getInfoUser() {
  console.log("Récupération des informations utilisateur");

  // Vérifier si l'utilisateur est connecté
  if (!isConnected()) {
    console.log(
      "Utilisateur non connecté - pas de récupération d'informations"
    );
    return;
  }

  const token = getToken();
  if (!token) {
    console.error("Token manquant");
    return;
  }

  // Créer des headers avec le bon format
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);

  let requestOptions = {
    method: "GET",
    headers: myHeaders,
    mode: "cors",
    credentials: "omit",
  };

  console.log("URL de la requête:", `${apiUrl}/account/me`);
  console.log("Token utilisé:", token);

  // Appeler l'API avec la bonne URL
  fetch(`${apiUrl}/account/me`, requestOptions)
    .then(async (response) => {
      console.log("Statut de la réponse:", response.status);

      if (response.ok) {
        return response.json();
      } else if (response.status === 401) {
        console.log("Token expiré ou invalide - déconnexion");
        signout();
        throw new Error("Non autorisé");
      } else {
        const errorText = await response.text();
        console.error("Erreur de la réponse:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    })
    .then((result) => {
      console.log("Informations utilisateur récupérées:", result);

      if (!result) {
        console.warn("Aucune donnée utilisateur retournée par l'API");
        return;
      }

      // Traiter les rôles si ils existent
      if (result.roles) {
        const safeRoles = result.roles.map((role) =>
          sanitizeInput(role, "text")
        );
        const simpleRoles = convertSymfonyRolesToSimple(safeRoles);
        setCookie(RoleCookieName, simpleRoles.join(","), 7);
        console.log("Rôles Symfony reçus:", safeRoles);
        console.log("Rôles simples sauvegardés:", simpleRoles);
      } else {
        console.warn("Aucun rôle défini pour cet utilisateur");
      }

      // Mettre à jour l'interface utilisateur
      if (result.pseudo || result.firstName || result.email) {
        updateUserProfileSafely({
          name: result.pseudo || result.firstName || "Utilisateur",
          email: result.email || "",
          balance: result.balance || result.solde || "0",
        });
        console.log("Interface utilisateur mise à jour");
      } else {
        console.warn("Données utilisateur incomplètes:", result);
      }

      // Rafraîchir l'affichage des éléments selon les rôles
      showAndHideElementsForRoles();
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des informations utilisateur:",
        error
      );

      if (error.message.includes("Non autorisé")) {
        return;
      } else if (error.message.includes("Failed to fetch")) {
        console.warn("Serveur API non accessible - mode hors ligne");
        console.warn(
          "Vérifiez que le serveur backend est démarré sur le port 8000"
        );
      } else {
        console.error("Erreur inconnue:", error.message);
      }
    });
}

// Fonction pour convertir les rôles Symfony en rôles simples
function convertSymfonyRolesToSimple(symfonyRoles) {
  const roleMapping = {
    ROLE_ADMIN: "admin",
    ROLE_EMPLOYED: "employed",
    ROLE_DRIVER: "driver",
    ROLE_PASSENGER: "passenger",
    ROLE_USER: "user",
  };

  const simpleRoles = [];

  symfonyRoles.forEach((role) => {
    if (roleMapping[role]) {
      const simpleRole = roleMapping[role];
      if (!simpleRoles.includes(simpleRole)) {
        simpleRoles.push(simpleRole);
      }
    }
  });

  // Logique spéciale pour driver_passenger
  if (simpleRoles.includes("driver") && simpleRoles.includes("passenger")) {
    if (!simpleRoles.includes("driver_passenger")) {
      simpleRoles.push("driver_passenger");
    }
  }

  return simpleRoles;
}

function getRole() {
  return getCookie(RoleCookieName);
}

// Fonction pour vérifier si un utilisateur a un rôle spécifique
function hasRole(requiredRole) {
  const userRoles = getRole();
  if (!userRoles) return false;

  const rolesArray = userRoles.split(",").map((role) => role.trim());
  return rolesArray.includes(requiredRole);
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
  const rolesString = getRole();
  const userRoles = rolesString
    ? rolesString.split(",").map((role) => role.trim())
    : [];

  console.log("🔍 Gestion des rôles - Connecté:", userConnected);
  console.log("🔍 Gestion des rôles - Rôles:", userRoles);

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
          if (userConnected && userRoles.includes("admin")) {
            shouldHide = false;
          }
          break;
        case "employed":
          if (userConnected && userRoles.includes("employed")) {
            shouldHide = false;
          }
          break;
        case "driver":
          if (userConnected && userRoles.includes("driver")) {
            shouldHide = false;
          }
          break;
        case "passenger":
          if (userConnected && userRoles.includes("passenger")) {
            shouldHide = false;
          }
          break;
        case "driver_passenger":
          if (userConnected && userRoles.includes("driver_passenger")) {
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

// ===== PROTECTION XSS =====

/**
 * Échappe les caractères HTML pour éviter les failles XSS
 * @param {string} text - Le texte à échapper
 * @returns {string} - Le texte échappé
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Nettoie et valide les données utilisateur
 * @param {string} input - L'entrée utilisateur
 * @param {string} type - Le type de validation ('email', 'text', 'number')
 * @returns {string} - L'entrée nettoyée
 */
function sanitizeInput(input, type = "text") {
  if (!input || typeof input !== "string") return "";

  // Supprimer les scripts et balises dangereuses
  let sanitized = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  sanitized = sanitized.replace(
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ""
  );
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  // Validation selon le type
  switch (type) {
    case "email":
      // Supprimer tout sauf les caractères autorisés pour un email
      sanitized = sanitized.replace(/[^a-zA-Z0-9@._-]/g, "");
      break;
    case "number":
      // Supprimer tout sauf les chiffres et points
      sanitized = sanitized.replace(/[^0-9.-]/g, "");
      break;
    case "text":
    default:
      // Limiter la longueur et supprimer les caractères de contrôle
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
      sanitized = sanitized.substring(0, 1000); // Limite de 1000 caractères
      break;
  }

  return sanitized.trim();
}

/**
 * Affiche du contenu de manière sécurisée dans un élément
 * @param {string} elementId - L'ID de l'élément
 * @param {string} content - Le contenu à afficher
 * @param {boolean} isHtml - Si true, permet du HTML limité (par défaut: false)
 */
function safeSetContent(elementId, content, isHtml = false) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (isHtml) {
    // Permettre seulement certaines balises HTML sûres
    const allowedTags = ["b", "i", "em", "strong", "br", "p", "span"];
    let cleanHtml = content;

    // Supprimer toutes les balises sauf celles autorisées
    cleanHtml = cleanHtml.replace(
      /<(?!\/?(?:b|i|em|strong|br|p|span)\b)[^>]*>/gi,
      ""
    );

    element.innerHTML = cleanHtml;
  } else {
    // Mode texte seulement (plus sûr)
    element.textContent = content;
  }
}

/**
 * Valide et sécurise les URLs
 * @param {string} url - L'URL à valider
 * @returns {boolean} - True si l'URL est sûre
 */
function isUrlSafe(url) {
  if (!url || typeof url !== "string") return false;

  // Rejeter les URLs avec JavaScript
  if (url.toLowerCase().includes("javascript:")) return false;
  if (url.toLowerCase().includes("data:")) return false;
  if (url.toLowerCase().includes("vbscript:")) return false;

  // Permettre seulement HTTP, HTTPS et URLs relatives
  const urlPattern = /^(https?:\/\/|\/)/i;
  return urlPattern.test(url);
}

// ===== EXEMPLES D'UTILISATION SÉCURISÉE =====

/**
 * Met à jour le profil utilisateur de manière sécurisée
 * @param {object} userProfile - Les données du profil utilisateur
 */
function updateUserProfileSafely(userProfile) {
  if (!userProfile) return;

  // Sécuriser le nom d'utilisateur
  const safeName = sanitizeInput(userProfile.name || "Utilisateur", "text");
  safeSetContent("user-name", safeName);

  // Sécuriser l'email
  const safeEmail = sanitizeInput(userProfile.email || "", "email");
  safeSetContent("user-email", safeEmail);

  // Sécuriser le solde (nombres seulement)
  const safeBalance = sanitizeInput(userProfile.balance || "0", "number");
  safeSetContent("user-balance", safeBalance + " €");

  console.log("Profil utilisateur mis à jour de manière sécurisée");
}

/**
 * Requête API sécurisée avec rate limiting
 * @param {string} endpoint - L'endpoint de l'API
 * @param {object} data - Les données à envoyer
 * @param {string} method - La méthode HTTP
 */
async function secureApiRequest(endpoint, data = null, method = "GET") {
  // Vérifier le rate limiting
  if (!globalRateLimiter.canMakeRequest()) {
    throw new Error("Trop de requêtes. Veuillez patienter.");
  }

  // Valider l'URL de l'endpoint
  const fullUrl = `${apiUrl}${endpoint}`;
  if (!isUrlSafe(fullUrl)) {
    throw new Error("URL non sécurisée");
  }

  // Préparer les headers sécurisés
  const headers = getSecureHeaders();

  // Ajouter le token d'authentification si disponible
  const token = getToken();
  if (token && isValidJWT(token)) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const options = {
    method,
    headers,
    mode: "cors",
    credentials: "omit",
  };

  // Ajouter le body pour POST/PUT
  if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    // Sécuriser les données avant envoi
    const secureData = {};
    Object.keys(data).forEach((key) => {
      if (key === "password") {
        secureData[key] = data[key]; // Ne pas échapper les mots de passe
      } else if (key === "email") {
        secureData[key] = sanitizeInput(data[key], "email");
      } else {
        secureData[key] = sanitizeInput(data[key], "text");
      }
    });

    options.body = JSON.stringify(secureData);
  }

  try {
    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API sécurisée:", error);
    throw error;
  }
}

// Version alternative de getInfoUser utilisant secureApiRequest
async function getInfoUserSecure() {
  if (!isConnected()) {
    console.log("Utilisateur non connecté");
    return;
  }

  try {
    const userInfo = await secureApiRequest("/account/me");
    console.log("Informations utilisateur récupérées:", userInfo);

    // Traitement sécurisé des données
    if (userInfo.role) {
      const safeRole = sanitizeInput(userInfo.role, "text");
      setCookie(RoleCookieName, safeRole, 7);
    }

    updateUserProfileSafely({
      name: userInfo.pseudo || userInfo.name,
      email: userInfo.email,
      balance: userInfo.balance || userInfo.solde,
    });

    showAndHideElementsForRoles();

    return userInfo;
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error);

    if (error.message.includes("401")) {
      console.log("Token invalide - déconnexion");
      signout();
    }
  }
}
