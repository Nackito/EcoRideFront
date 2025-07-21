// Script pour afficher les résultats de recherche sur la page resultSearch
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
  const headerHtml = createSearchHeader(criteria, message);
  console.log("🎯 Header créé, longueur:", headerHtml.length);

  if (headerContainer) {
    headerContainer.innerHTML = headerHtml;
  }

  // Créer et injecter le contenu des résultats
  const resultsHtml = rides
    .map((ride, index) => {
      console.log(`🎯 Création de la carte pour le trajet ${index + 1}:`, {
        id: ride.id,
        origine: ride.origin,
        destination: ride.destination,
      });
      return createRideCard(ride);
    })
    .join("");

  console.log("🎯 HTML des résultats créé, longueur:", resultsHtml.length);

  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <div class="container">
        <p class="ps-2 mb-4">
          <i class="bi bi-clock"></i> Les trajets sont triés chronologiquement par heure de départ
        </p>
        <div class="search-results-list">
          ${resultsHtml}
        </div>
      </div>
    `;
  }

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

function createSearchHeader(criteria, message) {
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

  return `
    <div class="bg-primary text-white py-4 mb-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="mb-2">Résultats de recherche</h1>
            <p class="mb-1 fs-5">${searchInfo.join(" • ")}</p>
            <p class="mb-0 opacity-75">${message}</p>
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
