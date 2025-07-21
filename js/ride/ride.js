// Recupérer les informations du formulaire de publication de covoiturage
console.log("🔄 Script ride.js chargé");

const inputDeparture = document.getElementById("departureInput");
const inputDestination = document.getElementById("destinationInput");
const inputDate = document.getElementById("dateInput");
const inputNbreSeats = document.getElementById("passengersInput");
const inputDepartureTime = document.getElementById("departureTimeInput");
const inputPrice = document.getElementById("priceInput");

const BtnPostOffer = document.getElementById("submit-offer");
const formOfferSeats = document.getElementById("form-offer-seats");

inputDeparture.addEventListener("keyup", validateForm);
inputDestination.addEventListener("keyup", validateForm);
inputDate.addEventListener("change", validateForm);
inputNbreSeats.addEventListener("change", validateForm);
inputDepartureTime.addEventListener("change", validateForm);
inputPrice.addEventListener("change", validateForm);

// Ajouter un listener pour le bouton de soumission
BtnPostOffer.addEventListener("click", function (event) {
  event.preventDefault(); // Empêcher le rechargement de la page
  console.log("🔄 Bouton cliqué - Début de la création du trajet");
  createRide();
});

function validateForm() {
  const departureOk = validateRequired(inputDeparture);
  const destinationOk = validateRequired(inputDestination);
  const dateOk = validateRequired(inputDate);
  const nbreSeatsOk = validateRequired(inputNbreSeats);
  const departureTimeOk = validateRequired(inputDepartureTime);
  const priceOk = validatePrice(inputPrice);

  // Vérifier si l'utilisateur est connecté (utilise la fonction de script.js)
  const isUserConnected =
    typeof isConnected === "function" ? isConnected() : false;

  if (
    departureOk &&
    destinationOk &&
    dateOk &&
    nbreSeatsOk &&
    departureTimeOk &&
    priceOk &&
    isUserConnected
  ) {
    BtnPostOffer.disabled = false; // Si tous les champs sont valides ET utilisateur connecté
    BtnPostOffer.textContent = "Publier le trajet";
  } else {
    BtnPostOffer.disabled = true; // Sinon on le désactive
    if (!isUserConnected) {
      BtnPostOffer.textContent = "Connectez-vous pour publier";
    } else {
      BtnPostOffer.textContent = "Publier le trajet";
    }
  }
}

function validateRequired(input) {
  if (input.value != "") {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;
  }
}

function validatePrice(input) {
  const price = parseFloat(input.value);
  if (price >= 4 && price <= 80) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;
  }
}

function createRide() {
  console.log("🚀 Fonction createRide() démarrée");

  // Vérifier si l'utilisateur est connecté (utilise les fonctions de script.js)
  if (typeof isConnected === "function" && !isConnected()) {
    alert("Vous devez être connecté pour publier un trajet");
    window.location.href = "/signin";
    return;
  }

  // Récupérer le token (utilise la fonction de script.js)
  const token = typeof getToken === "function" ? getToken() : null;
  if (!token) {
    alert("Session expirée. Veuillez vous reconnecter.");
    window.location.href = "/signin";
    return;
  }

  console.log("🔑 Token trouvé:", token.substring(0, 20) + "...");

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);
  console.log("📤 Headers configurés:", myHeaders);

  // Récupérer les valeurs des champs du formulaire
  const raw = JSON.stringify({
    departure: inputDeparture.value,
    destination: inputDestination.value,
    departureDate: inputDate.value,
    departureHour: inputDepartureTime.value,
    availableSeats: parseInt(inputNbreSeats.value),
    price: parseFloat(inputPrice.value),
    status: "active", // Statut par défaut
  });

  console.log("📦 JSON stringifié:", raw);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  console.log("⚙️ Options de la requête:", requestOptions);
  console.log("🌐 URL de l'API:", apiUrl + "/rides");

  fetch(apiUrl + "/rides", requestOptions)
    .then((response) => {
      console.log("📡 Réponse reçue:", response);
      console.log("📊 Status:", response.status);
      console.log("✅ OK?", response.ok);

      if (!response.ok) {
        return response.json().then((errorData) => {
          console.error("❌ Données d'erreur:", errorData);
          throw new Error(
            `HTTP error! status: ${response.status}, details: ${JSON.stringify(
              errorData
            )}`
          );
        });
      }
      return response.json();
    })
    .then((result) => {
      console.log("🎉 Succès complet:", result);
      alert("Bravo ! Votre trajet a été publié avec succès !");
      // Rediriger vers la page d'accueil ou la liste des trajets
      window.location.href = "/";
    })
    .catch((error) => {
      console.error("💥 Erreur capturée:", error);
      console.error("📄 Message d'erreur:", error.message);
      if (error.message.includes("401")) {
        alert("Session expirée. Veuillez vous reconnecter.");
        // Utiliser la fonction signout de script.js si disponible
        if (typeof signout === "function") {
          signout();
        } else {
          window.location.href = "/signin";
        }
      } else {
        alert("Erreur lors de la création du trajet : " + error.message);
      }
    });
}

// Initialiser le bouton comme désactivé au chargement
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 DOM chargé - Initialisation du formulaire");
  console.log("🔍 Éléments trouvés:");
  console.log("- inputDeparture:", inputDeparture);
  console.log("- inputDestination:", inputDestination);
  console.log("- inputDate:", inputDate);
  console.log("- inputNbreSeats:", inputNbreSeats);
  console.log("- inputDepartureTime:", inputDepartureTime);
  console.log("- inputPrice:", inputPrice);
  console.log("- BtnPostOffer:", BtnPostOffer);

  BtnPostOffer.disabled = true;
  console.log("🔒 Bouton désactivé par défaut");

  // Vérifier le statut de connexion
  const isUserConnected =
    typeof isConnected === "function" ? isConnected() : false;
  console.log(
    "🔐 Statut de connexion:",
    isUserConnected ? "Connecté" : "Non connecté"
  );

  // Afficher un message si l'utilisateur n'est pas connecté
  if (!isUserConnected) {
    console.warn("⚠️ Utilisateur non connecté - Le bouton sera désactivé");
    // Optionnel : afficher un message sur la page
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-warning mt-3";
    alertDiv.innerHTML =
      '<i class="bi bi-exclamation-triangle"></i> Vous devez être <a href="/pages/auth/signin.html" class="alert-link">connecté</a> pour publier un trajet.';
    const formContainer = document.querySelector(".form-container");
    if (formContainer) {
      formContainer.appendChild(alertDiv);
    }
  }

  // Définir des valeurs par défaut
  if (inputDepartureTime) {
    inputDepartureTime.value = "09:00";
    console.log("⏰ Heure par défaut définie: 09:00");
  }

  // Définir la date minimum à aujourd'hui
  if (inputDate) {
    const today = new Date().toISOString().split("T")[0];
    inputDate.setAttribute("min", today);
    console.log("📅 Date minimum définie:", today);
  }

  // Déclencher la validation initiale pour mettre à jour l'état du bouton
  validateForm();
});
