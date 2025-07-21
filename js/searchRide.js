// Script pour la recherche de trajets sur la page d'accueil
console.log("🔍 Script searchRide.js chargé");
console.log("📄 État du document:", document.readyState);

// Note: apiUrl est déjà défini dans script.js

// Récupérer les éléments du DOM
let departureInput = document.getElementById("departure");
let destinationInput = document.getElementById("destination");
let dateInput = document.getElementById("date");
let passengersInput = document.getElementById("passengers");
let searchForm = document.querySelector(".search-form");
let searchBtn = document.querySelector(".search-btn");

// Initialiser le système au chargement du DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 DOM chargé - Initialisation de la recherche");
  initializeSearchForm();
});

// Si le DOM est déjà chargé, exécuter immédiatement
if (document.readyState === "loading") {
  console.log(
    "⏳ Document en cours de chargement, attente de DOMContentLoaded"
  );
} else {
  console.log("✅ Document déjà chargé, initialisation immédiate");
  initializeSearchForm();
}

function initializeSearchForm() {
  console.log("🚀 Initialisation du formulaire de recherche");

  // Attendre un peu pour que tous les éléments soient chargés
  setTimeout(function () {
    console.log("⏰ Recherche des éléments après délai...");

    // Re-chercher les éléments au cas où ils n'étaient pas encore disponibles
    if (!departureInput) departureInput = document.getElementById("departure");
    if (!destinationInput)
      destinationInput = document.getElementById("destination");
    if (!dateInput) dateInput = document.getElementById("date");
    if (!passengersInput)
      passengersInput = document.getElementById("passengers");
    if (!searchForm) searchForm = document.querySelector(".search-form");
    if (!searchBtn) searchBtn = document.querySelector(".search-btn");

    // Vérifier que tous les éléments sont trouvés
    const elements = {
      departureInput: !!departureInput,
      destinationInput: !!destinationInput,
      dateInput: !!dateInput,
      passengersInput: !!passengersInput,
      searchForm: !!searchForm,
      searchBtn: !!searchBtn,
    };

    console.log("🔍 Éléments trouvés après délai:", elements);

    // Vérifier si tous les éléments essentiels sont présents
    if (departureInput && destinationInput && searchForm && searchBtn) {
      console.log("✅ Éléments principaux trouvés - Ajout des event listeners");

      // Ajouter les event listeners
      departureInput.addEventListener("input", validateSearchForm);
      destinationInput.addEventListener("input", validateSearchForm);
      if (dateInput) dateInput.addEventListener("change", validateSearchForm);
      if (passengersInput)
        passengersInput.addEventListener("input", validateSearchForm);

      // Ajouter listener sur le formulaire
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("🔄 Formulaire soumis - Début de la recherche");
        performSearch();
      });

      // Ajouter aussi un listener direct sur le bouton en cas de problème
      searchBtn.addEventListener("click", function (event) {
        event.preventDefault();
        console.log("🖱️ Bouton cliqué directement - Début de la recherche");
        performSearch();
      });

      // Validation initiale
      validateSearchForm();

      // Définir la date minimum à aujourd'hui
      if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.setAttribute("min", today);
        console.log("📅 Date minimum définie:", today);
      }
    } else {
      console.error(
        "❌ Erreur: Éléments de formulaire manquants même après délai"
      );
      console.error("❌ Détails:", {
        departureInput: !!departureInput,
        destinationInput: !!destinationInput,
        searchForm: !!searchForm,
        searchBtn: !!searchBtn,
      });
    }
  }, 500); // Attendre 500ms
}

// Fonction de validation du formulaire (au moins un champ requis)
function validateSearchForm() {
  console.log("🔍 Validation du formulaire de recherche");

  const departureOk = departureInput && departureInput.value.trim() !== "";
  const destinationOk =
    destinationInput && destinationInput.value.trim() !== "";

  console.log("📋 État des champs:", { departureOk, destinationOk });

  // Au moins un des deux champs principaux doit être rempli
  const isValid = departureOk || destinationOk;

  // Mettre à jour l'état du bouton
  if (searchBtn) {
    searchBtn.disabled = !isValid;
    searchBtn.textContent = isValid
      ? "Rechercher"
      : "Remplir au moins un champ";
  }

  // Ajouter/supprimer les classes de validation Bootstrap
  if (departureInput) {
    if (departureOk || !destinationOk) {
      departureInput.classList.remove("is-invalid");
      if (departureOk) departureInput.classList.add("is-valid");
    } else {
      departureInput.classList.add("is-invalid");
      departureInput.classList.remove("is-valid");
    }
  }

  if (destinationInput) {
    if (destinationOk || !departureOk) {
      destinationInput.classList.remove("is-invalid");
      if (destinationOk) destinationInput.classList.add("is-valid");
    } else {
      destinationInput.classList.add("is-invalid");
      destinationInput.classList.remove("is-valid");
    }
  }

  console.log(`✅ Formulaire ${isValid ? "valide" : "invalide"}`);
  return isValid;
}

// Fonction principale de recherche
function performSearch() {
  console.log("🚀 Lancement de la recherche");

  if (!validateSearchForm()) {
    console.warn("⚠️ Formulaire invalide - arrêt de la recherche");
    return;
  }

  // Désactiver le bouton pendant la recherche
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Recherche en cours...";
  }

  // Construire les paramètres de recherche
  const searchParams = new URLSearchParams();

  if (departureInput && departureInput.value.trim()) {
    searchParams.append("departure", departureInput.value.trim());
  }

  if (destinationInput && destinationInput.value.trim()) {
    searchParams.append("destination", destinationInput.value.trim());
  }

  if (dateInput && dateInput.value) {
    searchParams.append("departureDate", dateInput.value);
  }

  if (passengersInput && passengersInput.value) {
    const passengers = parseInt(passengersInput.value);
    if (passengers > 0) {
      searchParams.append("passengers", passengers.toString());
    }
  }

  const searchUrl = `${apiUrl}/rides/search?${searchParams.toString()}`;
  console.log("🔗 URL de recherche:", searchUrl);

  // Effectuer la recherche
  fetch(searchUrl)
    .then((response) => {
      console.log("📡 Réponse reçue, statut:", response.status);

      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(
            `Erreur API: ${response.status} - ${JSON.stringify(errorData)}`
          );
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("🎉 Données reçues:", data);

      // Sauvegarder les résultats et critères dans sessionStorage
      sessionStorage.setItem("searchResults", JSON.stringify(data.rides || []));
      sessionStorage.setItem(
        "searchCriteria",
        JSON.stringify({
          origin: departureInput?.value || "",
          destination: destinationInput?.value || "",
          date: dateInput?.value || "",
          seats: passengersInput?.value || "",
        })
      );
      sessionStorage.setItem("searchMessage", data.message || "");

      // Rediriger vers la page de détail
      console.log("🔄 Redirection vers detailride.html");
      window.location.href = "/ridesharing";
    })
    .catch((error) => {
      console.error("💥 Erreur lors de la recherche:", error);
      alert(`Erreur lors de la recherche: ${error.message}`);
    })
    .finally(() => {
      // Restaurer le bouton
      if (searchBtn) {
        searchBtn.disabled = false;
        searchBtn.textContent = "Rechercher";
      }
    });
}
