// ==========================================
// BURYATIA TOURISM - Interactive Features
// ==========================================

const API_BASE = '/api';

// ==========================================
// NAVIGATION
// ==========================================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
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
// DESTINATIONS
// ==========================================

let allDestinations = [];

async function loadDestinations(filter = 'all') {
    try {
        const url = filter === 'all' 
            ? `${API_BASE}/destinations`
            : `${API_BASE}/destinations?color_palette=${filter}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('API request failed');
        }
        const destinations = await response.json();
        if (destinations && destinations.length > 0) {
            allDestinations = destinations;
            renderDestinations(destinations);
        } else {
            throw new Error('No destinations in API');
        }
    } catch (error) {
        console.error('Error loading destinations from API, using sample data:', error);
        // Fallback to sample data
        const sampleData = getSampleDestinations();
        allDestinations = sampleData;
        renderDestinations(sampleData);
    }
}

function renderDestinations(destinations) {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) {
        console.warn('destinationsGrid not found on this page');
        return;
    }
    grid.innerHTML = '';
    
    destinations.forEach(dest => {
        const card = createDestinationCard(dest);
        grid.appendChild(card);
    });
    
    // Re-observe new scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

function createDestinationCard(dest) {
    const card = document.createElement('div');
    card.className = 'destination-card scroll-reveal';
    
    const paletteClass = dest.color_palette || 'baikal';
    const paletteName = getPaletteName(paletteClass);
    
    // Build activities list if available
    let activitiesHTML = '';
    if (dest.activities && dest.activities.length > 0) {
        activitiesHTML = `
            <div class="destination-activities">
                <h4>Что делать:</h4>
                <ul>
                    ${dest.activities.slice(0, 3).map(act => `<li>${act}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Build tip section if available
    let tipHTML = '';
    if (dest.tip) {
        tipHTML = `
            <div class="destination-tip">
                <strong>Совет:</strong> ${dest.tip}
            </div>
        `;
    }
    
    card.innerHTML = `
        <img src="${dest.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'}" 
             alt="${dest.name_ru}" 
             onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'">
        <div class="destination-info">
            <h3>${dest.name_ru}</h3>
            <p>${dest.description_ru || ''}</p>
            ${activitiesHTML}
            ${tipHTML}
            <span class="color-badge ${paletteClass}">${paletteName}</span>
        </div>
    `;
    
    return card;
}

function getPaletteName(palette) {
    const names = {
        'baikal': 'Байкал',
        'datsan': 'Дацан',
        'steppe': 'Степь',
        'sun': 'Улан-Удэ'
    };
    return names[palette] || palette;
}

// Color palette filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const palette = btn.dataset.palette;
        loadDestinations(palette);
    });
});

// ==========================================
// INTERACTIVE MAP
// ==========================================

async function loadMapPoints() {
    // Old SVG map removed - using Yandex Maps instead
    console.log('Using Yandex Maps for interactive map (main page)');
}

function renderMap(points) {
    const mapContainer = document.getElementById('interactiveMap');
    mapContainer.innerHTML = '';
    
    // Create SVG map
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 800 600');
    
    // Simplified Buryatia outline (placeholder)
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outline.setAttribute('d', 'M100,100 L700,100 L700,500 L100,500 Z');
    outline.setAttribute('fill', '#ede8dc');
    outline.setAttribute('stroke', '#1a5276');
    outline.setAttribute('stroke-width', '2');
    svg.appendChild(outline);
    
    // Add points
    points.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        
        // Convert coordinates to SVG positions (simplified)
        const x = ((point.longitude - 105) / 10) * 600 + 100;
        const y = ((55 - point.latitude) / 5) * 400 + 100;
        
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '8');
        circle.setAttribute('class', `map-point ${point.color_palette}`);
        circle.setAttribute('data-name', point.name_ru);
        
        // Add tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = point.name_ru;
        circle.appendChild(title);
        
        svg.appendChild(circle);
    });
    
    mapContainer.appendChild(svg);
}

// ==========================================
// REVIEWS
// ==========================================

async function loadReviews() {
    try {
        const response = await fetch(`${API_BASE}/reviews/approved`);
        const reviews = await response.json();
        renderReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        renderReviews(getSampleReviews());
    }
}

function renderReviews(reviews) {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    reviews.forEach(review => {
        const card = createReviewCard(review);
        grid.appendChild(card);
        observer.observe(card);
    });
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card scroll-reveal';
    
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    card.innerHTML = `
        <div class="review-author">${review.author}</div>
        <div class="review-rating">${stars}</div>
        <p class="review-text">${review.text}</p>
    `;
    
    return card;
}

// ==========================================
// RANDOM FACT
// ==========================================

async function loadRandomFact() {
    try {
        const response = await fetch(`${API_BASE}/facts/random`);
        const fact = await response.json();
        displayFact(fact);
    } catch (error) {
        console.error('Error loading fact:', error);
        displayFact(getSampleFact());
    }
}

function displayFact(fact) {
    const factText = document.getElementById('randomFactText');
    if (factText) {
        factText.textContent = fact.fact_ru;
    }
}

document.getElementById('newFactBtn')?.addEventListener('click', loadRandomFact);

// ==========================================
// SAMPLE DATA (Fallback)
// ==========================================

function getSampleDestinations() {
    return [
        {
            id: 1,
            name_ru: 'Чивыркуйский залив',
            description_ru: 'Самый тёплый залив Байкала (+23°C). Песчаные пляжи, термальные источники и лучшая рыбалка.',
            full_description: 'Чивыркуйский залив называют «байкальским морем» — он настолько широк, что противоположный берег почти не виден. Это единственное место на Байкале, где вода летом становится по-настоящему тёплой.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1551845856-c4b6938a1d5e?w=800',
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
            description_ru: 'Архипелаг из четырёх островов — главное лежбище байкальской нерпы, единственного пресноводного тюленя.',
            full_description: 'Ушканьи острова — заповедная зона, куда пускают только по спецразрешениям. Здесь, на гладких камнях, десятки нерп греются на солнце.',
            color_palette: 'baikal',
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
            description_ru: 'Место силы у шаманов. Трекинг на высоту 1877 м с панорамой, от которой захватывает дух.',
            full_description: 'Святой Нос — не просто полуостров. Для бурят это священное место, где небо встречается с землёй, а духи говорят с людьми.',
            color_palette: 'baikal',
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
            description_ru: 'Байкальский рай с белоснежным песком и знаменитыми «ходячими» деревьями.',
            full_description: 'Бухту Песчаную называют «байкальским раем». Белый песок, лазурная вода, сосны из камней и деревья на корнях — словно сказочные великаны.',
            color_palette: 'baikal',
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
            description_ru: 'Бухта, где горы смотрятся в воду. Идеальные отражения скал в кристально чистом озере.',
            full_description: 'Бухта Аяя спряталась среди скал на западном берегу Байкала. Вода кристально чистая, а скалы нависают так близко, что создаётся ощущение закрытого грота.',
            color_palette: 'baikal',
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
            description_ru: 'Реликтовое ледниковое озеро с редкой рыбой даватчан, больше нигде не встречающейся.',
            full_description: 'Озеро Фролиха — взгляд в прошлое планеты. Образовалось тысячи лет назад, когда отступили ледники. Вода настолько прозрачная, что на глубине 5–6 метров видно каждый камень.',
            color_palette: 'baikal',
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
            description_ru: 'Байкальский дикий пляж с песчаными дюнами. Популярное место для кемпинга и виндсерфинга.',
            full_description: 'Энхалук — место, где Байкал создал маленькую пустыню. Песчаные дюны до 5 метров, скрип песка под ногами и бесконечная синева воды.',
            color_palette: 'baikal',
            image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            activities: [
                'Кемпить прямо на дюнах',
                'Заниматься виндсерфингом или кайтсерфингом',
                'Купаться — вода чистая, дно песчаное',
                'Фотографировать закаты с дюн'
            ],
            tip: 'Никакой инфраструктуры — только природа. Еду и воду брать с собой.'
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
        { name_ru: 'Энхалук', latitude: 53.0, longitude: 108.2, color_palette: 'baikal' }
    ];
}

function getSampleReviews() {
    return [
        {
            author: 'Анна М., Москва',
            rating: 5,
            text: 'Чивыркуйский залив превзошёл все ожидания! Вода действительно тёплая, а термальные источники — это нечто невероятное. Нерпы на Ушканьих островах — самое милое, что я видела в жизни.'
        },
        {
            author: 'Дмитрий К., Санкт-Петербург',
            rating: 5,
            text: 'Восхождение на Святой Нос — это было мощно. Вид с вершины стоит каждого шага. Шаманский обряд с сэржэ добавил путешествию глубокий смысл.'
        },
        {
            author: 'Елена С., Новосибирск',
            rating: 5,
            text: 'Бухта Песчаная — настоящий рай. «Ходячие» деревья выглядят как из сказки, а закаты здесь самые красивые в моей жизни. Обязательно вернёмся!'
        },
        {
            author: 'Михаил П., Екатеринбург',
            rating: 5,
            text: 'Фотографировал отражения в бухте Аяя на рассвете — получилось потрясающе. Вода как зеркало, тишина такая, что слышишь своё сердце. Байкал — это магия.'
        }
    ];
}

function getSampleFact() {
    const facts = [
        { fact_ru: 'Байкал содержит около 20% мировых запасов пресной воды — это больше, чем все Великие озёра Северной Америки вместе взятые.' },
        { fact_ru: 'Байкальской нерпе (тюленю) 2-3 миллиона лет. Это единственное млекопитающее, которое живёт исключительно в пресной воде.' },
        { fact_ru: 'Вода в Байкале настолько чистая, что на глубине 40 метров можно видеть камни на дне. Это связано с деятельностью рачка эпишуры, который фильтрует воду.' },
        { fact_ru: 'Байкал находится в зоне активных землетрясений. Каждый год здесь происходит около 2000 подземных толчков, хотя большинство из них не ощущаются.' },
        { fact_ru: 'Чивыркуйский залив — единственное место на Байкале, где вода летом прогревается до +23°C. В остальных местах максимум +10-14°C.' },
        { fact_ru: 'На Ушканьих островах находится крупнейшее лежбище байкальской нерпы. Здесь одновременно можно увидеть до 3000 тюленей.' },
        { fact_ru: 'Полуостров Святой Нос буряты считают священным местом. По легенде, здесь обитает дух хозяина Байкала — Бурхан.' },
        { fact_ru: '«Ходячие» деревья в бухте Песчаной — это сосны, у которых ветер выдул почву из-под корней. Некоторые из них продолжают расти, стоя на корнях высотой до 3 метров.' },
        { fact_ru: 'Байкал замерзает только в январе, а вскрывается в мае. Толщина льда достигает 1,5-2 метров, а прозрачность — до 40 метров.' },
        { fact_ru: 'Даватчан, или «байкальский лосось», обитает только в озере Фролиха и ещё паре высокогорных озёр. Это реликтовая рыба ледникового периода.' }
    ];
    return facts[Math.floor(Math.random() * facts.length)];
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    
    // Force load sample data immediately
    const sampleData = getSampleDestinations();
    console.log('Sample destinations:', sampleData.length, 'items');
    allDestinations = sampleData;
    
    const grid = document.getElementById('destinationsGrid');
    console.log('Grid element:', grid);
    
    renderDestinations(sampleData);
    console.log('Destinations rendered');
    
    // Then try to load from API in background
    loadDestinations().catch(err => {
        console.log('Using sample data');
    });
    
    loadMapPoints();
    loadReviews();
    loadRandomFact();
});

// Handle page visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        document.body.classList.add('tab-hidden');
    } else {
        document.body.classList.remove('tab-hidden');
    }
});

// Initialize OpenLayers Map on main page (same as routes page)
let olMainMap = null;
let olMainMarkers = [];

function initMainMap() {
    console.log('[MAIN MAP] initMainMap called - OpenLayers OSM');
    
    const mapContainer = document.getElementById('map2gisMain');
    if (!mapContainer) {
        console.error('[MAIN MAP] Container #map2gisMain not found');
        return;
    }
    
    // Check if OpenLayers is loaded
    if (typeof ol === 'undefined') {
        console.error('[MAIN MAP] OpenLayers not loaded!');
        return;
    }
    
    const locations = [
        {
            coordinates: [51.8333, 107.5833],
            name: 'Oзеро Байкал',
            name_ru: 'Oзеро Байкал',
            description: 'Самое глубокое озеро на планете',
            description_ru: 'Самое глубокое озеро на планете',
            image_url: 'https://images.unsplash.com/photo-1504233529578-6d46baba6d34?w=400',
            color_palette: 'baikal'
        }
    ];

    addPlacesToMapMain(locations);
}

/**
 * Добавляет метки на карту главной страницы используя OpenLayers
 */
function addPlacesToMapMain(places) {
    console.log('[MAIN MAP] Adding', places.length, 'places to main map');
    
    const mapContainer = document.getElementById('map2gisMain');
    if (!mapContainer) return;
    
    // Filter valid places
    const validPlaces = places.filter(place => 
        place.coordinates && place.coordinates.length === 2
    );
    
    if (validPlaces.length === 0) return;
    
    // Create vector source and markers
    const vectorSource = new ol.source.Vector();
    
    validPlaces.forEach((place, i) => {
        const lat = place.coordinates[0];
        const lng = place.coordinates[1];
        
        // Create marker feature
        const markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat])),
            name: place.name_ru || place.name,
            description: place.description_ru || place.description,
            image_url: place.image_url,
            color_palette: place.color_palette
        });
        
        // Set marker style (same as routes page)
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#2C5F7C' }),
                stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
            })
        }));
        
        vectorSource.addFeature(markerFeature);
        console.log('[MAIN MAP] Added marker for:', place.name_ru);
    });
    
    // Create the map centered on Buryatia
    olMainMap = new ol.Map({
        target: mapContainer,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Vector({
                source: vectorSource
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([107.5833, 51.8333]), // [lng, lat]
            zoom: 7
        })
    });
    
    console.log('[MAIN MAP] ✓ OpenLayers Map created successfully');
    console.log('[MAIN MAP] Total markers added:', validPlaces.length);
}

// Initialize map when page loads
window.addEventListener('load', function() {
    console.log('[MAIN MAP] Window loaded, initializing OpenLayers map...');
    
    if (typeof ol === 'undefined') {
        console.error('[MAIN MAP] ✗ OpenLayers not loaded!');
        return;
    }
    
    initMainMap();
});
