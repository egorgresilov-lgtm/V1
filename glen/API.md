# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require an Authorization header:
```
Authorization: Bearer <access_token>
```

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "user"  // optional: guest, user, editor, super_admin
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@buryatia.ru",
  "password": "admin123"
}

Response:
{
  "user": {
    "id": 1,
    "email": "admin@buryatia.ru",
    "role": "super_admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Destinations

### Get All Destinations
```http
GET /destinations
GET /destinations?color_palette=baikal
GET /destinations?type=nature&color_palette=datsan
```

Query Parameters:
- `color_palette` (optional): baikal, datsan, steppe, sun
- `type` (optional): nature, culture, etc.

### Get Destination by ID
```http
GET /destinations/:id
```

### Get Destinations by Color Palette
```http
GET /destinations/color/baikal
GET /destinations/color/datsan
GET /destinations/color/steppe
GET /destinations/color/sun
```

### Get Map Points
```http
GET /destinations/map/points

Response:
[
  {
    "id": 1,
    "name_ru": "Озеро Байкал",
    "name_buryat": "Байгал далай",
    "color_palette": "baikal",
    "latitude": 53.5587,
    "longitude": 108.1650,
    "type": "nature"
  }
]
```

### Create Destination (Editor+)
```http
POST /destinations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name_ru": "Название на русском",
  "name_buryat": "Название на бурятском",
  "description_ru": "Описание",
  "description_buryat": "Описание на бурятском",
  "color_palette": "baikal",
  "latitude": 53.5587,
  "longitude": 108.1650,
  "image_url": "https://example.com/image.jpg",
  "type": "nature"
}
```

### Update Destination (Editor+)
```http
PUT /destinations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name_ru": "Обновлённое название",
  "description_ru": "Обновлённое описание"
}
```

### Delete Destination (Super Admin)
```http
DELETE /destinations/:id
Authorization: Bearer <token>
```

---

## Tours

### Get All Tours
```http
GET /tours
```

### Get Tour by ID
```http
GET /tours/:id
```

### Create Tour (Editor+)
```http
POST /tours
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Экотропа вокруг Байкала",
  "duration": "3 дня",
  "difficulty": "medium",  // easy, medium, hard
  "destination_ids": [1, 2],
  "price": 15000.00,
  "season": "Июнь - Сентябрь"
}
```

### Update Tour (Editor+)
```http
PUT /tours/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 16000.00
}
```

### Delete Tour (Super Admin)
```http
DELETE /tours/:id
Authorization: Bearer <token>
```

---

## Events

### Get All Events
```http
GET /events
```

### Get Upcoming Events
```http
GET /events/upcoming
```

### Create Event (Editor+)
```http
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title_ru": "Сагаалган",
  "title_buryat": "Сагаалган",
  "description_ru": "Бурятский Новый год",
  "description_buryat": "Буряад Шэнэ Жэл",
  "event_date": "2026-02-17",
  "type": "holiday"  // holiday, food, ritual
}
```

### Update Event (Editor+)
```http
PUT /events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_date": "2026-02-18"
}
```

### Delete Event (Super Admin)
```http
DELETE /events/:id
Authorization: Bearer <token>
```

---

## Bookings

### Get All Bookings (Editor+)
```http
GET /bookings
Authorization: Bearer <token>
```

### Get Booking by ID (Editor+)
```http
GET /bookings/:id
Authorization: Bearer <token>
```

### Create Booking
```http
POST /bookings
Content-Type: application/json

{
  "full_name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+79001234567",
  "tour_id": 1,
  "booking_date": "2026-07-15",
  "number_of_people": 2,
  "wishes": "Веgetарианское питание"
}

Note: Duplicate bookings (same email + tour + date) are rejected
```

### Update Booking Status (Editor+)
```http
PATCH /bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"  // pending, confirmed, cancelled, completed
}
```

### Delete Booking (Super Admin)
```http
DELETE /bookings/:id
Authorization: Bearer <token>
```

---

## Reviews

### Get All Reviews
```http
GET /reviews
GET /reviews?status=pending
```

### Get Approved Reviews
```http
GET /reviews/approved
```

### Create Review
```http
POST /reviews
Content-Type: application/json

{
  "author": "Анна М.",
  "text": "Отличное путешествие!",
  "rating": 5  // 1-5
}

Note: New reviews have status 'pending' and need moderation
```

### Moderate Review (Editor+)
```http
PATCH /reviews/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"  // pending, approved, rejected
}
```

### Delete Review (Editor+)
```http
DELETE /reviews/:id
Authorization: Bearer <token>
```

---

## Facts

### Get Random Fact
```http
GET /facts/random

Response:
{
  "id": 1,
  "fact_ru": "Байкал содержит около 20% мировых запасов пресной воды.",
  "fact_buryat": "Байгал далайда дэлхэйн сэгээн уһанай 20% хадхаалагдана.",
  "is_active": true
}
```

### Get All Facts (Editor+)
```http
GET /facts
Authorization: Bearer <token>
```

### Create Fact (Editor+)
```http
POST /facts
Authorization: Bearer <token>
Content-Type: application/json

{
  "fact_ru": "Интересный факт на русском",
  "fact_buryat": "Интересный факт на бурятском",
  "is_active": true
}
```

### Update Fact (Editor+)
```http
PUT /facts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fact_ru": "Обновлённый факт",
  "is_active": false
}
```

### Delete Fact (Super Admin)
```http
DELETE /facts/:id
Authorization: Bearer <token>
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Duplicate booking detected"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Booking creation: 3 requests per hour

When rate limit is exceeded:
```json
{
  "error": "Too many requests, please try again later"
}
```

---

## Color Palettes

Available color palettes for destinations:

- `baikal` - Deep blue-green (Lake Baikal)
- `datsan` - Ochre/gold/red (Buddhist temples)
- `steppe` - Muted green/beige (Steppes)
- `sun` - Warm yellow/wood (Ulan-Ude city)

---

## User Roles

- `guest` - Can view public content only
- `user` - Registered user, can create bookings and reviews
- `editor` - Can manage content (destinations, tours, events, facts)
- `super_admin` - Full access including deletion and user management

---

## Caching

Redis caching is enabled for:
- Destinations list: 1 hour
- Map points: 2 hours
- Events: 1 hour
- Upcoming events: 30 minutes
- Random facts: 5 minutes

Cache is automatically invalidated on updates.
