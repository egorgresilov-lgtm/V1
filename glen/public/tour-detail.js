let tourId;
let tourData;
let galleryPhotos = [];
let galleryIndex = 0;
let pendingGalleryIndex = 0;
let modalInited = false;
let leafletMap = null;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  tourId = params.get("id");

  if (!tourId) {
    window.location.href = "community-tours.html";
    return;
  }

  await loadTour();
});

async function loadTour() {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`/api/user-tours/community/${tourId}`, {
      headers,
    });
    if (!response.ok) throw new Error("not found");

    tourData = await response.json();
    document.title = `${tourData.title} — Бурятия. Дух места`;

    if (window.AttractionCoordinates) {
      await AttractionCoordinates.ensureLoaded();
    }

    galleryPhotos = buildPhotos(tourData);

    renderCollapsedCard();
    setupModalHandlers();
    setupBookingHandlers();
    setupGalleryControls();

    document.getElementById("tdLoading").style.display = "none";
    document.getElementById("tdContent").style.display = "block";
    const footer = document.getElementById("tdFooter");
    if (footer) footer.style.display = "";
    
    // Automatically open modal with full information
    openModal();
  } catch {
    window.location.href = "community-tours.html";
  }
}

function buildPhotos(data) {
  const photos = [];
  const seen = new Set();

  function addPhoto(title, src) {
    if (!src || seen.has(src)) return;
    seen.add(src);
    photos.push({ title: title || data.title, src });
  }

  addPhoto(data.title, data.main_photo_url);

  for (const point of data.points || []) {
    const name =
      point.destination_name || point.custom_place_name || "Точка маршрута";
    addPhoto(name, point.destination_image);
  }

  if (photos.length === 0) {
    photos.push({
      title: data.title,
      src: "https://picsum.photos/seed/buryatia-tour/1200/800",
    });
  }

  return photos;
}

function getDurationText() {
  const days = tourData.duration_days;
  const nights = Math.max(0, days - 1);
  return nights > 0
    ? `${days} ${pluralDays(days)} / ${nights} ${pluralNights(nights)}`
    : `${days} ${pluralDays(days)}`;
}

function getPriceText() {
  return tourData.price
    ? `${Number(tourData.price).toLocaleString("ru-RU")} ₽`
    : "Бесплатно";
}

function renderHeroRating() {
  const el = document.getElementById("heroRating");
  if (!el) return;

  const avg = parseFloat(tourData.avg_rating || 0);
  const total = (tourData.reviews || []).length;
  el.innerHTML = `
    <span class="star" aria-hidden="true">★</span>
    <span class="score">${avg.toFixed(1)}</span>
    <a href="#reviewsSection" class="reviews-link">${total} ${pluralReviews(total)}</a>
  `;
}

function applyTourMetaFields() {
  const duration = getDurationText();
  const difficulty = getDifficultyName(tourData.difficulty);
  const season = getSeasonName(tourData.season);
  const price = getPriceText();
  const rating = parseFloat(tourData.avg_rating || 0).toFixed(1) + " ★";

  for (const id of ["tcDuration", "heroDuration"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = duration;
  }
  for (const id of ["tcDifficulty", "heroDifficulty"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = difficulty;
  }
  for (const id of ["tcSeason", "heroSeason"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = season;
  }
  for (const id of ["tcPriceNow", "modalPriceNow"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = price;
  }
  for (const id of ["tcPriceOld", "modalPriceOld"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = "";
  }

  const tcRating = document.getElementById("tcRating");
  if (tcRating) tcRating.textContent = rating;

  renderHeroRating();
}

function renderCollapsedCard() {
  document.getElementById("tourTitle").textContent = tourData.title;
  applyTourMetaFields();

  document.getElementById("tcAuthor").textContent =
    tourData.author_name || "Аноним";

  const collapsedPhotos = galleryPhotos.slice(0, 4);
  document.getElementById("thumbsCollapsed").innerHTML = collapsedPhotos
    .map(
      (p, i) => `
        <div class="tc-thumb" data-i="${i}" title="${escapeHtmlAttr(p.title)}">
          <img src="${escapeHtmlAttr(p.src)}" alt="${escapeHtmlAttr(p.title)}" />
        </div>
      `,
    )
    .join("");

  const places = (tourData.points || [])
    .map((p) => p.destination_name || p.custom_place_name)
    .filter(Boolean);

  document.getElementById("tcPlacesChips").innerHTML = places
    .slice(0, 6)
    .map((t) => `<span class="chip">${escapeHtml(t)}</span>`)
    .join("");

  renderMiniMap();
}

function renderMiniMap() {
  const body = document.getElementById("miniMapBody");
  const routePoints = getRoutePoints();

  if (routePoints.length === 0) {
    body.innerHTML =
      '<div class="hint" style="position:static">Координаты маршрута не заданы</div>';
    return;
  }

  const lats = routePoints.map((p) => p.lat);
  const lons = routePoints.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const padX = 12;
  const padY = 18;
  const width = 240;
  const height = 140;

  const coords = routePoints.map((p) => {
    const x =
      padX +
      ((p.lon - minLon) / (maxLon - minLon || 1)) * (width - padX * 2);
    const y =
      padY +
      (1 - (p.lat - minLat) / (maxLat - minLat || 1)) * (height - padY * 2);
    return { ...p, x, y };
  });

  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");

  const dotsHtml = coords
    .map(
      (c) => `
        <div class="mini-dot" style="left:${((c.x / width) * 100).toFixed(1)}%;top:${((c.y / height) * 100).toFixed(1)}%"></div>
        <div class="mini-label" style="left:${((c.x / width) * 100).toFixed(1)}%;top:${((c.y / height) * 100).toFixed(1)}%">${escapeHtml(c.name)}</div>
      `,
    )
    .join("");

  body.innerHTML = `
    <svg class="mini-path" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <path d="${pathD}" fill="none" stroke="#D4A537" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 6" opacity="0.9"/>
    </svg>
    ${dotsHtml}
    <div class="hint">Интерактивная карта откроется в развёрнутом виде</div>
  `;
}

function getRoutePoints() {
  return (tourData.points || [])
    .map((p, idx) => {
      const name =
        p.destination_name || p.custom_place_name || `Точка ${idx + 1}`;
      let lat = p.latitude;
      let lon = p.longitude;

      if ((!lat || !lon) && window.AttractionCoordinates) {
        const c = AttractionCoordinates.resolveTourPoint(p);
        if (c) {
          lat = c.lat;
          lon = c.lng;
        }
      }

      if (!lat || !lon) return null;
      return { name, lat, lon, order: idx + 1 };
    })
    .filter(Boolean);
}

function setupModalHandlers() {
  const tourCard = document.getElementById("tourCard");
  const tourModal = document.getElementById("tourModal");
  const modalBg = document.getElementById("tourModalBg");
  const modalClose = document.getElementById("modalClose");

  // Disable modal closing - always show full view
  // tourCard.addEventListener("click", ...);
  // modalBg.addEventListener("click", closeModal);
  // modalClose.addEventListener("click", closeModal);
  // document.addEventListener("keydown", ...);
}

function openModal() {
  const tourModal = document.getElementById("tourModal");
  tourModal.classList.add("active");
  tourModal.setAttribute("aria-hidden", "false");

  if (modalInited) {
    setGalleryIndex(pendingGalleryIndex);
    try {
      leafletMap?.invalidateSize();
    } catch {}
  } else {
    initModalOnce();
  }
}

function closeModal() {
  const tourModal = document.getElementById("tourModal");
  tourModal.classList.remove("active");
  tourModal.setAttribute("aria-hidden", "true");
}

function setupBookingHandlers() {
  function handleBookClick(e) {
    e?.stopPropagation?.();
    alert("Форма бронирования откроется позже");
  }

  document.getElementById("btnBookTop").addEventListener("click", handleBookClick);
  document.getElementById("btnBookBottom").addEventListener("click", handleBookClick);
}

function setupGalleryControls() {
  document.getElementById("galleryPrev").addEventListener("click", (e) => {
    e.stopPropagation();
    setGalleryIndex(galleryIndex - 1);
  });
  document.getElementById("galleryNext").addEventListener("click", (e) => {
    e.stopPropagation();
    setGalleryIndex(galleryIndex + 1);
  });
}

function setGalleryIndex(i) {
  galleryIndex = (i + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[galleryIndex];

  document.getElementById("galleryMainImg").src = photo.src;
  document.getElementById("galleryMainImg").alt = photo.title;
  document.getElementById("galleryCaption").textContent = photo.title;

  document.querySelectorAll(".tc-g-dot").forEach((d) => d.classList.remove("active"));
  const dot = document.querySelector(`.tc-g-dot[data-i="${galleryIndex}"]`);
  if (dot) dot.classList.add("active");

  document.querySelectorAll(".tc-g-thumb").forEach((t) => t.classList.remove("active"));
  const thumb = document.querySelector(`.tc-g-thumb[data-i="${galleryIndex}"]`);
  if (thumb) thumb.classList.add("active");
}

function renderGalleryUI() {
  setGalleryIndex(pendingGalleryIndex || 0);

  const galleryDots = document.getElementById("galleryDots");
  galleryDots.innerHTML = galleryPhotos
    .map(
      (_, i) =>
        `<button class="tc-g-dot" data-i="${i}" aria-label="Фото ${i + 1}"></button>`,
    )
    .join("");

  galleryDots.querySelectorAll(".tc-g-dot").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setGalleryIndex(Number(e.currentTarget.dataset.i));
    });
  });

  const galleryThumbs = document.getElementById("galleryThumbs");
  galleryThumbs.innerHTML = galleryPhotos
    .map(
      (p, i) => `
        <div class="tc-g-thumb" data-i="${i}" title="${escapeHtmlAttr(p.title)}">
          <img src="${escapeHtmlAttr(p.src)}" alt="${escapeHtmlAttr(p.title)}" />
        </div>
      `,
    )
    .join("");

  galleryThumbs.querySelectorAll(".tc-g-thumb").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      setGalleryIndex(Number(e.currentTarget.dataset.i));
    });
  });
}

function buildItinerary() {
  const points = tourData.points || [];
  const days = Math.max(1, tourData.duration_days || 1);

  if (points.length === 0) {
    return [
      {
        day: "Маршрут",
        title: "Точки не добавлены",
        text: "Автор ещё не указал остановки маршрута.",
      },
    ];
  }

  const perDay = Math.ceil(points.length / days);
  const itinerary = [];

  for (let d = 0; d < days; d++) {
    const dayPoints = points.slice(d * perDay, (d + 1) * perDay);
    if (dayPoints.length === 0) break;

    const title = dayPoints
      .map((p) => p.destination_name || p.custom_place_name || "Остановка")
      .join(" — ");

    const text = dayPoints
      .map((p, i) => {
        const name =
          p.destination_name || p.custom_place_name || `Точка ${i + 1}`;
        const desc = p.destination_description || p.custom_description || "";
        const stay = p.stay_hours
          ? `\n⏱ ${p.stay_hours} ${pluralHours(p.stay_hours)}`
          : "";
        return desc ? `${name}${stay}\n${desc}` : `${name}${stay}`;
      })
      .join("\n\n");

    itinerary.push({
      day: days > 1 ? `День ${d + 1}` : "Маршрут",
      title,
      text,
    });
  }

  return itinerary;
}

function renderItinerary() {
  const el = document.getElementById("itinerary");
  el.innerHTML = buildItinerary()
    .map(
      (d) => `
        <div class="day-card">
          <div class="day-head">
            <span style="color: var(--gold); font-weight:900;">●</span>
            ${escapeHtml(d.day)} — ${escapeHtml(d.title)}
          </div>
          <div class="day-body">${escapeHtmlRichText(d.text)}</div>
        </div>
      `,
    )
    .join("");
}

function renderPlaces() {
  const el = document.getElementById("placesGrid");
  if (!el) return;

  const places = (tourData.points || [])
    .map((p) => ({
      name: p.destination_name || p.custom_place_name || "Место",
      image: p.destination_image || "https://picsum.photos/seed/place/140/100",
    }))
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i);

  el.innerHTML = places
    .map(
      (p) => `
        <div class="place-card">
          <img src="${escapeHtmlAttr(p.image)}" alt="${escapeHtmlAttr(p.name)}" />
          <div class="place-card-title">${escapeHtml(p.name)}</div>
        </div>
      `,
    )
    .join("");
}

function renderDescription() {
  const el = document.getElementById("fullDescription");
  const text =
    tourData.full_desc ||
    tourData.short_desc ||
    "Описание тура пока не добавлено.";
  el.textContent = text;
  el.style.whiteSpace = "pre-wrap";
}

function renderReviews() {
  renderHeroRating();

  const avg = parseFloat(tourData.avg_rating || 0);
  const reviews = tourData.reviews || [];
  const total = reviews.length;

  document.getElementById("reviewSummary").innerHTML = `
    <div class="review-score">
      <div class="num">${avg.toFixed(1)}</div>
      <div class="stars">${"★".repeat(Math.round(avg) || 0)}${"☆".repeat(5 - (Math.round(avg) || 0))}</div>
    </div>
    <div class="meta">
      <div class="small">Средняя оценка</div>
      <div class="title">${avg.toFixed(1)} ★ • ${total} ${pluralReviews(total)}</div>
    </div>
  `;

  const elList = document.getElementById("reviewsList");
  if (reviews.length === 0) {
    elList.innerHTML =
      '<p style="color:var(--muted);font-size:14px;margin:0">Отзывов пока нет — будьте первым!</p>';
    return;
  }

  elList.innerHTML = reviews
    .map((rv) => {
      const date = new Date(rv.created_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `
        <div class="review-card">
          <div class="top">
            <div class="name">${escapeHtml(rv.author_name || "Аноним")}</div>
            <div class="date">${escapeHtml(date)}</div>
          </div>
          <div class="text">${escapeHtmlRichText(rv.text)}</div>
        </div>
      `;
    })
    .join("");
}

function renderModalHeader() {
  document.getElementById("modalTitle").textContent = tourData.title;

  const heroTitle = document.getElementById("heroTitle");
  if (heroTitle) heroTitle.textContent = tourData.title;

  applyTourMetaFields();
}

async function initLeafletMap() {
  if (leafletMap) return;

  if (window.AttractionCoordinates) {
    await AttractionCoordinates.ensureLoaded();
  }

  const routePoints = getRoutePoints();
  const mapEl = document.getElementById("leafletMap");

  if (routePoints.length === 0) {
    mapEl.innerHTML =
      '<p style="text-align:center;padding:2rem;color:var(--muted)">Координаты точек не заданы</p>';
    return;
  }

  const first = routePoints[0];
  leafletMap = L.map("leafletMap", { scrollWheelZoom: false }).setView(
    [first.lat, first.lon],
    8,
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap",
  }).addTo(leafletMap);

  const latlngs = routePoints.map((p) => [p.lat, p.lon]);
  L.polyline(latlngs, {
    color: "#D4A537",
    weight: 4,
    opacity: 0.95,
    dashArray: "7 7",
  }).addTo(leafletMap);

  routePoints.forEach((p, idx) => {
    const marker = L.circleMarker([p.lat, p.lon], {
      radius: 8,
      color: "#1A4D5A",
      weight: 2,
      fillColor: "#D4A537",
      fillOpacity: 0.9,
    }).addTo(leafletMap);

    marker.bindPopup(
      `<div style="font-weight:800;color:#1A4D5A;">${escapeHtml(p.name)}</div><div style="color:#2a4750;font-size:13px;">Точка ${idx + 1}</div>`,
    );
  });

  leafletMap.fitBounds(latlngs, { padding: [20, 20] });
}

function initRatingStars() {
  const stars = document.querySelectorAll("#ratingStars .star-btn");
  stars.forEach((star) => {
    star.addEventListener("click", () =>
      submitRating(parseInt(star.dataset.rating, 10)),
    );
    star.addEventListener("mouseenter", () =>
      highlightStars(parseInt(star.dataset.rating, 10)),
    );
  });

  document.getElementById("ratingStars").addEventListener("mouseleave", () => {
    highlightStars(tourData?.user_rating || 0);
  });

  highlightStars(tourData?.user_rating || 0);
}

function highlightStars(rating) {
  document.querySelectorAll("#ratingStars .star-btn").forEach((star) => {
    star.classList.toggle(
      "active",
      parseInt(star.dataset.rating, 10) <= rating,
    );
  });

  const hint = document.getElementById("userRatingText");
  if (tourData?.user_rating) {
    hint.textContent = `Ваша оценка: ${tourData.user_rating} из 5`;
  } else if (rating > 0) {
    hint.textContent = `Выберите оценку: ${rating} из 5`;
  } else {
    hint.textContent = "Нажмите на звезду, чтобы оценить маршрут";
  }
}

async function submitRating(rating) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Для оценки необходимо войти в систему");
    return;
  }

  try {
    const res = await fetch(`/api/user-tours/community/${tourId}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating }),
    });
    if (res.ok) {
      tourData.user_rating = rating;
      highlightStars(rating);
    }
  } catch {}
}

function setupReviewForm() {
  const token = localStorage.getItem("token");
  const btnSubmit = document.getElementById("btnSubmitReview");
  const reviewText = document.getElementById("reviewText");
  const authNote = document.getElementById("reviewAuthNote");

  if (token) {
    reviewText.disabled = false;
    btnSubmit.disabled = false;
    authNote.textContent = "";
    btnSubmit.addEventListener("click", submitReview);
  } else {
    reviewText.placeholder = "Войдите, чтобы оставить отзыв…";
    btnSubmit.addEventListener("click", () =>
      alert("Войдите в систему, чтобы оставить отзыв"),
    );
  }
}

async function submitReview() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Войдите в систему, чтобы оставить отзыв");
    return;
  }

  const text = document.getElementById("reviewText").value.trim();
  if (!text) {
    alert("Напишите текст отзыва");
    return;
  }

  try {
    const res = await fetch(`/api/user-tours/community/${tourId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      document.getElementById("reviewText").value = "";
      const response = await fetch(`/api/user-tours/community/${tourId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const updated = await response.json();
        tourData.reviews = updated.reviews;
        tourData.avg_rating = updated.avg_rating;
        renderReviews();
        applyTourMetaFields();
      }
    }
  } catch {}
}

function initModalOnce() {
  if (modalInited) {
    try {
      leafletMap?.invalidateSize();
    } catch {}
    return;
  }

  modalInited = true;
  renderModalHeader();
  renderGalleryUI();
  renderPlaces();
  renderItinerary();
  renderDescription();
  renderReviews();
  initRatingStars();
  setupReviewForm();
  initLeafletMap();
}

window.addEventListener("resize", () => {
  try {
    leafletMap?.invalidateSize();
  } catch {}
});

function pluralDays(n) {
  const m = n % 10;
  const c = n % 100;
  if (m === 1 && c !== 11) return "день";
  if ([2, 3, 4].includes(m) && ![12, 13, 14].includes(c)) return "дня";
  return "дней";
}

function pluralNights(n) {
  const m = n % 10;
  const c = n % 100;
  if (m === 1 && c !== 11) return "ночь";
  if ([2, 3, 4].includes(m) && ![12, 13, 14].includes(c)) return "ночи";
  return "ночей";
}

function pluralHours(n) {
  const m = n % 10;
  const c = n % 100;
  if (m === 1 && c !== 11) return "час";
  if ([2, 3, 4].includes(m) && ![12, 13, 14].includes(c)) return "часа";
  return "часов";
}

function pluralReviews(n) {
  const m = n % 10;
  const c = n % 100;
  if (m === 1 && c !== 11) return "отзыв";
  if ([2, 3, 4].includes(m) && ![12, 13, 14].includes(c)) return "отзыва";
  return "отзывов";
}

function getDifficultyName(d) {
  return { easy: "Лёгкая", medium: "Средняя", hard: "Сложная" }[d] || d;
}

function getSeasonName(s) {
  return (
    { summer: "Лето", winter: "Зима", "year-round": "Круглый год" }[s] || s
  );
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(s) {
  return escapeHtml(s);
}

function escapeHtmlRichText(text) {
  return escapeHtml(text).replaceAll("\n", "<br/>");
}
