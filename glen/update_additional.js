const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'ybrbajhjdf',
    database: 'buryatia_tourism'
});

const additionalImageMap = {
    'Чивыркуйский залив': '/images/attractions/1.jpg',
    'Ушканьи острова': '/images/attractions/2.jpg'
};

async function updateAdditionalImages() {
    try {
        await client.connect();
        for (const [name, imageUrl] of Object.entries(additionalImageMap)) {
            await client.query('UPDATE destinations SET image_url = $1 WHERE name_ru = $2', [imageUrl, name]);
            console.log(`Updated ${name} with ${imageUrl}`);
        }
        console.log('Additional image updates complete.');
    } catch (err) {
        console.error('Error updating images:', err);
    } finally {
        await client.end();
    }
}

updateAdditionalImages();