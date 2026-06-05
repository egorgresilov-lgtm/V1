// Gastronomy Page JavaScript
const API_BASE = window.location.origin + '/api';

// ==========================================
// SAMPLE DATA
// ==========================================

function getSampleCuisine() {
    return [
        {
            id: 1,
            name: 'Буузы (Позы)',
            banner_title: 'Буузы — главное бурятское блюдо',
            description: 'Главное бурятское блюдо. Похоже на манты или хинкали, но своё: внутри — рубленое мясо (говядина+свинина) и много сока.',
            full_description: 'Буузы — это визитная карточка бурятской кухни. Похожи на манты или хинкали, но со своим характером.\n\nГлавное отличие — начинка: только рубленое мясо (говядина+свинина), никакой мясорубки! Мясо рубят ножом, добавляют лук, соль, перец. Тонкое тесто раскатывают кружочками, кладут начинку, лепят складочками сверху — получается 33 складки (как у настоящих мастеров).\n\nВарят на пару 20-25 минут. Внутри — много сочного бульона. Едят руками: надкусывают край, выпивают сок, потом доедают всё остальное.\n\nЛепить буузы учат с детства. Это семейное дело, объединяющее поколения.',
            activities: [
                'Научиться лепить буузы на мастер-классе',
                'Правильно съесть: надкусить, выпить сок, доесть',
                'Попробовать буузы из разных районов Бурятии',
                'Купить замороженные буузы домой',
                'Сравнить с манты и хинкали'
            ],
            tip: 'Где попробовать: В любой бурятской столовой, кафе, в «Степном кочевнике» на мастер-классе',
            color_palette: 'sun',
            image_url: '/images/traditions/позы.jpg'
        },
        {
            id: 2,
            name: 'Бухлёр',
            banner_title: 'Бухлёр — сытный суп с бараниной',
            description: 'Сытный суп с бараниной и домашней лапшой. Готовят в котле на костре.',
            full_description: 'Бухлёр — это наваристый бурятский суп, который варят часами. Настоящий бухлёр готовят только в котле на костре.\n\nСначала обжаривают баранину до корочки, потом заливают водой и варят 3-4 часа на медленном огне. Лапшу делают тут же из муки, яиц и воды — раскатывают, режут полосками, кидают в бульон.\n\nНа выходе — жирный, наваристый, очень вкусный бульон и мягкое мясо, которое отходит от кости. Подают с зеленью, чесноком, лепёшками.\n\nБухлёр — это не просто еда, а ритуал. Его готовят на праздники, собирают семью, угощают гостей.',
            activities: [
                'Попробовать бухлёр из котла на костре',
                'Оценить наваристый бульон и мягкое мясо',
                'Есть с лепёшками и чесноком',
                'Запить бурятским чаем с молоком',
                'Попросить рецепт у хозяйки'
            ],
            tip: 'Где попробовать: На фестивалях, в «Степном кочевнике», в некоторых ресторанах Улан-Удэ',
            color_palette: 'datsan',
            image_url: '/images/traditions/бухлер.jpg'
        },
        {
            id: 3,
            name: 'Хушуур',
            banner_title: 'Хушуур — бурятский чебурек',
            description: '«Бурятский чебурек». Тонкое тесто, много мяса, жарят во фритюре до хруста.',
            full_description: 'Хушуур — это жареный пирожок с мясом, который называют «бурятским чебуреком». Но у него свой характер.\n\nТесто раскатывают тонко-тонко, кладут рубленое мясо с луком, защипывают полумесяцем и жарят в большом количестве масла (фритюр). Получается хрустящая золотистая корочка, внутри — сочное мясо с бульоном.\n\nЕдят горячими, сразу после жарки. Часто макают в острый соус. Хушуур — это уличная еда, фастфуд по-бурятски.\n\nНа Сагаалган хушуры лепят целыми горами — чтобы хватило всем гостям.',
            activities: [
                'Съесть хушуур сразу после жарки — горячим',
                'Помазать в острый соус',
                'Сравнить с чебуреком (есть отличия!)',
                'Купить на уличном лотке',
                'Попробовать на Сагаалган'
            ],
            tip: 'Где попробовать: На уличных лотках в Сагаалган, в кафе при дацанах, в столовых',
            color_palette: 'steppe',
            image_url: '/images/traditions/хушуур.jpg'
        },

        {
            id: 5,
            name: 'Боовы',
            banner_title: 'Боовы — сладкие угощения на Сагаалган',
            description: 'Сладкие мучные угощения. Тесто режут на полоски или фигурки, жарят во фритюре, посыпают сахарной пудрой.',
            full_description: 'Боовы — это традиционные бурятские сладости. Тесто (мука, яйца, сахар, масло) раскатывают, режут на полоски, ромбики или фигурки, жарят во фритюре до золотистого цвета, посыпают сахарной пудрой.\n\nПолучаются хрустящие, сладкие, ароматные. Едят с чаем. На Сагаалган боовы пекут обязательно — ставят на стол пирамидой, чем выше — тем богаче дом.\n\nУ каждой хозяйки свой рецепт. Кто-то добавляет мёд, кто-то — ваниль, кто-то — творог. По вкусу можно узнать, чьи боовы.\n\nЭто не просто еда, а символ праздника, гостеприимства, достатка.',
            activities: [
                'Попробовать боовы с бурятским чаем',
                'Научиться печь боовы на мастер-классе',
                'Оценить разные рецепты (у каждой хозяйки свой)',
                'Купить в кондитерских Улан-Удэ',
                'Попробовать на Сагаалган'
            ],
            tip: 'Где попробовать: В бурятских семьях (если пригласят), в кондитерских Улан-Удэ',
            color_palette: 'sun',
            image_url: '/images/traditions/боовы.jpg'
        },
        {
            id: 6,
            name: 'Шулэн',
            banner_title: 'Шулэн — лапша с мясом',
            description: 'Лапша с мясом, более легкий суп, чем бухлёр. Традиционное первое блюдо.',
            full_description: 'Шулэн — это наваристый суп с домашней лапшой и мясом. Более лёгкий вариант по сравнению с бухлёром, но не менее вкусный.\n\nБульон варят из говядины или баранины, добавляют картофель, морковь, лук. Главное — домашняя лапша: её раскатывают тонко и режут полосками. Лапша получается тонкая, нежная, хорошо пропитывается бульоном.\n\nШулэн — это повседневное блюдо, которое готовят в семьях. Он согревает в холодные дни и даёт силы. Подают с зеленью, чёрным перцем, иногда с чесноком.\n\nЭто блюдо показывает простоту и мудрость кочевой кухни: минимум ингредиентов, максимум вкуса.',
            activities: [
                'Попробовать шулэн с домашней лапшой',
                'Оценить наваристый бульон',
                'Сравнить с бухлёром (шулэн легче)',
                'Есть с лепёшками и зеленью',
                'Запить бурятским чаем'
            ],
            tip: 'Где попробовать: В домашних кафе, в семьях, в некоторых ресторанах Улан-Удэ',
            color_palette: 'datsan',
            image_url: '/images/traditions/шулэн.jpg'
        },
        {
            id: 7,
            name: 'Сагаан эдеэн (Белая пища)',
            banner_title: 'Сагаан эдеэн — молочные продукты бурят',
            description: 'Молочные продукты, включая айраг (кумыс), аруул (сушеный творог) и сметану. Основа бурятского рациона.',
            full_description: 'Сагаан эдеэн — это «белая пища», молочные продукты, которые составляют основу бурятской кухни.\n\nАйраг (кумыс) — кисломолочный напиток из кобыльего молока. Лёгкий, освежающий, с небольшой кислинкой. Готовят летом, когда кобылы дают молоко.\n\nАруул — сушеный творог. Творог режут на кусочки и сушат на солнце. Получаются твёрдые, кисловатые шарики, которые хранятся месяцами. Аруул берут в дорогу, едят с чаем.\n\nСметана (тараг) — густая, жирная, домашняя. Подают к буузам, бухлёру, боовам. Без сметаны бурятский стол немыслим.\n\nБелая пища — это символ чистоты, здоровья, достатка. На Сагаалган стол должен ломиться от сагаан эдеэн.',
            activities: [
                'Попробовать айраг (кумыс)',
                'Распробовать аруул (сушеный творог)',
                'Есть буузы с домашней сметаной',
                'Купить молочные продукты на рынке',
                'Попробовать на Сагаалган'
            ],
            tip: 'Где попробовать: На Центральном рынке Улан-Удэ, в бурятских семьях, на фермах',
            color_palette: 'baikal',
            image_url: '/images/traditions/сагаан эдеэ.jpg'
        },
        {
            id: 8,
            name: 'Тоолэй',
            banner_title: 'Тоолэй — почетное блюдо из головы барана',
            description: 'Почетное блюдо — голова барана. Подаётся на праздники в честь уважаемых гостей.',
            full_description: 'Тоолэй — это ритуальное блюдо, которое подают только на больших праздниках и в честь самых уважаемых гостей.\n\nГолову барана варят целиком, подают на большом блюде. Самый почётный гость должен отрезать кусок мяса и поделиться с остальными. Это знак уважения и единства.\n\nУ каждого части головы своё значение: уши — чтобы слушал мудрые советы, глаза — чтобы видел хорошее, язык — чтобы говорил добрые слова.\n\nТоолэй — это не просто еда, а глубокий ритуал гостеприимства. Если вам подали тоолэй — вы очень желанный гость.',
            activities: [
                'Узнать ритуал разделки тоолэй',
                'Попробовать разные части (уши, язык, щёки)',
                'Понять символику каждой части',
                'Почувствовать себя почётным гостем',
                'Попробовать на Сагаалган или свадьбе'
            ],
            tip: 'Где попробовать: На больших праздниках, свадьбах, в этно-комплексах по запросу',
            color_palette: 'steppe',
            image_url: '/images/traditions/тоолэй.jpg'
        },
        {
            id: 9,
            name: 'Оромо',
            banner_title: 'Оромо — нежный кисломолочный напиток',
            description: 'Традиционный бурятский кисломолочный продукт с мягким вкусом и лёгкой кислинкой.',
            full_description: 'Оромо — традиционный кисломолочный продукт, который готовят из коровьего или козьего молока. Молоко томят, затем сквашивают, благодаря чему напиток получается густым, нежным и освежающим. Его пьют в жару, подают к лепёшкам и иногда дополняют мёдом или ягодами.\n\nВ этно-комплексах и сельских подворьях оромо часто входит в приветственное угощение как символ домашнего гостеприимства.',
            activities: [
                'Попробовать оромо в этно-комплексах',
                'Сочетать с лепёшкой или мёдом',
                'Сравнить вкус с кефиром и ряженкой',
                'Узнать местные рецепты закваски'
            ],
            tip: 'Где попробовать: «Степной кочевник», сельские подворья Тарбагатая и локальные гастро-ярмарки',
            color_palette: 'baikal',
            image_url: '/images/traditions/оргомо.jpg'
        }
    ];
}

function getSampleRestaurants() {
    return [
        {
            id: 1,
            name: '«Степной кочевник» (с. Нарын-Ацагат)',
            banner_title: 'Степной кочевник — этно-комплекс с мастер-классами',
            description: 'Этно-комплекс, где можно не только попробовать бурятскую кухню, но и научиться её готовить.',
            full_description: '«Степной кочевник» — это не ресторан, а целый мир. Вы приезжаете в бурятскую деревню, живёте в юрте, едите буузы и бухлёр, а главное — учитесь готовить.\n\nМастер-класс по лепке бууз — хит. Хозяйка показывает, как рубить мясо, раскатывать тесто, делать 33 складки. Потом все вместе варят буузы на пару и съедают за общим столом.\n\nА ещё здесь учат стрелять из лука, танцевать ёхор, завязывать хадак. Это не просто еда — это погружение в культуру.',
            activities: [
                'Мастер-класс по лепке бууз',
                'Дегустация бухлёра из котла',
                'Бурятский чай с молоком и боовами',
                'Стрельба из лука',
                'Танец ёхор у костра'
            ],
            tip: 'С. Нарын-Ацагат, Заиграевский район. Бронировать заранее!',
            color_palette: 'baikal',
            image_url: '/images/traditions/степной_кочевник.jpg',
            coordinates: { lat: 51.9333, lng: 107.5167 }
        },
        {
            id: 2,
            name: 'Кафе «У Баира»',
            banner_title: 'У Баира — сочные вкусные буузы',
            description: 'Закусочная с рейтингом 4.3. Сочные вкусные буузы на проспекте Строителей.',
            full_description: 'Кафе «У Баира» — популярная закусочная в Улан-Удэ с рейтингом 4.3 и более 1128 оценками.\n\nСпециализируются на буузах — сочных, вкусных, приготовленных по традиционному рецепту. Мясо рубят вручную, тесто раскатывают тонко, варят на пару.\n\nРасположены на проспекте Строителей, 72в (47-й квартал, Октябрьский район). Работают с 9:00. Можно заказать доставку.\n\nЕсть WhatsApp для заказов. Принимают заявки на кейтеринг и мероприятия.',
            activities: [
                'Попробовать фирменные сочные буузы',
                'Заказать доставку бууз домой',
                'Написать в WhatsApp для заказа',
                'Оставить отзыв (1128+ оценок)',
                'Заказать буузы на мероприятие'
            ],
            tip: 'Проспект Строителей, 72в. Тел: +7 (3012) 300-140. Сайт: ybaira.ru',
            color_palette: 'sun',
            image_url: '/images/traditions/у_баира.jpg',
            coordinates: { lat: 51.812445, lng: 107.652963 }
        },
        {
            id: 3,
            name: 'Кафе «Шулэндо»',
            banner_title: 'Шулэндо — бурятская и европейская кухня',
            description: 'Сеть кафе с рейтингом 4.3. Бурятская и европейская кухня. 5 филиалов в Улан-Удэ.',
            full_description: '«Шулэндо» — популярная сеть кафе в Улан-Удэ с рейтингом 4.3 и более 1010 оценками.\n\nСпециализируются на бурятской и европейской кухне. Подают шулэн, бухлёр, буузы, блины и другие блюда. Средний чек 350-500 рублей.\n\nВ городе 5 филиалов:\n— ул. Смолина, 81 (рейтинг 4.3)\n— Солнечная ул., 28\n— Коммунистическая ул., 20\n— ул. Цивилева, 27\n— пр-т Автомобилистов, 16\n\nМожно заказать навынос. Есть туалет. Работают до позднего вечера.',
            activities: [
                'Попробовать шулэн с домашней лапшой',
                'Заказать буузы и бухлёр',
                'Попробовать блины',
                'Взять еду навынос',
                'Посетить один из 5 филиалов'
            ],
            tip: '5 филиалов в Улан-Удэ. Тел: +7 (902) 163-89-00. Средний чек: 350-500₽',
            color_palette: 'datsan',
            image_url: '/images/traditions/шулэндо.jpg',
            coordinates: { lat: 51.839542, lng: 107.576823 }
        },
        {
            id: 4,
            name: 'Кафе «Бууза Room»',
            banner_title: 'Бууза Room — сеть кафе бурятской кухни',
            description: 'Сеть кафе с рейтингом 4.1. Бурятская и европейская кухня. Завтраки. 4 филиала в Улан-Удэ.',
            full_description: '«Бууза Room» — популярная сеть кафе в Улан-Удэ с рейтингом 4.1 и более 1431 оценкой.\n\nСпециализируются на бурятской и европейской кухне. Подают буузы, блины, завтраки. Работают ежедневно с 10:00 до 22:00.\n\nВ городе 4 филиала:\n— ул. Ленина, 52 (рейтинг 4.1) — Советский район\n— ул. Терешковой, 12а\n— ул. Гагарина, 27 блок А\n— ул. Смолина, 79\n\nМожно заказать доставку и навынос. Есть туалет. Доступная среда для людей с инвалидностью (пандус).\n\nБууза Room — это современное кафе, где традиционные бурятские рецепты сочетаются с комфортной атмосферой.',
            activities: [
                'Попробовать фирменные буузы',
                'Позавтракать в кафе',
                'Заказать доставку домой',
                'Попробовать блины',
                'Посетить один из 4 филиалов'
            ],
            tip: '4 филиала в Улан-Удэ. Работают с 10:00 до 22:00. ул. Ленина, 52',
            color_palette: 'steppe',
            image_url: '/images/traditions/бузза_room.jpg',
            coordinates: { lat: 51.833315, lng: 107.58469 }
        },
    ];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getPaletteName(palette) {
    const names = {
        'baikal': 'Байкал',
        'datsan': 'Места силы',
        'steppe': 'Природные места',
        'sun': 'Улан-Удэ'
    };
    return names[palette] || palette;
}

function getLocalImagePath(itemName) {
    // Default: use the item name as file name
    return `/images/traditions/${encodeURIComponent(itemName)}.jpg`;
}

function getImageUrl(item) {
    // Try local image first
    const localPath = getLocalImagePath(item.name);
    return item.image_url || localPath;
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================

function renderCuisine(cuisineItems) {
    const grid = document.getElementById('cuisineGrid');
    grid.innerHTML = '';
    
    cuisineItems.forEach(item => {
        const card = createCuisineCard(item);
        grid.appendChild(card);
    });
    
    // Re-observe new scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

function createCuisineCard(item) {
    const card = document.createElement('div');
    card.className = 'destination-card scroll-reveal';
    
    const paletteClass = item.color_palette || 'baikal';
    const paletteName = getPaletteName(paletteClass);
    const longDescription = item.full_description || item.description || '';
    const activities = Array.isArray(item.activities) ? item.activities : [];
    const activitiesHTML = activities.length
        ? `
            <div class="modal-section">
                <h3>🎯 Что попробовать:</h3>
                <ul class="modal-activities-list">
                    ${activities.slice(0, 5).map((a) => `<li>${a}</li>`).join('')}
                </ul>
            </div>
        `
        : '';
    const tipHTML = item.tip
        ? `
            <div class="modal-section">
                <div class="modal-tip">
                    <strong>💡 Где найти</strong>
                    ${item.tip}
                </div>
            </div>
        `
        : '';
    
    const imageUrl = getImageUrl(item);
    card.innerHTML = `
        <button class="card-close-icon" aria-label="Закрыть карточку">&times;</button>
        <span class="photo-title-plaque ${paletteClass}">${paletteName}</span>
        <img src="${imageUrl}" 
             alt="${item.name}" 
             onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600'">
        <div class="destination-info">
            <h3>${item.name}</h3>
            <p>${item.description || ''}</p>
        </div>
        <div class="card-expanded-content">
            <div class="modal-section">
                <h3>📖 Описание:</h3>
                <p class="modal-description">${longDescription}</p>
            </div>
            ${activitiesHTML}
            ${tipHTML}
            <div class="expanded-actions">
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

        event.stopPropagation();
        toggleExpandedCard(card, item.color_palette || 'baikal');
    });
    
    return card;
}

let currentExpandedCard = null;
let currentExpandedPlaceholder = null;
const THEME_CLASSES = ['theme-baikal', 'theme-datsan', 'theme-steppe', 'theme-sun', 'theme-ulanude'];

function toggleExpandedCard(card, theme) {
    if (currentExpandedCard === card) {
        closeExpandedCard();
        return;
    }

    closeExpandedCard();
    currentExpandedCard = card;
    createExpandedPlaceholder(card);
    card.classList.add('is-expanded');
    card.closest('.cuisine-cards-grid')?.classList.add('has-expanded');
    changeBackground(theme);
    document.body.style.overflow = 'hidden';
}

function closeExpandedCard() {
    if (!currentExpandedCard) return;
    currentExpandedCard.classList.remove('is-expanded');
    currentExpandedCard.closest('.cuisine-cards-grid')?.classList.remove('has-expanded');
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

// ==========================================
// MODAL FUNCTIONALITY
// ==========================================

function openCuisineModal(item) {
    closeExpandedCard();
    const modal = document.getElementById('cuisineModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) {
        console.warn('Cuisine modal elements not found');
        return;
    }
    
    const paletteClass = item.color_palette || 'baikal';
    const paletteName = getPaletteName(paletteClass);
    
    let activitiesHTML = '';
    if (Array.isArray(item.activities) && item.activities.length > 0) {
        activitiesHTML = `
            <div class="modal-section">
                <h3>🎯 Что попробовать:</h3>
                <ul class="modal-activities-list">
                    ${item.activities.map(act => `<li>${act}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    let tipHTML = '';
    if (item.tip) {
        tipHTML = `
            <div class="modal-section">
                <div class="modal-tip">
                    <strong>💡 Где найти</strong>
                    ${item.tip}
                </div>
            </div>
        `;
    }
    
    const modalImageUrl = getImageUrl(item);
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${modalImageUrl}" 
                 alt="${item.name}" 
                 class="modal-header-image"
                 onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200'">
            <div class="modal-header-overlay">
                ${item.banner_title ? `<h3 class="modal-banner-title">${item.banner_title}</h3>` : ''}
                <h2 class="modal-title">${item.name}</h2>
                <span class="modal-palette-badge color-badge ${paletteClass}">${paletteName}</span>
            </div>
        </div>
        <div class="modal-details">
            <div class="modal-section">
                <p class="modal-description">${item.full_description || item.description || ''}</p>
            </div>
            ${activitiesHTML}
            ${tipHTML}
        </div>
    `;
    
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeCuisineModal() {
    const modal = document.getElementById('cuisineModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('cuisineModal');
    const closeBtn = document.querySelector('.modal-close');
    if (!modal) {
        console.warn('Cuisine modal #cuisineModal not found');
        return;
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCuisineModal);
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCuisineModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeExpandedCard();
            closeCuisineModal();
        }
    });
});

// ==========================================
// STATISTICS
// ==========================================

function updateStatistics(cuisineItems, restaurantItems) {
    const cuisineCount = cuisineItems.length;
    const restaurantCount = restaurantItems.length;
    const masterclassCount = 2; // Master-classes available
    
    animateNumber('cuisineCount', cuisineCount);
    animateNumber('restaurantCount', restaurantCount);
    animateNumber('masterclassCount', masterclassCount);
}

function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = 0;
    const increment = Math.ceil(target / 50);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current;
    }, 30);
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Gastronomy page loaded');
    
    const cuisineItems = getSampleCuisine();
    const restaurantItems = getSampleRestaurants();
    
    renderCuisine(cuisineItems);
    renderRestaurants(restaurantItems);
    updateStatistics(cuisineItems, restaurantItems);
});

function renderRestaurants(restaurantItems) {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    restaurantItems.forEach(item => {
        const card = createRestaurantCard(item);
        grid.appendChild(card);
    });
    
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

function createRestaurantCard(item) {
    const card = document.createElement('div');
    card.className = 'destination-card scroll-reveal';
    
    const paletteClass = item.color_palette || 'baikal';
    const paletteName = getPaletteName(paletteClass);
    const longDescription = item.full_description || item.description || '';
    const activities = Array.isArray(item.activities) ? item.activities : [];
    const activitiesHTML = activities.length
        ? `
            <div class="modal-section">
                <h3>🍽️ Что вас ждёт:</h3>
                <ul class="modal-activities-list">
                    ${activities.slice(0, 5).map((a) => `<li>${a}</li>`).join('')}
                </ul>
            </div>
        `
        : '';
    const tipHTML = item.tip
        ? `
            <div class="modal-section">
                <div class="modal-tip">
                    <strong>📍 Совет</strong>
                    ${item.tip}
                </div>
            </div>
        `
        : '';
    
    const mapHTML = item.coordinates
        ? `
            <div class="modal-section">
                <h3>🗺️ Как добраться:</h3>
                <div class="cafe-map-container">
                    <iframe 
                        src="https://www.openstreetmap.org/export/embed.html?bbox=${item.coordinates.lng - 0.005}%2C${item.coordinates.lat - 0.003}%2C${item.coordinates.lng + 0.005}%2C${item.coordinates.lat + 0.003}&layer=mapnik&marker=${item.coordinates.lat}%2C${item.coordinates.lng}"
                        width="100%" 
                        height="300" 
                        style="border:0;" 
                        allowfullscreen="" 
                        loading="lazy">
                    </iframe>
                    <a href="https://2gis.ru/ulanude/search/${item.coordinates.lat}%2C${item.coordinates.lng}" 
                       target="_blank" 
                       class="map-link-btn">
                        📍 Открыть в 2GIS для маршрута
                    </a>
                </div>
            </div>
        `
        : '';
    
    const imageUrl = getImageUrl(item);
    card.innerHTML = `
        <button class="card-close-icon" aria-label="Закрыть карточку">&times;</button>
        <span class="photo-title-plaque ${paletteClass}">${paletteName}</span>
        <img src="${imageUrl}" 
             alt="${item.name}" 
             onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'">
        <div class="destination-info">
            <h3>${item.name}</h3>
            <p>${item.description || ''}</p>
        </div>
        <div class="card-expanded-content">
            <div class="modal-section">
                <h3>📖 Описание:</h3>
                <p class="modal-description">${longDescription}</p>
            </div>
            ${activitiesHTML}
            ${tipHTML}
            ${mapHTML}
            <div class="expanded-actions">
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
    
    card.addEventListener('click', (event) => {
        if (event.target.closest('.card-close') || event.target.closest('.card-close-icon')) {
            closeExpandedCard();
            return;
        }

        if (event.target.closest('.expanded-actions')) {
            event.stopPropagation();
            return;
        }

        event.stopPropagation();
        toggleExpandedCard(card, item.color_palette || 'baikal');
    });
    
    return card;
}

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('tab-hidden');
    } else {
        document.body.classList.remove('tab-hidden');
    }
});

// Scroll reveal animation
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
