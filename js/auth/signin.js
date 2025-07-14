//Implémenter le JS de ma page d'Connexion

const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const btnValidationConnexion = document.getElementById(
  "btn-validation-Connexion"
);

inputMail.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);

function validateForm() {
  const mailOk = validateMail(inputMail);

  if (mailOk) {
    btnValidationConnexion.disabled = false; // Si tous les champs sont valides, on active le bouton;
  } else {
    btnValidationConnexion.disabled = true; // Sinon on le désactive
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
