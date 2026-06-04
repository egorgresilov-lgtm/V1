const https = require('https');
const fs = require('fs');
const path = require('path');

const valleys = [
    { name: 'Баргузинская долина', url: 'https://a.d-cd.net/uZ4B5YUNzYAdmtWW-D7qUDjjD-I-1920.jpg', filename: '38.jpg' },
    { name: 'Тункинская долина', url: 'https://7d9e88a8-f178-4098-bea5-48d960920605.selcdn.net/8f6de215-fff2-48b6-84d0-eca5102f235b/', filename: '39.jpg' },
    { name: 'Долина потухших вулканов', url: 'https://cdn4.telesco.pe/file/FBYFiy051klqXhdsSGKlbJoXYWUXFCHpoDD8l3Ucjg0rvvn61_V8sMoNxkBL3XIe1zuysXNhHTXZ-UFRqdkt0txM5fNTzr8CMXcQUrD84a1YRU9mF9XQj6IfA8nGdxzA-5AHWkOvomxJ25_Gr_z4zkZ5j_NG0rEOIhK8rDNGS6VM2HSCv2bAgs6FfZfpI3s-wtmbeEXimgBo5thgGE0AbTOrJr3hya8o6fi1ht_ESxZh9Uc726abgBlgmRT4dFSk1lu7nNsRI8F_Vtk9XrHiLmIu2ZIPvPDRkvB6q5gvJ4tZ-vFooY7FiIDs39FA0L_V44Ravd_4g-MwoPo43hes7A.jpg', filename: '40.jpg' }
];

const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'public', 'images', 'attractions', filename);
        const file = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✓ Скачано: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
};

(async () => {
    for (const valley of valleys) {
        try {
            await downloadImage(valley.url, valley.filename);
        } catch (err) {
            console.error(`✗ Ошибка ${valley.filename}: ${err.message}`);
        }
    }
    console.log('\nЗагрузка долин завершена');
})();