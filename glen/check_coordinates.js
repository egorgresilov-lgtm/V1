const pool = require('./database/db');

const checkCoordinates = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT name_ru, latitude, longitude FROM destinations ORDER BY name_ru');
    
    console.log('Attractions with coordinates:\n');
    let withCoords = 0;
    let withoutCoords = 0;
    
    result.rows.forEach((row) => {
      const hasCoords = row.latitude && row.longitude;
      if (hasCoords) {
        console.log(`✅ ${row.name_ru}`);
        console.log(`   Lat: ${row.latitude}, Lng: ${row.longitude}\n`);
        withCoords++;
      } else {
        console.log(`❌ ${row.name_ru}`);
        console.log(`   No coordinates\n`);
        withoutCoords++;
      }
    });
    
    console.log(`\nSummary:`);
    console.log(`With coordinates: ${withCoords}`);
    console.log(`Without coordinates: ${withoutCoords}`);
    console.log(`Total: ${result.rows.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
  }
};

checkCoordinates().then(() => process.exit(0)).catch(() => process.exit(1));
