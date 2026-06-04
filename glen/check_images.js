const pool = require('./database/db');

const checkImages = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT name_ru, image_url FROM destinations ORDER BY name_ru');
    console.log('Destinations and their image URLs:');
    result.rows.forEach(row => {
      console.log(`${row.name_ru}: ${row.image_url}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
  }
};

checkImages().then(() => process.exit(0)).catch(() => process.exit(1));