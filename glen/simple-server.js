const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const EXTERNAL_PHOTOS_DIR = path.join(__dirname, '..', 'фотки');

const server = http.createServer((req, res) => {
    // Remove query parameters from URL
    let urlPath = req.url.split('?')[0];
    const decodedPath = decodeURIComponent(urlPath);
    
    let filePath;
    if (decodedPath.startsWith('/фотки/')) {
        const relativePhotoPath = decodedPath.replace('/фотки/', '');
        filePath = path.join(EXTERNAL_PHOTOS_DIR, relativePhotoPath);
    } else {
        const publicPath = decodedPath === '/' ? '/index.html' : decodedPath;
        filePath = path.join(__dirname, 'public', publicPath);
    }
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
    }
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open this URL in your browser to view the site`);
});
