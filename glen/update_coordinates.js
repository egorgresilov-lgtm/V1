const pool = require('./database/db');

const updateCoordinates = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Coordinates for attractions (approximate real coordinates)
    const coordinates = {
      // Lake Baikal locations
      'Чивыркуйский залив': { lat: 53.3, lng: 109.0 },
      'Ушканьи острова': { lat: 53.8, lng: 108.5 },
      'Полуостров Святой Нос': { lat: 53.5, lng: 108.8 },
      'Бухта Песчаная': { lat: 52.0, lng: 106.5 },
      'Бухта Аяя': { lat: 53.5, lng: 107.2 },
      'Озеро Фролиха': { lat: 54.5, lng: 109.2 },
      'Энхалук': { lat: 53.0, lng: 108.2 },
      'Озеро Байкал': { lat: 53.5587, lng: 108.165 },
      
      // Datsans
      'Иволгинский дацан': { lat: 51.7167, lng: 107.3167 },
      'Ринпоче Багша': { lat: 51.8358, lng: 107.5897 },
      'Дацан богини Янжимы': { lat: 52.85, lng: 108.25 },
      'Балдан Брэйбун': { lat: 52.75, lng: 108.15 },
      
      // Valleys
      'Баргузинская долина': { lat: 53.5, lng: 109.5 },
      'Тункинская долина': { lat: 51.7, lng: 102.5 },
      'Долина потухших вулканов': { lat: 51.65, lng: 102.45 },
      
      // Mountains
      'Пик Мунку-Сардык': { lat: 51.5833, lng: 101.35 },
      'Гора Мамай': { lat: 52.15, lng: 105.85 },
      
      // Waterfalls & Gorges
      'Сарминское ущелье': { lat: 53.15, lng: 107.85 },
      'Водопад Малый Жом-Болок': { lat: 51.75, lng: 102.35 },
      'Водопад Кынгарга': { lat: 51.93, lng: 102.67 },
      
      // Resorts & Hot Springs
      'Аршан': { lat: 51.93, lng: 102.73 },
      'Горячинск': { lat: 52.65, lng: 108.25 },
      'Нилова-Пустынь': { lat: 52.05, lng: 102.15 },
      'Шумакские источники': { lat: 52.1, lng: 102.2 },
      'Ильинка (Питателевский источник)': { lat: 52.05, lng: 107.65 },
      'Кучигер, Алла, Гарга, Дзелинда, Гоуджекит': { lat: 54.5, lng: 109.5 },
      'Баунт': { lat: 55.2, lng: 112.5 },
      
      // Ulan-Ude attractions
      'Памятник Ленину (Голова)': { lat: 51.8336, lng: 107.6064 },
      'Площадь Советов': { lat: 51.8333, lng: 107.6056 },
      'Пешеходная улица Ленина (Арбат)': { lat: 51.833, lng: 107.607 },
      'Театр оперы и балета': { lat: 51.8345, lng: 107.6045 },
      'Музей истории Улан-Удэ': { lat: 51.8325, lng: 107.608 },
      'Центр современного искусства «Залуу»': { lat: 51.834, lng: 107.609 },
      
      // Cultural sites
      'Этнографический музей народов Забайкалья': { lat: 51.87, lng: 107.65 },
      '«Степной кочевник» (с. Нарын-Ацагат)': { lat: 51.75, lng: 107.45 },
      'Село Бичура': { lat: 51.28, lng: 107.05 },
      'Село Тарбагатай': { lat: 51.48, lng: 107.35 },
      
      // Nature reserves
      'Байкальский биосферный заповедник': { lat: 51.5, lng: 106.0 },
      'Баргузинский заповедник': { lat: 54.2, lng: 109.0 },
      'Джергинский заповедник': { lat: 54.8, lng: 110.5 },
      'Забайкальский национальный парк': { lat: 53.5, lng: 108.5 },
      'Фролихинский заказник': { lat: 54.3, lng: 109.3 }
    };

    let updated = 0;
    let notFound = 0;

    for (const [name, coords] of Object.entries(coordinates)) {
      const result = await client.query(
        'UPDATE destinations SET latitude = $1, longitude = $2 WHERE name_ru = $3',
        [coords.lat, coords.lng, name]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ ${name}: [${coords.lat}, ${coords.lng}]`);
        updated++;
      } else {
        console.log(`⚠️  Not found: ${name}`);
        notFound++;
      }
    }

    await client.query('COMMIT');
    console.log(`\n✅ Updated ${updated} attractions`);
    console.log(`⚠️  Not found: ${notFound}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
  }
};

updateCoordinates().then(() => process.exit(0)).catch(() => process.exit(1));
