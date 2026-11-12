'use strict';
/*
 * Shri Vinayak Nursery — tiny website server (no npm packages needed, Node.js 16+).
 *
 *  - Serves the website (index.html, css/, js/, images/, videos/, data/site.json)
 *  - Serves the password-protected admin page (admin.html)
 *  - Lets the admin upload photos -> images/, videos -> videos/, and edit data/site.json
 *
 * Start:   node server.js        (then open http://localhost:3000 and http://localhost:3000/admin.html)
 * Password: set ADMIN_PASSWORD, or let the server create one on first start (printed once in the console).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(ROOT, 'data');
const SITE_FILE = path.join(DATA_DIR, 'site.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');       // stores the password HASH (never the password)
const ENV_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_MS = 8 * 60 * 60 * 1000;

const UPLOADS = {
  image: { dir: 'images', exts: ['.jpg', '.jpeg', '.png', '.webp', '.gif'], max: 15 * 1024 * 1024 },
  video: { dir: 'videos', exts: ['.mp4', '.webm', '.mov', '.m4v'], max: 500 * 1024 * 1024 }
};
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime'
};

for (const d of [DATA_DIR, path.join(ROOT, 'images'), path.join(ROOT, 'videos')]) fs.mkdirSync(d, { recursive: true });

/* ------------------------------ password ------------------------------ */
function hashPassword(pw, salt) {
  salt = salt || crypto.randomBytes(16);
  return { salt: salt.toString('hex'), hash: crypto.scryptSync(pw, salt, 64).toString('hex') };
}
function checkHash(pw, rec) {
  const h = crypto.scryptSync(pw, Buffer.from(rec.salt, 'hex'), 64);
  const e = Buffer.from(rec.hash, 'hex');
  return h.length === e.length && crypto.timingSafeEqual(h, e);
}
const sha = s => crypto.createHash('sha256').update(String(s)).digest();
function verifyPassword(pw) {
  pw = String(pw || '');
  if (ENV_PASSWORD) return crypto.timingSafeEqual(sha(pw), sha(ENV_PASSWORD));
  try { return checkHash(pw, JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'))); } catch (e) { return false; }
}
function initPassword() {
  if (ENV_PASSWORD) { console.log('Admin password: taken from the ADMIN_PASSWORD environment variable.'); return; }
  if (fs.existsSync(ADMIN_FILE)) return;
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pw = '';
  for (const b of crypto.randomBytes(12)) pw += alphabet[b % alphabet.length];
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(hashPassword(pw)), { mode: 0o600 });
  console.log('\n  ==================================================');
  console.log('   FIRST RUN — your admin password is:  ' + pw);
  console.log('   Save it now. You can change it in Admin > Settings.');
  console.log('  ==================================================\n');
}

/* ------------------------------ sessions ------------------------------ */
const sessions = new Map();   // token -> expiry
const attempts = new Map();   // ip -> { count, until }

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function isLoggedIn(req) {
  const t = parseCookies(req).svn_admin;
  const exp = t && sessions.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}
function isSecure(req) { return !!req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https'; }
function cookie(req, value, maxAge) {
  return 'svn_admin=' + value + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' + maxAge + (isSecure(req) ? '; Secure' : '');
}
function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
}

/* ------------------------------ helpers ------------------------------ */
function json(res, code, obj, extra) {
  const body = JSON.stringify(obj);
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) }, extra || {}));
  res.end(body);
}
function readJson(req, limit) {
  limit = limit || 1024 * 1024;
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('Request too large'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max || 500) : '');
const MEDIA_PATH = /^(images|videos)\/[A-Za-z0-9][A-Za-z0-9._-]*$/;
const cleanPath = (v, dir) => { v = str(v, 200); return MEDIA_PATH.test(v) && v.startsWith(dir + '/') ? v : ''; };
const uid = () => crypto.randomBytes(5).toString('hex');

function mapSrc(v) {
  v = str(v, 2000);
  const m = v.match(/src\s*=\s*["']([^"']+)["']/i);
  const url = m ? m[1] : v;
  return /^https:\/\/[^\s"'<>]+$/i.test(url) ? url : '';
}
function youtubeId(v) {
  v = str(v, 300);
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const u = new URL(v);
    if (u.hostname.includes('youtu.be')) { const id = u.pathname.slice(1).split('/')[0].slice(0, 11); return /^[\w-]{11}$/.test(id) ? id : ''; }
    const q = u.searchParams.get('v'); if (q && /^[\w-]{11}$/.test(q)) return q;
    const m = u.pathname.match(/\/(embed|shorts|live)\/([\w-]{11})/); if (m) return m[2];
  } catch (e) { /* ignore */ }
  return '';
}
function cleanContent(b) {
  b = b && typeof b === 'object' ? b : {};
  const c = b.contact || {};
  const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
  return {
    contact: {
      phone: str(c.phone, 40), whatsapp: str(c.whatsapp, 40).replace(/\D/g, ''), email: str(c.email, 120),
      address: str(c.address, 300), hours: str(c.hours, 120), mapEmbed: mapSrc(c.mapEmbed)
    },
    plants: arr(b.plants, 500).map(p => ({
      id: str(p.id, 40) || uid(), n: str(p.n, 120), s: str(p.s, 120), c: str(p.c, 60) || 'Other', e: str(p.e, 8) || '🌿',
      d: str(p.d, 400), price: str(p.price, 40), img: cleanPath(p.img, 'images'), tag: str(p.tag, 30)
    })).filter(p => p.n),
    gallery: arr(b.gallery, 100).map(g => ({
      id: str(g.id, 40) || uid(), img: cleanPath(g.img, 'images'), title: str(g.title, 120), caption: str(g.caption, 200)
    })).filter(g => g.img),
    videos: arr(b.videos, 50).map(v => ({
      id: str(v.id, 40) || uid(), title: str(v.title, 120), description: str(v.description, 300),
      youtube: youtubeId(v.youtube), file: cleanPath(v.file, 'videos')
    })).filter(v => v.youtube || v.file)
  };
}
function readSite() { try { return JSON.parse(fs.readFileSync(SITE_FILE, 'utf8')); } catch (e) { return {}; } }
function writeSite(obj) {
  const tmp = SITE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, SITE_FILE);
}

/* ------------------------------ uploads ------------------------------ */
function signatureOk(file, ext) {
  const fd = fs.openSync(file, 'r'); const b = Buffer.alloc(12);
  const n = fs.readSync(fd, b, 0, 12, 0); fs.closeSync(fd);
  if (n < 8) return false;
  const hex = b.toString('hex');
  if (ext === '.jpg' || ext === '.jpeg') return hex.startsWith('ffd8ff');
  if (ext === '.png') return hex.startsWith('89504e47');
  if (ext === '.gif') return b.toString('latin1', 0, 4) === 'GIF8';
  if (ext === '.webp') return b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP';
  if (ext === '.webm') return hex.startsWith('1a45dfa3');
  return b.toString('latin1', 4, 8) === 'ftyp';   // mp4 / m4v / mov
}
function handleUpload(req, res, url) {
  const cfg = UPLOADS[url.searchParams.get('type')];
  const fail = (code, msg) => json(res, code, { error: msg }, { Connection: 'close' });
  if (!cfg) return fail(400, 'Unknown upload type');
  let name = '';
  try { name = decodeURIComponent(req.headers['x-filename'] || ''); } catch (e) { /* ignore */ }
  const ext = path.extname(name).toLowerCase();
  if (!cfg.exts.includes(ext)) return fail(400, 'Allowed file types: ' + cfg.exts.join(', '));
  const len = parseInt(req.headers['content-length'] || '0', 10);
  if (!len) return fail(400, 'Empty upload');
  if (len > cfg.max) return fail(413, 'File too large (max ' + Math.round(cfg.max / 1048576) + ' MB)');

  const base = path.basename(name, path.extname(name)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'file';
  const fname = base + '-' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex') + ext;
  const dest = path.join(ROOT, cfg.dir, fname);
  const out = fs.createWriteStream(dest, { flags: 'wx' });
  let size = 0, dead = false;
  const cleanup = () => { dead = true; out.destroy(); fs.unlink(dest, () => {}); };

  req.on('data', c => { size += c.length; if (size > cfg.max && !dead) { cleanup(); fail(413, 'File too large'); } });
  req.on('aborted', cleanup);
  out.on('error', () => { if (!dead) { cleanup(); fail(500, 'Could not save file'); } });
  out.on('finish', () => {
    if (dead) return;
    if (!signatureOk(dest, ext)) { fs.unlink(dest, () => {}); return fail(400, 'That file does not look like a valid ' + url.searchParams.get('type')); }
    json(res, 200, { path: cfg.dir + '/' + fname });
  });
  req.pipe(out);
}

/* ------------------------------ API ------------------------------ */
async function handleApi(req, res, url) {
  const route = req.method + ' ' + url.pathname;
  if (req.method !== 'GET' && !sameOrigin(req)) return json(res, 403, { error: 'Cross-site request blocked' });

  if (route === 'GET /api/content') return json(res, 200, readSite());
  if (route === 'GET /api/session') return json(res, 200, { server: true, authenticated: isLoggedIn(req), passwordFromEnv: !!ENV_PASSWORD });

  if (route === 'POST /api/login') {
    const ip = req.socket.remoteAddress || 'x';
    const a = attempts.get(ip) || { count: 0, until: 0 };
    if (a.until > Date.now()) return json(res, 429, { error: 'Too many wrong attempts. Try again in a few minutes.' });
    const body = await readJson(req, 10 * 1024);
    if (!verifyPassword(body.password)) {
      a.count += 1;
      if (a.count >= 5) { a.until = Date.now() + 10 * 60 * 1000; a.count = 0; }
      attempts.set(ip, a);
      return json(res, 401, { error: 'Wrong password' });
    }
    attempts.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + SESSION_MS);
    return json(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, token, SESSION_MS / 1000) });
  }
  if (route === 'POST /api/logout') {
    sessions.delete(parseCookies(req).svn_admin);
    return json(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, '', 0) });
  }

  /* everything below needs a login */
  if (!isLoggedIn(req)) return json(res, 401, { error: 'Not logged in' }, { Connection: 'close' });

  if (route === 'PUT /api/content') {
    const cleaned = cleanContent(await readJson(req, 2 * 1024 * 1024));
    writeSite(cleaned);
    return json(res, 200, cleaned);
  }
  if (route === 'POST /api/upload') return handleUpload(req, res, url);
  if (route === 'DELETE /api/file') {
    const b = await readJson(req, 10 * 1024);
    const p = str(b.path, 200);
    const ext = path.extname(p).toLowerCase();
    const known = Object.values(UPLOADS).some(u => u.exts.includes(ext));
    if (!MEDIA_PATH.test(p) || !known) return json(res, 400, { error: 'Invalid path' });
    if (JSON.stringify(readSite()).includes('"' + p + '"')) return json(res, 200, { ok: true, skipped: 'still in use' });
    fs.unlink(path.join(ROOT, p), () => {});
    return json(res, 200, { ok: true });
  }
  if (route === 'POST /api/password') {
    if (ENV_PASSWORD) return json(res, 400, { error: 'Password is set with the ADMIN_PASSWORD environment variable; change it there.' });
    const b = await readJson(req, 10 * 1024);
    if (!verifyPassword(b.current)) return json(res, 401, { error: 'Current password is wrong' });
    const next = String(b.next || '');
    if (next.length < 8) return json(res, 400, { error: 'New password must be at least 8 characters' });
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(hashPassword(next)), { mode: 0o600 });
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { error: 'Not found' });
}

/* ------------------------------ static files ------------------------------ */
function notFound(res) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); }

function serveStatic(req, res, pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch (e) { return notFound(res); }
  if (rel === '/') rel = '/index.html';
  if (rel.includes('\0')) return notFound(res);
  const parts = rel.split('/').filter(Boolean);
  if (!parts.length || parts.some(s => s.startsWith('.'))) return notFound(res);   // blocks dotfiles and ..
  const top = parts[0];
  const allowed =
    (parts.length === 1 && ['index.html', 'admin.html', 'favicon.ico'].includes(top)) ||
    rel === '/data/site.json' ||
    (['css', 'js', 'images', 'videos', 'assets'].includes(top) && parts.length >= 2);
  if (!allowed) return notFound(res);                                              // server.js, admin.json etc. are never served
  const file = path.join(ROOT, ...parts);
  if (!file.startsWith(ROOT + path.sep)) return notFound(res);

  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return notFound(res);
    const ext = path.extname(file).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream', 'Accept-Ranges': 'bytes',
      'Cache-Control': (top === 'images' || top === 'videos' || top === 'assets') ? 'public, max-age=86400' : 'no-cache'
    };
    let start = 0, end = st.size - 1, code = 200;
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] || m[2])) {
      if (m[1] === '') { start = Math.max(0, st.size - parseInt(m[2], 10)); }
      else { start = parseInt(m[1], 10); if (m[2]) end = Math.min(parseInt(m[2], 10), st.size - 1); }
      if (start >= st.size || start > end) { res.writeHead(416, { 'Content-Range': 'bytes */' + st.size }); return res.end(); }
      code = 206; headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + st.size;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(code, headers);
    if (req.method === 'HEAD' || st.size === 0) return res.end();
    fs.createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
  });
}

/* ------------------------------ server ------------------------------ */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed' });
    serveStatic(req, res, url.pathname);
  } catch (err) {
    if (err && err.status) { if (!res.headersSent) json(res, err.status, { error: err.message }); return; }
    console.error(err);
    if (!res.headersSent) json(res, 500, { error: 'Server error' }); else res.end();
  }
});

initPassword();
if (!fs.existsSync(SITE_FILE)) writeSite(cleanContent({}));
server.listen(PORT, HOST, () => {
  console.log('Shri Vinayak Nursery is running');
  console.log('  Website : http://localhost:' + PORT + '/');
  console.log('  Admin   : http://localhost:' + PORT + '/admin.html');
});
