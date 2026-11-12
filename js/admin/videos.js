/* admin/videos.js — "Our Work" videos */
(function (A) {
  const $ = A.$, esc = SVN.esc;

  function render() {
    const list = $('#videoList'), v = A.content.videos;
    list.innerHTML = v.length ? v.map((x, i) => {
      const media = x.youtube
        ? '<img src="https://img.youtube.com/vi/' + esc(x.youtube) + '/hqdefault.jpg" alt="">'
        : '<video src="' + esc(x.file) + '#t=0.1" preload="metadata" controls playsinline></video>';
      return '<div class="item" data-i="' + i + '"><div class="media">' + media + '</div><div class="item-body">' +
        '<input class="f-title" value="' + esc(x.title) + '" placeholder="Title" maxlength="120" aria-label="Title">' +
        '<input class="f-desc" value="' + esc(x.description) + '" placeholder="Description" maxlength="300" aria-label="Description">' +
        '<div class="item-actions"><button type="button" class="btn btn-sm btn-outline" data-act="up">↑</button>' +
        '<button type="button" class="btn btn-sm btn-outline" data-act="down">↓</button>' +
        '<button type="button" class="btn btn-sm btn-danger" data-act="del">Delete</button></div></div></div>';
    }).join('') : '<p class="muted">No videos yet — the website is showing sample cards until you add some.</p>';
  }

  function mode() { return document.querySelector('input[name=vsrc]:checked').value; }
  document.querySelectorAll('input[name=vsrc]').forEach(r => r.addEventListener('change', () => {
    $('#vFileWrap').hidden = mode() !== 'file';
    $('#vLinkWrap').hidden = mode() !== 'youtube';
  }));

  $('#videoForm').addEventListener('submit', async e => {
    e.preventDefault();
    const title = $('#vTitle').value.trim(), description = $('#vDesc').value.trim();
    if (!title) return A.toast('Please enter a title', true);
    const btn = $('#videoBtn'); btn.disabled = true;
    try {
      const item = { id: A.uid(), title, description, youtube: '', file: '' };
      if (mode() === 'youtube') {
        item.youtube = SVN.youtubeId($('#vLink').value);
        if (!item.youtube) throw new Error('That does not look like a YouTube link.');
      } else {
        const f = $('#vFile').files[0];
        if (!f) throw new Error('Please choose a video file.');
        A.setProgress('video', 0, 'Uploading… 0%');
        item.file = await A.upload(f, f.name, 'video', pct => A.setProgress('video', pct, 'Uploading… ' + pct + '%' + (pct === 100 ? ' (saving)' : '')));
      }
      A.content.videos.push(item);
      await A.save();
      $('#videoForm').reset(); $('#vFileWrap').hidden = false; $('#vLinkWrap').hidden = true;
      A.toast('Video added');
    } catch (err) { A.toast(err.message, true); }
    A.setProgress('video', null, ''); btn.disabled = false;
  });

  $('#videoList').addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const i = +b.closest('.item').dataset.i, v = A.content.videos;
    try {
      if (b.dataset.act === 'del') {
        if (!confirm('Delete this video from the website' + (v[i].file ? ' and the videos folder' : '') + '?')) return;
        const [removed] = v.splice(i, 1);
        await A.save(); await A.deleteFile(removed.file); A.toast('Video deleted');
      } else {
        const j = b.dataset.act === 'up' ? i - 1 : i + 1;
        if (j < 0 || j >= v.length) return;
        [v[i], v[j]] = [v[j], v[i]]; await A.save();
      }
    } catch (err) { A.toast(err.message, true); }
  });

  $('#videoList').addEventListener('change', async e => {
    const it = e.target.closest('.item'); if (!it) return;
    const x = A.content.videos[+it.dataset.i];
    if (e.target.classList.contains('f-title')) { if (!e.target.value.trim()) { e.target.value = x.title; return; } x.title = e.target.value.trim(); }
    else if (e.target.classList.contains('f-desc')) x.description = e.target.value.trim();
    else return;
    try { await A.save(); A.toast('Saved'); } catch (err) { A.toast(err.message, true); }
  });

  A.renderers.push(render);
})(window.ADMIN);
