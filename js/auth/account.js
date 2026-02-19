// Script pour la page account.html
console.log("🔄 Script account.js chargé");

// Fonction d'initialisation de la page account
function initializeAccountPage() {
  console.log("🔧 Initialisation de la page Mon profil");

  // Vérifier si l'utilisateur est connecté
  if (!isConnected()) {
    console.warn(
      "❌ Utilisateur non connecté - redirection vers la page de connexion",
    );
    window.location.href = "/signin";
    return;
  }

  // Charger les informations utilisateur
  loadUserAccountInfo();
  loadPendingRequestsBadge();

  // Préparer le sélecteur de statut (chauffeur/passager)
  setupRoleSelector();
}

async function loadPendingRequestsBadge() {
  const badge = document.getElementById("pending-requests-badge");
  if (!badge) return;

  try {
    const token = getToken();
    if (!token) return;

    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const resp = await fetch(`${apiUrl}/rides/driver/requests`, {
      method: "GET",
      headers,
    });

    if (!resp.ok) {
      badge.classList.add("d-none");
      return;
    }

    const data = await resp.json();
    const requests = Array.isArray(data?.requests) ? data.requests : [];
    const pendingCount = requests.filter((r) => r.status === "pending").length;

    if (pendingCount > 0) {
      badge.textContent = String(pendingCount);
      badge.classList.remove("d-none");
    } else {
      badge.classList.add("d-none");
    }
  } catch (error) {
    console.warn("Impossible de charger le badge des demandes:", error);
    badge.classList.add("d-none");
  }
}

// Fonction pour charger les informations de l'utilisateur
async function loadUserAccountInfo() {
  console.log("📋 Chargement des informations du compte utilisateur...");

  try {
    const token = getToken();
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    // Utiliser la même méthode que getInfoUser() du script.js qui fonctionne
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      mode: "cors",
      credentials: "omit",
    };

    console.log("🔄 Envoi de la requête vers /api/account/me...");
    const response = await fetch(`${apiUrl}/account/me`, requestOptions);

    console.log("📡 Statut de la réponse:", response.status);

    if (response.ok) {
      const userInfo = await response.json();
      console.log("✅ Informations utilisateur récupérées:", userInfo);

      // Mettre à jour l'interface avec les données utilisateur
      updateAccountInterface(userInfo);
    } else if (response.status === 401) {
      console.log("🔄 Token expiré ou invalide - déconnexion");
      signout();
      throw new Error("Non autorisé");
    } else {
      const errorText = await response.text();
      console.error("❌ Erreur de la réponse:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du chargement des informations:", error);

    // En cas d'erreur, afficher un message par défaut
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
      userNameElement.textContent = "Erreur de chargement";
    }

    // Si erreur d'authentification, rediriger vers la connexion
    if (
      error.message.includes("401") ||
      error.message.includes("Non autorisé") ||
      error.message.includes("authentification")
    ) {
      console.warn("🔄 Token invalide - redirection vers la connexion");
      signout(); // Nettoyer les cookies et rediriger
    }
  }
}

// Configuration du sélecteur de rôle chauffeur/passager
function setupRoleSelector() {
  const select = document.querySelector(".form-select");
  if (!select) return;

  // Déterminer la valeur initiale selon les rôles actuels
  const rolesString = getRole();
  const roles = rolesString ? rolesString.split(",").map((r) => r.trim()) : [];

  let initialValue = "1"; // Passager par défaut
  if (roles.includes("driver_passenger")) {
    initialValue = "3";
  } else if (roles.includes("driver")) {
    initialValue = "2";
  } else if (roles.includes("passenger")) {
    initialValue = "1";
  }
  select.value = initialValue;

  // Sauvegarde du choix côté backend
  select.addEventListener("change", async (e) => {
    const value = e.target.value;
    const driver = value === "2" || value === "3";
    const passenger = value === "1" || value === "3";

    const token = getToken();
    if (!token) {
      console.warn("Token manquant - redirection vers la connexion");
      window.location.href = "/signin";
      return;
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    try {
      const resp = await fetch(`${apiUrl}/account/role`, {
        method: "POST",
        headers,
        body: JSON.stringify({ driver, passenger }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error("❌ Erreur enregistrement du statut:", txt);
        alert("Erreur lors de l'enregistrement du statut");
        return;
      }

      // Rafraîchir les rôles/cookies via la même logique que script.js
      if (typeof getInfoUser === "function") {
        getInfoUser();
      }
      // Mettre à jour la visibilité des éléments
      showAndHideElementsForRoles();
      console.log(
        "✅ Statut mis à jour (driver:",
        driver,
        "passenger:",
        passenger,
        ")",
      );
    } catch (err) {
      console.error("❌ Erreur réseau lors du changement de statut:", err);
      alert("Erreur réseau");
    }
  });
}

// Fonction pour mettre à jour l'interface avec les données utilisateur
function updateAccountInterface(userInfo) {
  console.log("🎨 Mise à jour de l'interface avec les données utilisateur");

  // Mettre à jour le nom d'utilisateur dans le header
  const userNameElement = document.getElementById("user-name");
  if (userNameElement && userInfo) {
    // Priorité : pseudo > firstName > name > email (partie avant @)
    let displayName = "Utilisateur";

    if (userInfo.pseudo) {
      displayName = userInfo.pseudo;
    } else if (userInfo.firstName) {
      displayName = userInfo.firstName;
    } else if (userInfo.name) {
      displayName = userInfo.name;
    } else if (userInfo.email) {
      displayName = userInfo.email.split("@")[0]; // Prendre la partie avant @
    }

    // Sécuriser l'affichage
    const safeName = sanitizeInput(displayName, "text");
    userNameElement.textContent = safeName;

    console.log(`✅ Nom d'utilisateur mis à jour: ${safeName}`);
  }

  // Mettre à jour le solde si disponible
  const balanceElement = document.getElementById("user-balance");
  if (
    balanceElement &&
    userInfo &&
    (userInfo.balance !== undefined || userInfo.solde !== undefined)
  ) {
    const balance = userInfo.balance || userInfo.solde || 0;
    const safeBalance = sanitizeInput(balance, "number");
    balanceElement.textContent = `${safeBalance} €`;
    console.log(`✅ Solde mis à jour: ${safeBalance} €`);
  } else if (balanceElement) {
    // Si pas de solde disponible, afficher 0 €
    balanceElement.textContent = "0 €";
  }

  // Log des données reçues pour debug
  console.log("📊 Données utilisateur disponibles:", {
    firstName: userInfo?.firstName,
    pseudo: userInfo?.pseudo,
    name: userInfo?.name,
    email: userInfo?.email,
    balance: userInfo?.balance || userInfo?.solde,
  });
}

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 DOM chargé - Initialisation de la page Mon profil");
  initializeAccountPage();
});

// Si le DOM est déjà chargé, exécuter immédiatement
if (document.readyState === "loading") {
  console.log(
    "⏳ Document en cours de chargement, attente de DOMContentLoaded",
  );
} else {
  console.log("✅ Document déjà chargé, initialisation immédiate");
  initializeAccountPage();
}

// Export des fonctions pour utilisation externe si nécessaire
if (typeof window !== "undefined") {
  window.loadUserAccountInfo = loadUserAccountInfo;
  window.updateAccountInterface = updateAccountInterface;
}
