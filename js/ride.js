// Recupérer les informations du formulaire de publication de covoiturage
const formOfferSeats = document.getElementById("form-offer-seats");
const inputDeparture = document.getElementById("departure");
const inputDestination = document.getElementById("destination");
const inputDate = document.getElementById("date");
const inputNbreSeats = document.getElementById("passengers");
const inputDepartureTime = document.getElementById("departure-time");
const inputPrice = document.getElementById("price");
const BtnPostOffer = document.getElementById("submit-offer");

inputDeparture.addEventListener("keyup", validateForm);
inputDestination.addEventListener("keyup", validateForm);
inputDate.addEventListener("change", validateForm);
inputNbreSeats.addEventListener("change", validateForm);
inputDepartureTime.addEventListener("change", validateForm);
inputPrice.addEventListener("change", validateForm);

function validateForm() {
  const departureOk = validateRequired(inputDeparture);
  const destinationOk = validateRequired(inputDestination);
  const dateOk = validateRequired(inputDate);
  const nbreSeatsOk = validateRequired(inputNbreSeats);
  const departureTimeOk = validateRequired(inputDepartureTime);
  const priceOk = validatePrice(inputPrice);

  if (
    departureOk &&
    destinationOk &&
    dateOk &&
    nbreSeatsOk &&
    departureTimeOk &&
    priceOk
  ) {
    BtnPostOffer.disabled = false; // Si tous les champs sont valides, on active le bouton
  } else {
    BtnPostOffer.disabled = true; // Sinon on le désactive
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

// Ajouter un listener pour le bouton de soumission
BtnPostOffer.addEventListener("click", function (event) {
  event.preventDefault(); // Empêcher le rechargement de la page
  createRide();
});

// Configuration de l'API
const apiUrl = "http://localhost:8000/api";

function createRide() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
  // Récupérer le token d'authentification
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Vous devez être connecté pour publier un trajet");
    window.location.href = "/pages/auth/signin.html";
    return;
  }
  
  myHeaders.append("Authorization", `Bearer ${token}`);

  // Construire les données du trajet
  const raw = JSON.stringify({
    departure: inputDeparture.value.trim(),
    destination: inputDestination.value.trim(),
    departureDate: inputDate.value,
    departureHour: inputDepartureTime.value,
    arrivalDate: inputDate.value, // Même date que le départ
    arrivalHour: "18:00", // Heure par défaut
    availableSeats: parseInt(inputNbreSeats.value),
    pricePerPerson: parseFloat(inputPrice.value),
    status: "open" // Statut par défaut
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(apiUrl + "/rides", requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      console.log("Succès:", result);
      alert("Bravo ! Votre trajet a été publié avec succès !");
      // Rediriger vers la page d'accueil ou la liste des trajets
      window.location.href = "/pages/home.html";
    })
    .catch((error) => {
      console.error("Erreur:", error);
      if (error.message.includes("401")) {
        alert("Session expirée. Veuillez vous reconnecter.");
        localStorage.removeItem("authToken");
        window.location.href = "/pages/auth/signin.html";
      } else {
        alert("Erreur lors de la création du trajet : " + error.message);
      }
    });
}

// Initialiser le bouton comme désactivé au chargement
document.addEventListener("DOMContentLoaded", function() {
  BtnPostOffer.disabled = true;
  
  // Définir des valeurs par défaut
  if (inputDepartureTime) {
    inputDepartureTime.value = "09:00";
  }
  
  // Définir la date minimum à aujourd'hui
  if (inputDate) {
    const today = new Date().toISOString().split('T')[0];
    inputDate.setAttribute('min', today);
  }
});
