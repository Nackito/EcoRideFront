// Gestion de covoiturage: affichage des trajets actifs/planned
console.log("🚌 carpoolingmanagement.js chargé");

function requireAuthOptional() {
  // On autorise la consultation sans forcer la connexion
  const token = typeof getToken === "function" ? getToken() : null;
  return token;
}

function apiHeaders(token) {
  const h = new Headers();
  h.append("Accept", "application/json");
  if (token) h.append("Authorization", `Bearer ${token}`);
  return h;
}

async function fetchActiveTrips() {
  // Adapter aux IDs existants dans la page
  const container =
    document.getElementById("activeTrips") ||
    document.getElementById("cm-trips-container");
  const statusEl = document.getElementById("cm-status");
  if (statusEl) statusEl.textContent = "Chargement des trajets…";
  try {
    const token = requireAuthOptional();
    const resp = await fetch(`${apiUrl}/rides`, {
      method: "GET",
      headers: apiHeaders(token),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${txt}`);
    }
    const data = await resp.json();
    const list = Array.isArray(data.rides) ? data.rides : [];
    renderTrips(list);
    if (statusEl) statusEl.textContent = `${list.length} trajet(s) trouvé(s)`;
    // Afficher/masquer le bloc "Aucun trajet actif"
    const emptyEl = document.getElementById("noActiveTrips");
    if (emptyEl) emptyEl.classList.toggle("d-none", list.length > 0);
  } catch (e) {
    console.error("Erreur fetchActiveTrips:", e);
    if (statusEl) statusEl.textContent = `Erreur: ${e.message}`;
    if (container)
      container.innerHTML =
        '<div class="alert alert-danger">Impossible de récupérer les trajets.</div>';
  }
}

function renderTrips(list) {
  const container =
    document.getElementById("activeTrips") ||
    document.getElementById("cm-trips-container");
  if (!container) return;
  container.innerHTML = "";
  if (!list.length) {
    container.innerHTML = "";
    return;
  }
  list.forEach((t) => {
    const depDate = t.departureDate || null;
    const depHour = (t.departureHour || "").slice(0, 5);
    const arrDate = t.arrivalDate || null;
    const arrHour = (t.arrivalHour || "").slice(0, 5);
    const seats = t.availableSeats ?? t.remainingSeats ?? 0;
    const price = t.price ?? "0";
    const driverName = t.driver && t.driver.name ? t.driver.name : "Conducteur";
    const vehicleType =
      t.vehicleType === "electric"
        ? "Électrique"
        : t.vehicleType === "hybrid"
          ? "Hybride"
          : "Thermique";

    const card = document.createElement("div");
    card.className = "card rounded-4 mb-3";
    card.innerHTML = `
      <div class="card-body p-3 p-md-4">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="fw-bold mb-1">${escapeHtml(t.origin || "")} → ${escapeHtml(t.destination || "")}</h5>
            <div class="text-muted">
              <span>${escapeHtml(depDate || "")} ${escapeHtml(depHour || "")}</span>
              ${arrDate ? `· Arrivée ${escapeHtml(arrDate)} ${escapeHtml(arrHour)}` : ""}
            </div>
            <div class="mt-1 small text-muted">
              ${escapeHtml(driverName)} • ${escapeHtml(vehicleType)}
            </div>
          </div>
          <div class="text-end">
            <div class="fw-bold">${escapeHtml(String(price))} €</div>
            <div class="text-muted small">${escapeHtml(String(seats))} place(s)</div>
          </div>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

function initCarpoolingManagement() {
  // Charger automatiquement à l'arrivée sur la page
  fetchActiveTrips();
}

// Exposer pour usage éventuel
if (typeof window !== "undefined") {
  window.fetchActiveTrips = fetchActiveTrips;
  window.viewActiveTrips = fetchActiveTrips;
}

initCarpoolingManagement();
