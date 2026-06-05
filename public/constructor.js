let currentStep = 1;
let map;
let markersLayer, routeLayer;
let selectedPoints = [];
let destinations = [];
let tourData = {};

// Check authentication on load
document.addEventListener('DOMContentLoaded', async () => {
    // Load destinations from API
    await loadDestinations();
    initMap();
    initSortable();
});

async function loadDestinations() {
    try {
        const response = await fetch('/api/destinations');
        destinations = await response.json();

        if (window.AttractionCoordinates) {
            await AttractionCoordinates.ensureLoaded();
            destinations = destinations.map((dest) =>
                AttractionCoordinates.applyToDestination(dest)
            );
        }

        renderDestinationsList();
    } catch (error) {
        console.error('Error loading destinations:', error);
        document.getElementById('destinationsList').innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Ошибка загрузки достопримечательностей</p>';
    }
}

function renderDestinationsList() {
    const list = document.getElementById('destinationsList');
    if (!list) return;

    if (destinations.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Нет доступных достопримечательностей</p>';
        return;
    }

    list.innerHTML = destinations.map(dest => `
        <div class="destination-item" data-id="${dest.id}" onclick="toggleDestination(${dest.id})">
            <img src="${dest.image_url || '/placeholder.jpg'}" alt="${dest.name_ru}">
            <div class="destination-item-info">
                <h4>${dest.name_ru}</h4>
                <p>${dest.description_ru?.substring(0, 60) || ''}...</p>
            </div>
            <div class="checkbox"></div>
        </div>
    `).join('');
}

function toggleDestination(destId) {
    const dest = destinations.find(d => d.id === destId);
    if (!dest) return;

    // Check if already added
    const existingIndex = selectedPoints.findIndex(p => p.destination_id === dest.id);

    if (existingIndex !== -1) {
        // Remove point
        selectedPoints.splice(existingIndex, 1);
        selectedPoints.forEach((p, i) => p.order_index = i);
    } else {
        // Add point
        selectedPoints.push({
            destination_id: dest.id,
            order_index: selectedPoints.length,
            stay_hours: 2,
            name: dest.name_ru,
            description: dest.description_ru,
            image: dest.image_url,
            coordinates: dest.coordinates
        });
    }

    renderPointsList();
    updateDestinationsListState();
    updateRoute();
}

function updateDestinationsListState() {
    document.querySelectorAll('.destination-item').forEach(item => {
        const destId = parseInt(item.dataset.id);
        const checkbox = item.querySelector('.checkbox');
        if (selectedPoints.find(p => p.destination_id === destId)) {
            item.classList.add('added');
            checkbox.classList.add('checked');
        } else {
            item.classList.remove('added');
            checkbox.classList.remove('checked');
        }
    });
}

function updateRoute() {
    // Clear existing route
    routeLayer.getSource().clear();

    // If we have at least 2 points, draw the route
    const coords = selectedPoints
        .filter(p => p.coordinates && Array.isArray(p.coordinates))
        .map(p => ol.proj.fromLonLat([p.coordinates[0], p.coordinates[1]]));

    if (coords.length >= 2) {
        const lineFeature = new ol.Feature({
            geometry: new ol.geom.LineString(coords)
        });
        lineFeature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#E8B960',
                width: 4,
                lineDash: [10, 10]
            })
        }));
        routeLayer.getSource().addFeature(lineFeature);

        // Fit view to show entire route
        const extent = routeLayer.getSource().getExtent();
        map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 400 });
    }
}

function initMap() {
    // Layer for route line
    routeLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    // Layer for destination markers
    markersLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });

    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }),
            routeLayer,
            markersLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([108.0, 52.0]),
            zoom: 7
        })
    });

    refreshDestinationMarkers();

    // Click handler on markers
    map.on('click', function (evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, f => f, {
            layerFilter: l => l === markersLayer
        });
        if (feature) {
            const dest = feature.get('dest');
            if (dest) addPoint(dest);
        }
    });

    // Change cursor to pointer when hovering over a marker
    map.on('pointermove', function (evt) {
        const hit = map.hasFeatureAtPixel(evt.pixel, {
            layerFilter: l => l === markersLayer
        });
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });
}

function refreshDestinationMarkers() {
    if (!markersLayer) return;
    markersLayer.getSource().clear();

    destinations.forEach((dest) => {
        if (dest.coordinates && Array.isArray(dest.coordinates)) {
            const feature = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([dest.coordinates[0], dest.coordinates[1]])
                ),
                dest: dest
            });
            feature.setStyle(
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 10,
                        fill: new ol.style.Fill({ color: '#E8B960' }),
                        stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 })
                    })
                })
            );
            markersLayer.getSource().addFeature(feature);
        }
    });
}

function addPoint(dest) {
    // Check if already added
    if (selectedPoints.find(p => p.destination_id === dest.id)) {
        alert('Эта точка уже добавлена в маршрут');
        return;
    }

    selectedPoints.push({
        destination_id: dest.id,
        order_index: selectedPoints.length,
        stay_hours: 2,
        name: dest.name_ru,
        description: dest.description_ru,
        image: dest.image_url,
        coordinates: dest.coordinates
    });

    renderPointsList();
    updateDestinationsListState();
    updateRoute();
}

function removePoint(index) {
    selectedPoints.splice(index, 1);
    // Reorder
    selectedPoints.forEach((p, i) => p.order_index = i);
    renderPointsList();
    updateDestinationsListState();
    updateRoute();
}

function renderPointsList() {
    const list = document.getElementById('pointsList');

    if (selectedPoints.length === 0) {
        list.innerHTML = '<p style="color: #64748b; text-align: center;">Кликните на маркеры карты, чтобы добавить точки</p>';
        return;
    }

    list.innerHTML = selectedPoints.map((point, index) => `
        <div class="point-item" data-index="${index}">
            <img src="${point.image || '/placeholder.jpg'}" alt="${point.name}">
            <div class="point-info">
                <h4>${index + 1}. ${point.name}</h4>
                <p>Время пребывания: <input type="number" value="${point.stay_hours}" min="1" max="24" onchange="updateStayHours(${index}, this.value)" style="width: 60px; padding: 5px;"> часов</p>
            </div>
            <div class="point-actions">
                <button onclick="removePoint(${index})" title="Удалить">✕</button>
            </div>
        </div>
    `).join('');
}

function updateStayHours(index, hours) {
    selectedPoints[index].stay_hours = parseInt(hours);
}

function initSortable() {
    const list = document.getElementById('pointsList');
    new Sortable(list, {
        animation: 150,
        onEnd: function(evt) {
            // Reorder points
            const item = selectedPoints.splice(evt.oldIndex, 1)[0];
            selectedPoints.splice(evt.newIndex, 0, item);
            selectedPoints.forEach((p, i) => p.order_index = i);
        }
    });
}

function nextStep() {
    // Validate current step
    if (currentStep === 1) {
        const title = document.getElementById('tourTitle').value.trim();
        const shortDesc = document.getElementById('tourShortDesc').value.trim();
        const duration = document.getElementById('tourDuration').value;

        if (!title || !shortDesc || !duration) {
            alert('Заполните все обязательные поля');
            return;
        }
    }

    if (currentStep < 4) {
        // Hide current step
        document.getElementById(`step${currentStep}`).classList.remove('active');
        // Show next step
        document.getElementById(`step${currentStep + 1}`).classList.add('active');
        // Update progress bar
        document.querySelectorAll('.progress-step')[currentStep - 1].classList.add('completed');
        document.querySelectorAll('.progress-step')[currentStep].classList.add('active');
        currentStep++;

        // Invalidate map size when showing step 2
        if (currentStep === 2 && map) {
            setTimeout(() => {
                map.updateSize();
            }, 100);
        }

        if (currentStep === 4) {
            renderPreview();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        // Hide current step
        document.getElementById(`step${currentStep}`).classList.remove('active');
        // Show previous step
        document.getElementById(`step${currentStep - 1}`).classList.add('active');
        // Update progress bar
        document.querySelectorAll('.progress-step')[currentStep - 1].classList.remove('active');
        document.querySelectorAll('.progress-step')[currentStep - 2].classList.remove('completed');
        currentStep--;

        // Invalidate map size when showing step 2
        if (currentStep === 2 && map) {
            setTimeout(() => {
                map.updateSize();
            }, 100);
        }
    }
}

async function previewPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('photoPreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Upload to server and store the permanent URL
    try {
        const formData = new FormData();
        formData.append('photo', file);
        const res = await fetch('/api/upload/tour-photo', { method: 'POST', body: formData });
        if (res.ok) {
            const data = await res.json();
            tourData.main_photo_url = data.url;
        } else {
            console.error('Photo upload failed');
        }
    } catch (e) {
        console.error('Photo upload error:', e);
    }
}

function renderPreview() {
    // Preserve main_photo_url that was set by previewPhoto()
    const savedPhotoUrl = tourData.main_photo_url || null;
    tourData = {
        title: document.getElementById('tourTitle').value || 'Без названия',
        short_desc: document.getElementById('tourShortDesc').value || '',
        full_desc: document.getElementById('tourFullDesc').value || '',
        duration_days: parseInt(document.getElementById('tourDuration').value) || 0,
        difficulty: document.getElementById('tourDifficulty').value || 'medium',
        season: document.getElementById('tourSeason').value || 'year-round',
        price: parseInt(document.getElementById('tourPrice').value) || null,
        main_photo_url: savedPhotoUrl
    };

    const preview = document.getElementById('tourPreview');
    if (!preview) {
        console.error('tourPreview element not found');
        return;
    }

    preview.innerHTML = `
        <h2>${tourData.title}</h2>
        ${tourData.short_desc ? `<p><strong>Краткое описание:</strong> ${tourData.short_desc}</p>` : ''}
        ${tourData.full_desc ? `<p><strong>Полное описание:</strong> ${tourData.full_desc}</p>` : ''}
        <p><strong>Длительность:</strong> ${tourData.duration_days} дней</p>
        <p><strong>Сложность:</strong> ${getDifficultyName(tourData.difficulty)}</p>
        <p><strong>Сезон:</strong> ${getSeasonName(tourData.season)}</p>
        ${tourData.price ? `<p><strong>Цена:</strong> ${tourData.price} ₽</p>` : ''}
        <h3>Маршрут (${selectedPoints.length} точек):</h3>
        ${selectedPoints.length > 0 ? `
            <ol>
                ${selectedPoints.map(p => `<li>${p.name} (${p.stay_hours} ч)</li>`).join('')}
            </ol>
        ` : '<p>Точки маршрута не добавлены</p>'}
    `;
}

function getDifficultyName(diff) {
    const names = { easy: 'Лёгкий', medium: 'Средний', hard: 'Высокий' };
    return names[diff] || diff;
}

function getSeasonName(season) {
    const names = { summer: 'Лето', winter: 'Зима', 'year-round': 'Круглый год' };
    return names[season] || season;
}

async function saveDraft() {
    await saveTour('draft');
}

async function publishTour() {
    if (selectedPoints.length < 2) {
        alert('Добавьте минимум 2 точки в маршрут');
        return;
    }
    await saveTour('published');
}

async function saveTour(status) {
    const token = localStorage.getItem('token');

    const data = {
        tour: {
            ...tourData,
            status
        },
        points: selectedPoints.map(p => ({
            destination_id: p.destination_id,
            order_index: p.order_index,
            stay_hours: p.stay_hours
        }))
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch('/api/user-tours/community', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            alert(status === 'draft' ? 'Черновик сохранён!' : 'Тур опубликован!');
            window.location.href = `community-tours.html`;
        } else {
            const error = await response.json();
            alert('Ошибка: ' + error.error);
        }
    } catch (error) {
        alert('Ошибка сохранения: ' + error.message);
    }
}
