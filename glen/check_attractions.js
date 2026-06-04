const pool = require('./database/db');

const checkAttractions = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT name_ru, image_url FROM destinations ORDER BY name_ru');
    
    console.log('Current attractions in database:\n');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name_ru}`);
      console.log(`   Image: ${row.image_url || 'None'}\n`);
    });
    
    console.log(`\nTotal: ${result.rows.length} attractions`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
  }
};

checkAttractions().then(() => process.exit(0)).catch(() => process.exit(1));
