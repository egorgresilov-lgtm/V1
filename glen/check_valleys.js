const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'ybrbajhjdf',
    database: 'buryatia_tourism'
});

async function checkValleys() {
    try {
        await client.connect();
        const result = await client.query(
            "SELECT name_ru, image_url FROM destinations WHERE name_ru LIKE '%долина%' OR name_ru = 'Долина потухших вулканов' ORDER BY name_ru"
        );
        console.log('Долины с фото:\n');
        result.rows.forEach(row => {
            console.log(`${row.name_ru}: ${row.image_url}`);
        });
    } catch (err) {
        console.error('Ошибка:', err.message);
    } finally {
        await client.end();
    }
}

checkValleys();