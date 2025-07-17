//Implémenter le JS de ma page d'Connexion

const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const btnValidationConnexion = document.getElementById(
  "btn-validation-Connexion"
);

//inputMail.addEventListener("keyup", validateForm);
//inputPassword.addEventListener("keyup", validateForm);
btnValidationConnexion.addEventListener("click", checkCredentials);

function checkCredentials() {
  // Ici, il faudrait normalement vérifier les identifiants avec le backend

  if (inputMail.value == "ted@mail.com" && inputPassword.value == "Azerty.11") {
    // Il faudra récupérer le vrai token
    const token = "fpojkfvpokvfedokspfkokfvfdokvkvdpf";
    setToken(token); // Fonction définie dans script.js pour gérer les cookies
    // Placer ce token en cookie

    // Redirection vers la page d'accueil ou une autre page
    window.location.replace("/"); // Remplacez par la route de votre page d'accueil
  } else {
    inputMail.classList.add("is-invalid");
    inputPassword.classList.add("is-invalid");
  }
}
