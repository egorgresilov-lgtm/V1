const fs = require('fs');
const https = require('https');
const path = require('path');

const additionalImages = [
    { name: 'Чивыркуйский залив', url: 'https://im.bolshayastrana.com/1200x00/4c28d4eb21223b685418559b205c66b820ccbfc911a70a9de7a16d97243303fd.jpeg', filename: '1.jpg' },
    { name: 'Ушканьи острова', url: 'https://im.bolshayastrana.com/1200x00/94fba392a3565b847149866ca49ccc41823a372b1b2e1e031ba3cd397588187a.jpeg', filename: '2.jpg' },
    // Add more as needed
];

const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(__dirname, 'public', 'images', 'attractions', filename));
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => {});
            reject(err);
        });
    });
};

(async () => {
    for (const img of additionalImages) {
        try {
            await downloadImage(img.url, img.filename);
        } catch (err) {
            console.error(`Failed to download ${img.filename}: ${err.message}`);
        }
    }
    console.log('Additional downloads complete.');
})();