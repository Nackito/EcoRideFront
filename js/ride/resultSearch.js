// Script pour afficher les résultats de recherche sur la page resultSearch
console.log("🔄 Script resultSearch.js chargé");
console.log("📄 État du document:", document.readyState);

// Variables globales pour la pagination
let allRidesData = [];
let currentDisplayedCount = 0;
const RIDES_PER_PAGE = 4;

// Note: apiUrl est déjà défini dans script.jsript pour afficher les résultats de recherche sur la page resultSearch
console.log("🔄 Script resultSearch.js chargé");
console.log("🔄 État du document actuel:", document.readyState);

// Note: apiUrl est déjà défini dans script.js

// Fonction d'initialisation
function initializeResultsPage() {
  console.log("🔧 Initialisation de la page de résultats");
  console.log("🔧 URL actuelle:", window.location.href);

  // Debug: vérifier les conteneurs HTML
  const containers = {
    loading: document.getElementById("loading-container"),
    header: document.getElementById("search-header-container"),
    results: document.getElementById("search-results-container"),
    noResults: document.getElementById("no-results-container"),
    actions: document.getElementById("actions-container"),
  };

  console.log("🔧 Conteneurs trouvés:", containers);

  // Debug: vérifier le sessionStorage
  console.log("🔧 Vérification du sessionStorage...");
  console.log(
    "🔧 searchResults brut:",
    sessionStorage.getItem("searchResults")
  );
  console.log(
    "🔧 searchCriteria brut:",
    sessionStorage.getItem("searchCriteria")
  );
  console.log(
    "🔧 searchMessage brut:",
    sessionStorage.getItem("searchMessage")
  );

  // Récupérer les données de recherche depuis sessionStorage
  const searchResults = JSON.parse(
    sessionStorage.getItem("searchResults") || "[]"
  );
  const searchCriteria = JSON.parse(
    sessionStorage.getItem("searchCriteria") || "{}"
  );
  const searchMessage = sessionStorage.getItem("searchMessage") || "";

  console.log("📊 ===== RÉSULTATS DE RECHERCHE =====");
  console.log("📊 Nombre de trajets trouvés:", searchResults.length);
  console.log("📊 Résultats complets:", searchResults);
  console.log("🔍 ===== CRITÈRES DE RECHERCHE =====");
  console.log("🔍 Critères utilisés:", searchCriteria);
  console.log("💬 ===== MESSAGE API =====");
  console.log("💬 Message de l'API:", searchMessage);

  // Afficher chaque trajet individuellement pour plus de clarté
  if (searchResults.length > 0) {
    console.log("🚗 ===== DÉTAILS DE CHAQUE TRAJET =====");
    searchResults.forEach((ride, index) => {
      console.log(`🚗 Trajet ${index + 1}:`, {
        id: ride.id,
        origine: ride.origin,
        destination: ride.destination,
        dateDepart: ride.departureDate,
        heureDepart: ride.departureHour,
        placesDisponibles: ride.availableSeats,
        placesRestantes: ride.remainingSeats,
        prix: ride.price,
        conducteur: ride.driver,
        description: ride.description,
        statut: ride.status,
      });
    });

    // Sauvegarder les données pour la pagination
    allRidesData = searchResults;
    currentDisplayedCount = 0;
    displaySearchResults(searchResults, searchCriteria, searchMessage);
  } else {
    console.log("❌ Aucun résultat à afficher");
    displayNoResults(searchCriteria);
  }
}

// Initialiser la page au chargement du DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 DOM chargé - Initialisation de la page de détails");
  initializeResultsPage();
});

// Si le DOM est déjà chargé, exécuter immédiatement
if (document.readyState === "loading") {
  console.log(
    "⏳ Document en cours de chargement, attente de DOMContentLoaded"
  );
} else {
  console.log("✅ Document déjà chargé, initialisation immédiate");
  initializeResultsPage();
}
function displaySearchResults(rides, criteria, message) {
  console.log(`🎯 ===== AFFICHAGE DE ${rides.length} TRAJET(S) =====`);
  console.log("🎯 Début du processus d'affichage...");

  // Masquer le message de chargement
  const loadingContainer = document.getElementById("loading-container");
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }

  // Conteneurs spécifiques
  const headerContainer = document.getElementById("search-header-container");
  const resultsContainer = document.getElementById("search-results-container");
  const actionsContainer = document.getElementById("actions-container");

  console.log("🎯 Conteneurs trouvés:", {
    header: !!headerContainer,
    results: !!resultsContainer,
    actions: !!actionsContainer,
  });

  // Créer et injecter le header avec les critères de recherche
  const headerHtml = createSearchHeader(criteria, message, rides.length);
  console.log("🎯 Header créé, longueur:", headerHtml.length);

  if (headerContainer) {
    headerContainer.innerHTML = headerHtml;
  }

  // Afficher les premiers résultats avec pagination
  displayRidesPaginated(rides, resultsContainer);

  // Créer et injecter les boutons d'actions
  if (actionsContainer) {
    actionsContainer.innerHTML = `
      <button class="btn btn-outline-secondary me-2" onclick="goBack()">
        <i class="bi bi-arrow-left me-2"></i>Nouvelle recherche
      </button>
      <button class="btn btn-success" onclick="window.location.href='/offerseats'">
        <i class="bi bi-plus-circle me-2"></i>Proposer un trajet
      </button>
    `;
    actionsContainer.style.display = "block";
  }

  console.log("🎯 ✅ Affichage terminé avec succès!");
}

// Fonction pour afficher les résultats avec pagination
function displayRidesPaginated(rides, resultsContainer) {
  console.log(
    `📄 Affichage paginé - Total: ${rides.length}, Déjà affichés: ${currentDisplayedCount}`
  );

  if (!resultsContainer) {
    console.error("❌ Conteneur de résultats introuvable");
    return;
  }

  // Si c'est le premier affichage, créer la structure complète
  if (currentDisplayedCount === 0) {
    resultsContainer.innerHTML = `
      <div class="container">
        <p class="ps-2 mb-4">
          <i class="bi bi-clock"></i> Les trajets sont triés chronologiquement par heure de départ
        </p>
        <div class="search-results-list" id="rides-list">
          <!-- Les cartes seront ajoutées ici -->
        </div>
        <div class="text-center mt-4" id="load-more-container" style="display: none;">
          <button class="btn btn-secondary btn-lg" onclick="loadMoreRides()">
            <i class="bi bi-plus-circle me-2"></i>Charger plus de résultats
          </button>
          <p class="text-muted mt-2 mb-0">
            <span id="displayed-count">0</span> sur <span id="total-count">${rides.length}</span> trajets affichés
          </p>
        </div>
      </div>
    `;
  }

  // Calculer les trajets à afficher
  const startIndex = currentDisplayedCount;
  const endIndex = Math.min(startIndex + RIDES_PER_PAGE, rides.length);
  const ridesToShow = rides.slice(startIndex, endIndex);

  console.log(`📄 Affichage des trajets ${startIndex + 1} à ${endIndex}`);

  // Créer le HTML des nouvelles cartes
  const newRidesHtml = ridesToShow
    .map((ride, index) => {
      console.log(
        `🎯 Création de la carte pour le trajet ${startIndex + index + 1}:`,
        {
          id: ride.id,
          origine: ride.origin,
          destination: ride.destination,
        }
      );
      return createRideCard(ride);
    })
    .join("");

  // Ajouter les nouvelles cartes à la liste existante
  const ridesList = document.getElementById("rides-list");
  if (ridesList) {
    // Créer un conteneur temporaire pour les nouvelles cartes
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = newRidesHtml;

    // Ajouter chaque carte avec une petite animation
    Array.from(tempDiv.children).forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      ridesList.appendChild(card);

      // Animation d'apparition avec délai échelonné
      setTimeout(() => {
        card.style.transition = "all 0.5s ease-out";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100); // 100ms de délai entre chaque carte
    });
  }

  // Mettre à jour le compteur
  currentDisplayedCount = endIndex;

  // Gérer l'affichage du bouton "Charger plus"
  updateLoadMoreButton(rides.length);

  console.log(
    `📄 ✅ ${ridesToShow.length} nouveaux trajets affichés. Total affiché: ${currentDisplayedCount}/${rides.length}`
  );
}

// Fonction pour mettre à jour le bouton "Charger plus"
function updateLoadMoreButton(totalRides) {
  const loadMoreContainer = document.getElementById("load-more-container");
  const displayedCountSpan = document.getElementById("displayed-count");

  if (loadMoreContainer && displayedCountSpan) {
    // Mettre à jour le compteur
    displayedCountSpan.textContent = currentDisplayedCount;

    // Afficher ou masquer le bouton selon s'il reste des trajets
    if (currentDisplayedCount < totalRides) {
      loadMoreContainer.style.display = "block";
    } else {
      loadMoreContainer.style.display = "none";
    }
  }
}

// Fonction appelée par le bouton "Charger plus"
function loadMoreRides() {
  console.log("🔄 Chargement de plus de trajets...");

  if (currentDisplayedCount < allRidesData.length) {
    const resultsContainer = document.getElementById(
      "search-results-container"
    );
    displayRidesPaginated(allRidesData, resultsContainer);
  } else {
    console.log("📄 Tous les trajets sont déjà affichés");
  }
}

function createSearchHeader(criteria, message, totalCount) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const searchInfo = [];
  if (criteria.origin) searchInfo.push(`De: ${criteria.origin}`);
  if (criteria.destination) searchInfo.push(`Vers: ${criteria.destination}`);
  if (criteria.date) searchInfo.push(`Le: ${formatDate(criteria.date)}`);
  if (criteria.seats) searchInfo.push(`${criteria.seats} passager(s)`);

  // Message avec le nombre de résultats
  const resultMessage =
    totalCount > 1
      ? `${totalCount} trajets trouvés`
      : `${totalCount} trajet trouvé`;

  return `
    <div class="bg-primary text-white py-4 mb-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="mb-2">
              <i class="bi bi-search me-2"></i>Résultats de recherche
            </h1>
            <p class="mb-1 fs-5">${searchInfo.join(" • ")}</p>
            <p class="mb-0 opacity-75">
              <i class="bi bi-check-circle me-1"></i>${resultMessage}
              ${message ? ` • ${message}` : ""}
            </p>
          </div>
          <div class="col-auto">
            <button class="btn btn-light" onclick="goBack()">
              <i class="bi bi-arrow-left me-1"></i>Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function createRideCard(ride) {
  console.log("🎨 Création de la carte pour le trajet:", ride.id);

  const formatTime = (timeStr) => {
    if (!timeStr) return "Non spécifiée";
    return timeStr.substring(0, 5); // HH:MM format
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date non spécifiée";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const departureTime = formatTime(ride.departureHour);
  const arrivalTime = formatTime(ride.arrivalHour);
  const origin = ride.origin || "Lieu de départ non spécifié";
  const destination = ride.destination || "Destination non spécifiée";
  const price = ride.price || "0";
  const availableSeats = ride.availableSeats || 0;
  const driverName =
    ride.driver?.firstName || ride.driver?.name || "Conducteur";

  return `
    <div class="card mb-3 rounded-5 elevation-5 mx-auto ride-result-card">
      <div class="card-body">
        <p class="card-text">
          ${departureTime} ${origin}
          <i class="bi bi-arrow-right-short"></i>
          ${arrivalTime} ${destination}
        </p>
        <div class="row align-items-center">
          <div class="col d-flex flex-column">
            <p class="mb-0 small text-secondary">${availableSeats} place(s) disponible(s)</p>
          </div>
          <div class="col-auto">
            <p class="mb-0">${price}€/pers</p>
          </div>
        </div>
        <hr class="my-3" />
        <div class="container pt-2 pb-2 hover-bg" onclick="requestBooking(${
          ride.id
        })">
          <div class="row align-items-center">
            <div class="col d-flex align-items-center">
              <i class="bi bi-person-circle me-3 profile-icon"></i>
              <h3 class="mb-0">${driverName}</h3>
            </div>
            <div class="col-auto">
              <i class="bi bi-car-front"></i>
              <p class="mb-0">Electric</p>
            </div>
          </div>
        </div>
        ${
          ride.description
            ? `
        <div class="mt-2">
          <small class="text-muted">Description:</small>
          <p class="mb-0 small">${ride.description}</p>
        </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

function displayNoResults(criteria) {
  console.log("❌ Aucun résultat trouvé");

  // Masquer le message de chargement
  const loadingContainer = document.getElementById("loading-container");
  if (loadingContainer) {
    loadingContainer.style.display = "none";
  }

  // Conteneurs spécifiques
  const headerContainer = document.getElementById("search-header-container");
  const noResultsContainer = document.getElementById("no-results-container");
  const actionsContainer = document.getElementById("actions-container");

  const searchInfo = [];
  if (criteria.origin) searchInfo.push(`De: ${criteria.origin}`);
  if (criteria.destination) searchInfo.push(`Vers: ${criteria.destination}`);
  if (criteria.date) searchInfo.push(`Le: ${criteria.date}`);
  if (criteria.seats) searchInfo.push(`${criteria.seats} passager(s)`);

  // Header pour "aucun résultat"
  if (headerContainer) {
    headerContainer.innerHTML = `
      <div class="bg-danger text-white py-4 mb-4">
        <div class="container">
          <div class="row align-items-center">
            <div class="col">
              <h1 class="mb-2">
                <i class="bi bi-exclamation-triangle me-2"></i>Aucun trajet trouvé
              </h1>
              <p class="mb-0 fs-5">${searchInfo.join(" • ")}</p>
            </div>
            <div class="col-auto">
              <button class="btn btn-light" onclick="goBack()">
                <i class="bi bi-arrow-left me-1"></i>Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Contenu du message "aucun résultat"
  if (noResultsContainer) {
    noResultsContainer.innerHTML = `
      <div class="container my-5">
        <div class="text-center">
          <i class="bi bi-search text-muted" style="font-size: 4rem;"></i>
          <h3 class="mt-3">Aucun trajet disponible</h3>
          <p class="text-muted mb-4">
            Nous n'avons trouvé aucun trajet correspondant à vos critères de recherche.
          </p>
          
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div class="bg-light p-4 rounded">
                <h5>Suggestions:</h5>
                <ul class="list-unstyled text-start">
                  <li><i class="bi bi-arrow-right text-primary me-2"></i>Essayez avec d'autres dates</li>
                  <li><i class="bi bi-arrow-right text-primary me-2"></i>Élargissez votre zone de recherche</li>
                  <li><i class="bi bi-arrow-right text-primary me-2"></i>Réduisez le nombre de passagers</li>
                  <li><i class="bi bi-arrow-right text-primary me-2"></i>Proposez votre propre trajet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    noResultsContainer.style.display = "block";
  }

  // Boutons d'actions
  if (actionsContainer) {
    actionsContainer.innerHTML = `
      <button class="btn btn-primary me-2" onclick="goBack()">
        <i class="bi bi-arrow-left me-2"></i>Nouvelle recherche
      </button>
      <button class="btn btn-success" onclick="window.location.href='/offerseats'">
        <i class="bi bi-plus-circle me-2"></i>Proposer un trajet
      </button>
    `;
    actionsContainer.style.display = "block";
  }
}

// Fonction pour retourner à la recherche
function goBack() {
  window.location.href = "/";
}

// Fonction pour demander une réservation
function requestBooking(rideId) {
  console.log(`📝 Demande de réservation pour le trajet ${rideId}`);

  // Vérifier si l'utilisateur est connecté
  if (typeof isConnected === "function" && !isConnected()) {
    alert("Vous devez être connecté pour faire une réservation");
    window.location.href = "/signin";
    return;
  }

  // Rediriger vers la page de réservation (à créer)
  alert(`Fonctionnalité de réservation à implémenter pour le trajet ${rideId}`);
  // window.location.href = `/pages/booking.html?ride=${rideId}`;
}
