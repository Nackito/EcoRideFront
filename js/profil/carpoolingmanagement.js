// Gestion de covoiturage: affichage des trajets actifs/planned
console.log("🚌 carpoolingmanagement.js chargé");
let bookingRequestsRefreshTimer = null;

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

function getCurrentUserIdFromToken() {
  try {
    const token = typeof getToken === "function" ? getToken() : null;
    if (!token) return null;
    const decoded = atob(token);
    const parts = decoded.split(":");
    const userId = Number(parts[0]);
    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
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
    const all = Array.isArray(data.rides) ? data.rides : [];
    const me = getCurrentUserIdFromToken();
    const list = me
      ? all.filter((r) => Number(r?.driver?.id) === Number(me))
      : all;
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
  ensureRequestsSection();
  // Charger automatiquement à l'arrivée sur la page
  fetchActiveTrips();
  fetchBookingRequests();

  // Badge/live list: rafraîchissement automatique toutes les 30s
  if (bookingRequestsRefreshTimer) {
    clearInterval(bookingRequestsRefreshTimer);
  }
  bookingRequestsRefreshTimer = setInterval(() => {
    fetchBookingRequests();
  }, 30000);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      if (bookingRequestsRefreshTimer) {
        clearInterval(bookingRequestsRefreshTimer);
        bookingRequestsRefreshTimer = null;
      }
    });
  }
}

function updatePendingBadges(pendingCount) {
  const pageBadge = document.getElementById("cm-pending-badge");
  const sectionBadge = document.getElementById("bookingRequestsPendingBadge");

  [pageBadge, sectionBadge].forEach((badge) => {
    if (!badge) return;
    if (pendingCount > 0) {
      badge.textContent = String(pendingCount);
      badge.classList.remove("d-none");
    } else {
      badge.classList.add("d-none");
    }
  });
}

function ensureRequestsSection() {
  if (document.getElementById("bookingRequestsList")) return;

  const pageContainer = document.querySelector(".carpooling-management");
  if (!pageContainer) return;

  const section = document.createElement("div");
  section.className = "card rounded-4 elevation-2 mb-4";
  section.innerHTML = `
    <div class="card-body p-2 p-md-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold mb-0">
          <i class="bi bi-envelope-check me-2 text-primary"></i>Demandes de réservation
          <span id="bookingRequestsPendingBadge" class="badge rounded-pill bg-danger ms-2 d-none">0</span>
        </h5>
        <button class="btn btn-outline-primary btn-sm" onclick="fetchBookingRequests()">
          <i class="bi bi-arrow-clockwise me-1"></i>Rafraîchir
        </button>
      </div>
      <div id="bookingRequestsStatus" class="text-muted small mb-2"></div>
      <div id="bookingRequestsList"></div>
    </div>
  `;

  pageContainer.appendChild(section);
}

async function fetchBookingRequests() {
  const statusEl = document.getElementById("bookingRequestsStatus");
  const listEl = document.getElementById("bookingRequestsList");
  if (!listEl) return;

  const token = requireAuthOptional();
  if (!token) {
    listEl.innerHTML =
      '<div class="alert alert-warning">Connectez-vous pour voir les demandes de réservation.</div>';
    return;
  }

  if (statusEl) statusEl.textContent = "Chargement des demandes...";
  try {
    const resp = await fetch(`${apiUrl}/rides/driver/requests`, {
      method: "GET",
      headers: apiHeaders(token),
    });
    const ct = resp.headers.get("Content-Type") || "";
    const payload = ct.includes("application/json")
      ? await resp.json().catch(() => null)
      : null;

    if (!resp.ok) {
      const msg =
        (payload && (payload.error || payload.details)) ||
        `HTTP ${resp.status}`;
      throw new Error(msg);
    }

    const requests = Array.isArray(payload?.requests) ? payload.requests : [];
    const pendingCount = requests.filter((r) => r.status === "pending").length;
    updatePendingBadges(pendingCount);
    renderBookingRequests(requests);
    if (statusEl)
      statusEl.textContent = `${requests.length} demande(s) trouvée(s)`;
  } catch (e) {
    console.error("Erreur fetchBookingRequests:", e);
    if (statusEl) statusEl.textContent = `Erreur: ${e.message}`;
    listEl.innerHTML =
      '<div class="alert alert-danger">Impossible de charger les demandes.</div>';
    updatePendingBadges(0);
  }
}

function renderBookingRequests(requests) {
  const listEl = document.getElementById("bookingRequestsList");
  if (!listEl) return;

  if (!requests.length) {
    listEl.innerHTML =
      '<div class="alert alert-info mb-0">Aucune demande de réservation pour le moment.</div>';
    return;
  }

  listEl.innerHTML = requests
    .map((r) => {
      const dt = r.departure_datetime
        ? new Date(r.departure_datetime).toLocaleString("fr-FR")
        : "Date inconnue";
      const statusBadge =
        r.status === "pending"
          ? '<span class="badge bg-warning text-dark">En attente</span>'
          : r.status === "accepted"
            ? '<span class="badge bg-success">Acceptée</span>'
            : '<span class="badge bg-danger">Refusée</span>';

      const actions =
        r.status === "pending"
          ? `
            <button class="btn btn-success btn-sm" onclick="acceptBookingRequest(${r.id})">
              <i class="bi bi-check-lg me-1"></i>Accepter
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="rejectBookingRequest(${r.id})">
              <i class="bi bi-x-lg me-1"></i>Refuser
            </button>
          `
          : "";

      return `
        <div class="card rounded-4 mb-2">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div class="fw-bold">${escapeHtml(r.departure_city || "")} → ${escapeHtml(r.arrival_city || "")}</div>
                <div class="small text-muted">Départ: ${escapeHtml(dt)}</div>
                <div class="small">Demandeur: <strong>${escapeHtml(r.passenger_pseudo || r.passenger_email || "Passager")}</strong></div>
              </div>
              <div class="text-end">
                ${statusBadge}
                <div class="small text-muted mt-1">${escapeHtml(String(r.seats_requested || 1))} place(s)</div>
              </div>
            </div>
            ${actions ? `<div class="d-flex gap-2 mt-3">${actions}</div>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

async function acceptBookingRequest(requestId) {
  const token = requireAuthOptional();
  if (!token) return;

  try {
    const resp = await fetch(
      `${apiUrl}/rides/driver/requests/${requestId}/accept`,
      {
        method: "POST",
        headers: apiHeaders(token),
      },
    );
    const ct = resp.headers.get("Content-Type") || "";
    const payload = ct.includes("application/json")
      ? await resp.json().catch(() => null)
      : null;
    if (!resp.ok) {
      throw new Error(
        (payload && (payload.error || payload.details)) ||
          `HTTP ${resp.status}`,
      );
    }
    alert(payload?.message || "Demande acceptée");
    fetchBookingRequests();
    fetchActiveTrips();
  } catch (e) {
    alert(`Erreur lors de l'acceptation: ${e.message}`);
  }
}

async function rejectBookingRequest(requestId) {
  const token = requireAuthOptional();
  if (!token) return;

  const reason = prompt("Raison du refus (optionnel):") || "";

  try {
    const headers = apiHeaders(token);
    headers.set("Content-Type", "application/json");
    const resp = await fetch(
      `${apiUrl}/rides/driver/requests/${requestId}/reject`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ reason }),
      },
    );
    const ct = resp.headers.get("Content-Type") || "";
    const payload = ct.includes("application/json")
      ? await resp.json().catch(() => null)
      : null;
    if (!resp.ok) {
      throw new Error(
        (payload && (payload.error || payload.details)) ||
          `HTTP ${resp.status}`,
      );
    }
    alert(payload?.message || "Demande refusée");
    fetchBookingRequests();
  } catch (e) {
    alert(`Erreur lors du refus: ${e.message}`);
  }
}

// Exposer pour usage éventuel
if (typeof window !== "undefined") {
  window.fetchActiveTrips = fetchActiveTrips;
  window.viewActiveTrips = fetchActiveTrips;
  window.fetchBookingRequests = fetchBookingRequests;
  window.acceptBookingRequest = acceptBookingRequest;
  window.rejectBookingRequest = rejectBookingRequest;
  window.startNewTrip = () => (window.location.href = "/offerseats");
}

initCarpoolingManagement();
