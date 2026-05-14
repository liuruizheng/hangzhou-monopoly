const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8765;
const HTML_FILE = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  const content = fs.readFileSync(HTML_FILE, 'utf-8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(content);
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`杭州大富翁已在 ${url} 启动`);
  const cmd = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd);
});
