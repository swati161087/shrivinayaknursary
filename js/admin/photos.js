/* admin/photos.js — carousel photos */
(function (A) {
  const $ = A.$, esc = SVN.esc;

  function render() {
    const list = $('#photoList'), g = A.content.gallery;
    list.innerHTML = g.length ? g.map((p, i) =>
      '<div class="item" data-i="' + i + '"><div class="media"><img src="' + esc(p.img) + '" alt=""></div><div class="item-body">' +
      '<input class="f-title" value="' + esc(p.title) + '" placeholder="Title" maxlength="120" aria-label="Title">' +
      '<input class="f-cap" value="' + esc(p.caption) + '" placeholder="Caption" maxlength="200" aria-label="Caption">' +
      '<div class="item-actions"><button type="button" class="btn btn-sm btn-outline" data-act="up" title="Move earlier">↑</button>' +
      '<button type="button" class="btn btn-sm btn-outline" data-act="down" title="Move later">↓</button>' +
      '<button type="button" class="btn btn-sm btn-danger" data-act="del">Delete</button></div></div></div>'
    ).join('') : '<p class="muted">No photos yet — the website is showing sample slides until you add some.</p>';
  }

  $('#photoForm').addEventListener('submit', async e => {
    e.preventDefault();
    const files = [...$('#photoFile').files];
    if (!files.length) return;
    const btn = $('#photoBtn'); btn.disabled = true;
    try {
      for (let i = 0; i < files.length; i++) {
        const label = 'Uploading ' + (i + 1) + ' of ' + files.length + '…';
        A.setProgress('photo', 0, label);
        const opt = await A.optimizeImage(files[i]);
        const path = await A.upload(opt.blob, opt.name, 'image', pct => A.setProgress('photo', pct, label));
        A.content.gallery.push({ id: A.uid(), img: path, title: files.length === 1 ? $('#photoTitle').value.trim() : '', caption: files.length === 1 ? $('#photoCaption').value.trim() : '' });
        await A.save();
      }
      $('#photoForm').reset();
      A.toast(files.length > 1 ? files.length + ' photos added' : 'Photo added');
    } catch (err) { A.toast(err.message, true); }
    A.setProgress('photo', null, ''); btn.disabled = false;
  });

  $('#photoList').addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const i = +b.closest('.item').dataset.i, g = A.content.gallery;
    try {
      if (b.dataset.act === 'del') {
        if (!confirm('Delete this photo from the website and the images folder?')) return;
        const [removed] = g.splice(i, 1);
        await A.save(); await A.deleteFile(removed.img); A.toast('Photo deleted');
      } else {
        const j = b.dataset.act === 'up' ? i - 1 : i + 1;
        if (j < 0 || j >= g.length) return;
        [g[i], g[j]] = [g[j], g[i]]; await A.save();
      }
    } catch (err) { A.toast(err.message, true); }
  });

  $('#photoList').addEventListener('change', async e => {
    const it = e.target.closest('.item'); if (!it) return;
    const p = A.content.gallery[+it.dataset.i];
    if (e.target.classList.contains('f-title')) p.title = e.target.value.trim();
    else if (e.target.classList.contains('f-cap')) p.caption = e.target.value.trim();
    else return;
    try { await A.save(); A.toast('Saved'); } catch (err) { A.toast(err.message, true); }
  });

  A.renderers.push(render);
})(window.ADMIN);
