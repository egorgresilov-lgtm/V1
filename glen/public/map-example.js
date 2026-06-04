/**
 * Пример правильного добавления достопримечательностей на Яндекс.Карту
 * с использованием Promise.all для параллельного геокодирования
 * 
 * Этот файл показывает правильный подход, который уже применен в attractions.js
 */

// Пример массива с достопримечательностями
const places = [
    { 
        name: "Эрмитаж", 
        address: "Санкт-Петербург, Дворцовая площадь, 2",
        name_ru: "Эрмитаж"
    },
    { 
        name: "Красная площадь", 
        address: "Москва, Красная площадь",
        name_ru: "Красная площадь"
    },
    {
        name: "Байкал",
        address: "Ольхон, Иркутская область",
        name_ru: "Озеро Байкал"
    }
];

/**
 * Правильный способ добавления меток с геокодированием
 * Использует Promise.all для параллельной обработки всех адресов
 */
async function addPlacesWithGeocoding(map, places) {
    console.log('Starting geocoding for', places.length, 'places...');
    
    // Создаем массив промисов для геокодирования всех адресов
    const geocodePromises = places.map((place, index) => {
        return new Promise((resolve) => {
            console.log(`Geocoding ${index + 1}: ${place.name} - ${place.address}`);
            
            ymaps.geocode(place.address, {
                results: 1
            }).then(function (res) {
                // Получаем первый результат геокодирования
                const firstGeoObject = res.geoObjects.get(0);
                
                if (!firstGeoObject) {
                    console.warn(`⚠ Address not found: "${place.address}" - skipping`);
                    resolve(null);
                    return;
                }
                
                // Получаем координаты
                const coords = firstGeoObject.geometry.getCoordinates();
                
                console.log(`✓ Geocoded "${place.name}" to:`, coords);
                
                // Создаем метку
                const placemark = new ymaps.Placemark(
                    coords,
                    {
                        balloonContentHeader: place.name_ru || place.name,
                        balloonContentBody: `
                            <div style="padding: 10px;">
                                <h3 style="margin: 0 0 10px 0;">${place.name}</h3>
                                <p style="margin: 0; color: #666;">${place.address}</p>
                            </div>
                        `,
                        hintContent: place.name,
                        iconContent: (index + 1).toString()
                    },
                    {
                        preset: 'islands#blueIcon'
                    }
                );
                
                resolve(placemark);
            }).catch(function (error) {
                console.warn(`✗ Error geocoding "${place.address}":`, error.message);
                resolve(null);
            });
        });
    });
    
    // Ждем завершения ВСЕХ запросов геокодирования параллельно
    const placemarks = await Promise.all(geocodePromises);
    
    // Фильтруем только успешные метки (null отбрасываем)
    const validPlacemarks = placemarks.filter(p => p !== null);
    
    console.log(`Successfully geocoded ${validPlacemarks.length} out of ${places.length} places`);
    
    if (validPlacemarks.length > 0) {
        // Очищаем старые метки
        map.geoObjects.removeAll();
        
        // Добавляем все новые метки на карту
        map.geoObjects.add(validPlacemarks);
        
        console.log('✓ All placemarks added to map');
        
        // Автоматически масштабируем карту чтобы показать все метки
        try {
            const bounds = map.geoObjects.getBounds();
            if (bounds) {
                console.log('Adjusting map bounds to show all placemarks...');
                map.setBounds(bounds, {
                    checkZoomRange: true,
                    zoomMargin: 50
                });
            }
        } catch (error) {
            console.error('Error setting bounds:', error);
        }
    } else {
        console.warn('No valid placemarks to display');
    }
}

/**
 * Пример использования:
 * 
 * ymaps.ready(function () {
 *     const map = new ymaps.Map('map', {
 *         center: [55.751574, 37.573856],
 *         zoom: 5
 *     });
 *     
 *     addPlacesWithGeocoding(map, places);
 * });
 */

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { addPlacesWithGeocoding, places };
}
