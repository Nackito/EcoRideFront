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
      console.log("Réponse complète:", result); // Pour débugger

      // Récupérer le token
      const token = result.token;
      setToken(token); // Fonction définie dans script.js pour gérer les cookies

      // Stocker les informations utilisateur
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));

        // Récupérer TOUS les rôles de l'utilisateur
        const userRoles = result.user.roles;
        console.log("Rôles de l'utilisateur:", userRoles);

        // Stocker tous les rôles dans localStorage
        localStorage.setItem("userRoles", JSON.stringify(userRoles));

        // Définir le rôle principal pour le cookie (priorité: ADMIN > DRIVER > PASSENGER > USER)
        let mainRole = "user"; // Valeur par défaut

        if (userRoles.includes("ROLE_ADMIN")) {
          mainRole = "admin";
        } else if (
          userRoles.includes("ROLE_DRIVER") &&
          userRoles.includes("ROLE_PASSENGER")
        ) {
          mainRole = "driver_passenger"; // Pour les utilisateurs avec les deux rôles
        } else if (userRoles.includes("ROLE_DRIVER")) {
          mainRole = "driver";
        } else if (userRoles.includes("ROLE_PASSENGER")) {
          mainRole = "passenger";
        }

        setCookie(RoleCookieName, mainRole, 7);

        // Créer des cookies individuels pour chaque rôle (plus pratique pour les conditions)
        setCookie(
          "isDriver",
          userRoles.includes("ROLE_DRIVER") ? "true" : "false",
          7
        );
        setCookie(
          "isPassenger",
          userRoles.includes("ROLE_PASSENGER") ? "true" : "false",
          7
        );
        setCookie(
          "isAdmin",
          userRoles.includes("ROLE_ADMIN") ? "true" : "false",
          7
        );
      }

      alert("Connexion réussie !");
      // Redirection vers la page d'accueil
      window.location.replace("/");
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
