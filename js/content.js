/* content.js — loads data/site.json (written by the admin page); falls back to defaults */
(function (S) {
  S.normalize = function (d) {
    d = d || {};
    const D = S.DEFAULTS;
    const arr = (v, def) => (Array.isArray(v) ? v : def);
    return {
      contact: Object.assign({}, D.contact, d.contact || {}),
      plants: arr(d.plants, D.plants).map((p, i) => ({
        id: p.id || 'p' + i, n: p.n || '', s: p.s || '', c: p.c || 'Other', e: p.e || '🌿',
        d: p.d || '', price: p.price || '', img: p.img || '', tag: p.tag || ''
      })),
      gallery: arr(d.gallery, []).map((g, i) => ({ id: g.id || 'g' + i, img: g.img || '', title: g.title || '', caption: g.caption || '' })).filter(g => g.img),
      videos: arr(d.videos, []).map((v, i) => ({ id: v.id || 'v' + i, title: v.title || '', description: v.description || '', youtube: v.youtube || '', file: v.file || '' })).filter(v => v.youtube || v.file)
    };
  };

  S.loadContent = async function () {
    try {
      const r = await fetch('data/site.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('no data');
      return S.normalize(await r.json());
    } catch (e) {
      return S.normalize({});   // e.g. opened straight from disk — show defaults
    }
  };
})(window.SVN = window.SVN || {});
