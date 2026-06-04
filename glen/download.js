const fs = require('fs');
const https = require('https');

const links = fs.readFileSync('c:\\Users\\egorg\\Downloads\\glen\\фотки\\достопримечательности\\Ссылки.txt', 'utf8').split('\n').filter(line => line.trim());

const download = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

const promises = [];

links.forEach((line, index) => {
    if (line.includes('img_url=')) {
        const imgMatch = line.match(/img_url=([^&]+)/);
        if (imgMatch) {
            const imgUrl = decodeURIComponent(imgMatch[1]).replace(/"/g, '').replace(/'/g, '');
            const filename = `${index + 1}.jpg`;
            const filepath = `c:\\Users\\egorg\\Downloads\\glen\\glen\\public\\images\\attractions\\${filename}`;
            console.log('Downloading: ' + filename + ' from ' + imgUrl);
            promises.push(download(imgUrl, filepath).then(() => console.log('Downloaded: ' + filename)).catch(() => console.log('Failed: ' + filename)));
        }
    }
});

Promise.all(promises).then(() => console.log('All done'));