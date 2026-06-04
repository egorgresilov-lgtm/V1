## Требуемые технологии

Frontend:
- HTML5, CSS3, JavaScript (ES6+)
- Кастомный дизайн без Bootstrap/Tailwind
- CSS Grid и Flexbox для адаптивной вёрстки
- Intersection Observer API для анимаций

Backend:
- Node.js с Express для REST API
- PostgreSQL для основной БД
- Redis для кэширования
- JWT для аутентификации
- bcrypt для хеширования паролей

## Предварительные требования

Перед установкой убедитесь, что установлены:
- Node.js версия 16 или выше
- PostgreSQL версия 12 или выше
- Redis (опционально, но рекомендуется)
- npm или yarn

## Установка и запуск

Шаг 1: Перейти в директорию проекта

```bash
cd c:\Users\egorg\Downloads\glen\glen
```

Шаг 2: Установить зависимости

```bash
npm install
```

Шаг 3: Настроить переменные окружения

Скопируйте .env.example в .env:

```bash
copy .env.example .env
```

Откройте .env и отредактируйте следующие параметры:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=buryatia_tourism
DB_USER=postgres
DB_PASSWORD=ваш_пароль_postgres
JWT_ACCESS_SECRET=ваш_секретный_ключ
JWT_REFRESH_SECRET=ваш_второй_секретный_ключ
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ваша_почта@gmail.com
EMAIL_PASS=пароль_приложения
```

Шаг 4: Создать базу данных PostgreSQL

Откройте PostgreSQL и выполните команду:

```sql
CREATE DATABASE buryatia_tourism;
```

Шаг 5: Запустить миграции базы данных

```bash
npm run migrate
```

Это создаст все необходимые таблицы в БД.

Шаг 6: Заполнить начальные данные

```bash
npm run seed
```

Seed включает администратора и примеры данных.

Шаг 7: Запустить сервер разработки

```bash
npm run dev
```

Или для обычного запуска:

```bash
npm start
```

Сервер запустится на http://localhost:3000

## Основные команды

```bash
npm install        Установка всех зависимостей
npm start          Запуск сервера в режиме production
npm run dev        Запуск сервера в режиме разработки
npm run migrate    Применить миграции БД
npm run seed       Заполнить БД начальными данными
npm run setup      Настроить БД (миграции + seed)
```
Пароль для входа в админ-панель: admin123
