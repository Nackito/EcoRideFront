// Historique passager: afficher toutes les demandes de réservation + annulation si trajet non démarré
console.log("📚 carpoolinghistory.js chargé");

function requireAuthToken() {
  const token = typeof getToken === "function" ? getToken() : null;
  if (!token) {
    window.location.href = "/signin";
    throw new Error("Token manquant");
  }
  return token;
}

function apiHeaders(token) {
  const h = new Headers();
  h.append("Accept", "application/json");
  h.append("Authorization", `Bearer ${token}`);
  return h;
}

function ensurePassengerPendingBadge() {
  const desktopTitle = document.querySelector(".carpooling-history h2");
  const mobileTitle = document.querySelector(".carpooling-history h4");

  [desktopTitle, mobileTitle].forEach((title, index) => {
    if (!title) return;
    const badgeId =
      index === 0
        ? "passenger-pending-badge-desktop"
        : "passenger-pending-badge-mobile";
    if (document.getElementById(badgeId)) return;

    const badge = document.createElement("span");
    badge.id = badgeId;
    badge.className = "badge rounded-pill bg-danger ms-2 d-none";
    badge.textContent = "0";
    badge.setAttribute("aria-label", "Demandes en attente");
    title.appendChild(badge);
  });
}

function updatePassengerPendingBadge(pendingCount) {
  [
    document.getElementById("passenger-pending-badge-desktop"),
    document.getElementById("passenger-pending-badge-mobile"),
  ].forEach((badge) => {
    if (!badge) return;
    if (pendingCount > 0) {
      badge.textContent = String(pendingCount);
      badge.classList.remove("d-none");
    } else {
      badge.classList.add("d-none");
    }
  });
}

async function fetchPassengerRequests() {
  const list = document.getElementById("tripsList");
  if (!list) return;

  ensurePassengerPendingBadge();

  list.innerHTML =
    '<div class="alert alert-info">Chargement des demandes...</div>';

  try {
    const token = requireAuthToken();
    const resp = await fetch(`${apiUrl}/rides/passenger/requests`, {
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
    const pendingCount = requests.filter(
      (r) => String(r.status).toLowerCase() === "pending",
    ).length;
    updatePassengerPendingBadge(pendingCount);
    renderPassengerRequests(requests);
    updateNoTripsMessage(requests.length === 0);
  } catch (e) {
    console.error("Erreur fetchPassengerRequests:", e);
    list.innerHTML =
      '<div class="alert alert-danger">Impossible de charger l\'historique des demandes.</div>';
    updatePassengerPendingBadge(0);
    updateNoTripsMessage(true);
  }
}

function mapCardStatus(r) {
  const status = String(r.status || "").toLowerCase();
  if (status === "cancelled" || status === "rejected") return "cancelled";

  const dep = r.departure_datetime ? new Date(r.departure_datetime) : null;
  const now = new Date();
  if ((status === "pending" || status === "accepted") && dep && dep > now) {
    return "upcoming";
  }
  return "completed";
}

function statusBadge(status) {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return '<span class="badge bg-warning text-dark">En attente</span>';
    case "accepted":
      return '<span class="badge bg-success">Acceptée</span>';
    case "rejected":
      return '<span class="badge bg-danger">Refusée</span>';
    case "cancelled":
      return '<span class="badge bg-secondary">Annulée</span>';
    default:
      return `<span class="badge bg-light text-dark">${escapeHtml(String(status || "Inconnu"))}</span>`;
  }
}

function formatDateTime(dt) {
  if (!dt) return "Date inconnue";
  const d = new Date(dt);
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderPassengerRequests(requests) {
  const list = document.getElementById("tripsList");
  if (!list) return;

  if (!requests.length) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = requests
    .map((r) => {
      const cardStatus = mapCardStatus(r);
      const canCancel = !!r.can_cancel;
      const from = escapeHtml(r.departure_city || "");
      const to = escapeHtml(r.arrival_city || "");
      const dep = escapeHtml(formatDateTime(r.departure_datetime));
      const driver = escapeHtml(
        r.driver_pseudo || r.driver_email || "Conducteur",
      );
      const seats = Number(r.seats_requested || 1);
      const price = Number(r.price || 0) * seats;

      return `
        <div class="card rounded-4 elevation-2 mb-3 trip-card" data-status="${cardStatus}" data-role="passenger">
          <div class="card-body p-2 p-md-4">
            <div class="row align-items-center">
              <div class="col-md-1 text-center d-none d-md-block">
                <i class="bi bi-person-sitting fs-3 text-secondary"></i>
              </div>
              <div class="col-md-4">
                <h6 class="fw-bold mb-1">${from} → ${to}</h6>
                <p class="text-muted small mb-0">${dep}</p>
              </div>
              <div class="col-md-2 text-center">
                <small class="text-muted">avec ${driver}<br/>${seats} place(s)</small>
              </div>
              <div class="col-md-2 text-center">
                ${statusBadge(r.status)}
              </div>
              <div class="col-md-2 text-center">
                <span class="fw-bold text-danger">-${escapeHtml(price.toFixed(2))}€</span>
              </div>
              <div class="col-md-1 text-center">
                ${
                  canCancel
                    ? `<button class="btn btn-outline-danger btn-sm" onclick="cancelPassengerRequest(${Number(r.id)})" title="Annuler la demande"><i class="bi bi-x-circle"></i></button>`
                    : `<button class="btn btn-outline-secondary btn-sm" disabled title="Annulation impossible"><i class="bi bi-lock"></i></button>`
                }
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // Si le script inline de la page existe encore, exploiter son filtre
  if (typeof filterTrips === "function") {
    filterTrips();
  }
}

async function cancelPassengerRequest(requestId) {
  if (!confirm("Annuler cette demande de réservation ?")) return;

  try {
    const token = requireAuthToken();
    const resp = await fetch(
      `${apiUrl}/rides/passenger/requests/${requestId}/cancel`,
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
      const msg =
        (payload && (payload.error || payload.details)) ||
        `HTTP ${resp.status}`;
      throw new Error(msg);
    }

    alert(payload?.message || "Demande annulée");
    fetchPassengerRequests();
  } catch (e) {
    console.error("Erreur cancelPassengerRequest:", e);
    alert(`Erreur lors de l'annulation: ${e.message}`);
  }
}

function updateNoTripsMessage(show) {
  const noTrips = document.getElementById("noTripsMessage");
  if (!noTrips) return;
  noTrips.classList.toggle("d-none", !show);
}

if (typeof window !== "undefined") {
  window.cancelPassengerRequest = cancelPassengerRequest;
}

document.addEventListener("DOMContentLoaded", fetchPassengerRequests);
if (document.readyState !== "loading") {
  fetchPassengerRequests();
}
