//Implémenter le JS de ma page d'inscription

const inputPseudo = document.getElementById("PseudoInput");
const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const inputConfirmationPasswor = document.getElementById(
  "ConfirmationPasswordInput"
);
const btnValidationInscription = document.getElementById(
  "btn-validation-inscription"
);
const signupForm = document.getElementById("signup-form");

inputPseudo.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputConfirmationPasswor.addEventListener("keyup", validateForm);

btnValidationInscription.addEventListener("click", function (event) {
  event.preventDefault(); // Empêcher le rechargement de la page
  registerUser();
});

function validateForm() {
  const pseudoOk = validateRequired(inputPseudo);
  const mailOk = validateMail(inputMail);
  const passwordOk = validatePassword(inputPassword);
  const confirmationPasswordOk = validateConfirmationPassword(
    inputPassword,
    inputConfirmationPasswor
  );

  if (pseudoOk && mailOk && passwordOk && confirmationPasswordOk) {
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

function registerUser() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  // Récupérer les valeurs des champs du formulaire
  const raw = JSON.stringify({
    pseudo: inputPseudo.value,
    email: inputMail.value,
    password: inputPassword.value,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("http://localhost:8000/api/registration", requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      console.log("Succès:", result);
      alert("Inscription réussie ! " + result.message);
      // Rediriger vers la page de connexion ou autre
      // window.location.href = "/connexion.html";
    })
    .catch((error) => {
      console.error("Erreur:", error);
      alert("Erreur lors de l'inscription : " + error.message);
    });
}
