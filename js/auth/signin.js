//Implémenter le JS de ma page d'Connexion

const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const btnValidationConnexion = document.getElementById(
  "btn-validation-Connexion"
);
const signinForm = document.getElementById("signin-form");

//inputMail.addEventListener("keyup", validateForm);
//inputPassword.addEventListener("keyup", validateForm);
btnValidationConnexion.addEventListener("click", checkCredentials);

function checkCredentials() {
  const dataForm = new FormData(signinForm);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    Email: dataForm.get("Email"),
    Password: dataForm.get("Password"),
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("http://localhost:8000/api/login", requestOptions)
    .then((response) => {
      if (!response.ok) {
        inputMail.classList.add("is-invalid");
        inputPassword.classList.add("is-invalid");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      // Il faudra récupérer le vrai token
      const token = result.token;
      setToken(token); // Fonction définie dans script.js pour gérer les cookies
      // Placer ce token en cookie

      setCookie(RoleCookieName, result.user.roles, 7); // Exemple de cookie pour le rôle, à adapter selon vos besoins
      // Redirection vers la page d'accueil ou une autre page
      window.location.replace("/"); // Remplacez par la route de votre page d'accueil
    })
    .catch((error) => {
      console.error("Erreur:", error);
      inputMail.classList.add("is-invalid");
      inputPassword.classList.add("is-invalid");

      // Afficher un message d'erreur approprié
      if (error.message.includes("401")) {
        alert(
          "Identifiants incorrects. Vérifiez votre email/pseudo et mot de passe."
        );
      } else {
        alert("Erreur lors de la connexion : " + error.message);
      }
    });
}
