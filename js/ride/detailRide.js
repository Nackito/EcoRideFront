// Script pour afficher les résultats de recherche sur la page detailride
console.log("🔄 Script detailRide.js chargé");

// Note: apiUrl est déjà défini dans script.js

// Initialiser la page au chargement du DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 DOM chargé - Initialisation de la page de détails");

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
});
function displaySearchResults(rides, criteria, message) {
  console.log(`🎯 ===== AFFICHAGE DE ${rides.length} TRAJET(S) =====`);
  console.log("🎯 Début du processus d'affichage...");

  // Conteneur principal pour les résultats
  const mainContainer = document.querySelector("body");
  console.log("🎯 Conteneur principal trouvé:", !!mainContainer);

  // Créer le header avec les critères de recherche
  const headerHtml = createSearchHeader(criteria, message);
  console.log("🎯 Header créé, longueur:", headerHtml.length);

  // Créer le contenu des résultats
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

  // Remplacer le contenu existant
  const finalHtml = `
    ${headerHtml}
    <div class="container my-4">
      <div class="row">
        <div class="col-12">
          ${resultsHtml}
        </div>
      </div>
    </div>
    
    <!-- Bouton retour -->
    <div class="text-center mb-5">
      <button class="btn btn-outline-secondary" onclick="goBack()">
        <i class="bi bi-arrow-left me-2"></i>Nouvelle recherche
      </button>
    </div>
  `;

  console.log("🎯 HTML final créé, longueur:", finalHtml.length);

  mainContainer.innerHTML = finalHtml;

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
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5); // HH:MM format
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const departureDateTime = ride.departureDate
    ? formatDate(ride.departureDate)
    : "Date non spécifiée";
  const departureTime = ride.departureHour
    ? formatTime(ride.departureHour)
    : "Heure non spécifiée";
  const arrivalTime = ride.arrivalHour
    ? formatTime(ride.arrivalHour)
    : "Heure non spécifiée";

  return `
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <!-- En-tête avec date -->
        <div class="bg-secondary text-white p-3 rounded mb-3">
          <h5 class="mb-0 fw-bold">${departureDateTime}</h5>
        </div>
        
        <!-- Détails du trajet -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="mb-3">
              <div class="row">
                <div class="col-3">
                  <div class="text-secondary">
                    <small>Départ</small>
                    <div class="fw-bold">${departureTime}</div>
                  </div>
                </div>
                <div class="col-9">
                  <div class="text-secondary">
                    <small>De</small>
                    <div class="fw-bold">${ride.origin || "Non spécifié"}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="row">
                <div class="col-3">
                  <div class="text-secondary">
                    <small>Arrivée</small>
                    <div class="fw-bold">${arrivalTime}</div>
                  </div>
                </div>
                <div class="col-9">
                  <div class="text-secondary">
                    <small>Vers</small>
                    <div class="fw-bold">${
                      ride.destination || "Non spécifié"
                    }</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Prix et places -->
          <div class="col-md-6">
            <div class="text-end">
              <div class="display-6 fw-bold text-primary">${
                ride.price || "0"
              }€</div>
              <small class="text-secondary">par personne</small>
            </div>
            
            <div class="text-end mt-2">
              <span class="badge bg-success fs-6">
                <i class="bi bi-people-fill me-1"></i>${
                  ride.availableSeats || 0
                } place(s)
              </span>
            </div>
          </div>
        </div>
        
        <!-- Informations conducteur -->
        <div class="bg-light p-3 rounded mb-3">
          <div class="row align-items-center">
            <div class="col">
              <div class="d-flex align-items-center">
                <i class="bi bi-person-circle me-2 fs-3 text-secondary"></i>
                <div>
                  <div class="fw-semibold">${
                    ride.driver?.firstName || "Conducteur"
                  }</div>
                  <small class="text-secondary">
                    <i class="bi bi-star-fill text-warning"></i>
                    ${ride.driver?.rating || "5.0"}/5 - ${
    ride.driver?.reviewsCount || "0"
  } avis
                  </small>
                </div>
              </div>
            </div>
            <div class="col-auto">
              <i class="bi bi-chevron-right text-secondary"></i>
            </div>
          </div>
        </div>
        
        <!-- Description si disponible -->
        ${
          ride.description
            ? `
          <div class="mb-3">
            <small class="text-secondary">Description:</small>
            <p class="mb-0">${ride.description}</p>
          </div>
        `
            : ""
        }
        
        <!-- Bouton de réservation -->
        <div class="text-center">
          <button class="btn btn-primary btn-lg" onclick="requestBooking(${
            ride.id
          })">
            <i class="bi bi-calendar-check me-2"></i>Demander une réservation
          </button>
        </div>
      </div>
    </div>
  `;
}

function displayNoResults(criteria) {
  console.log("❌ Aucun résultat trouvé");

  const mainContainer = document.querySelector("body");

  const searchInfo = [];
  if (criteria.origin) searchInfo.push(`De: ${criteria.origin}`);
  if (criteria.destination) searchInfo.push(`Vers: ${criteria.destination}`);
  if (criteria.date) searchInfo.push(`Le: ${criteria.date}`);
  if (criteria.seats) searchInfo.push(`${criteria.seats} passager(s)`);

  mainContainer.innerHTML = `
    <div class="bg-primary text-white py-4 mb-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="mb-2">Aucun trajet trouvé</h1>
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
        
        <div class="mt-4">
          <button class="btn btn-primary me-2" onclick="goBack()">
            <i class="bi bi-arrow-left me-2"></i>Nouvelle recherche
          </button>
          <a href="/pages/offer-seats.html" class="btn btn-success">
            <i class="bi bi-plus-circle me-2"></i>Proposer un trajet
          </a>
        </div>
      </div>
    </div>
  `;
}

// Fonction pour retourner à la recherche
function goBack() {
  window.location.href = "/pages/home.html";
}

// Fonction pour demander une réservation
function requestBooking(rideId) {
  console.log(`📝 Demande de réservation pour le trajet ${rideId}`);

  // Vérifier si l'utilisateur est connecté
  if (typeof isConnected === "function" && !isConnected()) {
    alert("Vous devez être connecté pour faire une réservation");
    window.location.href = "/pages/auth/signin.html";
    return;
  }

  // Rediriger vers la page de réservation (à créer)
  alert(`Fonctionnalité de réservation à implémenter pour le trajet ${rideId}`);
  // window.location.href = `/pages/booking.html?ride=${rideId}`;
}
