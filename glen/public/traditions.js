// Traditions Page JavaScript
const API_BASE = window.location.origin + '/api';

// ==========================================
// SAMPLE DATA
// ==========================================

function getSampleTraditions() {
    return [
        {
            id: 1,
            name: 'Юрта',
            description: 'Традиционное жилище кочевников — символ домашнего очага и гармонии с природой.',
            full_description: 'Бурятская юрта (гэр) — это не просто дом, а целый мир. Круглая форма символизирует единство и бесконечность. Дверь всегда смотрит на юг. Внутри — строгий порядок: мужская половина справа, женская слева, алтарь — на севере. Центр юрты — очаг, который нельзя осквернять. Юрту можно собрать за 2-3 часа и разобрать для кочёвки.',
            category: 'tradition',
            image_url: 'https://images.unsplash.com/photo-1745155541534-0b611f491762?auto=format&fit=crop&w=1200&q=80'
        },
        {
            id: 2,
            name: 'Ёхор',
            description: 'Круговой танец единства — тысячи людей двигаются как одно целое.',
            full_description: 'Ёхор — это не просто танец, а ритуал единения. Люди берутся за руки и двигаются по кругу, исполняя древние песни. Чем больше круг — тем сильнее энергия. Ёхор исполняют на праздниках, свадьбах, встречах гостей. Движения простые — главное чувствовать ритм и быть частью целого. Считается, что ёхор объединяет людей с предками и духами природы.',
            category: 'tradition',
            image_url: 'https://images.unsplash.com/photo-1771884078061-e099faacf85d?auto=format&fit=crop&w=1200&q=80'
        },
        {
            id: 3,
            name: 'Хадак',
            description: 'Ритуальный шарф — символ уважения, чистоты и благословения.',
            full_description: 'Хадак — это длинный шёлковый шарф (обычно белый, синий или жёлтый), который подносят гостям, ламам, духам. Белый цвет символизирует чистоту, синий — небо, жёлтый — процветание. Когда вам повязывают хадак — это знак глубокого уважения. Его нужно принимать двумя руками, слегка наклонившись. Хадаки вешают на деревья, обоо, статуи Будды — как дар духам.',
            category: 'tradition',
            image_url: 'https://images.unsplash.com/photo-1770337328092-04b654a8098e?auto=format&fit=crop&w=1200&q=80'
        },
        {
            id: 4,
            name: 'Обоо',
            description: 'Священная куча камней — место поклонения духам природы.',
            full_description: 'Обоо — это ритуальная куча камней на вершине горы или перевале. Путники добавляют камни, просят удачи, завязывают хадаки. Считается, что здесь живут духи-хозяева местности. Перед прохождением через перевал нужно обойти обоо три раза по часовой стрелке, добавить камень и попросить благополучного пути. Разрушать обоо — большой грех.',
            category: 'tradition',
            image_url: '/images/traditions/Обоо.jpg'
        },
        {
            id: 5,
            name: 'Бурятский чай (Сай)',
            description: 'Чай с молоком, солью и маслом — напиток гостеприимства.',
            full_description: 'Бурятский чай — это не просто напиток, а ритуал. Зелёный прессованный чай варят с молоком, солью и маслом. На вкус непривычный — солёный и сытный. Но именно так пьют чай кочевники уже тысячи лет. Когда вы приходите в бурятский дом, вам сразу нальют сай. Отказываться — оскорбление. Пить нужно медленно, хозяйка будет постоянно подливать — это знак гостеприимства.',
            category: 'tradition',
            image_url: '/images/traditions/сай.jpg'
        },
        {
            id: 6,
            name: 'Горловое пение (Хөөмий)',
            description: 'Уникальная техника пения — два голоса одновременно.',
            full_description: 'Хөөмий — это искусство извлекать два звука одновременно: низкий басовый дрон и высокий свистящий обертон. Технике тысячи лет. Бурятские горловики имитируют звуки природы: ветер в горах, журчание ручья, крик орла. Горловое пение — это не развлечение, а способ гармонизации с миром. Обучиться хөөмий сложно — нужно чувствовать вибрации всем телом.',
            category: 'tradition',
            image_url: '/images/traditions/хоомей.jpg'
        }
    ];
}

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
        }
    ];
}

function getSampleCrafts() {
    return [
        {
            id: 1,
            name: 'Войлочное ремесло',
            icon: '🧶',
            description: 'Изготовление войлока из шерсти — древнее искусство кочевников.',
            full_description: 'Войлок — это спрессованная шерсть. Буряты делали из него юрты, ковры, одежду, обувь. Процесс сложный: шерсть раскладывают слоями, поливают горячей водой с мылом и долго катают. Получается плотный, тёплый материал, который не пропускает ветер. Сегодня из войлока делают сувениры: игрушки, панно, украшения. Настоящий войлок пахнет шерстью и хранит тепло рук мастера.',
            image_url: '/images/traditions/войлочное_ремесло.jpg'
        },
        {
            id: 2,
            name: 'Серебряное дело',
            icon: 'ERING',
            description: 'Ювелирное искусство с древними орнаментами.',
            full_description: 'Бурятские серебряники — мастера высокого класса. Они делали украшения, посуду, ритуальные предметы. Главное — орнамент: каждый узор имеет значение. Спираль — вечность, ромб — плодородие, волны — вода. Сегодня в Улан-Удэ есть мастерские, где можно купить настоящие серебряные украшения с бурятскими узорами. Это не сувениры — это искусство, которое передаётся из поколения в поколение.',
            image_url: '/images/traditions/серебрянное_дело.jpg'
        },
        {
            id: 3,
            name: 'Бурят-монгольская каллиграфия',
            icon: '✍️',
            description: 'Древнее письмо — искусство красивых линий.',
            full_description: 'Старомонгольское письмо — это вертикальные строки, которые читаются сверху вниз, слева направо. Каждая буква — произведение искусства. Каллиграфы тренируются годами, чтобы линии были плавными, пропорции идеальными. Сегодня в Бурятии есть центры каллиграфии, где учат писать на старомонгольском. Можно заказать своё имя каллиграфическим письмом — это уникальный сувенир.',
            image_url: '/images/traditions/бурятская_каллиграфия.jpg'
        },
        {
            id: 4,
            name: 'Вышивка',
            icon: '🪡',
            description: 'Традиционная вышивка золотыми нитями на ткани.',
            full_description: 'Бурятская вышивка — это золотые нити на шёлке или бархате. Вышивают орнаменты, сцены из жизни, религиозные сюжеты. Техника сложная: нить продевают так, чтобы получился рельефный узор. Вышитыми изделиями украшают юрты, одежду, ритуальные предметы. Сегодня мастерицы вышивают панно, подушки, сумки. Каждая работа уникальна — машинная вышивка не заменит ручную.',
            image_url: '/images/traditions/вышивка.jpeg'
        }
    ];
}

function getSampleCeremonies() {
    return [
        {
            id: 1,
            name: 'Сагаалган',
            icon: '🎉',
            description: 'Праздник Белого месяца — бурятский Новый год по лунному календарю.',
            full_description: 'Сагаалган — главный праздник Бурятии. Отмечают в феврале-марте (дата меняется по лунному календарю). Подготовка начинается за месяц: убирают дом, готовят еду, шьют новую одежду. В ночь праздника зажигают свечи, молятся, загадывают желания. Утром надевают белую одежду (символ чистоты), ходят в гости к старшим, дарят хадаки. Стол ломится от бууз, боовов, мяса. Сагаалган длится месяц — за это время нужно обойти всех родственников.',
            date: 'Февраль-Март',
            image_url: '/images/traditions/сагалгаан.jpg'
        },
        {
            id: 2,
            name: 'Сурхарбан',
            icon: '🏹',
            description: 'Фестиваль трёх игр: стрельба из лука, конные скачки, борьба.',
            full_description: 'Сурхарбан — это древний фестиваль кочевников. Три вида соревнований: стрельба из лука (мэргэн), конные скачки (морин урилдаан), борьба (бөхэ). Победителей почитают как героев. Сурхарбан проходит летом, собирает тысячи зрителей. Стрельба из лука — самое зрелищное: лучники стреляют по мишеням на расстоянии 70-100 метров. Скачки — на 20-30 км, наездники часто дети. Борьба — без весовых категорий, побеждает сильнейший.',
            date: 'Июль',
            image_url: '/images/traditions/сурхарбан.jpg'
        },
        {
            id: 3,
            name: 'Обряд кормления огня',
            icon: '🔥',
            description: 'Подношение духу огня — молоко, масло, мясо.',
            full_description: 'Огонь для бурят — живое существо. Его нельзя ругать, плевать в него, бросать мусор. Огонь кормят: брызгают молоко, кидают масло, мясо. Обряд проводят утром, перед едой. Сначала три ложки — огню, потом себе. Огонь очищает: через него проносят новорождённых, молодожёнов, больных. Если огонь трещит — духи довольны. Если плохо горит — значит, кто-то нарушил запрет.',
            date: 'Ежедневно',
            image_url: '/images/traditions/обряд_огня.jpg'
        },
        {
            id: 4,
            name: 'Шаманский обряд',
            icon: '🥁',
            description: 'Ритуал общения с духами через бубен и транc.',
            full_description: 'Шаман (бөө) — посредник между миром людей и миром духов. Обряд начинается с подготовки: шаман надеет костюм с колокольчиками, берёт бубен (дунгэ). Бубен бьёт ритмично — это «конь» шамана, на котором он летит к духам. Шаман впадает в транс, говорит голосами духов, даёт советы, лечит. Обряды проводят в особых местах — обоо, священных рощах. Шаманизм в Бурятии жив до сих пор, особенно в сёлах.',
            date: 'По необходимости',
            image_url: '/images/traditions/шаманский.jpg'
        }
    ];
}

function getSampleFestivals() {
    return [
        {
            id: 1,
            name: 'Балет на Байкале',
            banner_title: 'Балет на Байкале — сцена на берегу великого озера',
            description: 'Ежегодный фестиваль в июле. Артисты Бурятского театра оперы и балета танцуют на открытой сцене с видом на Байкал.',
            full_description: 'Представьте: закат над Байкалом, вода оранжевая, горы синие. На сцене — «Лебединое озеро» или бурятский балет «Улюбшан». Танцуют артисты из Улан-Удэ, иногда приезжают гости из Москвы и Монголии.\n\nСцена стоит прямо на берегу, в посёлке Горячинск или на турбазе «Байкальский прибой». Билеты расходятся за месяц.',
            activities: [
                'Посмотреть балет на закате',
                'Сделать фото артистов на фоне Байкала',
                'Приехать с пикником (можно с собой)',
                'Остаться на ночь в отеле на берегу'
            ],
            tip: 'Июль (точные даты — в афише театра)',
            color_palette: 'baikal',
            image_url: '/images/traditions/балет.jpg'
        },
        {
            id: 2,
            name: 'Боргойская баранина',
            banner_title: 'Боргойская баранина — царское мясо на фестивале',
            description: 'Летний фестиваль в Боргойской степи. Дегустация легендарной баранины, которая поставлялась к царскому столу.',
            full_description: 'Боргойская баранина — это бренд. Мясо особого вкуса: овцы пасутся на степных травах, которые дают мясу сладковатый привкус. Ещё в XIX веке боргойскую баранину поставляли к царскому столу.\n\nФестиваль проходит в Боргойской степи, под открытым небом. Готовят бухлёр (суп), хушууры, позы, шашлык. Можно попробовать и купить. А ещё — послушать горловое пение, купить шерстяные изделия, просто погулять по степи.',
            activities: [
                'Попробовать настоящую боргойскую баранину',
                'Съесть бухлёр из котла на костре',
                'Купить мясо домой (замороженное, в вакууме)',
                'Послушать этно-музыку',
                'Фотографировать степь'
            ],
            tip: 'Август',
            color_palette: 'datsan',
            image_url: '/images/traditions/баранина.jpg'
        }
    ];
}

// ==========================================
// RENDERING FUNCTIONS
// ==========================================

function renderTraditions(traditions) {
    const grid = document.getElementById('traditionsGrid');
    grid.innerHTML = '';
    
    traditions.forEach(tradition => {
        const card = document.createElement('div');
        card.className = 'tradition-card scroll-reveal';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div class="tradition-header">
                <img src="${tradition.image_url}" alt="${tradition.name}" class="tradition-image" onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'">
            </div>
            <div class="card-content">
                <h3>${tradition.name}</h3>
                <p>${tradition.description}</p>
            </div>
        `;
        
        card.addEventListener('click', () => openTraditionModal(tradition));
        grid.appendChild(card);
    });
}

function renderCuisine(cuisine) {
    const grid = document.getElementById('cuisineGrid');
    grid.innerHTML = '';
    
    cuisine.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'cuisine-card scroll-reveal';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div class="cuisine-header">
                <img src="${dish.image_url}" alt="${dish.name}" class="cuisine-image">
            </div>
            <div class="cuisine-content">
                <h3>${dish.name}</h3>
                <p>${dish.description}</p>
            </div>
        `;
        
        card.addEventListener('click', () => openCuisineModal(dish));
        grid.appendChild(card);
    });
}

function renderCrafts(crafts) {
    const grid = document.getElementById('craftsGrid');
    grid.innerHTML = '';
    
    crafts.forEach(craft => {
        const card = document.createElement('div');
        card.className = 'craft-card scroll-reveal';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div class="craft-header">
                <img src="${craft.image_url}" alt="${craft.name}" class="craft-image" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80';">
            </div>
            <div class="craft-content">
                <h3>${craft.name}</h3>
                <p>${craft.description}</p>
            </div>
        `;
        
        card.addEventListener('click', () => openCraftModal(craft));
        grid.appendChild(card);
    });
}

function renderCeremonies(ceremonies) {
    const grid = document.getElementById('ceremoniesGrid');
    grid.innerHTML = '';
    
    ceremonies.forEach(ceremony => {
        const card = document.createElement('div');
        card.className = 'ceremony-card scroll-reveal';
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div class="ceremony-header">
                <img src="${ceremony.image_url}" alt="${ceremony.name}" class="ceremony-image">
                <div class="ceremony-date-badge">${ceremony.date}</div>
            </div>
            <div class="ceremony-content">
                <h3>${ceremony.name}</h3>
                <p>${ceremony.description}</p>
            </div>
        `;
        
        card.addEventListener('click', () => openCeremonyModal(ceremony));
        grid.appendChild(card);
    });
}

function renderFestivals(festivals) {
    const grid = document.getElementById('festivalsGrid');
    grid.innerHTML = '';
    
    festivals.forEach(festival => {
        const card = document.createElement('div');
        card.className = 'festival-card scroll-reveal';
        card.style.cursor = 'pointer';
        
        const paletteClass = festival.color_palette || 'baikal';
        const paletteName = getFestivalPaletteName(paletteClass);
        
        card.innerHTML = `
            <img src="${festival.image_url}" 
                 alt="${festival.name}" 
                 class="festival-image"
                 onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'">
            <div class="festival-info">
                <h3>${festival.name}</h3>
                <p>${festival.description}</p>
                <span class="color-badge ${paletteClass}">${paletteName}</span>
            </div>
        `;
        
        card.addEventListener('click', () => openFestivalModal(festival));
        grid.appendChild(card);
    });
}

function getFestivalPaletteName(palette) {
    const names = {
        'baikal': 'Байкал',
        'datsan': 'Дацан',
        'steppe': 'Степь',
        'sun': 'Улан-Удэ'
    };
    return names[palette] || palette;
}

// ==========================================
// MODAL FUNCTIONS
// ==========================================

function createModal() {
    const modal = document.getElementById('traditionModal');
    
    // Close handlers
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function closeModal() {
    const modal = document.getElementById('traditionModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

function openTraditionModal(tradition) {
    const modal = document.getElementById('traditionModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${tradition.image_url}" 
                 alt="${tradition.name}" 
                 class="modal-header-image"
                 onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'">
            <div class="modal-header-overlay">
                <h2 class="modal-title">${tradition.name}</h2>
            </div>
        </div>
        <div class="modal-details">
            <div class="modal-section">
                <p class="modal-description">${tradition.full_description}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 10);
}

function openCuisineModal(dish) {
    const modal = document.getElementById('traditionModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${dish.image_url}" 
                 alt="${dish.name}" 
                 class="modal-header-image"
                 onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'">
            <div class="modal-header-overlay">
                <h2 class="modal-title">${dish.name}</h2>
            </div>
        </div>
        <div class="modal-details">
            <div class="modal-section">
                <p class="modal-description">${dish.full_description}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 10);
}

function openCraftModal(craft) {
    const modal = document.getElementById('traditionModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${craft.image_url}" 
                 alt="${craft.name}" 
                 class="modal-header-image"
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80';">
            <div class="modal-header-overlay">
                <h2 class="modal-title">${craft.name}</h2>
            </div>
        </div>
        <div class="modal-details">
            <div class="modal-section">
                <p class="modal-description">${craft.full_description}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 10);
}

function openCeremonyModal(ceremony) {
    const modal = document.getElementById('traditionModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${ceremony.image_url}" 
                 alt="${ceremony.name}" 
                 class="modal-header-image"
                 onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'">
            <div class="modal-header-overlay">
                <h2 class="modal-title">${ceremony.name}</h2>
            </div>
        </div>
        <div class="modal-details">
            <div class="modal-section">
                <p class="modal-description">${ceremony.full_description}</p>
            </div>
            ${ceremony.date ? `
                <div class="modal-section">
                    <div class="modal-tip">
                        <strong>📅 Когда:</strong> ${ceremony.date}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 10);
}

function openFestivalModal(festival) {
    const modal = document.getElementById('traditionModal');
    const modalBody = document.getElementById('modalBody');
    
    const paletteClass = festival.color_palette || 'baikal';
    const paletteName = getFestivalPaletteName(paletteClass);
    
    let activitiesHTML = '';
    if (festival.activities && festival.activities.length > 0) {
        activitiesHTML = `
            <div class="modal-section">
                <h3>🎯 Что делать:</h3>
                <ul class="modal-activities-list">
                    ${festival.activities.map(act => `<li>${act}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    let tipHTML = '';
    if (festival.tip) {
        tipHTML = `
            <div class="modal-section">
                <div class="modal-tip">
                    <strong>📅 Когда:</strong>
                    ${festival.tip}
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${festival.image_url}" 
                 alt="${festival.name}" 
                 class="modal-header-image"
                 onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'">
            <div class="modal-header-overlay">
                ${festival.banner_title ? `<h3 class="modal-banner-title">${festival.banner_title}</h3>` : ''}
                <h2 class="modal-title">${festival.name}</h2>
                <span class="modal-palette-badge color-badge ${paletteClass}">${paletteName}</span>
            </div>
        </div>
        <div class="modal-details">
            <div class="modal-section">
                <p class="modal-description">${festival.full_description || festival.description || ''}</p>
            </div>
            ${activitiesHTML}
            ${tipHTML}
        </div>
    `;
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 10);
}

// ==========================================
// ANIMATED COUNTERS
// ==========================================

function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
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
    console.log('Traditions page loaded');
    
    // Create modal
    createModal();
    
    // Load data
    const traditions = getSampleTraditions();
    const crafts = getSampleCrafts();
    const ceremonies = getSampleCeremonies();
    const festivals = getSampleFestivals();
    
    // Render
    renderTraditions(traditions);
    renderCrafts(crafts);
    renderCeremonies(ceremonies);
    renderFestivals(festivals);
    
    // Animate counters
    setTimeout(() => {
        animateCounter('traditionCount', traditions.length);
        animateCounter('ceremonyCount', ceremonies.length);
        animateCounter('craftCount', crafts.length);
    }, 500);
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('tab-hidden');
    } else {
        document.body.classList.remove('tab-hidden');
    }
});
