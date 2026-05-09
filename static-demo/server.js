// Tiny static + proxy server.
// Serves /root/aiwander-static/index.html at /
// Proxies /api/* to localhost:3001 (Next.js, which has the API routes)
// No framework, no streaming bugs.

const http = require('http');
const fs = require('fs');
const path = require('path');

const STATIC_DIR = '/root/aiwander-static';
const NEXT_HOST = '127.0.0.1';
const NEXT_PORT = 3001;
const PORT = 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const fp = path.join(STATIC_DIR, urlPath);
  if (!fp.startsWith(STATIC_DIR)) { res.writeHead(403); res.end(); return; }
  fs.readFile(fp, (err, data) => {
    if (err) {
      // Fall back to index.html for SPA-like behavior
      fs.readFile(path.join(STATIC_DIR, 'index.html'), (e2, html) => {
        if (e2) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });
      return;
    }
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

function proxyToNext(req, res) {
  const opts = {
    host: NEXT_HOST,
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${NEXT_HOST}:${NEXT_PORT}` },
  };
  const proxyReq = http.request(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (err) => {
    console.error('proxy error:', err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'next.js upstream not reachable', detail: err.message }));
    }
  });
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/_next/')) {
    proxyToNext(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`aiwander-static-server listening on :${PORT}`);
  console.log(`  / -> ${STATIC_DIR}/index.html`);
  console.log(`  /api/* -> http://${NEXT_HOST}:${NEXT_PORT}/api/*`);
});
