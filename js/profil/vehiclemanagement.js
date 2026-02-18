// Gestion des véhicules: liste et ajout via API backend
console.log("🚗 vehiclemanagement.js chargé");

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

async function fetchVehicles() {
  try {
    const token = requireAuth();
    const resp = await fetch(`${apiUrl}/account/vehicles`, {
      method: "GET",
      headers: apiHeaders(token),
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const list = await resp.json();
    renderVehicles(list);
  } catch (e) {
    console.error("Erreur fetchVehicles:", e);
  }
}

function renderVehicles(list) {
  const container = document.getElementById("vehiclesList");
  if (!container) return;
  container.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML =
      '<div class="alert alert-info">Aucun véhicule pour le moment.</div>';
    return;
  }

  list.forEach((v) => {
    const year = (v.registration_date || "").substring(0, 4);
    const energyLabel =
      (v.energy || "").charAt(0).toUpperCase() + (v.energy || "").slice(1);
    const plate = v.plate_number || "";
    const color = v.color || "";
    const seats = v.seats || 0;
    const title = `${v.brand || ""} ${v.model || ""}`.trim();

    const card = document.createElement("div");
    card.className = "card rounded-4 mb-3";
    card.innerHTML = `
      <div class="card-body p-2 p-md-4">
        <div class="row align-items-center g-2 g-md-3">
          <div class="col-2 col-md-1 text-center">
            <i class="bi bi-car-front fs-4 fs-md-2 text-primary"></i>
          </div>
          <div class="col-7 col-md-8">
            <div class="d-block d-md-none">
              <h6 class="fw-bold mb-0">${escapeHtml(title)}</h6>
              <small class="text-muted">${escapeHtml(year)} • ${escapeHtml(energyLabel)} • ${escapeHtml(color)} • ${escapeHtml(plate)} • ${escapeHtml(String(seats))} places</small>
            </div>
            <div class="d-none d-md-block">
              <h5 class="fw-bold mb-1">${escapeHtml(title)}</h5>
              <p class="text-muted mb-0">${escapeHtml(year)} • ${escapeHtml(energyLabel)} • ${escapeHtml(color)} • ${escapeHtml(plate)} • ${escapeHtml(String(seats))} places disponibles</p>
            </div>
          </div>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

function mapEnergy(ui) {
  switch (ui) {
    case "electric":
      return "electrique";
    case "hybrid":
      return "hybride";
    case "petrol":
      return "essence";
    case "diesel":
      return "diesel";
    default:
      return "essence";
  }
}

async function saveVehicle() {
  try {
    const token = requireAuth();
    const brand = document.getElementById("brand").value.trim();
    const model = document.getElementById("model").value.trim();
    const year = document.getElementById("year").value;
    const fuelType = document.getElementById("fuelType").value;
    const seats = document.getElementById("seats").value;
    const color = document.getElementById("color").value.trim();
    const license = document.getElementById("license").value.trim();

    const energy = mapEnergy(fuelType);
    const registrationDate = year ? `${year}-01-01` : null;

    const payload = {
      brand,
      model,
      color,
      energy,
      plateNumber: license,
      registrationDate,
      seats: Number(seats),
    };

    const resp = await fetch(`${apiUrl}/account/vehicles`, {
      method: "POST",
      headers: apiHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${txt}`);
    }
    // Fermer le modal si présent
    const modalEl = document.getElementById("vehicleModal");
    if (modalEl) {
      const modal =
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }
    // Recharger la liste
    fetchVehicles();
  } catch (e) {
    console.error("Erreur saveVehicle:", e);
    alert("Erreur lors de l'enregistrement du véhicule");
  }
}

function initVehiclePage() {
  const addBtn = document.getElementById("addVehicleBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const modalEl = document.getElementById("vehicleModal");
      if (modalEl) {
        new bootstrap.Modal(modalEl).show();
      }
    });
  }
  fetchVehicles();
}

// Expose saveVehicle to global for inline onclick
if (typeof window !== "undefined") {
  window.saveVehicle = saveVehicle;
}

document.addEventListener("DOMContentLoaded", initVehiclePage);
