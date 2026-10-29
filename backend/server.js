/**
 * ScholarMatch - REST API & Static Web Server
 * Built with Node.js standard libraries (zero third-party dependencies required).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, '..', 'data', 'schemes.json');
const DEFAULT_DATA_FILE = path.join(__dirname, '..', 'data', 'default-schemes.json');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Import core eligibility engine
const EligibilityEngine = require(path.join(FRONTEND_DIR, 'js', 'eligibility-engine.js'));

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Data Helper Functions
function loadSchemes() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      if (fs.existsSync(DEFAULT_DATA_FILE)) {
        fs.copyFileSync(DEFAULT_DATA_FILE, DATA_FILE);
      } else {
        return [];
      }
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading schemes file:', err);
    return [];
  }
}

function saveSchemes(schemes) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(schemes, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing schemes file:', err);
    return false;
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 2e6) { // 2MB limit
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // API Endpoints
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Health check
      if (pathname === '/api/health' && method === 'GET') {
        return sendJson(res, 200, {
          status: 'ok',
          service: 'ScholarMatch API',
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        });
      }

      // 2. GET all schemes
      if (pathname === '/api/schemes' && method === 'GET') {
        const schemes = loadSchemes();
        return sendJson(res, 200, schemes);
      }

      // 3. GET scheme by ID
      if (pathname.match(/^\/api\/schemes\/([a-zA-Z0-9_-]+)$/) && method === 'GET') {
        const id = pathname.split('/')[3];
        const schemes = loadSchemes();
        const scheme = schemes.find(s => s.id === id);
        if (!scheme) {
          return sendJson(res, 404, { error: 'Scheme not found' });
        }
        return sendJson(res, 200, scheme);
      }

      // 4. POST Check Eligibility
      if (pathname === '/api/check-eligibility' && method === 'POST') {
        const body = await parseJsonBody(req);
        const profile = body.profile || body;
        
        if (!profile || typeof profile !== 'object') {
          return sendJson(res, 400, { error: 'Student profile payload is required' });
        }

        const schemes = loadSchemes();
        const matches = EligibilityEngine.evaluateAll(profile, schemes);

        const summary = {
          total: matches.length,
          eligible: matches.filter(m => m.matchResult.status === 'eligible').length,
          potential: matches.filter(m => m.matchResult.status === 'potential').length,
          notEligible: matches.filter(m => m.matchResult.status === 'not-eligible').length,
          profile,
          matches,
          timestamp: new Date().toISOString()
        };

        return sendJson(res, 200, summary);
      }

      // 5. POST Create scheme (Admin)
      if (pathname === '/api/schemes' && method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.name) {
          return sendJson(res, 400, { error: 'Scheme name is required' });
        }

        const schemes = loadSchemes();
        const newScheme = {
          ...body,
          id: body.id || `scheme-${Date.now().toString().slice(-4)}`,
          isDemo: true
        };

        schemes.unshift(newScheme);
        saveSchemes(schemes);
        return sendJson(res, 201, newScheme);
      }

      // 6. PUT Update scheme (Admin)
      if (pathname.match(/^\/api\/schemes\/([a-zA-Z0-9_-]+)$/) && method === 'PUT') {
        const id = pathname.split('/')[3];
        const body = await parseJsonBody(req);
        const schemes = loadSchemes();
        const index = schemes.findIndex(s => s.id === id);

        if (index === -1) {
          return sendJson(res, 404, { error: 'Scheme not found' });
        }

        schemes[index] = { ...schemes[index], ...body, id };
        saveSchemes(schemes);
        return sendJson(res, 200, schemes[index]);
      }

      // 7. DELETE scheme (Admin)
      if (pathname.match(/^\/api\/schemes\/([a-zA-Z0-9_-]+)$/) && method === 'DELETE') {
        const id = pathname.split('/')[3];
        let schemes = loadSchemes();
        const initialLength = schemes.length;
        schemes = schemes.filter(s => s.id !== id);

        if (schemes.length === initialLength) {
          return sendJson(res, 404, { error: 'Scheme not found' });
        }

        saveSchemes(schemes);
        return sendJson(res, 200, { success: true, deletedId: id });
      }

      // 8. POST Reset schemes (Admin)
      if (pathname === '/api/reset-schemes' && method === 'POST') {
        if (fs.existsSync(DEFAULT_DATA_FILE)) {
          fs.copyFileSync(DEFAULT_DATA_FILE, DATA_FILE);
          const schemes = loadSchemes();
          return sendJson(res, 200, { success: true, schemes });
        } else {
          return sendJson(res, 500, { error: 'Default schemes file not found' });
        }
      }

      // 9. POST Contact Form
      if (pathname === '/api/contact' && method === 'POST') {
        const body = await parseJsonBody(req);
        const ticketId = 'SM-' + Math.floor(100000 + Math.random() * 900000);
        return sendJson(res, 200, {
          success: true,
          ticketId,
          message: `Query registered successfully under ticket ID #${ticketId}. Our student assistance team will review it.`
        });
      }

      return sendJson(res, 404, { error: 'API route not found' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(res, 500, { error: err.message || 'Internal Server Error' });
    }
  }

  // Static File Serving
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(FRONTEND_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file not found, fall back to index.html for SPA routing
      const indexFallback = path.join(FRONTEND_DIR, 'index.html');
      fs.readFile(indexFallback, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error loading file');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` ScholarMatch Server is live at: http://localhost:${PORT}`);
  console.log(` REST API available at: http://localhost:${PORT}/api/schemes`);
  console.log(`====================================================`);
});
