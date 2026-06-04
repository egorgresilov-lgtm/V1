// ==========================================
// ATTRACTIONS PAGE - Dedicated functionality
// ==========================================

const API_BASE = '/api';
const DEFAULT_ATTRACTION_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
const ATTRACTIONS_PHOTO_DIR = '/photos/достопримечательности';
// Sample data оставляем только как fallback, если API недоступен.
const PREFER_SAMPLE_DATA = false;

// Кэш координат из файла коорд.txt
let KOORD_COORDINATES_NORMALIZED = [];

function normalizePlaceName(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/[-–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[«»"]/g, '')
        .replace(/\([^)]*\)/g, '') // убираем скобки с уточнениями
        .trim();
}

async function ensureKoordCoordinatesLoaded() {
    if (KOORD_COORDINATES_NORMALIZED.length > 0) return KOORD_COORDINATES_NORMALIZED;

    try {
        const res = await fetch('/data/coordinates.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const points = await res.json();
        KOORD_COORDINATES_NORMALIZED = (Array.isArray(points) ? points : []).map((item) => ({
            key: normalizePlaceName(item.name),
            lat: item.lat,
            lng: item.lng
        }));
    } catch (e) {
        console.warn('[KOORD] Failed to load coordinates from коорд.txt:', e);
        KOORD_COORDINATES_NORMALIZED = [];
    }

    return KOORD_COORDINATES_NORMALIZED;
}

const NORTHERN_SPRINGS_POINTS = [
    { name_ru: 'Кучигерские источники', lat: 54.199444, lng: 110.102222 },
    { name_ru: 'Аллинские источники', lat: 54.738611, lng: 111.093611 },
    { name_ru: 'Дзелинда', lat: 55.120833, lng: 111.090278 },
    { name_ru: 'Гоуджекит', lat: 55.426111, lng: 109.965833 },
    { name_ru: 'Гаргинские источники', lat: 54.321944, lng: 110.501389 }
];

function buildNorthernSpringsFullDescription(springs) {
    const detailed = (springs || []).filter((s) => (s.full_description || '').includes('Что делать'));
    if (detailed.length >= 2) {
        const intro = 'Север Бурятии — край озёр, тайги и горячих источников. Ниже — пять главных термальных зон региона.<br><br>';
        const sections = detailed
            .sort((a, b) => (a.id || 0) - (b.id || 0))
            .map((s) => {
                const summary = s.full_description.split('<br><br><strong>Что делать:</strong>')[0].trim();
                const body = summary.replace(/^[^—]+—\s*/, '');
                return `<strong>${s.name_ru}.</strong> ${body}`;
            })
            .join('<br><br>');
        return `${intro}${sections}<br><br><strong>Что делать:</strong><br>• Выбрать источник по температуре и составу воды<br>• Принять термальные ванны и грязевые процедуры<br>• Остановиться на базе отдыха на несколько дней<br>• Купаться зимой — пар, снег вокруг, а вам тепло<br>• Совместить с поездкой по Баргузинской долине или северному Байкалу<br><br><strong>Важно:</strong> До Кучигера, Аллы и Гарги — 6–8 часов из Улан-Удэ, бронируйте жильё заранее. До Гарги мост через реку разрушен — уточняйте проезд. Берите тапочки, полотенце и запас еды.`;
    }
    return NORTHERN_SPRINGS_FULL_DESCRIPTION;
}

const NORTHERN_SPRINGS_FULL_DESCRIPTION = 'Кучигерские источники известны с XIX века — о них знают далеко за пределами Бурятии. Горячая вода (от +21 до +75°C) бьёт прямо из земли, а вместе с илом образует лечебные грязи. Говорят, у источников можно увидеть брошенные костыли — люди оставляли их, когда вставали на ноги после курса.<br><br>На базе отдыха «Кучигер» есть деревянные ванны, домики и открытый бассейн. Вокруг — тайга, горы Баргузинской долины и полная тишина.<br><br><strong>Что делать:</strong><br>• Принимать термальные ванны и грязевые процедуры<br>• Купаться в открытом бассейне под звёздами<br>• Совместить с поездкой к соседним источникам Алла и Гарга<br>• Гулять по долине и слушать легенды о целительной силе воды<br><br><strong>Важно:</strong> Дорога из Улан-Удэ занимает 6–8 часов. Бронируйте проживание заранее — в сезон мест мало.';

function isNorthernSpringAttraction(attraction) {
    const text = normalizePlaceName([
        attraction?.name_ru || '',
        attraction?.banner_title || '',
        attraction?.description_ru || ''
    ].join(' '));

    return ['кучигер', 'алла', 'гарга', 'гарта', 'дзелинда', 'гоуджекит'].some((token) => text.includes(token));
}

function normalizeNorthernSpringsAttraction(attractions) {
    if (!Array.isArray(attractions) || attractions.length === 0) return attractions;

    const springs = attractions.filter(isNorthernSpringAttraction);
    if (springs.length === 0) return attractions;

    const base = attractions.find((item) => normalizePlaceName(item.name_ru) === normalizePlaceName('Кучигер, Алла, Гарга, Дзелинда, Гоуджекит')) || springs[0];
    const preservedId = base?.id ?? 2500;
    const preservedPalette = base?.color_palette || 'datsan';

    const combinedAttraction = {
        id: preservedId,
        name_ru: 'Кучигер, Алла, Гарга, Дзелинда, Гоуджекит',
        banner_title: 'Термальные источники севера — дикая природа и горячая вода',
        description_ru: 'Несколько природных термальных источников в северной Бурятии. Обустроенные базы отдыха и совсем дикие места — на любой вкус.',
        full_description: buildNorthernSpringsFullDescription(springs),
        color_palette: preservedPalette,
        image_url: base?.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        multi_map_points: NORTHERN_SPRINGS_POINTS
    };

    return [
        ...attractions.filter((item) => !isNorthernSpringAttraction(item)),
        combinedAttraction
    ];
}

function getManualCoordinatesByName(name) {
    const normalizedName = normalizePlaceName(name);
    if (!normalizedName) return null;

    const match = KOORD_COORDINATES_NORMALIZED.find(
        (item) => item.key === normalizedName || item.key.includes(normalizedName) || normalizedName.includes(item.key)
    );

    if (!match) return null;
    return { lat: match.lat, lng: match.lng };
}

/** Координаты из API/админки: [долгота, широта] */
function getCoordinatesFromAttraction(attraction) {
    if (!attraction?.coordinates || !Array.isArray(attraction.coordinates) || attraction.coordinates.length < 2) {
        return null;
    }
    const lon = Number(attraction.coordinates[0]);
    const lat = Number(attraction.coordinates[1]);
    if (Number.isNaN(lon) || Number.isNaN(lat)) return null;
    return { lat, lng: lon };
}

function getCoordinates(attraction) {
    return (
        getCoordinatesFromAttraction(attraction) ||
        getManualCoordinatesByName(attraction?.name_ru)
    );
}

// Helper function to get local image path for an attraction
function getLocalImagePath(attractionName) {
    // Map of attraction names to file names (handling special cases)
    const nameToFileMap = {
        'Ринпоче Багша (Улан-Удэ)': 'Ринпоче Багша.jpg',
        'Ринпоче Багша': 'Ринпоче Багша.jpg',
        'Памятник Ленину (Голова)': 'Памятник Ленину (Голова).jpg',
        'Ильинка (Питателевский источник)': 'Ильинка (Питателевский источник).jpg',
        // Термальные источники (разбили на отдельные точки)
        'Кучигер': 'кучигер.jpg',
        'Алла': 'кучигер.jpg',
        'Гарга': 'кучигер.jpg',
        'Дзелинда': 'кучигер.jpg',
        'Гоуджекит': 'кучигер.jpg',
        'Нилова-Пустынь': null, // Use default
        'Пик Мунку-Сардык': 'пик_мунку_сардык.jpg',
        'Степной кочевник': 'Степной кочевник.jpg',
        '«Степной кочевник» (с. Нарын-Ацагат)': 'Степной кочевник.jpg',
        'Этнографический музей народов Забайкалья': 'Этнографический музей народов Забайкалья.jpg',
        'Село Бичура': 'Село Бичура.jpg',
        'Село Тарбагатай': 'село_тарбагатай.jpg',
        'Байкал': 'Байкал.jpg',
        'Озеро Байкал': 'Байкал.jpg',
        'Горные лыжи и фрирайд (гора Мамай)': 'Гора Мамай.jpg',
        'Конные туры': 'Степной кочевник.jpg',
        'Рафтинг на реке Жом-Болок': 'Водопад Малый Жом-Болок.jpg',
        'Большая Байкальская тропа (ББТ)': 'Байкал.jpg',
        'Одигитриевский собор (Улан-Удэ)': 'Свято-Одигитриевский Собор в Улан-Удэ.jpg',
        'Посольско-Преображенская церковь (с. Посольское)': 'Спасо-Преображенский Посольский монастырь.jpg',
        'Спасская церковь (Бичура)': 'Спасская церковь (Бичура).jpg',
        'Храм «Всех скорбящих Радость» (Кяхта)': 'Храм «Всех скорбящих Радость» (Кяхта).jpg',
        'Тарбагатай — живая история старообрядцев': '/images/villages/Тарбагатай.jpg',
        'Бичура — самая длинная сельская улица': '/images/villages/Бичура.jpg',
        'Нарын-Ацагат («Степной кочевник»)': '/images/villages/Нарын-ацагат.jpg',
        'Ацагат — деревня поэтов и лам': '/images/villages/Ацагат.jpg',
        'Хойтогол — кочевье у Байкала': '/images/villages/Хойтогол.jpg'
    };
    
    if (nameToFileMap.hasOwnProperty(attractionName)) {
        const fileName = nameToFileMap[attractionName];
        if (fileName) {
            // If it's already a full path (starts with /), return as is
            if (fileName.startsWith('/')) {
                return fileName;
            }
            return `${ATTRACTIONS_PHOTO_DIR}/${encodeURIComponent(fileName)}`;
        }
        return null;
    }
    
    // Default: use the attraction name as file name
    return `${ATTRACTIONS_PHOTO_DIR}/${encodeURIComponent(attractionName)}.jpg`;
}

function buildImageCandidates(attraction) {
    const candidates = [];

    // Prefer local image by attraction name
    const localPath = getLocalImagePath(attraction.name_ru);
    if (localPath) {
        candidates.push(localPath);
    }

    // Then use API-provided URL
    if (attraction.image_url) {
        candidates.push(attraction.image_url);
    }

    // Final safe fallback
    candidates.push(DEFAULT_ATTRACTION_IMAGE);

    // Remove duplicates while preserving order
    return [...new Set(candidates.filter(Boolean))];
}

// Get image URL - preferred first candidate
function getImageUrl(attraction) {
    return buildImageCandidates(attraction)[0];
}

function getImageTagAttributes(attraction, extraClass = '') {
    const [primary, ...fallbacks] = buildImageCandidates(attraction);
    const encodedFallbacks = fallbacks.map((url) => encodeURIComponent(url)).join(',');
    const classAttribute = extraClass ? ` class="${extraClass}"` : '';

    return `src="${primary}"${classAttribute} data-fallbacks="${encodedFallbacks}" onerror="window.handleAttractionImageError(this)"`;
}

window.handleAttractionImageError = function(imageElement) {
    const fallbackString = imageElement.dataset.fallbacks || '';
    if (!fallbackString) {
        imageElement.onerror = null;
        imageElement.src = DEFAULT_ATTRACTION_IMAGE;
        return;
    }

    const fallbacks = fallbackString
        .split(',')
        .filter(Boolean)
        .map((item) => decodeURIComponent(item));

    if (fallbacks.length === 0) {
        imageElement.onerror = null;
        imageElement.src = DEFAULT_ATTRACTION_IMAGE;
        return;
    }

    const [nextUrl, ...remaining] = fallbacks;
    imageElement.dataset.fallbacks = remaining.map((url) => encodeURIComponent(url)).join(',');
    imageElement.src = nextUrl;
};

// ==========================================
// NAVIGATION
// ==========================================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ==========================================
// SCROLL REVEAL ANIMATION
// ==========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// ==========================================
// SOUND TOGGLE
// ==========================================

// ==========================================
// ATTRACTIONS MANAGEMENT
// ==========================================

let allAttractions = [];
let currentFilter = 'all';
let currentSearch = '';
let currentDatsanSubfilter = 'all';
let currentExpandedCard = null;
let currentExpandedPlaceholder = null;
const THEME_CLASSES = ['theme-baikal', 'theme-datsan', 'theme-villages', 'theme-steppe', 'theme-sun', 'theme-ulanude'];
const DATSAN_VILLAGE_KEYWORDS = ['тарбагат', 'бичур', 'нарын-ацагат', 'ацагат', 'хойтогол'];

function isVillagePowerPlace(attraction) {
    const text = [
        attraction.name_ru || '',
        attraction.banner_title || '',
        attraction.description_ru || '',
        attraction.full_description || ''
    ].join(' ').toLowerCase();

    return DATSAN_VILLAGE_KEYWORDS.some((keyword) => text.includes(keyword));
}

async function loadAttractions(filter = 'all', searchTerm = '') {
    closeExpandedCard();
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const grid = document.getElementById('attractionsGrid');
    
    loadingState.style.display = 'block';
    grid.style.display = 'none';
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    if (PREFER_SAMPLE_DATA) {
        await ensureKoordCoordinatesLoaded();
        let attractions = normalizeNorthernSpringsAttraction(getSampleAttractions());

        if (filter !== 'all') {
            attractions = attractions.filter(a => a.color_palette === filter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            attractions = attractions.filter(a =>
                a.name_ru.toLowerCase().includes(term) ||
                (a.description_ru && a.description_ru.toLowerCase().includes(term))
            );
        }

        allAttractions = attractions;
        renderAttractions(attractions);
        updateStatistics(attractions);
        loadingState.style.display = 'none';
        grid.style.display = attractions.length > 0 ? 'grid' : 'none';
        updateMapWithAttractions(attractions);
        return;
    }
    
    try {
        console.log('Loading attractions from API...');

        // Подгружаем справочник координат из коорд.txt
        await ensureKoordCoordinatesLoaded();
        
        // Build API URL with filters
        let apiUrl = `${API_BASE}/destinations`;
        const params = [];
        
        if (filter !== 'all') {
            params.push(`color_palette=${filter}`);
        }
        
        if (params.length > 0) {
            apiUrl += '?' + params.join('&');
        }
        
        // Fetch from API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let attractions = normalizeNorthernSpringsAttraction(await response.json());
        console.log('Fetched', attractions.length, 'attractions from API');
        
        // Apply client-side search filter
        if (filter === 'datsan' && currentDatsanSubfilter === 'villages') {
            attractions = attractions.filter(isVillagePowerPlace);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            attractions = attractions.filter(a => 
                a.name_ru.toLowerCase().includes(term) || 
                (a.description_ru && a.description_ru.toLowerCase().includes(term))
            );
        }
        
        allAttractions = attractions;
        renderAttractions(attractions);
        updateStatistics(attractions);
        loadingState.style.display = 'none';
        
        if (attractions.length > 0) {
            grid.style.display = 'grid';
        } else {
            // Intentionally keep empty state hidden per UI request.
            grid.style.display = 'none';
        }
        
        // Update map with attractions
        updateMapWithAttractions(attractions);
        
        console.log('Loaded', attractions.length, 'attractions');
    } catch (error) {
        console.error('Error loading attractions:', error);
        console.log('Falling back to sample data...');
        
        // Fallback to sample data if API fails
        await ensureKoordCoordinatesLoaded();
        let attractions = normalizeNorthernSpringsAttraction(getSampleAttractions());
        
        // Apply filters to sample data
        if (filter !== 'all') {
            attractions = attractions.filter(a => a.color_palette === filter);
        }

        if (filter === 'datsan' && currentDatsanSubfilter === 'villages') {
            attractions = attractions.filter(isVillagePowerPlace);
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            attractions = attractions.filter(a => 
                a.name_ru.toLowerCase().includes(term) || 
                (a.description_ru && a.description_ru.toLowerCase().includes(term))
            );
        }
        
        allAttractions = attractions;
        renderAttractions(attractions);
        updateStatistics(attractions);
        loadingState.style.display = 'none';
        
        if (attractions.length > 0) {
            grid.style.display = 'grid';
        } else {
            grid.style.display = 'none';
        }
    }
}

function renderAttractions(attractions) {
    const grid = document.getElementById('attractionsGrid');
    grid.innerHTML = '';
    
    attractions.forEach(attraction => {
        const card = createAttractionCard(attraction);
        grid.appendChild(card);
    });
    
    // Re-observe new scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

function createAttractionCard(attraction) {
    const card = document.createElement('div');
    card.className = 'destination-card scroll-reveal';
    
    const paletteClass = attraction.color_palette || 'baikal';
    const paletteName = getPaletteName(paletteClass);
    const longDescription = attraction.full_description || attraction.description_ru || '';
    const activities = Array.isArray(attraction.activities) ? attraction.activities : [];
    const activitiesHTML = activities.length
        ? `
            <div class="modal-section">
                <h3>🎯 Что делать:</h3>
                <ul class="modal-activities-list">
                    ${activities.slice(0, 5).map((item) => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `
        : '';
    const tipHTML = attraction.tip
        ? `
            <div class="modal-section">
                <div class="modal-tip">
                    <strong>💡 Полезный совет</strong>
                    ${attraction.tip}
                </div>
            </div>
        `
        : '';
    
    const cardImageAttributes = getImageTagAttributes(attraction);
    
    const mapSectionHTML = createMapSectionHTML(attraction);
    
    card.innerHTML = `
        <button class="card-close-icon" aria-label="Закрыть карточку">&times;</button>
        <span class="photo-title-plaque ${paletteClass}">${paletteName}</span>
        <img ${cardImageAttributes} alt="${attraction.name_ru}">
        <div class="destination-info">
            <h3>${attraction.name_ru}</h3>
            <span class="destination-category ${paletteClass}">📍 ${paletteName}</span>
            <p>${attraction.description_ru || ''}</p>
        </div>
        <div class="card-expanded-content">
            <div class="modal-section">
                <h3>📖 Описание:</h3>
                <p class="modal-description">${longDescription}</p>
            </div>
            ${activitiesHTML}
            ${tipHTML}
            ${mapSectionHTML}
            <div class="expanded-actions">
                <button type="button" class="btn btn-secondary ripple-btn">Забронировать</button>
                <button type="button" class="btn btn-secondary card-close ripple-btn">Закрыть</button>
            </div>
        </div>
    `;

    const closeBtn = card.querySelector('.card-close');
    const closeIconBtn = card.querySelector('.card-close-icon');

    closeBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeExpandedCard();
    });

    closeIconBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeExpandedCard();
    });
    
    // Expand/collapse with theme transition
    card.addEventListener('click', (event) => {
        if (event.target.closest('.card-close') || event.target.closest('.card-close-icon')) {
            closeExpandedCard();
            return;
        }

        if (event.target.closest('.expanded-actions')) {
            event.stopPropagation();
            return;
        }

        if (event.target.closest('.ripple-btn')) {
            event.preventDefault();
            createRipple(event);
            event.stopPropagation();
            return;
        }

        event.stopPropagation();
        toggleExpandedCard(card, attraction.color_palette || 'baikal');
    });
    
    return card;
}

function getPaletteName(palette) {
    const names = {
        'baikal': 'Байкал',
        'datsan': 'Места силы',
        'villages': 'Сёла',
        'steppe': 'Природные места',
        'sun': 'Улан-Удэ'
    };
    return names[palette] || palette;
}

function toggleExpandedCard(card, theme) {
    if (currentExpandedCard === card) {
        return;
    }

    closeExpandedCard();
    currentExpandedCard = card;
    createExpandedPlaceholder(card);
    card.classList.add('is-expanded');
    card.closest('.destinations-grid')?.classList.add('has-expanded');
    changeBackground(theme);
    document.body.style.overflow = 'hidden';
    
    // Map is now using OpenStreetMap iframe - no initialization needed
}

function closeExpandedCard() {
    if (!currentExpandedCard) return;
    currentExpandedCard.classList.remove('is-expanded');
    currentExpandedCard.closest('.destinations-grid')?.classList.remove('has-expanded');
    removeExpandedPlaceholder();
    currentExpandedCard = null;
    resetBackground();
    document.body.style.overflow = '';
}

function createExpandedPlaceholder(card) {
    removeExpandedPlaceholder();
    const rect = card.getBoundingClientRect();
    const placeholder = document.createElement('div');
    placeholder.className = 'destination-card-placeholder';
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.width = `${rect.width}px`;
    card.parentNode?.insertBefore(placeholder, card);
    currentExpandedPlaceholder = placeholder;
}

function removeExpandedPlaceholder() {
    if (!currentExpandedPlaceholder) return;
    currentExpandedPlaceholder.remove();
    currentExpandedPlaceholder = null;
}

function changeBackground(theme) {
    document.body.classList.remove(...THEME_CLASSES);
    if (theme) {
        const normalizedTheme = theme === 'sun' ? 'sun' : theme;
        document.body.classList.add(`theme-${normalizedTheme}`);
        document.body.classList.add('theme-active');
    }
}

function resetBackground() {
    document.body.classList.remove(...THEME_CLASSES);
    document.body.classList.remove('theme-active');
}

function createRipple(event) {
    const button = event.target.closest('.ripple-btn');
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'card-ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 650);
}

function createMapSectionHTML(attraction, title = '📍 Расположение на карте:') {
    if (Array.isArray(attraction?.multi_map_points) && attraction.multi_map_points.length > 1) {
        const points = attraction.multi_map_points;
        const minLat = Math.min(...points.map((p) => p.lat));
        const maxLat = Math.max(...points.map((p) => p.lat));
        const minLng = Math.min(...points.map((p) => p.lng));
        const maxLng = Math.max(...points.map((p) => p.lng));
        const latPadding = Math.max(0.06, (maxLat - minLat) * 0.2);
        const lngPadding = Math.max(0.08, (maxLng - minLng) * 0.2);
        const bbox = `${minLng - lngPadding}%2C${minLat - latPadding}%2C${maxLng + lngPadding}%2C${maxLat + latPadding}`;
        const markers = points.map((p) => `${p.lat}%2C${p.lng}`).join('&marker=');

        return `
            <div class="modal-section">
                <h3>${title}</h3>
                <div class="cafe-map-container">
                    <iframe
                        src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${markers}"
                        width="100%"
                        height="320"
                        style="border:0;"
                        allowfullscreen=""
                        loading="lazy">
                    </iframe>
                    <a href="https://2gis.ru/ulanude/search/${encodeURIComponent('Кучигер Алла Гарга Дзелинда Гоуджекит')}"
                       target="_blank"
                       class="map-link-btn">
                        📍 Открыть в 2GIS для маршрута
                    </a>
                </div>
            </div>
        `;
    }

    const coords = getCoordinates(attraction);

    if (coords) {
        const { lat, lng } = coords;
        // Use OpenStreetMap embed (same approach as gastronomy page)
        return `
            <div class="modal-section">
                <h3>${title}</h3>
                <div class="cafe-map-container">
                    <iframe 
                        src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.005}%2C${lng + 0.01}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}"
                        width="100%" 
                        height="300" 
                        style="border:0;" 
                        allowfullscreen="" 
                        loading="lazy">
                    </iframe>
                    <a href="https://2gis.ru/ulanude/search/${lat}%2C${lng}" 
                       target="_blank" 
                       class="map-link-btn">
                        📍 Открыть в 2GIS для маршрута
                    </a>
                </div>
            </div>
        `;
    }

    const mapQuery = encodeURIComponent(`${attraction.name_ru} Бурятия`);
    return `
        <div class="modal-section">
            <h3>${title}</h3>
            <div class="cafe-map-container">
                <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=105%2C50%2C115%2C56&layer=mapnik"
                    width="100%"
                    height="300"
                    style="border:0;"
                    allowfullscreen=""
                    loading="lazy">
                </iframe>
                <a href="https://2gis.ru/ulanude/search/${mapQuery}"
                   target="_blank"
                   class="map-link-btn">
                    📍 Открыть в 2GIS для маршрута
                </a>
            </div>
        </div>
    `;
}

// ==========================================
// MODAL FUNCTIONALITY
// ==========================================

function openAttractionModal(attraction) {
    closeExpandedCard();
    const modal = document.getElementById('attractionModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) {
        console.warn('Attraction modal elements not found');
        return;
    }
    
    const paletteClass = attraction.color_palette || 'baikal';
    const paletteName = getPaletteName(paletteClass);
    
    let activitiesHTML = '';
    if (Array.isArray(attraction.activities) && attraction.activities.length > 0) {
        activitiesHTML = `
            <div class="modal-section">
                <h3>🎯 Что делать:</h3>
                <ul class="modal-activities-list">
                    ${attraction.activities.map(act => `<li>${act}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    let tipHTML = '';
    if (attraction.tip) {
        tipHTML = `
            <div class="modal-section">
                <div class="modal-tip">
                    <strong>💡 Полезный совет</strong>
                    ${attraction.tip}
                </div>
            </div>
        `;
    }
    
    const modalImageAttributes = getImageTagAttributes(attraction, 'modal-header-image');
    
    const mapSectionHTML = createMapSectionHTML(attraction, '📍 Расположение на карте');
    
    const coords = getCoordinates(attraction);
    console.log('[MODAL] Opening attraction:', attraction.name_ru);
    console.log('[MODAL] Coordinates:', coords ? `${coords.lat}, ${coords.lng}` : 'No coordinates');
    console.log('[MODAL] Has coords:', !!coords);
    console.log('[MODAL] Mapgl defined:', typeof mapgl !== 'undefined');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img ${modalImageAttributes} alt="${attraction.name_ru}">
            <div class="modal-header-overlay">
                ${attraction.banner_title ? `<h3 class="modal-banner-title">${attraction.banner_title}</h3>` : ''}
                <h2 class="modal-title">${attraction.name_ru}</h2>
                <span class="modal-palette-badge color-badge ${paletteClass}">${paletteName}</span>
            </div>
        </div>
        <div class="modal-details">
            <div class="modal-section">
                <p class="modal-description">${attraction.full_description || attraction.description_ru || ''}</p>
            </div>
            ${activitiesHTML}
            ${tipHTML}
            ${mapSectionHTML}
        </div>
    `;
    
    // Make modal visible (class-driven, with inline fallback)
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Map is now using OpenStreetMap iframe - no initialization needed
}

function closeAttractionModal() {
    const modal = document.getElementById('attractionModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('attractionModal');
    const closeBtn = document.querySelector('.modal-close');
    if (!modal) {
        console.warn('Attraction modal #attractionModal not found');
        return;
    }
    
    // Close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAttractionModal);
    }
    
    // Click outside modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAttractionModal();
        }
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeExpandedCard();
            closeAttractionModal();
        }
    });

    document.addEventListener('click', (e) => {
        if (!currentExpandedCard) return;
        if (currentExpandedCard.contains(e.target)) return;
        closeExpandedCard();
    });
});

// ==========================================
// STATISTICS
// ==========================================

function updateStatistics(attractions) {
    const allAttractions = getSampleAttractions();
    const total = attractions.length;
    const baikal = allAttractions.filter(a => a.color_palette === 'baikal').length;
    const datsan = allAttractions.filter(a => a.color_palette === 'datsan').length;
    const villages = allAttractions.filter(a => a.color_palette === 'villages').length;
    const steppe = allAttractions.filter(a => a.color_palette === 'steppe').length;
    
    animateNumber('statTotal', total);
    animateNumber('statBaikal', baikal);
    animateNumber('statDatsan', datsan);
    animateNumber('statVillages', villages);
    animateNumber('statSteppe', steppe);
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

const searchInput = document.getElementById('attractionSearch');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadAttractions(currentFilter, currentSearch);
    }, 300);
});

// ==========================================
// FILTER FUNCTIONALITY
// ==========================================

document.querySelectorAll('.palette-filter .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.palette-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.dataset.palette;
        loadAttractions(currentFilter, currentSearch);
    });
});

// ==========================================
// INTERACTIVE MAP
// ==========================================

async function loadMapPoints() {
    // Initialize OpenLayers map with attractions
    console.log('Initializing attractions map with OpenLayers');
    initMap();
}

function renderMap(points) {
    const mapContainer = document.getElementById('interactiveMap');
    mapContainer.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 800 600');
    
    // Simplified Buryatia outline
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outline.setAttribute('d', 'M100,100 L700,100 L700,500 L100,500 Z');
    outline.setAttribute('fill', '#ede8dc');
    outline.setAttribute('stroke', '#1a5276');
    outline.setAttribute('stroke-width', '2');
    svg.appendChild(outline);
    
    // Add points
    points.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        
        const x = ((point.longitude - 105) / 10) * 600 + 100;
        const y = ((55 - point.latitude) / 5) * 400 + 100;
        
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '8');
        circle.setAttribute('class', `map-point ${point.color_palette}`);
        circle.setAttribute('data-name', point.name_ru);
        
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = point.name_ru;
        circle.appendChild(title);
        
        svg.appendChild(circle);
    });
    
    mapContainer.appendChild(svg);
}

// ==========================================
// SAMPLE DATA
// ==========================================

function getSampleAttractions() {
    return [
        {
            id: 1,
            name_ru: 'Чивыркуйский залив',
            banner_title: 'Чивыркуйский залив — байкальское море тепла',
            description_ru: 'Самый тёплый залив Байкала (+23°C). Песчаные пляжи, термальные источники и лучшая рыбалка.',
            full_description: 'Чивыркуйский залив называют «байкальским морем» — он настолько широк, что противоположный берег почти не виден. Это единственное место на Байкале, где вода летом становится по-настоящему тёплой, а пляжи напоминают южные курорты — но вместо пальм здесь вековые сосны, подступающие прямо к воде.<br><br>В бухте Змеиная бьют термальные источники (температура до +42°C даже зимой). Говорят, что вода здесь лечит суставы и успокаивает нервы. А рыбаки знают: лучшего места для ловли хариуса, окуня и щуки не найти во всей Бурятии.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1551845856-c4b6938a1d5e?w=800',
            coordinates: [53.1500, 108.9500],
            activities: [
                'Купаться в самом тёплом заливе Байкала',
                'Принимать термальные ванны в бухте Змеиная',
                'Рыбачить с лодки или с берега',
                'Ставить палатку в кедровнике прямо у воды',
                'Фотографировать закаты — здесь они особенно алые'
            ],
            tip: 'Берите с собой маску и ласты — вода настолько прозрачная, что видно дно на 5–6 метров.'
        },
        {
            id: 2,
            name_ru: 'Ушканьи острова',
            banner_title: 'Ушканьи острова — царство байкальской нерпы',
            description_ru: 'Архипелаг из четырёх островов — главное лежбище байкальской нерпы, единственного пресноводного тюленя.',
            full_description: 'Ушканьи острова — это заповедная зона, куда пускают только по спецразрешениям. И неслучайно: здесь, на гладких камнях, десятки нерп греются на солнце. Эти любопытные, но пугливые звери — главная звезда Байкала. На большом Ушканьем острове есть смотровая площадка, откуда за лежбищем можно наблюдать, не тревожа животных.<br><br>Климат здесь особый: даже в июле температура редко поднимается выше +15°C. Но это компенсируется чистейшим воздухом и удивительной тишиной, прерываемой только плеском волн и фырканьем нерп.',
            color_palette: 'baikal',
            coordinates: [53.8333, 108.6500],
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Наблюдать за нерпами с безопасного расстояния',
                'Фотографировать скалистые берега и кедровый стланик',
                'Слушать тишину — здесь нет суеты, только ветер и вода'
            ],
            tip: 'Для посещения нужно оформить разрешение в ФГБУ «Заповедное Подлеморье». Без гида — нельзя.'
        },
        {
            id: 3,
            name_ru: 'Полуостров Святой Нос',
            banner_title: 'Святой Нос — место силы у шаманов',
            description_ru: 'Место силы у шаманов. Трекинг на высоту 1877 м с панорамой, от которой захватывает дух.',
            full_description: 'Святой Нос — не просто полуостров. Для бурят это священное место, где небо встречается с землёй, а духи говорят с людьми. Шаманы приходят сюда для ритуалов, туристы — за головокружительными видами и тишиной.<br><br>Тропа на вершину идёт через кедровый стланик, альпийские луга и каменные россыпи. Наградой станет панорама: Чивыркуйский залив слева, Баргузинский — справа, а впереди — бескрайняя гладь Байкала до самого горизонта.',
            color_palette: 'baikal',
            coordinates: [53.2833, 108.9500],
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Совершить трекинг на вершину (1877 м) — 4–5 часов',
                'Поставить сэржэ (коновязь) — ритуальный столб',
                'Встретить рассвет на смотровой площадке',
                'Почувствовать «тишину Байкала»'
            ],
            tip: 'Берите с собой тёплую одежду даже летом — на вершине ветрено и прохладно.'
        },
        {
            id: 4,
            name_ru: 'Бухта Песчаная',
            banner_title: 'Бухта Песчаная — байкальский рай с ходячими деревьями',
            description_ru: 'Байкальский рай с белоснежным песком и знаменитыми «ходячими» деревьями.',
            full_description: 'Бухту Песчаную называют «байкальским раем». Представьте: белый песок, лазурная вода, сосны, растущие прямо из камней, и деревья на корнях — ветер и вода сделали их похожими на сказочных великанов, шагающих по берегу.<br><br>Это место особенно любят художники и фотографы — свет здесь особенный, мягкий и золотистый. А вода настолько прозрачная, что кажется: можно дотянуться до каждого камешка на дне.',
            color_palette: 'baikal',
            coordinates: [52.3833, 106.3500],
            image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            activities: [
                'Купаться в лазурной воде',
                'Фотографировать «ходячие» деревья',
                'Рисовать или просто сидеть с блокнотом',
                'Ночевать в палатке под звёздами'
            ],
            tip: 'Как добраться: Только по воде — из посёлка Листвянка или с турбаз Чивыркуйского залива.'
        },
        {
            id: 5,
            name_ru: 'Бухта Аяя',
            banner_title: 'Аяя — бухта, где горы смотрятся в воду',
            description_ru: 'Бухта, где горы смотрятся в воду. Идеальные отражения скал в кристально чистом озере.',
            full_description: 'Бухта Аяя спряталась среди скал на западном берегу Байкала. Она небольшая, но невероятно фотогеничная. Вода здесь кристально чистая, а скалы нависают так близко, что создаётся ощущение закрытого байкальского грота.<br><br>В солнечный день отражение гор в воде идеальное — кажется, можно перепутать небо с землёй. Ветер сюда залетает редко, поэтому поверхность часто бывает абсолютно зеркальной.',
            color_palette: 'baikal',
            coordinates: [53.5000, 107.8500],
            image_url: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b6a?w=800',
            activities: [
                'Фотографировать отражения — лучшее место на Байкале',
                'Купаться в спокойной, защищённой от ветра воде',
                'Устраивать пикник на галечном пляже',
                'Нырять с маской — видимость до 10 метров'
            ],
            tip: 'Лучшее время для фото — раннее утро, когда вода ещё неподвижна.'
        },
        {
            id: 6,
            name_ru: 'Озеро Фролиха',
            banner_title: 'Фролиха — реликтовое озеро с даватчаном',
            description_ru: 'Реликтовое ледниковое озеро с редкой рыбой даватчан, больше нигде не встречающейся.',
            full_description: 'Озеро Фролиха — это взгляд в прошлое планеты. Оно образовалось тысячи лет назад, когда ледники отступили, оставив после себя чашу с чистейшей ледниковой водой. Вода здесь настолько прозрачная, что даже на глубине 5–6 метров видно каждый камень.<br><br>Озеро знаменито даватчаном — рыбой, которую называют «байкальским лососем». Её нет больше нигде в мире, только здесь и в паре соседних высокогорных озёр.',
            color_palette: 'baikal',
            coordinates: [53.6500, 108.5000],
            image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
            activities: [
                'Трекинг от бухты Аяя (около 25 км)',
                'Поймать даватчана (рыбалка по лицензии)',
                'Разбить лагерь на берегу',
                'Фотографировать изумрудную воду на фоне скал'
            ],
            tip: 'Дорога трудная, нужна хорошая физподготовка и гид.'
        },
        {
            id: 7,
            name_ru: 'Энхалук',
            banner_title: 'Энхалук — байкальский дикий пляж с дюнами',
            description_ru: 'Байкальский дикий пляж с песчаными дюнами. Популярное место для кемпинга и виндсерфинга.',
            full_description: 'Энхалук — это не посёлок и не курорт. Это просто место на карте, где Байкал решил создать маленькую пустыню. Песчаные дюны высотой до 5 метров, редкая трава, скрип песка под ногами и бесконечная синева воды впереди.<br><br>Сюда едут те, кто хочет уединения, свободы и ветра. Ветры здесь дуют почти всегда — поэтому виндсерфингисты облюбовали Энхалук давно. А на закате дюны становятся золотыми — лучшее время для фотосессии.',
            color_palette: 'baikal',
            coordinates: [52.0833, 106.1167],
            image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            activities: [
                'Кемпить прямо на дюнах',
                'Заниматься виндсерфингом или кайтсерфингом',
                'Купаться — вода чистая, дно песчаное',
                'Фотографировать закаты с дюн'
            ],
            tip: 'Никакой инфраструктуры — только природа. Еду и воду брать с собой.'
        },
        {
            id: 8,
            name_ru: 'Иволгинский дацан',
            banner_title: 'Иволгинский дацан — сердце буддизма России',
            description_ru: 'Главный буддийский монастырь России, резиденция Хамбо-ламы. Здесь хранится нетленное тело ламы Итигэлова — феномен, который не могут объяснить учёные.',
            full_description: 'Иволгинский дацан — это не просто монастырь. Это центр буддизма всей России. Сюда едут паломники со всей страны и мира. Здесь живёт Хамбо-лама — глава буддистов России. А главное чудо — лама Итигэлов.<br><br>Даши-Доржо Итигэлов умер в 1927 году, сев в позу лотоса и попросив учеников навестить его через 75 лет. В 2002 году его тело достали — оно оказалось нетленным. Без бальзамирования, без специальных условий. Учёные разводят руками. Верующие знают: это знак.',
            coordinates: [51.8500, 107.6167],
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
            activities: [
                'Поклониться нетленному телу ламы Итигэлова (в специальном дворце)',
                'Обойти все 17 храмов и ступ по кругу (особое значение)',
                'Загадать желание у молитвенного барабана',
                'Купить бурятский чай и сладости в монастырской лавке',
                'Посмотреть на самую большую в России статую Будды (2 этажа высотой)'
            ],
            tip: 'Как одеться: Плечи и колени закрыты. Без шапки в храмах. Женщины — лучше в юбке. Фото внутри храмов — только с разрешения.<br><br>Совет: Приезжайте утром, до туристов. Тишина и молитвы создают особую атмосферу.'
        },
        {
            id: 9,
            name_ru: 'Ринпоче Багша (Улан-Удэ)',
            banner_title: 'Ринпоче Багша — золотой Будда на Лысой горе',
            description_ru: 'Дацан на вершине Лысой горы в Улан-Удэ. 6-метровая позолоченная статуя Будды, крупнейший буддийский колокол в России и вид на весь город.',
            full_description: 'Из любой точки Улан-Удэ видна Лысая гора. А на ней — золотая точка. Это дацан Ринпоче Багша. Главное здесь — статуя Будды высотой 6 метров, покрытая сусальным золотом. Она стоит в окружении 1000 маленьких Будд.<br><br>Но не статуей единой. Здесь висит самый большой буддийский колокол в России — его звон слышен далеко. А ещё — «Тропа долгой жизни» с молитвенными флагами, смотровая площадка с видом на весь Улан-Удэ и ступа, очищающая карму.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
            activities: [
                'Позвонить в огромный колокол (загадав желание)',
                'Пройти «Тропу долгой жизни» (привязать флаг)',
                'Сфотографировать Улан-Удэ с высоты',
                'Посмотреть на 1000 маленьких Будд вокруг большой статуи',
                'Просто посидеть в тишине — здесь она особая'
            ],
            tip: 'Приезжайте на закате — золотой Будда сияет особенно ярко, а город внизу зажигает огни.'
        },
        {
            id: 10,
            name_ru: 'Дацан богини Янжимы',
            banner_title: 'Дацан богини Янжимы — место, где исполняются желания о детях',
            description_ru: 'Единственный в мире дацан, посвящённый богине Янжиме — покровительнице материнства, творчества и мудрости. Сюда приезжают со всей России просить о детях.',
            full_description: 'Этот дацан стоит в Баргузинской долине, вдали от шумных трасс. Сюда не заезжают случайно — едут намеренно. Чаще всего женщины. Янжима — богиня, которая дарит детей. Молятся ей и о творчестве, и о мудрости, но главное — о материнстве.<br><br>Ламы говорят: если просить от чистого сердца — помогает. В дацане есть книга, где женщины пишут благодарности. Их тысячи. «Приехала без надежды — родила двойню», «После трёх выкидышей — здоровый сын». Читать эти записи — мурашки по коже.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
            activities: [
                'Заказать молебен о даровании детей',
                'Написать просьбу на ленточке и привязать её к специальному дереву',
                'Посмотреть на статую богини Янжимы (она улыбается)',
                'Поблагодарить, если желание сбылось'
            ],
            tip: 'Важно: Приезжать нужно с чистыми мыслями. Без злости, зависти, уныния.'
        },
        {
            id: 11,
            name_ru: 'Балдан Брэйбун',
            banner_title: 'Балдан Брэйбун — возрождённый монастырь у подножия Баргузинского хребта',
            description_ru: 'Восстановленный буддийский монастырь XIX века. Стоит у подножия Баргузинского хребта, среди лесов и гор.',
            full_description: 'Балдан Брэйбун был построен в XIX веке, разрушен в советское время и возрождён уже в нашем. Сегодня это действующий дацан, где монахи живут, молятся и работают. Место удивительно гармоничное: горы, лес, тишина и молитвы.<br><br>В дацане есть библиотека буддийских текстов, ступа и старые статуи, чудом уцелевшие в годы гонений. Монахи варят целебный чай из горных трав и угощают паломников.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
            activities: [
                'Попить монастырский чай с травами',
                'Увидеть уцелевшие статуи XIX века',
                'Поговорить с монахами (многие знают русский)',
                'Просто побыть в тишине — это одно из самых спокойных мест Бурятии'
            ],
            tip: 'Если повезёт — попадёте на утреннюю службу. Зрелище не для туристов, а для души.'
        },
        {
            id: 12,
            name_ru: 'Баргузинская долина',
            banner_title: 'Баргузинская долина — место, где встречаются тундра и полупустыня',
            description_ru: 'Пространство между двумя хребтами, где на одном участке можно увидеть тундру, тайгу и полупустыню. Здесь находится дацан богини Янжимы.',
            full_description: 'Баргузинская долина — это географический парадокс. С одной стороны — Баргузинский хребет с вечной мерзлотой и лишайниками. С другой — Икатский хребет, задерживающий влагу. Между ними — долина, где за несколько километров ландшафт меняется от болотистой тундры до сухой степи с верблюдами.<br><br>Здесь находится дацан богини Янжимы — единственный в мире, посвящённый богине творчества, мудрости и покровительнице детей. Говорят, если долго и искренне просить — она помогает.',
            color_palette: 'steppe',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            activities: [
                'Посетить дацан богини Янжимы (особенно если мечтаете о ребёнке)',
                'Фотографировать контрасты природы в одной долине',
                'Увидеть диких верблюдов (они здесь есть!)',
                'Побывать в посёлке Уро — родине баргузинского соболя'
            ],
            tip: 'Легенда: Богиня Янжима помогает тем, кто приходит с чистым сердцем. Женщины приезжают сюда со всей Бурятии просить о детях.'
        },
        {
            id: 13,
            name_ru: 'Тункинская долина',
            banner_title: 'Тункинская долина — сибирские Альпы с термальными источниками',
            description_ru: 'Горная долина, которую сравнивают с Альпами. Здесь есть всё: минеральные источники, водопады, альпийские луга, чистые реки и заснеженные пики.',
            full_description: 'Тункинскую долину называют «сибирскими Альпами» не ради красного словца. Она действительно похожа на Швейцарию: такие же зелёные луга, такие же острые горные пики, такие же прозрачные реки. Но есть одно отличие — здесь почти нет людей.<br><br>Долина входит в состав Тункинского национального парка. Здесь можно неделями ходить пешком и встречать только нерпу на камнях да орла в небе. А вечером — залезть в горячий источник под открытым небом и смотреть на звёзды.',
            color_palette: 'steppe',
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Принимать ванны в источниках Аршана, Ниловой Пустыни, Жемчуга',
                'Совершать трекинг к Пику Любви (300 ступеней — к удаче в любви)',
                'Смотреть на водопады Кынгаргу и Малый Жом-Болок',
                'Жить в кемпинге у реки Иркут',
                'Фотографировать отражение Саянских пиков в воде'
            ],
            tip: 'Приезжайте в августе — альпийские луга цветут, а воздух прозрачен до горизонта.'
        },
        {
            id: 14,
            name_ru: 'Долина потухших вулканов',
            banner_title: 'Долина потухших вулканов — чёрные конусы среди зелёных лугов',
            description_ru: 'Уникальное место, где посреди степи стоят чёрные шлаковые конусы потухших вулканов Кропоткина, Перетолчина и Старого. Застывшие лавовые потоки до сих пор хранят тепло.',
            full_description: 'Представьте: вы едете по бескрайней степи, вокруг — ковыль и ветер. И вдруг из земли вырастают чёрные, совершенно инородные конусы. Это вулканы. Они не извергались тысячи лет, но до сих пор выглядят так, будто проснулись вчера.<br><br>Вулкан Кропоткина — самый высокий (высота около 200 метров). На его вершину можно подняться пешком. Внутри — кратер, заросший травой. Сверху открывается вид на долину с семью вулканами (потухших, но не забытых).',
            color_palette: 'steppe',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Подняться на вулкан Кропоткина',
                'Походить по застывшей лаве — она похожа на чёрное стекло',
                'Фотографировать чёрные конусы на фоне зелёной степи',
                'Почувствовать энергию земли (место называют «геологическим чудом»)'
            ],
            tip: 'Секрет: Если встать внутри кратера и крикнуть — эхо летит над всей долиной.'
        },
        {
            id: 15,
            name_ru: 'Пик Мунку-Сардык',
            banner_title: 'Мунку-Сардык — крыша Восточных Саян и священная гора',
            description_ru: 'Высочайшая точка Восточных Саян (3491 метр). Священная гора, покрытая вечными снегами. Цель для опытных альпинистов и место силы для бурят.',
            full_description: 'Мунку-Сардык переводится как «вечная белая гора». И это правда — даже в июле на вершине лежит снег. Для бурят это священное место, где живут духи. Гору нельзя осквернять криками или мусором — только тишина и уважение.<br><br>Восхождение требует подготовки: высота, ледники, камнепады. Но те, кто доходят, говорят: мир становится другим. Наверху — только небо, снег и чувство абсолютной свободы.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Совершить восхождение (требуется акклиматизация, снаряжение, гид)',
                'Фотографировать панораму Саян и Байкала с высоты 3,5 км',
                'Поставить флажок на вершине',
                'Почувствовать «головокружение от высоты и святости»'
            ],
            tip: 'Важно: Без гида и разрешения — нельзя. Маршрут опасен.'
        },
        {
            id: 16,
            name_ru: 'Гора Мамай',
            banner_title: 'Гора Мамай — альпийские луга летом, фрирайд зимой',
            description_ru: 'Гора, которая хороша в любое время года. Летом — альпийские луга и Соболиные озёра. Зимой — фрирайд и снегоходы.',
            full_description: 'Гора Мамай — это 700 метров относительной высоты и 1000 метров от трассы. Достаточно, чтобы забыть о цивилизации. Летом здесь пасутся табуны лошадей, цветут альпийские луга и плещется рыба в Соболиных озёрах. Зимой сюда едут фрирайдеры — снега так много, что можно кататься до мая.<br><br>На вершине — ровное плато. Говорят, что название пошло от слова «мама» (так в некоторых диалектах называют духов). Место действительно особенное — тихое, спокойное, уютное.',
            color_palette: 'steppe',
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Летом: трекинг к Соболиным озёрам, рыбалка, пикник на альпийском лугу',
                'Зимой: фрирайд (снаряжение своё), снегоходы',
                'Фотографировать закаты — здесь небо часто розовое',
                'Жить в глэмпингах у подножия'
            ],
            tip: 'Лучшее время для пешего похода — июль-август. Для фрирайда — февраль-март.'
        },
        {
            id: 17,
            name_ru: 'Сарминское ущелье',
            banner_title: 'Сарминское ущелье — где дует самый сильный ветер на Байкале',
            description_ru: 'Ущелье, известное сарминским ветром — самым сильным на Байкале (до 50 м/с). Летом здесь цветут разнотравные поляны.',
            full_description: 'Сарма — это легенда. Ветер, который вырывается из ущелья со скоростью урагана, поднимает на Байкале волны высотой с двухэтажный дом. Местные рыбаки боятся его как огня. Но туристы едут сюда не за ветром — за красотой.<br><br>Летом, когда Сарма затихает, ущелье превращается в цветущий сад. Разнотравье такое густое и яркое, что кажется: кто-то разлил краски по склонам. А по дну течёт река с ледяной водой.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Фотографировать контраст: суровые скалы и нежные цветы',
                'Устроить пикник на разнотравной поляне',
                'Попробовать поймать момент, когда начинается Сарма (ветер слышен издалека)',
                'Постоять на краю ущелья — вид на Байкал открывается невероятный'
            ],
            tip: 'Осторожно: Если подул ветер — уходите. Сарма опасна для жизни.'
        },
        {
            id: 18,
            name_ru: 'Водопад Малый Жом-Болок',
            banner_title: 'Малый Жом-Болок — 20 метров падающей воды',
            description_ru: 'Двадцатиметровый водопад на реке Бага-Жомболок. Летом — шум воды и радуги. Зимой — гигантская ледяная скульптура.',
            full_description: 'Водопад Малый Жом-Болок — это 20 метров чистой, ледяной, бешеной воды. Летом вокруг него зелено и влажно, в брызгах постоянно играют маленькие радуги. А зимой водопад замерзает — и превращается в огромную ледяную скульптуру, которую можно разглядывать часами.<br><br>Добраться до него — приключение само по себе: тропа идёт через тайгу, переправы через ручьи и подъёмы по камням. Но когда выходишь к водопаду — всё забывается.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b6a?w=800',
            activities: [
                'Стоять под брызгами (очень освежает)',
                'Фотографировать водопад с разных ракурсов',
                'Зимой — рассматривать ледяные наплывы',
                'Устроить привал у подножия (есть удобные камни)'
            ],
            tip: 'Приезжайте в июне — водопад полноводный и особенно красивый.'
        },
        {
            id: 19,
            name_ru: 'Водопад Кынгарга',
            banner_title: 'Кынгарга — водопад в мраморном ущелье',
            description_ru: 'Каскад из 12 ступеней в мраморном ущелье. Всего в 3 километрах от посёлка Аршан. Самый доступный и живописный водопад Тункинской долины.',
            full_description: 'Кынгаргу называют «бубен» (с бурятского). И правда — вода шумит так, будто шаман бьёт в бубен. Водопад спускается по мраморным ступеням 12 каскадами. Между ними — небольшие озёра с ледяной, но очень мягкой водой.<br><br>Подойти к водопаду легко — тропа начинается прямо от посёлка Аршан, всего 3 километра по лесу. На полпути — кафе с буузами и видом на Саяны. А у самого водопада — деревянные мостки и скамейки.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b6a?w=800',
            activities: [
                'Дойти до верхней ступени — подъём крутой, но вид того стоит',
                'Окунуться в одно из озёр (смельчаки делают это даже зимой)',
                'Фотографировать мраморные ступени с падающей водой',
                'Посидеть на скамейке и слушать «бубен» Кынгарги'
            ],
            tip: 'Легенда: Говорят, вода здесь лечит усталость и дарит ясность мыслей.'
        },
        {
            id: 20,
            name_ru: 'Аршан',
            banner_title: 'Аршан — старейший курорт у подножия Саян',
            description_ru: 'Старейший бальнеологический курорт Бурятии. Минеральные воды, водопады, трекинг к Пику Любви и атмосфера советского санатория с новыми удобствами.',
            full_description: 'Аршан — это слово знакомо каждому буряту. Оно означает «целебная вода». Курорт основали ещё в 1920-х, и с тех пор сюда едут лечить желудок, нервы и просто отдыхать.<br><br>Главное богатство — минеральные источники с углекислыми водами. Их можно пить (но осторожно) и принимать ванны. Вокруг — горы, кедры, водопады. А в посёлке — санатории, кафе с бурятской кухней и сувенирные лавки.',
            color_palette: 'steppe',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Пить минеральную воду из бювета (берите стакан)',
                'Подняться к Пику Любви — 300 ступеней к удаче в личной жизни',
                'Сходить на водопад Кынгаргу (3 км от посёлка)',
                'Жить в современном санатории с лечением',
                'Купить бурятские травы и целебные сборы'
            ],
            tip: 'Лучшее время — июль-август. В сентябре уже холодно, зимой работают только некоторые санатории.'
        },
        {
            id: 21,
            name_ru: 'Горячинск',
            banner_title: 'Горячинск — курорт на берегу Байкала с целебной водой',
            description_ru: 'Курорт на берегу Байкала с минеральными водами, известный ещё с дореволюционных времён. Лечение опорно-двигательного аппарата и нервной системы.',
            full_description: 'Горячинск старше Аршана — его основали в XVIII веке. Екатерина II жаловала местные источники, купцы строили дачи, а сегодня здесь современный санаторий на берегу Байкала.<br><br>Вода в Горячинске кремнистая, термальная (до +54°C). Лечит суставы, кожу, нервы. Но главное — вид. Бассейн с горячей водой стоит прямо у Байкала. Вы лежите в тёплой воде, а перед вами — холодная, синяя, бесконечная гладь озера.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Принимать термальные ванны в бассейне с видом на Байкал',
                'Лечить суставы и нервы (курс — 14 дней)',
                'Гулять по сосновому лесу прямо от санатория',
                'Купаться в Байкале (если хватит смелости) — контраст горячих источников и ледяного озера',
                'Фотографировать рассветы над Байкалом из бассейна'
            ],
            tip: 'Бронируйте номера заранее — в сезон мест нет.'
        },
        {
            id: 22,
            name_ru: 'Нилова-Пустынь',
            banner_title: 'Нилова-Пустынь — радоновые ванны в горах Тунки',
            description_ru: 'Курорт в Тункинском районе с радоновыми водами. Лечит опорно-двигательный аппарат, кожные заболевания и нервы.',
            full_description: 'Нилова-Пустынь спряталась в горах Восточного Саяна, на высоте 1000 метров. Воздух здесь разрежённый, чистый, пахнет сосной и камнем. А вода — радоновая, слаборадиоактивная. Звучит страшно, но именно радон лечит то, что не берут другие воды: артриты, радикулиты, псориаз.<br><br>Курорт небольшой, камерный. Здесь нет толп. Есть тишина, горы и вода, которая делает своё дело.',
            color_palette: 'steppe',
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Принимать радоновые ванны (по назначению врача)',
                'Дышать горным воздухом (он сам по себе лекарство)',
                'Гулять по окрестностям — тропы идут прямо от санатория',
                'Смотреть на звёзды — здесь нет городского света'
            ],
            tip: 'Важно: Радоновые ванны имеют противопоказания. Нужна консультация врача.'
        },
        {
            id: 23,
            name_ru: 'Шумакские источники',
            banner_title: 'Шумакские источники — высокогорное чудо со ста источниками',
            description_ru: 'Высокогорные термальные источники (более 100!) в Восточных Саянах. Труднодоступны, но те, кто добирается, называют Шумак лучшим местом на земле.',
            full_description: 'Шумак — это легенда. Больше ста термальных источников, бьющих из земли в высокогорной долине. Вода разная: в одном источнике лечит сердце, в другом — желудок, в третьем — нервы. Ламы освятили каждый.<br><br>Добраться сюда трудно: 70 км пешком от посёлка Нилова-Пустынь или вертолётом. Но те, кто доходит, говорят: Шумак меняет жизнь. Тишина, горы, пар от источников и чувство, что ты на краю света.',
            color_palette: 'steppe',
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Принимать ванны в разных источниках (каждый для своего)',
                'Жить в домиках базы «Шумак» (без удобств, но с душой)',
                'Смотреть на звёзды — здесь Млечный Путь виден как на ладони',
                'Почувствовать полное отключение от цивилизации (связи нет)'
            ],
            tip: 'Сложность: Только для подготовленных или тех, у кого есть деньги на вертолёт.'
        },
        {
            id: 24,
            name_ru: 'Ильинка (Питателевский источник)',
            banner_title: 'Ильинка — горячий источник в часе от Улан-Удэ',
            description_ru: 'Горячий источник всего в часе езды от Улан-Удэ. Крытый бассейн с минеральной водой +38°C. Идеально для одного дня.',
            full_description: 'Ильинка — это если хочется горячей воды, но нет времени ехать в горы. Всего час на машине от Улан-Удэ — и вы в крытом бассейне с термальной водой. Температура +38°C — как в тёплой ванне. Вода слабоминерализованная, пахнет сероводородом (это нормально).<br><br>Вокруг бассейна — кабинки для переодевания, лавочки, зона отдыха. Можно приехать утром, купаться, обедать в кафе и вечером вернуться в город.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Купаться в горячей воде круглый год',
                'Лечить суставы и кожу (курс — 5–10 процедур)',
                'Приезжать всей семьёй — детям тоже полезно',
                'Совместить с поездкой на Байкал (Ильинка на полпути)'
            ],
            tip: 'В выходные много народу. Приезжайте в будни.'
        },
        {
            id: 25,
            name_ru: 'Кучигер, Алла, Гарга, Дзелинда, Гоуджекит',
            banner_title: 'Термальные источники севера — дикая природа и горячая вода',
            description_ru: 'Несколько природных термальных источников в северной Бурятии. Обустроенные базы отдыха и совсем дикие места — на любой вкус.',
            full_description: 'Кучигерские источники известны с XIX века — о них знают далеко за пределами Бурятии. Горячая вода (от +21 до +75°C) бьёт прямо из земли, а вместе с илом образует лечебные грязи. Говорят, у источников можно увидеть брошенные костыли — люди оставляли их, когда вставали на ноги после курса.<br><br>На базе отдыха «Кучигер» есть деревянные ванны, домики и открытый бассейн. Вокруг — тайга, горы Баргузинской долины и полная тишина.<br><br><strong>Что делать:</strong><br>• Принимать термальные ванны и грязевые процедуры<br>• Купаться в открытом бассейне под звёздами<br>• Совместить с поездкой к соседним источникам Алла и Гарга<br>• Гулять по долине и слушать легенды о целительной силе воды<br><br><strong>Важно:</strong> Дорога из Улан-Удэ занимает 6–8 часов. Бронируйте проживание заранее — в сезон мест мало.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Выбрать «свой» источник по температуре и составу',
                'Жить в домике с горячей водой прямо из скважины',
                'Купаться зимой — пар идёт, вокруг снег, а вам тепло',
                'Рыбачить, собирать грибы, просто гулять'
            ],
            tip: 'Берите с собой тапочки, полотенце и еду — не везде есть кафе.'
        },
        {
            id: 26,
            name_ru: 'Баунт',
            banner_title: 'Баунт — целебные озёра северной Бурятии',
            description_ru: 'Курорт в северной Бурятии на берегу одноимённого озера. Лечение грязями и минеральными водами. Место для тех, кто хочет тишины и покоя.',
            full_description: 'Озеро Баунт находится в центре Баунтовского района — самого северного и самого дикого в Бурятии. Вода здесь чистая, прозрачная, а грязи со дна — лечебные. Курорт небольшой, старый, но работающий.<br><br>Сюда едут за тишиной. Нет шоссе, нет толп, нет суеты. Есть озеро, лес, источники и чувство, что ты в другом времени.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Лечить суставы целебными грязями',
                'Купаться в чистейшем озере',
                'Ловить рыбу — здесь её много',
                'Уходить в лес за грибами и ягодами',
                'Фотографировать северную природу — она суровая, но красивая'
            ],
            tip: 'Дорога долгая (12 часов из Улан-Удэ). Берите с собой запас еды и терпение.'
        },
        {
            id: 27,
            name_ru: 'Памятник Ленину (Голова)',
            banner_title: 'Голова Ленина — главный селфи-объект Бурятии',
            description_ru: 'Самая большая голова вождя в мире: высота 7,7 метра, вес 42 тонны. Любимое место для селфи у жителей и туристов.',
            full_description: 'Да, это звучит странно. Но это факт: в центре Улан-Удэ стоит огромная бронзовая голова Ленина. Высота — два этажа. Вес — 42 тонны. Открыли в 1971 году, и с тех пор она стала символом города — солнечной столицы с советским прошлым и бурятским настоящим.<br><br>Туристы обязательно фотографируются с головой. Смешные, серьёзные, с подарками, в бурятских шапках — тысячи фото. Ленин здесь свой, родной, не страшный.',
            color_palette: 'sun',
            image_url: 'https://images.unsplash.com/photo-1551817958-c1e8d3508b42?w=800',
            latitude: 51.834722,
            longitude: 107.585000,
            activities: [
                'Сделать селфи на фоне головы (классика)',
                'Погладить нос на удачу (местная примета)',
                'Посидеть на ступенях и понаблюдать за городом',
                'Купить мороженое в киоске рядом'
            ],
            tip: 'Приезжайте на закате — солнце красиво подсвечивает бронзу.'
        },
        {
            id: 28,
            name_ru: 'Площадь Советов',
            banner_title: 'Площадь Советов — главная площадь Улан-Удэ',
            description_ru: 'Центральная площадь города, окружённая архитектурой советского периода. Здесь проходят все главные праздники: Сагаалган, День Победы, День города.',
            full_description: 'Площадь Советов — это сердце Улан-Удэ. Если вы не знаете, куда идти, идите сюда. Слева — правительство Бурятии, справа — администрация города, в центре — фонтан и сцена для праздников.<br><br>Зимой здесь ставят ёлку и ледовый городок. На Сагаалган — устанавливают белую юрту и проводят обряды. Летом — концерты, ярмарки, фестивали.',
            color_palette: 'sun',
            image_url: 'https://images.unsplash.com/photo-1551817958-c1e8d3508b42?w=800',
            activities: [
                'Постоять в центре и понять, где вы',
                'Посмотреть на здание правительства с бурятским орнаментом',
                'Погулять вечером — площадь красиво подсвечена',
                'Попасть на Сагаалган (февраль) — это незабываемо'
            ],
            tip: 'Зайдите в Госцирк (рядом) — он работает с 1970-х.'
        },
        {
            id: 29,
            name_ru: 'Пешеходная улица Ленина (Арбат)',
            banner_title: 'Улица Ленина — улан-удэнский Арбат',
            description_ru: 'Пешеходная улица в центре города. Купеческие дома, памятники, кафе, сувенирные лавки и вечно гуляющие люди.',
            full_description: 'Улицу Ленина называют «улан-удэнским Арбатом». Здесь нет машин, только люди, лавочки, уличные музыканты и запах кофе из маленьких кафе. Дома — купеческие, XIX века, с резными наличниками.<br><br>На улице стоят памятники: Гражданину с зонтиком, Велосипедисту, Фотографу. С ними принято фотографироваться. А ещё здесь продают бурятские сувениры: войлочные игрушки, украшения из серебра, каллиграфию.',
            color_palette: 'sun',
            image_url: 'https://images.unsplash.com/photo-1551817958-c1e8d3508b42?w=800',
            activities: [
                'Пройти от площади Революции до цирка (20 минут прогулки)',
                'Зайти в сувенирную лавку и купить что-то бурятское',
                'Выпить кофе в одной из кофеен',
                'Сфотографироваться с Гражданином с зонтиком',
                'Летом — съесть мороженое, зимой — горячий чай из самовара'
            ],
            tip: 'Зайдите в переулки — там сохранилась старая купеческая застройка.'
        },
        {
            id: 30,
            name_ru: 'Театр оперы и балета',
            banner_title: 'Театр оперы и балета — классика на бурятской сцене',
            description_ru: 'Главный театр Бурятии. Идут классические оперы и балеты, а также национальные бурятские постановки.',
            full_description: 'Театр оперы и балета — это гордость Улан-Удэ. Здание с колоннами и лепниной стоит в центре, напротив площади Советов. Внутри — красный бархат, хрустальные люстры и акустика, которой завидуют московские театры.<br><br>Здесь можно увидеть «Лебединое озеро» и «Жизель», а можно — «Улюбшан» («Любовь») на бурятском языке с русскими титрами. Национальные балеты ставят по бурятским легендам, с элементами народных танцев.',
            color_palette: 'sun',
            image_url: 'https://images.unsplash.com/photo-1551817958-c1e8d3508b42?w=800',
            activities: [
                'Посмотреть балет «Улюбшан» (он о вечной любви)',
                'Прийти в костюме (вечерний дресс-код приветствуется)',
                'Прогуляться в антракте по фойе с колоннами',
                'Купить программку на бурятском языке — сувенир необычный'
            ],
            tip: 'Билеты покупайте заранее — на премьеры их разбирают за месяц.'
        },
        {
            id: 31,
            name_ru: 'Музей истории Улан-Удэ',
            banner_title: 'Музей истории Улан-Удэ — от острога до столицы',
            description_ru: 'Музей, рассказывающий историю города от основания в 1666 году до наших дней. Расположен в старинном купеческом доме.',
            full_description: 'Музей истории Улан-Удэ стоит в старом купеческом доме на улице Ленина. Здесь нет огромных залов — всё камерно, уютно, по-домашнему. Экспозиция ведёт от основания Удинского острога (1666 год) через купеческий XIX век к советскому времени и современности.<br><br>Особенно интересны разделы о торговле: купцы Верхнеудинска (старое название Улан-Удэ) торговали с Китаем чаем, шёлком и серебром. А ещё — о Гражданской войне: здесь была столица Дальневосточной республики.',
            color_palette: 'sun',
            image_url: 'https://images.unsplash.com/photo-1551817958-c1e8d3508b42?w=800',
            activities: [
                'Узнать, как маленький острог стал столицей республики',
                'Посмотреть на купеческие самовары и костюмы',
                'Найти старые фото Улан-Удэ — и сравнить с современными',
                'Спросить про привидение (говорят, в старом купеческом доме оно есть)'
            ],
            tip: 'Возьмите аудиогид — истории очень живые.'
        },
        {
            id: 32,
            name_ru: 'Центр современного искусства «Залуу»',
            banner_title: 'Залуу — современное искусство на стыке культур',
            description_ru: 'Центр современного искусства, где бурят-монгольская каллиграфия встречается с инсталляциями и перформансами.',
            full_description: '«Залуу» в переводе с бурятского — «молодой». И это название идеально подходит: здесь выставляются молодые бурятские художники, графики, каллиграфы. Главное — бурят-монгольская каллиграфия: старинное письмо, которое превращают в современное искусство.<br><br>В центре проводят мастер-классы по каллиграфии, лекции о бурятской культуре, концерты этно-музыки. А в магазине при центре можно купить авторские открытки, плакаты, футболки с бурятскими надписями.',
            color_palette: 'sun',
            image_url: 'https://images.unsplash.com/photo-1551817958-c1e8d3508b42?w=800',
            activities: [
                'Научиться писать своё имя на старомонгольском письме',
                'Купить уникальный сувенир — авторскую каллиграфию',
                'Посмотреть на современное бурятское искусство (оно удивляет)',
                'Выпить чай в кафе при центре — с видом на старые купеческие дома'
            ],
            tip: 'Загляните в афишу — часто проходят бесплатные лекции.'
        },
        {
            id: 33,
            name_ru: 'Этнографический музей народов Забайкалья',
            banner_title: 'Этнографический музей — 37 гектаров живой истории',
            description_ru: 'Музей под открытым небом площадью 37 гектаров. Бурятские юрты, эвенкийские чумы, старообрядческие избы, буддийский дуган и мастер-классы по лепке бууз.',
            full_description: 'Этот музей — целый мир. Вы входите в ворота — и переноситесь в Забайкалье XIX века. Сначала бурятский улус: войлочные юрты, внутри — очаг, колыбель, алтарь. Рядом — эвенкийские чумы из жердей и бересты. Дальше — русские деревни старообрядцев: избы с резными наличниками, церковь, амбар.<br><br>А ещё здесь есть буддийский дуган (храм) и шаманское святилище. Все постройки настоящие, перевезённые из разных районов Бурятии. В них можно заходить, трогать, сидеть на лавках.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            activities: [
                'Полепить буузы на мастер-классе (и съесть их тут же)',
                'Посидеть в бурятской юрте у очага',
                'Позвонить в шаманский бубен (аккуратно — это священное)',
                'Сфотографироваться в старообрядческом костюме',
                'Угоститься боовами и чаем с молоком'
            ],
            tip: 'Время: Лучше закладывать 3–4 часа — музей огромный.'
        },
        {
            id: 34,
            name_ru: '«Степной кочевник» (с. Нарын-Ацагат)',
            banner_title: 'Степной кочевник — жизнь в юрте, стрельба из лука и танец ёохор',
            description_ru: 'Этно-комплекс в Заиграевском районе. Жизнь в отапливаемых юртах, конные прогулки, стрельба из лука, национальный танец ёохор и бурятская кухня.',
            full_description: '«Степной кочевник» — это не музей, а живая деревня. Вы приезжаете — и становитесь кочевником на день или на несколько. Живёте в настоящей войлочной юрте (внутри есть печка, летом прохладно, зимой тепло), едите буузы и бухлёр, стреляете из лука.<br><br>Хозяева — настоящие буряты, которые говорят на родном языке, поют горлом и танцуют ёохор (круговой танец). Они научат вас завязывать хадак (ритуальный шарф), ставить коновязь и здороваться по-бурятски.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            activities: [
                'Переночевать в юрте (отапливаемой!)',
                'Съесть настоящие буузы, приготовленные хозяйкой',
                'Пострелять из лука по мишеням',
                'Выучить несколько слов на бурятском',
                'Танцевать ёохор у костра'
            ],
            tip: 'Обязательно попробуйте молочную водку — архи. Пьётся легко, но крепкая.'
        },
        {
            id: 35,
            name_ru: 'Село Бичура',
            banner_title: 'Бичура — самое длинное старообрядческое село в мире',
            description_ru: 'Крупнейшее старообрядческое село Бурятии. Улица Коммунистическая — 17 километров, внесена в Книгу рекордов Гиннесса. Культура старообрядцев — в списке наследия ЮНЕСКО.',
            full_description: 'Бичура — это не село, а маленький город, растянувшийся на 17 километров вдоль реки. Здесь живут семейские — старообрядцы, которых сослали в Забайкалье в XVIII веке. Они сохранили свой язык (южнорусский говор), свою веру (дониконовское православие), свои песни и костюмы.<br><br>Главная улица, Коммунистическая, попала в Книгу рекордов Гиннесса как самая длинная сельская улица в мире. Пройти её пешком — занятие не для слабых.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            activities: [
                'Пройтись по самой длинной улице (хотя бы часть)',
                'Услышать старообрядческие песни (поют а капелла, до мурашек)',
                'Зайти в старообрядческую церковь',
                'Попробовать домашние разносолы (огурцы, грибы, квас)',
                'Купить льняные полотенца с ручной вышивкой'
            ],
            tip: 'Приезжайте на праздник — масленица или Троица здесь отмечаются с размахом.'
        },
        {
            id: 36,
            name_ru: 'Село Тарбагатай',
            banner_title: 'Тарбагатай — семейская изба и ЮНЕСКО',
            description_ru: 'Село, где находится музей «Семейская изба». Культура старообрядцев Забайкалья внесена в список наследия ЮНЕСКО как шедевр устного нематериального наследия.',
            full_description: 'Тарбагатай — это младший брат Бичуры. Тоже старообрядческое село, тоже старинные избы, тоже особый говор. Но здесь есть музей «Семейская изба» — дом XIX века, где всё сохранилось как было: печь, прялка, иконы, люлька, сундук с приданым.<br><br>Хозяйка музея — бабушка, которая родилась в этой избе. Она рассказывает о жизни семейских, поёт старинные песни и угощает чаем из самовара.',
            color_palette: 'datsan',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            activities: [
                'Посетить музей «Семейская изба»',
                'Попить чай из самовара с травами',
                'Услышать живое старообрядческое пение',
                'Купить домотканые половики и вышивку',
                'Прогуляться по тихим улицам с избами'
            ],
            tip: 'Спрашивайте про «свадебный поезд» — традицию, которой уже 300 лет.'
        },
        {
            id: 37,
            name_ru: 'Байкальский биосферный заповедник',
            banner_title: 'Байкальский заповедник — Хамар-Дабан, где рождаются реки',
            description_ru: 'Заповедник на хребте Хамар-Дабан. Высокогорья, альпийские луга, тайга и реки, которые текут в Байкал. Требуется регистрация на сайте.',
            full_description: 'Байкальский заповедник — это горная страна. Хребет Хамар-Дабан, пики до 2000 метров, озёра ледникового происхождения и реки, которые бегут в Байкал. Здесь водятся медведи, изюбри, кабарга и орлы.<br><br>Для туристов есть экотропы разной сложности. Самая известная — на пик Черского (вид на Байкал с высоты 2000 метров). Но без регистрации на сайт заповедника вас не пустят.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Подняться на пик Черского (2044 м) — вид на Байкал невероятный',
                'Пройти по экотропе «Река Осиновка» (лёгкая, для всех)',
                'Посетить визит-центр с музеем природы',
                'Увидеть кабаргу (маленького оленя с клыками)',
                'Соблюдать правила — здесь строго с мусором'
            ],
            tip: 'Важно: Регистрация на сайте заповедника обязательна. Без неё — штраф.'
        },
        {
            id: 38,
            name_ru: 'Баргузинский заповедник',
            banner_title: 'Баргузинский заповедник — первый заповедник России',
            description_ru: 'Первый заповедник России, основанный в 1916 году для сохранения соболя. Северо-восточное побережье Байкала, тайга, горячие источники.',
            full_description: 'Баргузинский заповедник старше советской власти. Его основали в 1916 году, когда соболя на Байкале почти истребили. Спасли. Сейчас соболь здесь — хозяин, а люди — гости. Заповедник строгий: просто так не войдёшь, только с разрешения и по тропам.<br><br>Здесь тайга подходит прямо к Байкалу, вода чернеет от глубины, а на берегу бьют горячие источники. Туристическая тропа одна — «Путь к чистому Байкалу», но она того стоит.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Пройти по экотропе «Путь к чистому Байкалу» (50 км, 4–5 дней)',
                'Увидеть дикого соболя (повезёт — он не боится людей)',
                'Принять термальные ванны у берега',
                'Ночевать в лесу в палатке (разрешённые места)',
                'Почувствовать себя первопроходцем'
            ],
            tip: 'Важно: Только по разрешению. Гид обязателен для маршрута длиннее дня.'
        },
        {
            id: 39,
            name_ru: 'Джергинский заповедник',
            banner_title: 'Джергинский заповедник — царство снежного барана и манула',
            description_ru: 'Северо-восток Бурятии. Обитают снежный баран (толсторог) и манул — дикий кот, занесённый в Красную книгу. Субарктическая природа.',
            full_description: 'Джергинский заповедник — для тех, кто хочет увидеть настоящий север. Здесь растут лиственницы с кривыми стволами, по камням прыгают снежные бараны, а в кустах прячется манул — пушистый дикий кот с недовольной мордой.<br><br>Это одно из самых труднодоступных мест Бурятии. Дорог нет, только вертолёт или пешком несколько дней. Но те, кто доходит, говорят: другой планета. Суровая, холодная, но прекрасная.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Увидеть снежного барана (толсторога) — он живёт только здесь',
                'Попытаться разглядеть манула (он прячется)',
                'Пройти по тундре и почувствовать субарктику',
                'Фотографировать каменные россыпи и ледники'
            ],
            tip: 'Сложность: Только для очень подготовленных. Без гида и разрешения — нельзя.'
        },
        {
            id: 40,
            name_ru: 'Забайкальский национальный парк',
            banner_title: 'Забайкальский нацпарк — восточный берег Байкала',
            description_ru: 'Национальный парк на восточном побережье Байкала. Тропа «Путь к чистому Байкалу» (50 км), песчаные пляжи, горячие источники. Въездной пропуск — 400 рублей.',
            full_description: 'Забайкальский национальный парк — это Чивыркуйский залив, полуостров Святой Нос, Ушканьи острова и много километров береговой линии. Здесь можно и в горах, и у воды, и в лесу, и на источнике.<br><br>Самая известная тропа — «Путь к чистому Байкалу», 50 километров вдоль берега. Идти 4–5 дней, ночевать в палатках или на турбазах. Встречаются медведи, но обычно они не опасны.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Пройти часть Большой Байкальской тропы',
                'Искупаться в Чивыркуйском заливе',
                'Сходить на Ушканьи острова (с разрешением)',
                'Принять горячие ванны в бухте Змеиная',
                'Увидеть нерпу на камнях'
            ],
            tip: 'Важно: Въезд платный — 400 рублей с человека. Останавливают на кордонах.'
        },
        {
            id: 41,
            name_ru: 'Фролихинский заказник',
            banner_title: 'Фролихинский заказник — водопады и изюбрь',
            description_ru: 'Заказник на северо-восточном побережье Байкала. Охрана изюбря и кабарги. Водопады, озёра Фролиха и ледниковые ландшафты.',
            full_description: 'Фролихинский заказник — это место, где Байкал встречается с горами. Здесь текут быстрые реки с водопадами, в озёрах плещется редкая рыба, а в лесах прячутся изюбрь и кабарга.<br><br>Центр заказника — озеро Фролиха, реликтовое, ледниковое, с изумрудной водой. Добраться сюда — подвиг: 25 километров пешком от бухты Аяя. Но озеро того стоит.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Дойти до озера Фролиха (треккинг 25 км)',
                'Посмотреть на водопады по дороге',
                'Увидеть изюбря (крупный олень) или кабаргу (маленькая, с клыками)',
                'Поймать даватчана (редкая рыба, по лицензии)'
            ],
            tip: 'Сложность: Только для пеших туристов с хорошей подготовкой.'
        },
        {
            id: 42,
            name_ru: 'Большая Байкальская тропа (ББТ)',
            banner_title: 'Большая Байкальская тропа — 50 километров вдоль самого красивого берега',
            description_ru: 'Система пеших троп вокруг Байкала. Самый популярный участок — в Забайкальском нацпарке, 50 км от бухты Песчаной до мыса Большой Кадильный.',
            full_description: 'Большая Байкальская тропа — система пеших маршрутов вокруг Байкала, созданная волонтёрами со всего мира. Тропы промаркированы, на них обустроены места для палаток и привалов. Самый популярный участок — 50 км в Забайкальском национальном парке: от бухты Песчаной до мыса Большой Кадильный.<br><br>Идти можно от одного дня до недели. За 4–5 дней вы увидите песчаные бухты, скальные мысы, горячие источники в бухте Змеиная и, если повезёт, нерп на камнях.<br><br><strong>Что делать:</strong><br>• Пройти 50 км за 4–5 дней с палаткой и провизией<br>• Купаться в Байкале каждый день по пути<br>• Принять горячие ванны в бухте Змеиная<br>• Встретить рассвет на мысе<br>• Взять гида, если идёте впервые<br><br><strong>Важно:</strong> Регистрируйтесь на сайте ББТ — там же маршруты и правила. Въезд в нацпарк платный (400 ₽). Медведи встречаются — храните еду в недоступном месте.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            activities: [
                'Пройти 50 км за 4–5 дней (палатка, еда — с собой)',
                'Спать в палатке под звёздами',
                'Купаться в Байкале каждый день',
                'Встретить рассвет на мысе',
                'Взять гида (если идёте в первый раз)'
            ],
            tip: 'Регистрируйтесь на сайте ББТ — они помогают с маршрутами.'
        },
        {
            id: 43,
            name_ru: 'Горные лыжи и фрирайд (гора Мамай)',
            banner_title: 'Гора Мамай — фрирайд на байкальском снегу',
            description_ru: 'Гора с перепадом высот 700 метров. Летом — альпийские луга, зимой — глубокий снег и фрирайд. Подъём на ратраке.',
            full_description: 'Зимой гора Мамай превращается в рай для фрирайдеров. Снег лежит с ноября по май — много, сухой и пушистый. Перепад высот около 700 метров: подъём на ратраке или снегоходе, спуск по целине между заснеженными елями.<br><br>Есть и подготовленные трассы, но главное здесь — свобода. На горе работает кафе с горячим чаем и буузами, можно арендовать снаряжение и взять инструктора. Жильё — в домиках и глэмпингах у подножия.<br><br><strong>Что делать:</strong><br>• Кататься по целине (фрирайд) с опытным гидом<br>• Прокатиться на ратраке на вершину<br>• Съесть буузы на высоте 1000 метров<br>• Фотографировать заснеженные Саяны<br>• Отдохнуть в домике с печкой после катания<br><br><strong>Важно:</strong> Сезон — декабрь–апрель. Без лавинного снаряжения и опыта в целину не ходите. Летом — треккинг и рыбалка на Соболиных озёрах.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            activities: [
                'Покататься по целине (фрирайд)',
                'Взять инструктора, если новичок',
                'Съесть буузы на высоте 1000 метров',
                'Фотографировать заснеженные Саяны',
                'Отдохнуть в домике с печкой'
            ],
            tip: 'Сезон: Декабрь — апрель.'
        },
        {
            id: 44,
            name_ru: 'Конные туры',
            banner_title: 'Конные туры — по степи как настоящий кочевник',
            description_ru: 'Поездка верхом по бурятской степи. От нескольких часов до нескольких дней. С ночёвкой в юртах.',
            full_description: 'Буряты — кочевой народ, и лошадь здесь не просто транспорт, а друг и помощник. В этнокомплексах вроде «Степного кочевника» вам дадут спокойную обученную лошадь, покажут, как седлать, и отправят в степь.<br><br>Маршруты разные: часовая прогулка до реки, полдня к священной роще, несколько дней с ночёвкой в юртах. Лошади идут шагом — рысь только для опытных всадников.<br><br><strong>Что делать:</strong><br>• Проехать верхом по бескрайней степи<br>• Устроить пикник на привале с видом на горы<br>• Переночевать в юрте с печкой<br>• Попробовать стрельбу из лука верхом<br>• Научиться завязывать хадак и здороваться по-бурятски<br><br><strong>Важно:</strong> Берите перчатки и крем от солнца — степь открытая. Бронируйте тур заранее, особенно на выходные.',
            color_palette: 'steppe',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            activities: [
                'Проехать верхом по бескрайней степи',
                'Устроить пикник на привале',
                'Переночевать в юрте (отапливаемой!)',
                'Попробовать конный спорт — стрельба из лука верхом',
                'Почувствовать себя кочевником'
            ],
            tip: 'Берите свои перчатки и крем от солнца — степь открытая.'
        },
        {
            id: 45,
            name_ru: 'Рафтинг на реке Жом-Болок',
            banner_title: 'Жом-Болок — рафтинг к водопаду',
            description_ru: 'Сплав по горной реке с порогами и водопадом. Маршрут: от посёлка Аршан до водопада Малый Жом-Болок.',
            full_description: 'Река Жом-Болок течёт по лавовым полям Восточных Саян — около 60 км необычного русла среди застывшей лавы, озёр и каменных коридоров. На участке у летника Ходарус — каскад из порогов 3–5 категории: «Бильярд», «Катапульта», «Недотрога».<br><br>Маршруты часто совмещают со сплавом по Оке Саянской, треккингом в Долину вулканов и купанием в источниках Хойто-Гол. Кульминация — водопад Малый Жом-Болок.<br><br><strong>Что делать:</strong><br>• Сплавиться по порогам с лицензированным оператором<br>• Увидеть водопад с воды или с берега<br>• Совместить сплав с походом в Долину вулканов<br>• Окунуться в термальные источники после спуска<br><br><strong>Важно:</strong> Только с инструктором и группой. Вода холодная (ниже +10°C), сезон — июнь–август. Прохождение всех завалов — маршрут 5 категории, для опытных водников.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b6a?w=800',
            activities: [
                'Проплыть пороги под руководством гида',
                'Увидеть водопад с воды',
                'Устроить пикник на берегу',
                'Фотографировать горные пейзажи',
                'Получить адреналин (обязательно)'
            ],
            tip: 'Важно: Только с инструктором. Без опыта не беритесь.'
        },
        {
            id: 46,
            name_ru: 'Одигитриевский собор (Улан-Удэ)',
            banner_title: 'Одигитриевский собор — первый каменный храм города',
            description_ru: 'Храм XVIII века в стиле сибирского барокко в центре Улан-Удэ, у берега Селенги.',
            full_description: 'Одигитриевский собор возвышается в историческом центре Улан-Удэ с 1741 года — это первый каменный храм города. Архитектура в стиле сибирского барокко сочетает пышные декоративные элементы и строгий объём. Внутри хранится почитаемая икона Божией Матери «Одигитрия».<br><br>Собор стоит у слияния рек Уды и Селенги, напротив площади Советов. Вокруг — купеческие дома, музеи и набережная.<br><br><strong>Что делать:</strong><br>• Осмотреть фасады с элементами сибирского барокко<br>• Посетить богослужение (утреннее особенно атмосферное)<br>• Прогуляться по историческому центру и набережной Селенги<br>• Сфотографировать собор с площади Советов<br><br><strong>Важно:</strong> При входе в храм — скромная одежда, женщинам желательно платок. Лучшее время для фото — утро, когда меньше людей.',
            color_palette: 'sun',
            activities: [
                'Осмотреть фасады с элементами сибирского барокко',
                'Посетить действующую службу',
                'Изучить исторический центр рядом с собором'
            ],
            tip: 'Лучше приходить утром: меньше людей и мягкий свет для фото.'
        },
        {
            id: 47,
            name_ru: 'Посольско-Преображенская церковь (с. Посольское)',
            banner_title: 'Посольско-Преображенская церковь у Байкала',
            description_ru: 'Белый храм с голубыми куполами у самого Байкала, в историческом посольском селе.',
            full_description: 'Посольско-Преображенский монастырь стоит на берегу Байкала в селе Посольское — там, где в XVII веке проходило русское посольство в Китай. Белые стены и голубые купола создают выразительный силуэт на фоне воды и гор.<br><br>Монастырь основан в 1681 году. Сегодня это действующий храм и тихое место для паломничества вдали от городской суеты.<br><br><strong>Что делать:</strong><br>• Посетить храм и монастырскую территорию<br>• Прогуляться по берегу Байкала у села<br>• Узнать историю посольских миссий в Китай<br>• Сделать панорамные фото Байкала и храма<br><br><strong>Важно:</strong> Удобно совмещать с поездкой по восточному побережью Байкала (Танхой, Горячинск). Дорога от Улан-Удэ — около 3 часов.',
            color_palette: 'baikal',
            activities: [
                'Посетить храм и территорию у берега',
                'Прогуляться по посольскому историческому месту',
                'Сделать панорамные фото Байкала'
            ],
            tip: 'Совмещайте посещение с поездкой по восточному побережью Байкала.'
        },
        {
            id: 48,
            name_ru: 'Покровская церковь (Тарбагатай)',
            banner_title: 'Старообрядческий храм в Тарбагатае',
            description_ru: 'Деревянная церковь семейских, связанная с традициями старообрядцев Бурятии.',
            full_description: 'Покровская церковь в Тарбагатае — деревянный храм семейских, старообрядцев Забайкалья, которых сослали сюда в XVIII веке. Сдержанный интерьер, старинные иконы и особое многоголосное пение создают атмосферу, будто время остановилось.<br><br>Храм часто посещают вместе с музеем «Семейская изба» и этнографическими подворьями села.<br><br><strong>Что делать:</strong><br>• Познакомиться со старообрядческими традициями<br>• Осмотреть деревянную церковную архитектуру<br>• Посетить музей «Семейская изба» рядом<br>• Услышать старообрядческое пение (если попадёте на службу)<br><br><strong>Важно:</strong> Уточняйте расписание служб и возможность экскурсии заранее. Одевайтесь скромно.',
            color_palette: 'steppe',
            activities: [
                'Познакомиться со старообрядческими традициями',
                'Осмотреть деревянную церковную архитектуру',
                'Посетить село вместе с этнографической программой'
            ],
            tip: 'Уточняйте расписание служб и возможность экскурсии заранее.'
        },
        {
            id: 49,
            name_ru: 'Спасская церковь (Бичура)',
            banner_title: 'Спасская церковь в старообрядческой Бичуре',
            description_ru: 'Белокаменный храм в одном из самых известных семейских сёл Бурятии.',
            full_description: 'Спасская церковь стоит в Бичуре — одном из крупнейших старообрядческих сёл России. Архитектура лаконична и выразительна, внутреннее убранство связано с местной иконописной традицией семейских.<br><br>Посещение церкви обычно становится частью поездки по селу с его 17-километровой улицей, хоровыми ансамблями и домашней кухней.<br><br><strong>Что делать:</strong><br>• Посетить действующий храм<br>• Узнать об истории семейских в Бичуре<br>• Прогуляться по длинной сельской улице<br>• Попробовать домашние пирожки и разносолы<br><br><strong>Важно:</strong> Лучшее время — тёплый сезон, когда проходят местные праздники (Масленица, Троица). Хорошо комбинировать с Тарбагатаем.',
            color_palette: 'steppe',
            activities: [
                'Посетить действующий храм',
                'Узнать об истории семейских в Бичуре',
                'Совместить с прогулкой по селу'
            ],
            tip: 'Лучшее время для поездки — тёплый сезон, когда проходят локальные праздники.'
        },
        {
            id: 50,
            name_ru: 'Храм «Всех скорбящих Радость» (Кяхта)',
            banner_title: 'Кяхтинский храм на пути купеческой истории',
            description_ru: 'Исторический храм в Кяхте, связанный с эпохой чайной торговли.',
            full_description: 'Кяхта — бывший центр чайной торговли с Китаем, «Сибирский Рим» с купеческими особняками. Храм «Всех скорбящих Радость» отражает эпоху, когда через город проходил весь чай для России.<br><br>Рядом — развалины Гостиного двора, купеческие дома и краеведческий музей. Город на границе с Монголией, атмосфера особенная — смесь русской, бурятской и китайской истории.<br><br><strong>Что делать:</strong><br>• Осмотреть храм и историческую застройку Кяхты<br>• Посетить краеведческий музей о чайном пути<br>• Прогуляться по купеческим домам и Гостиному двору<br>• Съездить к границе с Монголией (с пропуском)<br><br><strong>Важно:</strong> Кяхта — пограничная зона. Для въезда нужен пропуск в управлении ФСБ по Республике Бурятия (оформляйте заранее). 230 км от Улан-Удэ.',
            color_palette: 'datsan',
            activities: [
                'Осмотреть храм и историческую застройку Кяхты',
                'Посетить экспозиции о чайном пути',
                'Сделать культурную прогулку по старому городу'
            ],
            tip: 'Удобно посещать в формате однодневного маршрута по Кяхте.'
        },
        {
            id: 51,
            name_ru: 'Тарбагатай — живая история старообрядцев',
            banner_title: 'Тарбагатай — этнографическое село семейских',
            description_ru: 'Село-музей под открытым небом с домом «Семейская изба» и традиционными праздниками.',
            full_description: 'Тарбагатай — центр культуры семейских, где бережно сохраняют песенную традицию, обряды и быт XVII века. Здесь можно увидеть женщин в старинных сарафанах, услышать а cappella до мурашек и попробовать кухню, которую готовят по рецептам предков.<br><br>Главная достопримечательность — музей «Семейская изба»: дом XIX века, где всё сохранилось как было — печь, прялка, иконы, люлька. Хозяйка музея родилась в этой избе и рассказывает истории семейских.<br><br><strong>Что делать:</strong><br>• Посетить музей «Семейская изба» с экскурсией<br>• Попить чай из самовара с травами<br>• Услышать старообрядческое многоголосие<br>• Купить домотканые половики и вышивку<br>• Прогуляться по тихим улицам с резными избами<br><br><strong>Важно:</strong> Летом уточняйте даты фестивалей и сельских праздников. Спросите про «свадебный поезд» — традицию 300-летней давности.',
            color_palette: 'villages',
            image_url: '/images/villages/Тарбагатай.jpg',
            coordinates: [51.6833, 107.2833],
            activities: [
                'Посетить музей «Семейская изба»',
                'Познакомиться с песенной традицией семейских',
                'Поучаствовать в локальных этно-мероприятиях'
            ],
            tip: 'Если едете летом, уточните даты фестивалей и сельских праздников.'
        },
        {
            id: 52,
            name_ru: 'Бичура — самая длинная сельская улица',
            banner_title: 'Бичура — село с уникальной протяжённой застройкой',
            description_ru: 'Крупное старообрядческое село с уникальной планировкой и семейской культурой.',
            full_description: 'Бичура — крупное старообрядческое село, растянувшееся на 17 километров вдоль реки. Главная улица, Коммунистическая, попала в Книгу рекордов Гиннесса как самая длинная сельская улица в мире.<br><br>Здесь живут семейские — потомки переселенцев XVIII века. Они сохранили особый говор, песенное многоголосие, домашние рецепты и знаменитые пирожки, о которых знает вся Бурятия.<br><br><strong>Что делать:</strong><br>• Пройтись по рекордной улице (хотя бы часть)<br>• Послушать хоровой ансамбль семейских<br>• Попробовать домашние пирожки и разносолы<br>• Зайти в Спасскую церковь<br>• Купить льняные полотенца с ручной вышивкой<br><br><strong>Важно:</strong> Хорошо комбинировать с поездкой в Тарбагатай (40 км). На Масленицу и Троицу здесь особенно интересно.',
            color_palette: 'villages',
            image_url: '/images/villages/Бичура.jpg',
            coordinates: [51.4167, 107.0833],
            activities: [
                'Прогуляться по исторической сельской застройке',
                'Познакомиться с традициями семейских',
                'Попробовать домашнюю кухню на локальных подворьях'
            ],
            tip: 'Хорошо комбинировать с поездкой в Тарбагатай.'
        },
        {
            id: 53,
            name_ru: 'Нарын-Ацагат («Степной кочевник»)',
            banner_title: 'Нарын-Ацагат — этно-комплекс кочевой культуры',
            description_ru: 'Юрты, конные прогулки, стрельба из лука и кухня в атмосфере бурятской степи.',
            full_description: 'Этнокомплекс «Степной кочевник» в Нарын-Ацагате — это не музей, а живая деревня. Вы приезжаете и на день становитесь кочевником: живёте в войлочной юрте с печкой, едите буузы и бухлёр, стреляете из лука, танцуете ёохор у костра.<br><br>Хозяева — настоящие буряты, которые поют горлом, рассказывают легенды и учат завязывать хадак. Подходит и для короткой поездки, и для ночёвки с полной этнопрограммой.<br><br><strong>Что делать:</strong><br>• Переночевать в юрте<br>• Покататься верхом по степи<br>• Пострелять из лука<br>• Попробовать буузы, бухлёр и архи<br>• Научиться нескольким словам на бурятском<br><br><strong>Важно:</strong> Бронируйте программу заранее, особенно на выходные. Зимой юрты отапливаются — можно ехать круглый год.',
            color_palette: 'villages',
            image_url: '/images/villages/Нарын-ацагат.jpg',
            coordinates: [51.5167, 102.5333],
            activities: [
                'Переночевать в юрте',
                'Пострелять из лука и покататься верхом',
                'Попробовать буузы и бухлёр в этно-формате'
            ],
            tip: 'Бронируйте программу заранее, особенно на выходные.'
        },
        {
            id: 54,
            name_ru: 'Ацагат — деревня поэтов и лам',
            banner_title: 'Ацагат — культурная точка Заиграевского района',
            description_ru: 'Деревня с литературным и буддийским наследием, музейными и духовными локациями.',
            full_description: 'Ацагат — тихая деревня в Заиграевском районе, известная как родина поэта Намжила Нимбуева и духовный центр с буддийским наследием. Здесь в XIX веке была первая в России тибетская лечебница — мамба-дацан, а у Ацагатского аршана собирали лекарственные травы тибетские ламы.<br><br>Вода аршана кристально чистая, с повышенным удельным весом. Вокруг — плантации лекарственных растений и спокойный ритм сельской жизни.<br><br><strong>Что делать:</strong><br>• Посетить Ацагатский аршан (3 км от села)<br>• Познакомиться с местными музейными экспозициями<br>• Увидеть традицию каллиграфии и поэзии<br>• Прогуляться по тихой долине<br><br><strong>Важно:</strong> Лучше приезжать в первой половине дня, когда открыты музейные точки. У аршана — уважительное отношение, как к священному месту.',
            color_palette: 'villages',
            image_url: '/images/villages/Ацагат.jpg',
            coordinates: [51.6000, 107.5667],
            activities: [
                'Посетить локальные культурные объекты',
                'Познакомиться с традицией каллиграфии',
                'Сделать спокойную прогулку по селу'
            ],
            tip: 'Лучше посещать в первой половине дня, когда открыты музейные точки.'
        },
        {
            id: 55,
            name_ru: 'Хойтогол — кочевье у Байкала',
            banner_title: 'Хойтогол — формат жизни в ритме степи',
            description_ru: 'Сезонное кочевье в байкальской зоне с погружением в традиционный уклад.',
            full_description: 'Хойтогол — село в горах Тункинской долины, недалеко от Ниловой Пустыни. Здесь на высоте 1600–1700 метров бьют термальные источники — после сплава по Жом-Болок туристы часто отдыхают именно здесь.<br><br>Это место для тех, кто хочет увидеть настоящую кочевую жизнь: табуны лошадей, юрты, горный воздух и тишину Саян. Летом — альпийские луга, зимой — снег и горячая вода под открытым небом.<br><br><strong>Что делать:</strong><br>• Окунуться в термальные источники Хойто-Гол<br>• Посмотреть на кочевой быт и коневодство<br>• Совместить с поездкой в Нилову Пустынь или Аршан<br>• Пройти тропы к Долине вулканов (с гидом)<br><br><strong>Важно:</strong> Дорога горная, лучше планировать поездку летом. Источники на высоте — берите тёплую одежду для переодевания.',
            color_palette: 'villages',
            image_url: '/images/villages/Хойтогол.jpg',
            coordinates: [51.7500, 107.6167],
            activities: [
                'Участвовать в бытовых активностях стойбища',
                'Освоить базовые навыки верховой подготовки',
                'Совместить с поездкой к байкальскому берегу'
            ],
            tip: 'Лучше планировать поездку в сезон работы стойбища и с локальным проводником.'
        }
    ];
}

function getSampleMapPoints() {
    return [
        { name_ru: 'Чивыркуйский залив', latitude: 53.3, longitude: 109.0, color_palette: 'baikal' },
        { name_ru: 'Ушканьи острова', latitude: 53.8, longitude: 108.5, color_palette: 'baikal' },
        { name_ru: 'Святой Нос', latitude: 53.5, longitude: 108.8, color_palette: 'baikal' },
        { name_ru: 'Бухта Песчаная', latitude: 52.0, longitude: 106.5, color_palette: 'baikal' },
        { name_ru: 'Бухта Аяя', latitude: 53.5, longitude: 107.2, color_palette: 'baikal' },
        { name_ru: 'Озеро Фролиха', latitude: 54.5, longitude: 109.2, color_palette: 'baikal' },
        { name_ru: 'Энхалук', latitude: 53.0, longitude: 108.2, color_palette: 'baikal' },
        { name_ru: 'Иволгинский дацан', latitude: 51.8, longitude: 107.6, color_palette: 'datsan' },
        { name_ru: 'Степь Тугнуйская', latitude: 51.5, longitude: 107.0, color_palette: 'steppe' }
    ];
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Attractions page loaded');
    console.log('Script version: 23 - Using OpenStreetMap iframes');
    
    // Карта на странице достопримечательностей убрана (оставляем карты только внутри окон/карточек)
    // loadMapPoints();
    loadAttractions();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('tab-hidden');
    } else {
        document.body.classList.remove('tab-hidden');
    }
});

// ==========================================
// OPENLAYERS MAP INITIALIZATION (Same as Routes page)
// ==========================================

let olMap = null;
let olMarkers = [];
let olVectorSource = null;

// Function to initialize OpenLayers Map (same as routes page)
function initMap() {
    console.log('[MAP] initMap called - OpenLayers OSM');
    
    const mapContainer = document.getElementById('map2gisAttractions');
    if (!mapContainer) {
        console.log('[MAP] Container #map2gisAttractions not found - this is OK if map was removed');
        return;
    }
    
    try {
        // Check if OpenLayers is loaded
        if (typeof ol === 'undefined') {
            console.error('[MAP] ✗ OpenLayers not loaded! Make sure to include OL CSS and JS in HTML');
            return;
        }
        
        // Create vector source for markers - assign to window for global access
        window.olVectorSource = new ol.source.Vector();
        
        // Create the map centered on Ulan-Ude (same as routes page) - assign to window for global access
        window.olMap = new ol.Map({
            target: mapContainer,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                new ol.layer.Vector({
                    source: window.olVectorSource
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([107.2711, 52.2870]), // [lng, lat]
                zoom: 8
            })
        });

        olMap = window.olMap;
        olVectorSource = window.olVectorSource;
        
        console.log('[MAP] ✓ OpenLayers Map created successfully');
        
        // Load and display attractions
        updateMapWithSampleAttractions();
        
    } catch (e) {
        console.error('[MAP] ✗ Error creating OpenLayers map:', e);
    }
}

// Load and display attractions from sample data
function updateMapWithSampleAttractions() {
    console.log('[MAP] updateMapWithSampleAttractions called, olVectorSource:', typeof window.olVectorSource);
    
    if (!window.olMap || !window.olVectorSource) {
        console.warn('[MAP] Map not initialized: olMap=', !!window.olMap, 'olVectorSource=', !!window.olVectorSource);
        return;
    }
    
    const attractions = getSampleAttractions();
    console.log('[MAP] Adding', attractions.length, 'sample attractions to map');
    
    // Filter only attractions with coordinates
    const withCoords = attractions.filter(a => getCoordinates(a));
    console.log('[MAP]', withCoords.length, 'attractions with coordinates');
    
    // Clear existing markers
    window.olVectorSource.clear();
    
    // Add markers for each attraction
    withCoords.forEach((attraction, index) => {
        const coords = getCoordinates(attraction);
        if (!coords) return;
        
        const { lat, lng } = coords;
        
        console.log(`[MAP] Adding marker ${index + 1}: ${attraction.name_ru} at [${lng}, ${lat}]`);
        
        // Create marker feature
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat])),
            name: attraction.name_ru,
            description: attraction.description_ru || '',
            color_palette: attraction.color_palette,
            id: attraction.id
        });
        
        // Set marker style
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#2C5F7C' }),
                stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
            })
        }));
        
        // Add to vector source
        window.olVectorSource.addFeature(markerFeature);
    });
    
    console.log('[MAP] ✓ Added', window.olVectorSource.getFeatures().length, 'markers to map');
}

// Make initModalMap globally accessible
window.initModalMap = initModalMap;

// Function to initialize map in expanded card using OpenLayers
function initExpandedMap(attraction) {
    const mapContainer = document.getElementById(`expandedMap-${attraction.id}`);
    if (!mapContainer) {
        console.warn('[MAP] Expanded map container not found for attraction', attraction.id);
        return;
    }
    
    try {
        if (typeof ol === 'undefined') {
            console.error('[MAP] ✗ OpenLayers not loaded!');
            return;
        }
        
        const coords = getCoordinates(attraction);
        if (!coords) {
            console.warn('[MAP] No coordinates available for attraction', attraction.id);
            return;
        }
        
        const { lat, lng } = coords;
        
        console.log(`[MAP] Initializing expanded map for ${attraction.name_ru} at [${lng}, ${lat}]`);
        
        // Create vector source and marker
        const vectorSource = new ol.source.Vector();
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
        });
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#2C5F7C' }),
                stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
            })
        }));
        vectorSource.addFeature(markerFeature);
        
        // Create the map centered on the attraction
        const expandedMap = new ol.Map({
            target: mapContainer,
            layers: [
                new ol.layer.Tile({ source: new ol.source.OSM() }),
                new ol.layer.Vector({ source: vectorSource })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([lng, lat]),
                zoom: 12
            })
        });
        
        console.log(`[MAP] ✓ Expanded map created for ${attraction.name_ru}`);
        
    } catch (e) {
        console.error('[MAP] ✗ Error creating expanded map:', e);
    }
}

// Function to initialize map in modal using OpenLayers
function initModalMap(attraction) {
    const mapContainer = document.getElementById(`modalMap-${attraction.id}`);
    if (!mapContainer) {
        console.warn('[MAP] Modal map container not found for attraction', attraction.id);
        return;
    }
    
    try {
        if (typeof ol === 'undefined') {
            console.error('[MAP] ✗ OpenLayers not loaded!');
            return;
        }
        
        const coords = getCoordinates(attraction);
        if (!coords) {
            console.warn('[MAP] No coordinates available for attraction', attraction.id);
            return;
        }
        
        const { lat, lng } = coords;
        
        console.log(`[MAP] Initializing modal map for ${attraction.name_ru} at [${lng}, ${lat}]`);
        
        // Create vector source and marker
        const vectorSource = new ol.source.Vector();
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
        });
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#2C5F7C' }),
                stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
            })
        }));
        vectorSource.addFeature(markerFeature);
        
        // Create the map centered on the attraction
        const modalMap = new ol.Map({
            target: mapContainer,
            layers: [
                new ol.layer.Tile({ source: new ol.source.OSM() }),
                new ol.layer.Vector({ source: vectorSource })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([lng, lat]),
                zoom: 12
            })
        });
        
        console.log(`[MAP] ✓ Modal map created for ${attraction.name_ru}`);
        
    } catch (e) {
        console.error('[MAP] ✗ Error creating modal map:', e);
    }
}

// Load and display attractions on the map using OpenLayers
async function loadAndDisplayAttractions() {
    try {
        console.log('[MAP] Loading attractions from API...');
        
        const response = await fetch('/api/destinations');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const attractions = await response.json();
        console.log('[MAP] Loaded', attractions.length, 'attractions');
        
        // Filter only attractions with coordinates
        const withCoords = attractions.filter(a => getCoordinates(a));
        
        console.log('[MAP]', withCoords.length, 'attractions with coordinates');
        
        if (withCoords.length === 0) {
            console.warn('[MAP] No attractions with coordinates found!');
            return;
        }
        
        // Clear existing markers
        clearMarkers();
        
        // Create markers for each attraction using OpenLayers
        withCoords.forEach((attraction, index) => {
            const coords = getCoordinates(attraction);
            if (!coords) return; // Skip if no coordinates
            
            const { lat, lng } = coords;
            
            console.log(`[MAP] Marker ${index + 1}: ${attraction.name_ru} at [${lng}, ${lat}]`);
            
            // Create marker feature
            const markerFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat])),
                name: attraction.name_ru,
                description: attraction.description_ru || '',
                image_url: attraction.image_url,
                color_palette: attraction.color_palette,
                id: attraction.id
            });
            
            // Set marker style
            markerFeature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({ color: '#2C5F7C' }),
                    stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
                })
            }));
            
            // Add to vector source
            olVectorSource.addFeature(markerFeature);
        });
        
        console.log('[MAP] ✓ Created', olVectorSource.getFeatures().length, 'markers');
        
    } catch (error) {
        console.error('[MAP] ✗ Error loading attractions:', error);
    }
}

// Clear all markers from the map
function clearMarkers() {
    if (olVectorSource) {
        olVectorSource.clear();
    }
}

// 2GIS Map initialization removed - now using OpenStreetMap iframes
// Initialize map when page loads
/*
window.addEventListener('load', function() {
    console.log('[MAP] Window loaded, initializing 2GIS map...');
    
    if (typeof mapgl === 'undefined') {
        console.error('[MAP] ✗ 2GIS MapGL not loaded!');
        return;
    }
    
    initMap();
});
*/

// Function to update map when filtering attractions using OpenLayers
function updateMapWithAttractions(attractions) {
    if (!olMap || !olVectorSource) {
        // Map widget is optional on this page; silently skip marker updates when absent.
        return;
    }
    
    console.log('[MAP] Updating map with', attractions.length, 'attractions');
    
    // Clear existing markers
    clearMarkers();
    
    // Filter attractions with coordinates
    const withCoords = attractions.filter(a => getCoordinates(a));
    
    // Create markers for filtered attractions using OpenLayers
    withCoords.forEach((attraction, index) => {
        const coords = getCoordinates(attraction);
        if (!coords) return; // Skip if no coordinates
        
        const { lat, lng } = coords;
        
        // Create marker feature
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat])),
            name: attraction.name_ru,
            description: attraction.description_ru || '',
            image_url: attraction.image_url,
            color_palette: attraction.color_palette,
            id: attraction.id
        });
        
        // Set marker style (same as routes page)
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#2C5F7C' }),
                stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
            })
        }));
        
        // Add to vector source
        olVectorSource.addFeature(markerFeature);
    });
    
    console.log('[MAP] ✓ Updated', olVectorSource.getFeatures().length, 'markers');
}

// Show attraction detail modal (make it global for onclick)
window.showAttractionModal = async function(attractionId) {
    let attraction = allAttractions.find(a => a.id === attractionId);
    
    // If the attraction is not in the currently loaded list (e.g. due to filters), load it by id
    if (!attraction) {
        try {
            const response = await fetch(`${API_BASE}/destinations/${attractionId}`);
            if (response.ok) {
                attraction = await response.json();
            }
        } catch (e) {
            console.warn('Failed to load attraction by id:', attractionId, e);
        }
    }
    
    if (!attraction) return;
    openAttractionModal(attraction);
};
