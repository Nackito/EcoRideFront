// Remplit la page Informations personnelles depuis /api/account/me et masque les blocs de démo
console.log("👤 personalinfo.js chargé");

function requireAuth() {
  const token = typeof getToken === "function" ? getToken() : null;
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

async function loadAccount() {
  try {
    const token = requireAuth();
    let info = {};

    // Base: données SQL via /account/me (pseudo, email, createdAt, credits, isSuspended)
    let respMe = await fetch(`${apiUrl}/account/me`, {
      method: "GET",
      headers: apiHeaders(token),
    });
    if (respMe.ok) {
      info = await respMe.json();
    }

    // Extras: profil étendu via /account/profile (firstName, lastName, phone, birthDate, bio)
    let respProfile = await fetch(`${apiUrl}/account/profile`, {
      method: "GET",
      headers: apiHeaders(token),
    });
    if (respProfile.ok) {
      const profileData = await respProfile.json();
      info = { ...info, ...profileData };
    }

    if (!respMe.ok && !respProfile.ok) {
      const txt = await (respMe.ok ? respProfile.text() : respMe.text());
      throw new Error(`HTTP ${respMe.status}/${respProfile.status}: ${txt}`);
    }

    renderPersonalInfo(info);
  } catch (e) {
    console.error("Erreur loadAccount:", e);
  }
}

function renderPersonalInfo(info) {
  // Masquer les blocs de démo si présents
  // (mobile + desktop dans la première carte)
  document
    .querySelectorAll(
      ".personal-info-page .card .d-block.d-md-none, .personal-info-page .card .d-none.d-md-block",
    )
    .forEach((el) => el.classList.add("d-none"));

  // Mettre à jour le header supérieur
  const headerContainer = document.querySelector(
    ".personal-info-page .container.pt-2.pb-2.hover-bg .row .col div",
  );
  if (headerContainer) {
    const displayName =
      info.pseudo || (info.email ? info.email.split("@")[0] : "Utilisateur");
    const memberSince = formatMembershipDate(info.createdAt);
    headerContainer.innerHTML = `
      <h3 class="mb-1">${escapeHtml(displayName)}</h3>
      ${memberSince ? `<p class="mb-0">Membre depuis ${escapeHtml(memberSince)}</p>` : ""}
    `;
  }

  // Injecter un bloc dynamique avec les infos clés
  const dynamicId = "personal-info-dynamic";
  let dynamic = document.getElementById(dynamicId);
  if (!dynamic) {
    dynamic = document.createElement("div");
    dynamic.id = dynamicId;
    dynamic.className = "card rounded-4 mb-4";
    // Insérer après la première carte si possible
    const firstCard = document.querySelector(".personal-info-page .card");
    if (firstCard && firstCard.parentElement) {
      firstCard.parentElement.insertBefore(dynamic, firstCard.nextSibling);
    } else {
      document.querySelector(".personal-info-page").appendChild(dynamic);
    }
  }

  const createdLabel = formatMembershipDate(info.createdAt);
  const fullName = [info.firstName, info.lastName].filter(Boolean).join(" ");
  const pseudo = info.pseudo || "—";
  const email = info.email || "—";
  const credits = typeof info.credits === "number" ? info.credits : "—";
  const isSuspended = !!info.isSuspended;

  dynamic.innerHTML = `
    <div class="card-body p-md-4">
      <div class="row mb-3 align-items-end">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Pseudo</h6></div>
        <div class="col-12 col-sm-5"><input id="pi-pseudo" class="form-control" value="${escapeHtml(pseudo)}" /></div>
        <div class="col-12 col-sm-3 mt-2 mt-sm-0"><button id="pi-save-pseudo" class="btn btn-outline-primary w-100">Sauvegarder le pseudo</button></div>
      </div>
      <hr class="my-2" />
      <div class="row mb-3">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Prénom</h6></div>
        <div class="col-12 col-sm-8"><input id="pi-firstName" class="form-control" value="${escapeHtml(info.firstName || "")}" disabled /></div>
      </div>
      <div class="row mb-3">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Nom</h6></div>
        <div class="col-12 col-sm-8"><input id="pi-lastName" class="form-control" value="${escapeHtml(info.lastName || "")}" disabled /></div>
      </div>
      <div class="row mb-3">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Téléphone</h6></div>
        <div class="col-12 col-sm-8"><input id="pi-phone" class="form-control" value="${escapeHtml(info.phone || "")}" disabled /></div>
      </div>
      <div class="row mb-3">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Date de naissance</h6></div>
        <div class="col-12 col-sm-8"><input id="pi-birthDate" type="date" class="form-control" value="${escapeHtml(info.birthDate || "")}" disabled /></div>
      </div>
      <div class="row mb-3">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Bio</h6></div>
        <div class="col-12 col-sm-8"><textarea id="pi-bio" class="form-control" rows="3" disabled>${escapeHtml(info.bio || "")}</textarea></div>
      </div>
      <div class="d-flex justify-content-end gap-2">
        <button id="pi-edit" class="btn btn-outline-secondary">Modifier mes informations</button>
        <button id="pi-save" class="btn btn-primary d-none">Sauvegarder</button>
      </div>
      <hr class="my-3" />
      <div class="row mb-2">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Email</h6></div>
        <div class="col-12 col-sm-8"><p class="mb-0">${escapeHtml(email)}</p></div>
      </div>
      <div class="row mb-2">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Crédits</h6></div>
        <div class="col-12 col-sm-8"><p class="mb-0">${escapeHtml(String(credits))}</p></div>
      </div>
      <div class="row mb-2">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Statut</h6></div>
        <div class="col-12 col-sm-8">
          ${
            isSuspended
              ? '<span class="badge bg-danger">Suspendu</span>'
              : '<span class="badge bg-success">Actif</span>'
          }
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Date d'inscription</h6></div>
        <div class="col-12 col-sm-8"><p class="mb-0">${escapeHtml(createdLabel)}</p></div>
      </div>
    </div>
  `;

  const saveBtn = document.getElementById("pi-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveProfile);
  }
  const savePseudoBtn = document.getElementById("pi-save-pseudo");
  if (savePseudoBtn) {
    savePseudoBtn.addEventListener("click", savePseudo);
  }
  const editBtn = document.getElementById("pi-edit");
  if (editBtn) {
    editBtn.addEventListener("click", enableEditMode);
  }
}

function formatMembershipDate(createdAt) {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function computeAge(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const age = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return age;
}

function initPersonalInfoPage() {
  // Relier les boutons globaux
  const globalMobileBtn = document.getElementById("pi-edit-global-mobile");
  if (globalMobileBtn)
    globalMobileBtn.addEventListener("click", enableEditMode);
  const globalDesktopBtn = document.getElementById("pi-edit-global-desktop");
  if (globalDesktopBtn)
    globalDesktopBtn.addEventListener("click", enableEditMode);

  // Charger informations utilisateur + véhicules
  loadAccount();
  loadVehicles();
}

async function saveProfile() {
  try {
    const token = requireAuth();
    const payload = {
      firstName: document.getElementById("pi-firstName").value.trim(),
      lastName: document.getElementById("pi-lastName").value.trim(),
      phone: document.getElementById("pi-phone").value.trim(),
      birthDate: document.getElementById("pi-birthDate").value,
      bio: document.getElementById("pi-bio").value.trim(),
    };

    const resp = await fetch(`${apiUrl}/account/profile`, {
      method: "POST",
      headers: apiHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${txt}`);
    }
    alert("Profil mis à jour");
    // Recharger l'affichage
    loadAccount();
  } catch (e) {
    console.error("Erreur saveProfile:", e);
    alert("Erreur lors de la mise à jour du profil");
  }
}

async function savePseudo() {
  try {
    const token = requireAuth();
    const pseudo = document.getElementById("pi-pseudo").value.trim();
    if (!pseudo) {
      alert("Le pseudo est requis");
      return;
    }
    const resp = await fetch(`${apiUrl}/account/pseudo`, {
      method: "POST",
      headers: apiHeaders(token),
      body: JSON.stringify({ pseudo }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${txt}`);
    }
    alert("Pseudo mis à jour");
    // Rafraîchir affichage et header
    if (typeof getInfoUser === "function") {
      getInfoUser();
    }
    loadAccount();
  } catch (e) {
    console.error("Erreur savePseudo:", e);
    alert("Erreur lors de la mise à jour du pseudo");
  }
}

// Appel direct pour SPA: le script est injecté après le contenu
initPersonalInfoPage();

function enableEditMode() {
  ["pi-firstName", "pi-lastName", "pi-phone", "pi-birthDate", "pi-bio"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    },
  );
  const saveBtn = document.getElementById("pi-save");
  if (saveBtn) saveBtn.classList.remove("d-none");
}

async function loadVehicles() {
  try {
    const token = requireAuth();
    const resp = await fetch(`${apiUrl}/account/vehicles`, {
      method: "GET",
      headers: apiHeaders(token),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${txt}`);
    }
    const vehicles = await resp.json();
    renderVehicles(Array.isArray(vehicles) ? vehicles : []);
  } catch (e) {
    console.error("Erreur loadVehicles:", e);
    renderVehicles([]);
  }
}

function renderVehicles(vehicles) {
  const container = document.getElementById("pi-vehicles-container");
  if (!container) return;

  if (!vehicles || vehicles.length === 0) {
    container.innerHTML = `
      <div class="text-center p-3 bg-light rounded-3">
        <p class="mb-2 text-muted">Aucun véhicule enregistré pour le moment.</p>
        <a href="/vehiclemanagement" class="btn btn-primary"><i class="bi bi-plus-lg me-2"></i>Ajouter un véhicule</a>
      </div>
    `;
    return;
  }

  const rows = vehicles
    .map((v) => {
      const brand = escapeHtml(v.brand || "");
      const model = escapeHtml(v.model || "");
      const color = escapeHtml(v.color || "");
      const energy = escapeHtml(v.energy || "");
      const plate = escapeHtml(v.plate_number || "");
      const seats = typeof v.seats === "number" ? v.seats : "";
      const regDate = v.registration_date
        ? new Date(v.registration_date)
        : null;
      const year =
        regDate && !isNaN(regDate.getTime()) ? regDate.getFullYear() : "—";

      return `
        <div class="row align-items-center mb-3">
          <div class="col-md-3 text-center mb-2 mb-md-0">
            <i class="bi bi-car-front display-6 text-secondary"></i>
          </div>
          <div class="col-md-9">
            <div class="row mb-2">
              <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Véhicule</h6></div>
              <div class="col-12 col-sm-8"><p class="mb-0">${brand} ${model}</p></div>
            </div>
            <hr class="my-2" />
            <div class="row mb-2">
              <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Année</h6></div>
              <div class="col-12 col-sm-8"><p class="mb-0">${escapeHtml(String(year))}</p></div>
            </div>
            <hr class="my-2" />
            <div class="row mb-2">
              <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Couleur</h6></div>
              <div class="col-12 col-sm-8"><p class="mb-0">${color || "—"}</p></div>
            </div>
            <hr class="my-2" />
            <div class="row mb-2">
              <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Type</h6></div>
              <div class="col-12 col-sm-8"><span class="badge bg-info">${energy || "—"}</span></div>
            </div>
            <hr class="my-2" />
            <div class="row mb-2">
              <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Immatriculation</h6></div>
              <div class="col-12 col-sm-8"><p class="mb-0">${plate || "—"}</p></div>
            </div>
            <hr class="my-2" />
            <div class="row mb-2">
              <div class="col-12 col-sm-4"><h6 class="fw-semibold text-secondary">Nombre de places</h6></div>
              <div class="col-12 col-sm-8"><p class="mb-0">${escapeHtml(String(seats || "—"))}</p></div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = rows;
}
