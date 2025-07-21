// Script pour afficher les résultats de recherche sur la page resultSearch
console.log("🔄 Script resultSearch.js chargé");
console.log("📄 État du document:", document.readyState);

// Variables globales pour la pagination et les filtres
let allRidesData = [];
let filteredRidesData = [];
let currentDisplayedCount = 0;
const RIDES_PER_PAGE = 4;

// Variables pour les filtres
let currentFilters = {
  ecological: {
    electric: false,
    hybrid: false,
    carpool: false,
  },
  maxPrice: 100,
  minRating: 0,
};
let filtersCollapsed = true;

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

    // Sauvegarder les données pour la pagination et les filtres
    allRidesData = searchResults;
    filteredRidesData = searchResults; // Initialement, pas de filtres appliqués
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

  // Créer et ajouter les filtres après le header
  const filtersHtml = createFiltersSection();
  if (headerContainer) {
    headerContainer.insertAdjacentHTML("afterend", filtersHtml);
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
  // Utiliser les données filtrées au lieu des données brutes
  const ridesToUse = filteredRidesData;
  console.log(
    `📄 Affichage paginé - Total filtré: ${ridesToUse.length}, Déjà affichés: ${currentDisplayedCount}`
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
            <span id="displayed-count">0</span> sur <span id="total-count">${ridesToUse.length}</span> trajets affichés
          </p>
        </div>
      </div>
    `;
  }

  // Calculer les trajets à afficher
  const startIndex = currentDisplayedCount;
  const endIndex = Math.min(startIndex + RIDES_PER_PAGE, ridesToUse.length);
  const ridesToShow = ridesToUse.slice(startIndex, endIndex);

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
  updateLoadMoreButton(ridesToUse.length);

  console.log(
    `📄 ✅ ${ridesToShow.length} nouveaux trajets affichés. Total affiché: ${currentDisplayedCount}/${ridesToUse.length}`
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

  if (currentDisplayedCount < filteredRidesData.length) {
    const resultsContainer = document.getElementById(
      "search-results-container"
    );
    displayRidesPaginated(filteredRidesData, resultsContainer);
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

  const getVehicleTypeDisplay = (vehicleType) => {
    switch (vehicleType) {
      case "electric":
        return '<i class="bi bi-lightning-charge text-success"></i> <span class="text-success">Électrique</span>';
      case "hybrid":
        return '<i class="bi bi-battery-half text-warning"></i> <span class="text-warning">Hybride</span>';
      default:
        return '<i class="bi bi-car-front"></i> <span>Thermique</span>';
    }
  };

  const getDriverRatingDisplay = (rating) => {
    if (!rating) return '<span class="text-muted small">Pas encore noté</span>';

    const stars = Math.round(rating);
    const starsHtml = Array.from(
      { length: 5 },
      (_, i) =>
        `<i class="bi bi-star${i < stars ? "-fill" : ""} ${
          i < stars ? "text-warning" : "text-muted"
        }"></i>`
    ).join("");

    return `${starsHtml} <span class="ms-1 small">(${rating}/5)</span>`;
  };

  const departureTime = formatTime(ride.departureHour);
  const arrivalTime = formatTime(ride.arrivalHour);
  const origin = ride.origin || "Lieu de départ non spécifié";
  const destination = ride.destination || "Destination non spécifiée";
  const price = ride.price || "0";
  const availableSeats = ride.availableSeats || 0;
  const driverName =
    ride.driver?.firstName || ride.driver?.name || "Conducteur";
  const vehicleType = ride.vehicleType || "thermal";
  const driverRating = ride.driver?.rating || null;

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
            <p class="mb-0 fw-bold">${price}€<small class="text-muted">/pers</small></p>
          </div>
        </div>
        <hr class="my-3" />
        <div class="container pt-2 pb-2 hover-bg" onclick="requestBooking(${
          ride.id
        })">
          <div class="row align-items-center mb-2">
            <div class="col d-flex align-items-center">
              <i class="bi bi-person-circle me-3 profile-icon"></i>
              <div>
                <h3 class="mb-0">${driverName}</h3>
                <div class="rating-display">
                  ${getDriverRatingDisplay(driverRating)}
                </div>
              </div>
            </div>
            <div class="col-auto text-end">
              <div class="vehicle-type">
                ${getVehicleTypeDisplay(vehicleType)}
              </div>
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

// ===== FONCTIONS POUR LES FILTRES =====

function createFiltersSection() {
  const activeFiltersCount = countActiveFilters();

  return `
    <div class="container">
      <div class="filters-container" id="filters-container">
        <div class="filters-header">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <button class="btn btn-link btn-filter-toggle p-0" onclick="toggleFilters()">
                <i class="bi bi-funnel me-2" id="filter-icon"></i>
                <span>Filtres</span>
              </button>
              ${
                activeFiltersCount > 0
                  ? `<span class="filters-count ms-2">${activeFiltersCount}</span>`
                  : ""
              }
            </div>
            <button class="btn btn-link btn-filter-toggle p-0" onclick="toggleFilters()">
              <i class="bi ${
                filtersCollapsed ? "bi-chevron-down" : "bi-chevron-up"
              }" id="chevron-icon"></i>
            </button>
          </div>
        </div>
        
        <div class="filters-body filters-collapse" id="filters-body" style="display: ${
          filtersCollapsed ? "none" : "block"
        }">
          <!-- Aspect écologique -->
          <div class="filter-group">
            <label class="filter-label">
              <i class="bi bi-leaf me-1"></i>Aspect écologique
            </label>
            <div class="ecological-options">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="filter-electric" onchange="updateEcoFilter('electric', this.checked)">
                <label class="form-check-label" for="filter-electric">
                  <i class="bi bi-lightning-charge eco-icon"></i>Véhicule électrique
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="filter-hybrid" onchange="updateEcoFilter('hybrid', this.checked)">
                <label class="form-check-label" for="filter-hybrid">
                  <i class="bi bi-battery-half eco-icon"></i>Véhicule hybride
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="filter-carpool" onchange="updateEcoFilter('carpool', this.checked)">
                <label class="form-check-label" for="filter-carpool">
                  <i class="bi bi-people eco-icon"></i>Covoiturage (>2 passagers)
                </label>
              </div>
            </div>
          </div>

          <!-- Prix maximum -->
          <div class="filter-group">
            <label class="filter-label" for="price-range">
              <i class="bi bi-currency-euro me-1"></i>Prix maximum par personne
            </label>
            <div class="price-range">
              <input type="range" class="form-range" id="price-range" min="0" max="100" value="${
                currentFilters.maxPrice
              }" 
                     oninput="updatePriceFilter(this.value)">
              <div class="price-display mt-2">
                <span id="price-value">${currentFilters.maxPrice}</span>€
              </div>
            </div>
          </div>

          <!-- Note minimum -->
          <div class="filter-group">
            <label class="filter-label">
              <i class="bi bi-star me-1"></i>Note minimum du conducteur
            </label>
            <div class="rating-stars">
              <div class="star-rating">
                ${[1, 2, 3, 4, 5]
                  .map(
                    (star) => `
                  <i class="bi bi-star${
                    star <= currentFilters.minRating ? "-fill" : ""
                  } star ${star <= currentFilters.minRating ? "active" : ""}" 
                     onclick="updateRatingFilter(${star})"></i>
                `
                  )
                  .join("")}
              </div>
              <span class="rating-text ms-2">
                ${
                  currentFilters.minRating > 0
                    ? `${currentFilters.minRating} étoile(s) et plus`
                    : "Toutes les notes"
                }
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="filters-actions">
            <button type="button" class="btn-clear" onclick="clearAllFilters()">
              <i class="bi bi-x-circle me-1"></i>Effacer les filtres
            </button>
            <button type="button" class="btn btn-primary btn-apply" onclick="applyFilters()">
              <i class="bi bi-check-circle me-1"></i>Appliquer les filtres
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleFilters() {
  filtersCollapsed = !filtersCollapsed;
  const filtersBody = document.getElementById("filters-body");
  const chevronIcon = document.getElementById("chevron-icon");

  if (filtersCollapsed) {
    filtersBody.style.display = "none";
    chevronIcon.className = "bi bi-chevron-down";
  } else {
    filtersBody.style.display = "block";
    chevronIcon.className = "bi bi-chevron-up";
  }
}

function updateEcoFilter(type, checked) {
  currentFilters.ecological[type] = checked;
  console.log(`🌱 Filtre écologique ${type}: ${checked}`);
}

function updatePriceFilter(value) {
  currentFilters.maxPrice = parseInt(value);
  document.getElementById("price-value").textContent = value;
  console.log(`💰 Prix maximum: ${value}€`);
}

function updateRatingFilter(rating) {
  // Si on clique sur la même étoile, on désélectionne
  if (currentFilters.minRating === rating) {
    currentFilters.minRating = 0;
  } else {
    currentFilters.minRating = rating;
  }

  // Mettre à jour l'affichage des étoiles
  const stars = document.querySelectorAll(".star");
  const ratingText = document.querySelector(".rating-text");

  stars.forEach((star, index) => {
    const starNumber = index + 1;
    if (starNumber <= currentFilters.minRating) {
      star.className = "bi bi-star-fill star active";
    } else {
      star.className = "bi bi-star star";
    }
  });

  ratingText.textContent =
    currentFilters.minRating > 0
      ? `${currentFilters.minRating} étoile(s) et plus`
      : "Toutes les notes";

  console.log(`⭐ Note minimum: ${currentFilters.minRating}`);
}

function clearAllFilters() {
  // Réinitialiser les filtres
  currentFilters = {
    ecological: { electric: false, hybrid: false, carpool: false },
    maxPrice: 100,
    minRating: 0,
  };

  // Mettre à jour l'interface
  document.getElementById("filter-electric").checked = false;
  document.getElementById("filter-hybrid").checked = false;
  document.getElementById("filter-carpool").checked = false;
  document.getElementById("price-range").value = 100;
  document.getElementById("price-value").textContent = "100";

  // Réinitialiser les étoiles
  updateRatingFilter(0);

  console.log("🧹 Filtres réinitialisés");
}

function countActiveFilters() {
  let count = 0;

  // Compter les filtres écologiques
  Object.values(currentFilters.ecological).forEach((value) => {
    if (value) count++;
  });

  // Compter le filtre prix s'il n'est pas à la valeur max
  if (currentFilters.maxPrice < 100) count++;

  // Compter le filtre note s'il est activé
  if (currentFilters.minRating > 0) count++;

  return count;
}

function applyFilters() {
  console.log("🔍 Application des filtres:", currentFilters);

  // Filtrer les données
  filteredRidesData = allRidesData.filter((ride) => {
    // Filtre prix
    const ridePrice = parseFloat(ride.price || 0);
    if (ridePrice > currentFilters.maxPrice) {
      return false;
    }

    // Filtre écologique
    const hasEcoFilter = Object.values(currentFilters.ecological).some(
      (value) => value
    );
    if (hasEcoFilter) {
      let passesEcoFilter = false;

      if (currentFilters.ecological.electric) {
        // Supposons qu'on ait une propriété vehicleType ou qu'on puisse le déduire
        passesEcoFilter = passesEcoFilter || ride.vehicleType === "electric";
      }

      if (currentFilters.ecological.hybrid) {
        passesEcoFilter = passesEcoFilter || ride.vehicleType === "hybrid";
      }

      if (currentFilters.ecological.carpool) {
        // Si c'est du covoiturage avec plus de 2 passagers
        const totalSeats = parseInt(ride.availableSeats || 0);
        passesEcoFilter = passesEcoFilter || totalSeats >= 3;
      }

      if (!passesEcoFilter) return false;
    }

    // Filtre note
    if (currentFilters.minRating > 0) {
      const driverRating = parseFloat(ride.driver?.rating || 0);
      if (driverRating < currentFilters.minRating) {
        return false;
      }
    }

    return true;
  });

  console.log(
    `🎯 ${filteredRidesData.length} trajets après filtrage (sur ${allRidesData.length} initiaux)`
  );

  // Réinitialiser l'affichage
  currentDisplayedCount = 0;
  const resultsContainer = document.getElementById("search-results-container");

  if (filteredRidesData.length > 0) {
    // Mise à jour du header avec le nouveau nombre
    updateSearchHeaderCount(filteredRidesData.length);
    displayRidesPaginated(filteredRidesData, resultsContainer);
  } else {
    // Afficher message "aucun résultat avec ces filtres"
    resultsContainer.innerHTML = `
      <div class="container text-center my-5">
        <i class="bi bi-funnel text-muted" style="font-size: 4rem;"></i>
        <h3 class="mt-3">Aucun trajet ne correspond à vos filtres</h3>
        <p class="text-muted mb-4">
          Essayez de modifier vos critères de filtrage pour obtenir plus de résultats.
        </p>
        <button class="btn btn-outline-primary" onclick="clearAllFilters(); applyFilters();">
          <i class="bi bi-arrow-clockwise me-2"></i>Réinitialiser les filtres
        </button>
      </div>
    `;
  }

  // Mettre à jour l'indicateur de filtres actifs
  updateFiltersIndicator();
}

function updateSearchHeaderCount(newCount) {
  const headerContainer = document.getElementById("search-header-container");
  if (headerContainer) {
    const resultMessage =
      newCount > 1
        ? `${newCount} trajets trouvés`
        : `${newCount} trajet trouvé`;
    const resultParagraph = headerContainer.querySelector(".opacity-75");
    if (resultParagraph) {
      const currentText = resultParagraph.innerHTML;
      const updatedText = currentText.replace(
        /\d+\s+trajet[s]?\s+trouvé[s]?/,
        resultMessage
      );
      resultParagraph.innerHTML = updatedText;
    }
  }
}

function updateFiltersIndicator() {
  const activeCount = countActiveFilters();
  const filtersContainer = document.getElementById("filters-container");

  if (filtersContainer) {
    const existingBadge = filtersContainer.querySelector(".filters-count");
    const toggleButton = filtersContainer.querySelector(".btn-filter-toggle");

    if (activeCount > 0) {
      if (!existingBadge) {
        toggleButton.insertAdjacentHTML(
          "afterend",
          `<span class="filters-count ms-2">${activeCount}</span>`
        );
      } else {
        existingBadge.textContent = activeCount;
      }
    } else if (existingBadge) {
      existingBadge.remove();
    }
  }
}
