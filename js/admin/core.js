/* admin/core.js — API calls, uploads, toasts, shared helpers */
(function (A) {
  const $ = A.$ = s => document.querySelector(s);
  A.content = null;
  A.renderers = [];          // each admin module registers a render() here
  A.uid = () => Math.random().toString(36).slice(2, 10);

  A.toast = function (msg, isError) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast' + (isError ? ' error' : ''); t.hidden = false;
    clearTimeout(A._tt); A._tt = setTimeout(() => { t.hidden = true; }, isError ? 5000 : 2500);
  };

  A.api = async function (url, opts) {
    let r;
    try { r = await fetch(url, Object.assign({ credentials: 'same-origin' }, opts)); }
    catch (e) { throw new Error('Cannot reach the server. Is it running?'); }
    let data = null;
    try { data = await r.json(); } catch (e) { /* no body */ }
    if (r.status === 401 && !(opts && opts.noRedirect)) { A.showView('login'); throw new Error('Please log in again.'); }
    if (!r.ok) throw new Error((data && data.error) || 'Request failed (' + r.status + ')');
    return data;
  };
  const jsonOpts = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  A.save = async function () {
    A.content = SVN.normalize(await A.api('/api/content', jsonOpts('PUT', A.content)));
    A.renderAll();
  };
  A.deleteFile = path => (path ? A.api('/api/file', jsonOpts('DELETE', { path })).catch(() => {}) : Promise.resolve());

  /* Upload with progress. `blob` can be a File or Blob. */
  A.upload = function (blob, name, type, onProgress) {
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open('POST', '/api/upload?type=' + encodeURIComponent(type));
      x.setRequestHeader('X-Filename', encodeURIComponent(name));
      x.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100)); };
      x.onload = () => {
        let d = {}; try { d = JSON.parse(x.responseText); } catch (e) { /* ignore */ }
        if (x.status === 401) { A.showView('login'); return reject(new Error('Please log in again.')); }
        x.status === 200 && d.path ? resolve(d.path) : reject(new Error(d.error || 'Upload failed (' + x.status + ')'));
      };
      x.onerror = () => reject(new Error('Upload failed — is the server running?'));
      x.send(blob);
    });
  };

  /* Shrinks big photos (max 1800px, JPEG) before upload so the website stays fast */
  A.optimizeImage = async function (file) {
    const original = { blob: file, name: file.name };
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 800 * 1024) return original;
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
      const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(bmp, 0, 0, w, h);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
      if (!blob || blob.size >= file.size) return original;
      return { blob, name: file.name.replace(/\.[^.]+$/, '') + '.jpg' };
    } catch (e) { return original; }
  };

  A.setProgress = function (prefix, pct, label) {
    const bar = $('#' + prefix + 'Bar');
    if (bar) { bar.hidden = pct == null; if (pct != null) bar.firstElementChild.style.width = pct + '%'; }
    const l = $('#' + prefix + 'Label'); if (l) l.textContent = label || '';
  };

  A.renderAll = () => A.renderers.forEach(fn => fn());

  A.showView = function (v) {
    $('#offlineView').hidden = v !== 'offline';
    $('#loginView').hidden = v !== 'login';
    $('#appView').hidden = v !== 'app';
    if (v === 'login') { $('#loginPw').value = ''; setTimeout(() => $('#loginPw').focus(), 0); }
  };
})(window.ADMIN = window.ADMIN || {});
