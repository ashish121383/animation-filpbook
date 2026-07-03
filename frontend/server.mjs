/**
 * Production server for Cursor Cloud VM access.
 * Serves built frontend and proxies /api to the FastAPI backend.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = join(__dirname, 'dist');
const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:8000';
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function proxyApi(req, res) {
  const url = `${API_TARGET}${req.url}`;
  try {
    const headers = { ...req.headers, host: new URL(API_TARGET).host };
    delete headers['connection'];
    delete headers['transfer-encoding'];

    const body =
      req.method !== 'GET' && req.method !== 'HEAD' ? await readBody(req) : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const responseHeaders = Object.fromEntries(response.headers.entries());
    delete responseHeaders['transfer-encoding'];

    res.writeHead(response.status, responseHeaders);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ detail: `API proxy error: ${err.message}` }));
  }
}

async function serveStatic(pathname, res) {
  let filePath = join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
    const content = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    const indexHtml = await readFile(join(DIST_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(indexHtml);
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api')) {
    await proxyApi(req, res);
    return;
  }

  await serveStatic(url.pathname, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Flipbook server running at http://0.0.0.0:${PORT}`);
  console.log(`API proxy -> ${API_TARGET}`);
});
