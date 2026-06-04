const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'ybrbajhjdf',
    database: 'buryatia_tourism'
});

const valleyImages = {
    'Баргузинская долина': '/images/attractions/38.jpg',
    'Тункинская долина': '/images/attractions/39.jpg',
    'Долина потухших вулканов': '/images/attractions/40.jpg'
};

async function updateValleyImages() {
    try {
        await client.connect();
        for (const [name, imageUrl] of Object.entries(valleyImages)) {
            await client.query('UPDATE destinations SET image_url = $1 WHERE name_ru = $2', [imageUrl, name]);
            console.log(`✓ Обновлена: ${name}`);
        }
        console.log('\n✓ Все долины успешно вставлены!');
    } catch (err) {
        console.error('Ошибка:', err.message);
    } finally {
        await client.end();
    }
}

updateValleyImages();