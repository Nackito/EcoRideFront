//Implémenter le JS de ma page d'inscription

const inputPseudo = document.getElementById("PseudoInput");
const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const inputConfirmationPassword = document.getElementById(
  "ConfirmationPasswordInput"
);

// Récupérer les boutons radio pour les rôles
const roleDriver = document.getElementById("roleDriver");
const rolePassenger = document.getElementById("rolePassenger");
const roleBoth = document.getElementById("roleBoth");

function getSelectedRole() {
  const selectedRadio = document.querySelector('input[name="role"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}

const btnValidationInscription = document.getElementById(
  "btn-validation-inscription"
);
const signupForm = document.getElementById("signup-form");

inputPseudo.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputConfirmationPassword.addEventListener("keyup", validateForm);
// Ajouter les listeners sur chaque bouton radio
roleDriver.addEventListener("change", validateForm);
rolePassenger.addEventListener("change", validateForm);
roleBoth.addEventListener("change", validateForm);

btnValidationInscription.addEventListener("click", function (event) {
  event.preventDefault(); // Empêcher le rechargement de la page
  registerUser();
});

// Intercepter la soumission du formulaire (Entrée clavier, submit natif)
signupForm.addEventListener("submit", function (event) {
  event.preventDefault();
  registerUser();
});

function validateForm() {
  const pseudoOk = validateRequired(inputPseudo);
  const mailOk = validateMail(inputMail);
  const passwordOk = validatePassword(inputPassword);
  const confirmationPasswordOk = validateConfirmationPassword(
    inputPassword,
    inputConfirmationPassword
  );
  const roleOk = validateRole();

  if (pseudoOk && mailOk && passwordOk && confirmationPasswordOk && roleOk) {
    btnValidationInscription.disabled = false; // Si tous les champs sont valides, on active le bouton;
  } else {
    btnValidationInscription.disabled = true; // Sinon on le désactive
  }
}

function validateMail(input) {
  //Définir mon regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mailUser = input.value;
  if (mailUser.match(emailRegex)) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;
  }
}

function validatePassword(input) {
  //Définir mon regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
  const passwordUser = input.value;
  if (passwordUser.match(passwordRegex)) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;
  }
}

function validateConfirmationPassword(inputPwd, inputConfirmPwd) {
  if (inputPwd.value == inputConfirmPwd.value) {
    inputConfirmPwd.classList.add("is-valid");
    inputConfirmPwd.classList.remove("is-invalid");
    return true;
  } else {
    inputConfirmPwd.classList.add("is-invalid");
    inputConfirmPwd.classList.remove("is-valid");
    return false;
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

function validateRole() {
  const selectedRole = getSelectedRole();
  if (selectedRole) {
    // Retirer les classes d'erreur de tous les boutons radio
    roleDriver.classList.remove("is-invalid");
    rolePassenger.classList.remove("is-invalid");
    roleBoth.classList.remove("is-invalid");
    return true;
  } else {
    // Ajouter les classes d'erreur à tous les boutons radio
    roleDriver.classList.add("is-invalid");
    rolePassenger.classList.add("is-invalid");
    roleBoth.classList.add("is-invalid");
    return false;
  }
}

function registerUser() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  // Construire le tableau des rôles selon la sélection
  const selectedRoleValue = getSelectedRole();
  const roles = ["ROLE_USER"]; // Rôle de base obligatoire

  if (selectedRoleValue === "driver") {
    roles.push("ROLE_DRIVER");
  } else if (selectedRoleValue === "passenger") {
    roles.push("ROLE_PASSENGER");
  } else if (selectedRoleValue === "both") {
    roles.push("ROLE_DRIVER");
    roles.push("ROLE_PASSENGER");
  }

  // Vérifier qu'un rôle a été sélectionné
  if (!selectedRoleValue) {
    alert("Veuillez sélectionner un rôle avant de vous inscrire.");
    return;
  }

  // Récupérer les valeurs des champs du formulaire
  const raw = JSON.stringify({
    pseudo: inputPseudo.value,
    email: inputMail.value,
    password: inputPassword.value,
    roles: roles, // Envoyer le tableau de rôles comme attendu par l'API
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(apiUrl + "/registration", requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      //console.log("Succès:", result);
      alert(
        "Bravo " +
          inputPseudo.value +
          ", Inscription réussie ! " +
          result.message
      );
      // Rediriger vers la page de connexion ou autre
      window.location.href = "/signin"; // Remplacez par la route de votre page de connexion
    })
    .catch((error) => {
      console.error("Erreur:", error);
      alert("Erreur lors de l'inscription : " + error.message);
    });
}
