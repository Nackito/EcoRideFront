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
  myHeaders.append("Accept", "application/json");
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
    .then(async (response) => {
      console.log("📡 Réponse reçue:", response);
      console.log("📊 Status:", response.status);
      console.log("✅ OK?", response.ok);

      if (!response.ok) {
        let details = "";
        let errorJson = null;
        try {
          const ct = response.headers.get("Content-Type") || "";
          if (ct.includes("application/json")) {
            errorJson = await response.json();
            details = JSON.stringify(errorJson);
          } else {
            details = await response.text();
          }
        } catch (e) {
          details = "(impossible de parser la réponse d'erreur)";
        }
        console.error("❌ Détails d'erreur:", details);

        // Notification pro si aucun véhicule
        if (
          response.status === 400 &&
          errorJson &&
          (errorJson.error || "").toLowerCase().includes("véhicule")
        ) {
          showProNotification(
            "Action requise",
            errorJson.details ||
              "Aucun véhicule enregistré. Vous devez enregistrer un véhicule avant de publier un trajet.",
            errorJson.redirect || "/vehiclemanagement",
          );
        }
        throw new Error(`HTTP ${response.status}: ${details}`);
      }

      const ct = response.headers.get("Content-Type") || "";
      if (!ct.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          "Réponse non-JSON du serveur: " + text.slice(0, 200) + "...",
        );
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
        // Éviter l'alerte si la notification pro est affichée
        if (document.getElementById("pro-notice")) return;
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
    isUserConnected ? "Connecté" : "Non connecté",
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

/**
 * Affiche une notification professionnelle en haut à droite
 * @param {string} title
 * @param {string} message
 * @param {string} redirectHref
 */
function showProNotification(
  title,
  message,
  redirectHref = "/vehiclemanagement",
) {
  try {
    // Supprimer une notification existante
    const old = document.getElementById("pro-notice");
    if (old && old.parentElement) old.parentElement.removeChild(old);

    const wrapper = document.createElement("div");
    wrapper.id = "pro-notice";
    wrapper.className = "position-fixed top-0 end-0 p-3";
    wrapper.style.zIndex = "1080";

    const safeTitle =
      typeof escapeHtml === "function" ? escapeHtml(title) : title;
    const safeMsg =
      typeof escapeHtml === "function" ? escapeHtml(message) : message;

    wrapper.innerHTML = `
      <div class="card shadow-lg border-0" style="width: 360px;">
        <div class="card-header d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-info-circle-fill text-primary"></i>
            <strong>${safeTitle}</strong>
          </div>
          <button type="button" class="btn btn-sm btn-outline-primary" id="pro-notice-close">Fermer</button>
        </div>
        <div class="card-body">
          <p class="mb-3">${safeMsg}</p>
          <div class="d-flex justify-content-end">
            <a href="/vehiclemanagement" class="btn btn-primary">
              <i class="bi bi-gear me-2"></i>Aller à l'ajout de véhicule
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    const closeBtn = document.getElementById("pro-notice-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        window.location.href = redirectHref || "/vehiclemanagement";
      });
    }
  } catch (e) {
    console.error("Erreur affichage notification:", e);
    alert(message + "\nRedirection vers la gestion des véhicules.");
    window.location.href = redirectHref || "/vehiclemanagement";
  }
}
