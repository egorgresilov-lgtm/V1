# Бурятия Tourism - Дух Места 🏔️

Полнофункциональное fullstack-приложение о туризме в Бурятии с уникальным дизайном, передающим «Дух места» — эмоциональную связь с природой, культурой и историей региона.

## 🎨 Концепция и Дизайн

### Цветовая палитра
- **Байкал** — глубокий сине-зелёный (#1a5276, #2980b9)
- **Иволгинский дацан** — охра, золотой, акцентный красный (#d4ac0d, #f1c40f, #c0392b)
- **Степи** — приглушённый травяной, охристый, серо-бежевый (#7d8c6e, #c9a961, #d5c4a1)
- **Улан-Удэ** — тёплый жёлтый, оттенки дерева (#f39c12, #8b6f47)

### Особенности дизайна
- Плавная анимация появления элементов при скролле
- Эффект «дымки» при наведении на карточки
- Бурятские орнаменты в оформлении
- Фото с лёгким акварельным фильтром
- Интерактивная SVG-карта с точками достопримечательностей
- Адаптивный дизайн для всех устройств

## 🚀 Технологии

### Frontend
- Чистый HTML5, CSS3, JavaScript (ES6+)
- Без Bootstrap/Tailwind — кастомный дизайн
- CSS Grid и Flexbox для адаптивной вёрстки
- Intersection Observer API для анимаций
- SVG для интерактивной карты

### Backend
- **Node.js + Express** — REST API
- **PostgreSQL** — основная база данных
- **Redis** — кэширование
- **JWT** — аутентификация (access + refresh tokens)
- **bcrypt** — хеширование паролей
- Архитектура: Контроллеры → Сервисы → Репозитории

## 📋 Предварительные требования

- Node.js (версия 16 или выше)
- PostgreSQL (версия 12 или выше)
- Redis (опционально, но рекомендуется)
- npm или yarn

## 🛠️ Установка и запуск

### 1. Клонирование репозитория

```bash
cd c:\Users\egorg\Downloads\glen
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Скопируйте файл `.env.example` в `.env` и настройте параметры:

```bash
copy .env.example .env
```

Откройте `.env` и измените следующие параметры:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=buryatia_tourism
DB_USER=postgres
DB_PASSWORD=ваш_пароль_postgres

# JWT Secrets (измените на свои секретные ключи!)
JWT_ACCESS_SECRET=your_access_secret_key_change_this
JWT_REFRESH_SECRET=your_refresh_secret_key_change_this

# Email Configuration (для уведомлений о бронированиях)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Telegram Bot (для уведомлений админу)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 4. Создание базы данных

Войдите в PostgreSQL и создайте базу данных:

```sql
CREATE DATABASE buryatia_tourism;
```

### 5. Запуск миграций

```bash
npm run migrate
```

Это создаст все необходимые таблицы:
- `users` — пользователи с ролями
- `destinations` — достопримечательности с цветовой палитрой
- `tours` — маршруты и туры
- `traditional_events` — традиционные праздники
- `reviews` — отзывы с модерацией
- `bookings` — бронирования
- `random_facts` — интересные факты
- `refresh_tokens` — токены обновления
- `activity_log` — журнал действий

### 6. Заполнение начальными данными

```bash
npm run seed
```

Seed данные включают:
- Администратора (email: `admin@buryatia.ru`, пароль: `admin123`)
- 3 достопримечательности (Байкал, Иволгинский дацан, Баргузинская долина)
- 2 маршрута
- 2 традиционных праздника (Сагаалган, Сурхарбан)
- 3 интересных факта

### 7. Запуск сервера разработки

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

## 📱 Использование

### Основной сайт

Откройте браузер и перейдите по адресу: `http://localhost:3000`

**Функциональность:**
- Просмотр достопримечательностей с фильтрацией по цветовой палитре
- Интерактивная карта Бурятии
- Информация о турах и маршрутах
- Раздел о традициях и культуре
- Случайные факты о Бурятии
- Отзывы путешественников
- Адаптивный дизайн для мобильных устройств

### Админ-панель

Перейдите по адресу: `http://localhost:3000/admin.html`

**Учётные данные администратора:**
- Email: `admin@buryatia.ru`
- Пароль: `admin123`

**Возможности админ-панели:**
- ✅ CRUD достопримечательностей (с выбором цвета из палитры)
- ✅ Управление маршрутами
- ✅ Просмотр и управление бронированиями (подтверждение/отмена)
- ✅ Модерация отзывов (одобрение/отклонение)
- ✅ Редактирование случайных фактов
- ✅ Журнал действий пользователей

## 🔐 API Endpoints

### Аутентификация
- `POST /api/auth/register` — регистрация нового пользователя
- `POST /api/auth/login` — вход в систему
- `POST /api/auth/refresh-token` — обновление токена
- `POST /api/auth/logout` — выход из системы

### Достопримечательности
- `GET /api/destinations` — получить все достопримечательности
  - Query params: `?color_palette=baikal&?type=nature`
- `GET /api/destinations/:id` — получить достопримечательность по ID
- `GET /api/destinations/color/:color_palette` — фильтр по цветовой палитре
- `GET /api/destinations/map/points` — точки для карты с координатами
- `POST /api/destinations` — создать (требуется: editor/super_admin)
- `PUT /api/destinations/:id` — обновить (требуется: editor/super_admin)
- `DELETE /api/destinations/:id` — удалить (требуется: super_admin)

### Маршруты
- `GET /api/tours` — получить все маршруты
- `GET /api/tours/:id` — получить маршрут по ID
- `POST /api/tours` — создать (требуется: editor/super_admin)
- `PUT /api/tours/:id` — обновить (требуется: editor/super_admin)
- `DELETE /api/tours/:id` — удалить (требуется: super_admin)

### События
- `GET /api/events` — получить все события
- `GET /api/events/upcoming` — ближайшие праздники
- `POST /api/events` — создать (требуется: editor/super_admin)
- `PUT /api/events/:id` — обновить (требуется: editor/super_admin)
- `DELETE /api/events/:id` — удалить (требуется: super_admin)

### Бронирования
- `GET /api/bookings` — получить все бронирования (требуется: editor/super_admin)
- `GET /api/bookings/:id` — получить бронирование по ID (требуется: editor/super_admin)
- `POST /api/bookings` — создать бронирование
- `PATCH /api/bookings/:id/status` — изменить статус (требуется: editor/super_admin)
- `DELETE /api/bookings/:id` — удалить (требуется: super_admin)

### Отзывы
- `GET /api/reviews` — получить все отзывы
- `GET /api/reviews/approved` — получить одобренные отзывы
- `POST /api/reviews` — создать отзыв
- `PATCH /api/reviews/:id/status` — модерация (требуется: editor/super_admin)
- `DELETE /api/reviews/:id` — удалить (требуется: editor/super_admin)

### Факты
- `GET /api/facts/random` — получить случайный факт
- `GET /api/facts` — получить все факты (требуется: editor/super_admin)
- `POST /api/facts` — создать факт (требуется: editor/super_admin)
- `PUT /api/facts/:id` — обновить факт (требуется: editor/super_admin)
- `DELETE /api/facts/:id` — удалить факт (требуется: super_admin)

## 🎯 Проверочный вопрос

**Вопрос:** Как фильтрация достопримечательностей по цветовой палитре (Байкал/дацан/степь/солнце) связана с «Духом места» и как она реализована в API?

**Ответ:** 

Концепция «Духа места» передаёт эмоциональную связь с уникальными характеристиками Бурятии через цветовые ассоциации:

1. **Байкал** (сине-зелёный) — чистота, глубина, спокойствие великого озера
2. **Дацан** (охра, золото) — духовность, мудрость буддизма, священность
3. **Степь** (травяной, бежевый) — свобода, простор, кочевые традиции
4. **Улан-Удэ/Солнце** (жёлтый, дерево) — тепло, гостеприимство, городская культура

**Реализация в API:**

```javascript
// GET /api/destinations?color_palette=baikal
// Фильтрация происходит на уровне базы данных

async getAllDestinations(filters = {}) {
  let query = 'SELECT * FROM destinations WHERE 1=1';
  
  if (filters.color_palette) {
    query += ` AND color_palette = $${paramCount}`;
    values.push(filters.color_palette);
  }
  
  const result = await pool.query(query, values);
  return result.rows;
}
```

Пользователь может выбрать цветовую палитру на фронтенде, и API вернёт только те достопримечательности, которые ассоциируются с выбранным «духом места». Это позволяет создавать тематические маршруты и погружаться в определённую атмосферу Бурятии.

## 🔒 Безопасность

- ✅ Хеширование паролей с bcrypt
- ✅ JWT аутентификация с access и refresh токенами
- ✅ Защита от SQL-инъекций (параметризированные запросы)
- ✅ Защита от XSS (Helmet.js)
- ✅ CORS для контроля доступа
- ✅ Rate limiting для защиты от брутфорса
- ✅ Ролевая модель доступа (guest/user/editor/super_admin)
- ✅ Логирование всех действий администраторов
- ✅ Переменные окружения для чувствительных данных

## 📂 Структура проекта

```
glen/
├── controllers/          # Контроллеры API
│   ├── authController.js
│   ├── destinationController.js
│   ├── tourController.js
│   ├── eventController.js
│   ├── bookingController.js
│   ├── reviewController.js
│   └── factController.js
├── database/            # База данных
│   ├── db.js           # Подключение к PostgreSQL
│   ├── migrate.js      # Миграции
│   └── seed.js         # Начальные данные
├── middleware/          # Промежуточное ПО
│   ├── auth.js         # Аутентификация и авторизация
│   └── rateLimiter.js  # Ограничение запросов
├── public/             # Фронтенд
│   ├── index.html      # Главный сайт
│   ├── admin.html      # Админ-панель
│   ├── styles.css      # Стили
│   ├── script.js       # Клиентский JS
│   └── admin.js        # JS админ-панели
├── repositories/       # Репозитории (работа с БД)
│   ├── destinationRepository.js
│   ├── tourRepository.js
│   ├── eventRepository.js
│   ├── bookingRepository.js
│   ├── reviewRepository.js
│   ├── userRepository.js
│   └── factRepository.js
├── routes/            # Маршруты API
│   ├── authRoutes.js
│   ├── destinationRoutes.js
│   ├── tourRoutes.js
│   ├── eventRoutes.js
│   ├── bookingRoutes.js
│   ├── reviewRoutes.js
│   └── factRoutes.js
├── services/          # Бизнес-логика
│   ├── authService.js
│   ├── destinationService.js
│   ├── tourService.js
│   ├── eventService.js
│   ├── bookingService.js
│   ├── reviewService.js
│   └── factService.js
├── utils/             # Утилиты
│   ├── jwt.js        # Работа с JWT
│   ├── logger.js     # Логирование
│   └── redis.js      # Кэширование
├── .env              # Переменные окружения (не в git)
├── .env.example      # Пример конфигурации
├── .gitignore
├── package.json
└── server.js         # Точка входа
```

## 🧪 Тестирование

Для проверки работы приложения:

1. Убедитесь, что сервер запущен (`npm run dev`)
2. Откройте `http://localhost:3000` — должен загрузиться главный сайт
3. Откройте `http://localhost:3000/admin.html` — войдите как администратор
4. Попробуйте добавить новую достопримечательность через админ-панель
5. Проверьте фильтрацию по цветовой палитре на главной странице

## 🌟 Особенности реализации

### Чистая архитектура
- **Контроллеры** — обработка HTTP запросов/ответов
- **Сервисы** — бизнес-логика
- **Репозитории** — работа с базой данных
- Легко тестировать и поддерживать

### Производительность
- Кэширование через Redis (достопримечательности, события, факты)
- Индексы в базе данных для быстрых запросов
- Оптимизированные SQL запросы

### UX/UI
- Плавные анимации без тяжёлых библиотек
- Ленивая загрузка контента
- Отзывчивый интерфейс
- Fallback данные при ошибках API

## 📸 Источники изображений (Традиции)

Фото для блока `Традиции` на странице `public/traditions.js` используются из [Unsplash Source](https://source.unsplash.com/) и [Wikimedia Commons](https://commons.wikimedia.org/):

### Традиции
- `Юрта` — `https://images.unsplash.com/photo-1745155541534-0b611f491762?auto=format&fit=crop&w=1200&q=80` (оригинал: https://unsplash.com/photos/a-mongolian-yurt-sits-in-a-scenic-hilly-landscape-OIuhsUwfOlo)
- `Ёхор` — `https://images.unsplash.com/photo-1771884078061-e099faacf85d?auto=format&fit=crop&w=1200&q=80` (оригинал: https://unsplash.com/photos/people-holding-hands-in-a-circle-dance-sdvCRUbhdHc)
- `Хадак` — `https://images.unsplash.com/photo-1770337328092-04b654a8098e?auto=format&fit=crop&w=1200&q=80` (оригинал: https://unsplash.com/photos/golden-stupa-with-prayer-flags-and-blue-sky-or7E9Ol2J1g)
- `Обоо` — `https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80` (Unsplash)
- `Бурятский чай (Сай)` — `https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80` (Unsplash)
- `Горловое пение (Хөөмий)` — `https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80` (Unsplash)

### Народные ремёсла
- `Войлочное ремесло` — `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80` (Unsplash - wool craft)
- `Серебряное дело` — `https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80` (Unsplash - silver jewelry)
- `Бурят-монгольская каллиграфия` — `https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80` (Unsplash - calligraphy/writing)
- `Вышивка` — `https://upload.wikimedia.org/wikipedia/commons/9/9c/Buryat_costumes_11.JPG` (Wikimedia Commons - Buryat traditional costume with gold embroidery, festival Altargana-2012)

### Новые источники (папка `фотки/новое`)
- `Оромо` — `https://ru.wikipedia.org/wiki/%D0%9E%D1%80%D0%BE%D0%BC%D0%BE_(%D0%B1%D0%BB%D1%8E%D0%B4%D0%BE)#/media/%D0%A4%D0%B0%D0%B9%D0%BB:Oromo_(dish).jpg`
- `Свято-Одигитриевский собор в Улан-Удэ` — `https://ru.wikipedia.org/wiki/%D0%9E%D0%B4%D0%B8%D0%B3%D0%B8%D1%82%D1%80%D0%B8%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80_(%D0%A3%D0%BB%D0%B0%D0%BD-%D0%A3%D0%B4%D1%8D)#/media/%D0%A4%D0%B0%D0%B9%D0%BB:Odigitrievsky_Cathedral,_Ulan_Ude_01.jpg`
- `Спасо-Преображенский Посольский монастырь` — `https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B0%D1%81%D0%BE-%D0%9F%D1%80%D0%B5%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BE%D0%B1%D0%BE%D1%80_%D0%9F%D0%BE%D1%81%D0%BE%D0%BB%D1%8C%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8F#/media/%D0%A4%D0%B0%D0%B9%D0%BB:%D0%9F%D0%BE%D1%81%D0%BE%D0%BB%D1%8C%D1%81%D0%BA%D0%BE%D0%B5,_%D0%A1%D0%BF%D0%B0%D1%81%D0%BE-%D0%9F%D1%80%D0%B5%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%D0%B9_%D0%9F%D0%BE%D1%81%D0%BE%D0%BB%D1%8C%D1%81%D0%BA%D0%B8%D0%B9_%D0%BC%D0%BE%D0%BD%D0%B0%D1%81%D1%82%D1%8B%D1%80%D1%8C,_1.jpg`
- `Спасская церковь (Бичура)` — `https://pravoslavnaya-buryatiya.ru/2021/07/09/hram-svyatogo-proroka-bozhiya-ilii-s-bichura/`
- `Храм «Всех скорбящих Радость» (Кяхта)` — `https://sobory.ru/photo/526447`

## 📝 Лицензия

MIT

## 👨‍💻 Автор

Разработано с ❤️ для продвижения туризма в Бурятии

---

**Байкал — наше сокровище!** 🌊
