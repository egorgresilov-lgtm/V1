@echo off
chcp 65001 > nul
cd /d "%~dp0glen"

setlocal enabledelayedexpansion

REM Проверка Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js не установлен!
    echo Скачайте: https://nodejs.org/
    pause
    exit /b 1
)

REM Установка зависимостей если нужно
if not exist node_modules (
    echo 📦 Установка зависимостей...
    call npm install
    if errorlevel 1 (
        echo ❌ Ошибка при установке!
        pause
        exit /b 1
    )
)

REM Создание .env файла если его нет
if not exist .env (
    echo ⚙️  Создание файла конфигурации .env...
    (
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=buryatia_tourism
        echo DB_USER=postgres
        echo DB_PASSWORD=password
        echo DB_SSL=false
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo PORT=3000
        echo NODE_ENV=development
        echo JWT_SECRET=your_secret_key_change_in_production
        echo JWT_EXPIRY=7d
        echo SMTP_HOST=smtp.gmail.com
        echo SMTP_PORT=587
        echo SMTP_USER=your_email@gmail.com
        echo SMTP_PASSWORD=your_app_password
        echo SMTP_FROM=noreply@buryatia.ru
    ) > .env
)

cls
echo ========================================
echo   🚀 Buryatia Tourism Server
echo ========================================
echo.
echo 1. 🎯 Запустить сервер
echo 2. 👨‍💻 Режим разработки (nodemon)
echo 3. 🔧 Инициализация (setup + migrate + seed)
echo 4. ❌ Выход
echo.
set /p choice="Выберите опцию (1-4): "

if "%choice%"=="1" (
    cls
    echo ✅ Запуск сервера...
    echo 📍 Сайт: http://localhost:3000
    echo 📍 Админ: http://localhost:3000/admin.html
    echo.
    echo Нажмите Ctrl+C для остановки
    echo.
    npm start
) else if "%choice%"=="2" (
    cls
    echo ✅ Запуск режима разработки...
    echo 🔄 Сервер перезагружается при изменении файлов
    echo 📍 Сайт: http://localhost:3000
    echo.
    echo Нажмите Ctrl+C для остановки
    echo.
    npm run dev
) else if "%choice%"=="3" (
    cls
    echo 🔧 Полная инициализация проекта...
    echo.
    echo ⚙️  Этап 1: Настройка БД...
    npm run setup
    if errorlevel 1 (
        echo ❌ Ошибка при setup!
        pause
        exit /b 1
    )
    echo ✅ БД настроена
    echo.
    
    echo 📝 Этап 2: Миграция...
    npm run migrate
    echo ✅ Миграция завершена
    echo.
    
    echo 🌱 Этап 3: Загрузка данных...
    npm run seed
    echo ✅ Данные загружены
    echo.
    echo ✅ Инициализация завершена!
    echo.
    pause
) else if "%choice%"=="4" (
    exit /b 0
) else (
    echo ❌ Неверный выбор!
    timeout /t 2 /nobreak
    cls
    "%0"
)

pause
