const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const port = Number(process.env.PORT || 8000);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

const fallbackFavicon = Buffer.from('data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAAEAAQAAAAAAAgAAACluLqgAAEAAElFTkSuQmCC');

const server = http.createServer((req, res) => {
  let requestPath = req.url === '/' ? '/index.html' : req.url;
  requestPath = decodeURIComponent(requestPath);
  const filePath = path.join(root, requestPath);

  if (requestPath === '/favicon.ico') {
    res.writeHead(200, { 'Content-Type': 'image/x-icon' });
    res.end(fallbackFavicon);
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server error');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    const fallbackPort = port + 1;
    server.listen(fallbackPort, () => {
      console.log(`Server running at http://localhost:${fallbackPort}`);
    });
  } else {
    console.error(error);
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
