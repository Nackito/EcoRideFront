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
      }
      return response.json();
    })
    .then((result) => {
      // Il faudra récupérer le vrai token
      const token = result.token;
      setToken(token); // Fonction définie dans script.js pour gérer les cookies
      // Placer ce token en cookie

      setCookie(RoleCookieName, result.role[0], 7); // Exemple de cookie pour le rôle, à adapter selon vos besoins
      // Redirection vers la page d'accueil ou une autre page
      window.location.replace("/"); // Remplacez par la route de votre page d'accueil
    })
    .catch((error) => {
      console.error("Erreur:", error);
      alert("Erreur lors de la connexion : " + error.message);
    });
}
