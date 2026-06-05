let allTours = [];
let ctMap = null; // active OpenLayers map instance

const ctOverlay = document.getElementById("ctOverlay");
const ctDetail = document.getElementById("ctDetail");

document.addEventListener("DOMContentLoaded", () => {
  loadTours();

  // Close on backdrop click
  ctOverlay.addEventListener("click", (e) => {
    if (e.target === ctOverlay) closeTour();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ctOverlay.classList.contains("active"))
      closeTour();
  });
});

/* ─────────────── Load & filter ─────────────── */

async function loadTours(filter = "all") {
  const grid = document.getElementById("toursGrid");
  grid.innerHTML = `
        <div class="state-box">
            <div class="spinner-ring"></div>
            <p>Загружаем маршруты...</p>
        </div>`;

  try {
    let url = "/api/user-tours/community";
    const params = [];
    if (["easy", "medium", "hard"].includes(filter))
      params.push(`difficulty=${filter}`);
    else if (["summer", "winter", "year-round"].includes(filter))
      params.push(`season=${filter}`);
    if (params.length) url += "?" + params.join("&");

    const res = await fetch(url);
    allTours = await res.json();
    renderTours();
    updateStats();
  } catch (err) {
    console.error(err);
    grid.innerHTML = `
            <div class="state-box">
                <div class="state-icon">⚠️</div>
                <h3>Не удалось загрузить туры</h3>
                <p>Попробуйте обновить страницу</p>
            </div>`;
  }
}

function filterTours(filter) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  event.target.classList.add("active");
  loadTours(filter);
}

function updateStats() {
  fetch("/api/user-tours/community")
    .then((r) => r.json())
    .then((tours) => {
      animateCount("statTotal", tours.length);
      animateCount(
        "statEasy",
        tours.filter((t) => t.difficulty === "easy").length,
      );
      animateCount(
        "statMedium",
        tours.filter((t) => t.difficulty === "medium").length,
      );
      animateCount(
        "statHard",
        tours.filter((t) => t.difficulty === "hard").length,
      );
    })
    .catch(() => {});
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(t);
  }, 30);
}

/* ─────────────── Render grid ─────────────── */

function renderTours() {
  const grid = document.getElementById("toursGrid");

  if (!allTours.length) {
    grid.innerHTML = `
            <div class="state-box">
                <div class="state-icon">🗺️</div>
                <h3>Маршрутов пока нет</h3>
                <p>Станьте первым — создайте маршрут в конструкторе!</p>
            </div>`;
    return;
  }

  grid.innerHTML = allTours
    .map((tour) => {
      const diffLabel = getDifficultyName(tour.difficulty);
      const seasonLabel = getSeasonName(tour.season);
      const rating = parseFloat(tour.avg_rating || 0).toFixed(1);
      const image = tour.main_photo_url
        ? `<img src="${tour.main_photo_url}" alt="${escHtml(tour.title)}"
                    style="width:100%;height:200px;object-fit:cover;"
                    onerror="this.parentNode.innerHTML='<div class=card-image-placeholder>🗺️</div>'">`
        : `<div class="card-image-placeholder">🗺️</div>`;

      return `
        <article class="community-card" onclick="window.location.href='tour-detail.html?id=${tour.id}'">
            ${image}
            <div class="card-body">
                <div class="card-badges">
                    <span class="badge badge-${tour.difficulty}">${diffLabel}</span>
                    <span class="badge badge-season">${seasonLabel}</span>
                </div>
                <h3 class="card-title">${escHtml(tour.title)}</h3>
                <p class="card-desc">${escHtml(tour.short_desc || "")}</p>
                <div class="card-footer">
                    <div class="card-meta-left">
                        <span class="card-author">👤 ${escHtml(tour.author_name || "Аноним")}</span>
                        <span class="card-duration">⏱ ${tour.duration_days} ${pluralDays(tour.duration_days)}</span>
                    </div>
                    <div class="card-rating"><span>★</span>${rating}</div>
                </div>
            </div>
        </article>`;
    })
    .join("");
}

/* ─────────────── Overlay ─────────────── */

async function openTour(id) {
  // Show overlay with spinner
  ctDetail.innerHTML = `
        <button class="routes-tour-close" onclick="closeTour()">×</button>
        <div style="text-align:center;padding:4rem 2rem;">
            <div class="spinner-ring" style="margin:0 auto 1rem;"></div>
            <p style="color:var(--text-secondary);">Загружаем маршрут...</p>
        </div>`;
  ctOverlay.classList.add("active");
  ctOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  try {
    const res = await fetch(`/api/user-tours/community/${id}`);
    if (!res.ok) throw new Error("not found");
    const tour = await res.json();
    renderTourOverlay(tour);
  } catch (e) {
    ctDetail.innerHTML = `
            <button class="routes-tour-close" onclick="closeTour()">×</button>
            <div style="text-align:center;padding:4rem 2rem;">
                <div style="font-size:3rem;">⚠️</div>
                <h3 style="margin:1rem 0 0.5rem;">Ошибка загрузки</h3>
                <p style="color:var(--text-secondary);">Попробуйте ещё раз</p>
            </div>`;
  }
}

function renderTourOverlay(tour) {
  const rating = parseFloat(tour.avg_rating || 0).toFixed(1);
  const heroImg = tour.main_photo_url
    ? `<img src="${tour.main_photo_url}" alt="${escHtml(tour.title)}"
                style="width:100%;height:280px;object-fit:cover;border-radius:28px 28px 0 0;display:block;"
                onerror="this.style.display='none'">`
    : `<div style="width:100%;height:200px;background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 50%,var(--accent-gold) 100%);
                border-radius:28px 28px 0 0;display:flex;align-items:center;justify-content:center;font-size:4rem;">🗺️</div>`;

  const pointsHtml =
    !tour.points || !tour.points.length
      ? `<p style="color:var(--text-secondary);padding:1rem 0;">Точки маршрута не добавлены</p>`
      : `<div class="routes-stages-scroll">
            ${tour.points
              .map((p, i) => {
                const name = escHtml(
                  p.destination_name || p.custom_place_name || `Точка ${i + 1}`,
                );
                const desc = escHtml(
                  p.destination_description || p.custom_description || "",
                );
                const img = p.destination_image
                  ? `background-image:url('${p.destination_image}')`
                  : `background:linear-gradient(135deg,var(--primary-light),var(--accent-gold))`;
                return `
                <article class="routes-stage-card">
                    <div class="routes-stage-image" style="${img}"></div>
                    <h3>${i + 1}. ${name}</h3>
                    <p class="routes-stage-coords">⏱ ${p.stay_hours} ${pluralHours(p.stay_hours)}</p>
                    ${desc ? `<p>${desc}</p>` : ""}
                </article>`;
              })
              .join("")}
           </div>`;

  const reviewsHtml =
    !tour.reviews || !tour.reviews.length
      ? `<p style="color:var(--text-secondary);font-size:0.9rem;">Отзывов пока нет</p>`
      : tour.reviews
          .map(
            (r) => `
            <div style="padding:0.9rem 0;border-bottom:1px solid var(--bg-secondary);">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
                    <strong style="font-size:0.9rem;font-family:var(--font-heading);">👤 ${escHtml(r.author_name || "Аноним")}</strong>
                    <span style="font-size:0.78rem;color:var(--text-light);">${new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <p style="font-size:0.88rem;color:var(--text-secondary);margin:0;">${escHtml(r.text)}</p>
            </div>`,
          )
          .join("");

  ctDetail.innerHTML = `
        <button class="routes-tour-close" onclick="closeTour()">×</button>

        ${heroImg}

        <div style="padding:1.8rem 2rem 0.5rem;">
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.9rem;">
                <span class="badge badge-${tour.difficulty}">${getDifficultyName(tour.difficulty)}</span>
                <span class="badge badge-season">${getSeasonName(tour.season)}</span>
            </div>

            <h2 style="font-size:clamp(1.4rem,3vw,2rem);font-family:var(--font-heading);font-weight:800;
                       color:var(--text-primary);margin:0 0 0.5rem;">${escHtml(tour.title)}</h2>

            <p style="color:var(--text-secondary);font-size:1rem;line-height:1.6;margin:0 0 1.2rem;">
                ${escHtml(tour.short_desc || "")}</p>

            <div style="display:flex;gap:0.7rem;flex-wrap:wrap;margin-bottom:1.4rem;">
                <span class="routes-tour-duration">⏱ ${tour.duration_days} ${pluralDays(tour.duration_days)}</span>
                <span class="routes-tour-duration">★ ${rating}</span>
                <span class="routes-tour-duration">👤 ${escHtml(tour.author_name || "Аноним")}</span>
                ${tour.price ? `<span class="routes-tour-duration">💰 ${Number(tour.price).toLocaleString("ru-RU")} ₽</span>` : ""}
            </div>

            ${
              tour.full_desc
                ? `<p style="font-size:0.95rem;color:var(--text-secondary);line-height:1.75;
                border-top:1px solid var(--bg-secondary);padding-top:1.2rem;margin-bottom:1.4rem;">
                ${escHtml(tour.full_desc)}</p>`
                : ""
            }
        </div>

        <div style="padding:0 2rem 1rem;">
            <h3 class="routes-stages-title">🗺 Карта маршрута</h3>
            <div id="ctTourMap" style="height:300px;border-radius:20px;overflow:hidden;
                 border:2px solid var(--bg-secondary);margin-bottom:0.5rem;"></div>
        </div>

        <div style="padding:0 2rem 1rem;">
            <h3 class="routes-stages-title">📍 Точки маршрута</h3>
            ${pointsHtml}
        </div>

        <div style="padding:0 2rem 1.5rem;">
            <h3 class="routes-stages-title">💬 Отзывы</h3>
            ${reviewsHtml}
        </div>
    `;

  // Init map after DOM is updated
  setTimeout(() => {
    initTourMap(tour.points || []).catch((err) =>
      console.error("[CT MAP]", err),
    );
  }, 50);
}

function closeTour() {
  // Destroy map instance before removing DOM node
  if (ctMap) {
    ctMap.setTarget(null);
    ctMap = null;
  }
  ctOverlay.classList.remove("active");
  ctOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ─────────────── Map ─────────────── */

async function initTourMap(points) {
  const mapEl = document.getElementById("ctTourMap");
  if (!mapEl || !window.ol) return;

  if (window.AttractionCoordinates) {
    await AttractionCoordinates.ensureLoaded();
  }

  // [lon, lat] — same coordinates as on the attractions page
  const coords = [];
  for (const p of points) {
    const c = window.AttractionCoordinates
      ? AttractionCoordinates.resolveTourPoint(p)
      : p.latitude && p.longitude
        ? { lat: p.latitude, lng: p.longitude }
        : null;
    if (c) coords.push([c.lng, c.lat]);
  }

  if (coords.length === 0) {
    mapEl.innerHTML =
      '<p style="text-align:center;padding:1.5rem;color:var(--text-secondary)">Координаты точек не заданы</p>';
    return;
  }

  const projected = coords.map((c) => ol.proj.fromLonLat(c));

  // Route line
  const routeFeature = new ol.Feature({
    geometry: new ol.geom.LineString(projected),
  });
  routeFeature.setStyle(
    new ol.style.Style({
      stroke: new ol.style.Stroke({ color: "#E8B960", width: 4 }),
    }),
  );

  // Numbered markers
  const markerFeatures = projected.map((pt, i) => {
    const f = new ol.Feature({ geometry: new ol.geom.Point(pt) });
    f.setStyle(
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({ color: "#2C5F7C" }),
          stroke: new ol.style.Stroke({ color: "#FFFFFF", width: 2 }),
        }),
        text: new ol.style.Text({
          text: String(i + 1),
          fill: new ol.style.Fill({ color: "#FFFFFF" }),
          font: "bold 11px sans-serif",
          offsetY: 1,
        }),
      }),
    );
    return f;
  });

  const vectorSource = new ol.source.Vector({
    features: [routeFeature, ...markerFeatures],
  });

  // Destroy previous instance if any
  if (ctMap) {
    ctMap.setTarget(null);
    ctMap = null;
  }

  ctMap = new ol.Map({
    target: "ctTourMap",
    layers: [
      new ol.layer.Tile({ source: new ol.source.OSM() }),
      new ol.layer.Vector({ source: vectorSource }),
    ],
    view: new ol.View({ center: projected[0], zoom: 7 }),
  });

  // Fit view to show entire route
  if (projected.length > 1) {
    ctMap.getView().fit(routeFeature.getGeometry().getExtent(), {
      padding: [40, 40, 40, 40],
      duration: 400,
    });
  }
}

/* ─────────────── Helpers ─────────────── */

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pluralDays(n) {
  const m = n % 10,
    c = n % 100;
  if (m === 1 && c !== 11) return "день";
  if ([2, 3, 4].includes(m) && ![12, 13, 14].includes(c)) return "дня";
  return "дней";
}

function pluralHours(n) {
  const m = n % 10,
    c = n % 100;
  if (m === 1 && c !== 11) return "час";
  if ([2, 3, 4].includes(m) && ![12, 13, 14].includes(c)) return "часа";
  return "часов";
}

function getDifficultyName(d) {
  return { easy: "Лёгкий", medium: "Средний", hard: "Сложный" }[d] || d;
}

function getSeasonName(s) {
  return (
    { summer: "Лето", winter: "Зима", "year-round": "Круглый год" }[s] || s
  );
}
