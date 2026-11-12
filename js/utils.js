/* utils.js — small helpers shared by the website and the admin page */
(function (S) {
  S.$ = (sel, root) => (root || document).querySelector(sel);
  S.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  S.digits = s => String(s || '').replace(/\D/g, '');

  /* Accepts a YouTube link or an 11-character video ID, returns the ID (or '') */
  S.youtubeId = function (input) {
    input = String(input || '').trim();
    if (/^[\w-]{11}$/.test(input)) return input;
    try {
      const u = new URL(input);
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0].slice(0, 11);
      const v = u.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/\/(embed|shorts|live)\/([\w-]{11})/);
      if (m) return m[2];
    } catch (e) { /* not a URL */ }
    return '';
  };

  /* Accepts a Google Maps <iframe> snippet or a plain https link, returns the embed URL (or '') */
  S.mapSrc = function (input) {
    input = String(input || '').trim();
    const m = input.match(/src\s*=\s*["']([^"']+)["']/i);
    const url = m ? m[1] : input;
    return /^https:\/\/[^\s"'<>]+$/i.test(url) ? url : '';
  };
})(window.SVN = window.SVN || {});
