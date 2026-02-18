// Préférences de covoiturage: base (fumeur/animaux)
console.log("🎛️ carpoolingpreferences.js chargé");

function requireAuth() {
  const token = getToken && getToken();
  if (!token) {
    window.location.href = "/signin";
    throw new Error("Token manquant");
  }
  return token;
}

function apiHeaders(token) {
  const h = new Headers();
  h.append("Content-Type", "application/json");
  h.append("Accept", "application/json");
  h.append("Authorization", `Bearer ${token}`);
  return h;
}

async function loadBasePrefs() {
  try {
    const token = requireAuth();
    const resp = await fetch(`${apiUrl}/account/preferences/base`, {
      method: "GET",
      headers: apiHeaders(token),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const prefs = await resp.json();
    applyBasePrefs(prefs);
  } catch (e) {
    console.error("Erreur loadBasePrefs:", e);
  }
}

function applyBasePrefs(prefs) {
  const smoker = !!prefs.smoker_allowed;
  const animals = !!prefs.animals_allowed;

  const smokingInputs = [
    "non-smoker",
    "smoker",
    "non-smoker-mobile",
    "smoker-mobile",
  ]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  smokingInputs.forEach((el) => {
    const isSmoker = el.value === "smoker";
    el.checked = isSmoker ? smoker : !smoker;
  });

  const petsInputs = [
    "no-pets",
    "pets-allowed",
    "no-pets-mobile",
    "pets-allowed-mobile",
  ]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  petsInputs.forEach((el) => {
    const allow = el.value === "pets-allowed";
    el.checked = allow ? animals : !animals;
  });
}

async function saveBasePrefs() {
  try {
    const token = requireAuth();
    const smoker =
      document.getElementById("smoker").checked ||
      document.getElementById("smoker-mobile").checked;
    const animals =
      document.getElementById("pets-allowed").checked ||
      document.getElementById("pets-allowed-mobile").checked;

    const resp = await fetch(`${apiUrl}/account/preferences/base`, {
      method: "POST",
      headers: apiHeaders(token),
      body: JSON.stringify({
        smoker_allowed: smoker,
        animals_allowed: animals,
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${txt}`);
    }
    alert("Préférences sauvegardées");
  } catch (e) {
    console.error("Erreur saveBasePrefs:", e);
    alert("Erreur lors de la sauvegarde des préférences");
  }
}

function initPrefsPage() {
  loadBasePrefs();
  // Sauvegarde à chaque changement des radios
  [
    "non-smoker",
    "smoker",
    "non-smoker-mobile",
    "smoker-mobile",
    "no-pets",
    "pets-allowed",
    "no-pets-mobile",
    "pets-allowed-mobile",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", saveBasePrefs);
  });
}

document.addEventListener("DOMContentLoaded", initPrefsPage);
