/* admin/plants.js — plant catalogue */
(function (A) {
  const $ = A.$, esc = SVN.esc;
  let editing = null;   // plant object being edited

  function render() {
    const plants = A.content.plants;
    $('#plantCount').textContent = plants.length;
    $('#catList').innerHTML = [...new Set(plants.map(p => p.c))].map(c => '<option value="' + esc(c) + '">').join('');
    $('#plantList').innerHTML = plants.length ? plants.map((p, i) =>
      '<tr data-i="' + i + '"><td><div class="pt">' + (p.img ? '<img src="' + esc(p.img) + '" alt="">' : esc(p.e)) + '</div></td>' +
      '<td><b>' + esc(p.n) + '</b>' + (p.tag ? ' <small class="muted">· ' + esc(p.tag) + '</small>' : '') + '</td>' +
      '<td>' + esc(p.c) + '</td><td>' + (p.price ? esc(p.price) : '<span class="muted">on request</span>') + '</td>' +
      '<td style="white-space:nowrap"><button type="button" class="btn btn-sm btn-outline" data-act="edit">Edit</button>' +
      '<button type="button" class="btn btn-sm btn-danger" data-act="del">Delete</button></td></tr>'
    ).join('') : '<tr><td colspan="5" class="muted">No plants yet.</td></tr>';
  }

  function resetForm() {
    editing = null;
    $('#plantForm').reset(); $('#pId').value = '';
    $('#plantBtn').textContent = '➕ Add plant'; $('#plantCancel').hidden = true; $('#pFileHint').textContent = '';
  }
  function fillForm(p) {
    editing = p;
    $('#pId').value = p.id; $('#pName').value = p.n; $('#pSci').value = p.s; $('#pCat').value = p.c; $('#pPrice').value = p.price;
    $('#pTag').value = p.tag; $('#pEmoji').value = p.e; $('#pDesc').value = p.d; $('#pFile').value = '';
    $('#pFileHint').textContent = p.img ? 'Current photo: ' + p.img + ' — choose a file only if you want to replace it.' : '';
    $('#plantBtn').textContent = '💾 Save changes'; $('#plantCancel').hidden = false;
    $('#plantForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('#plantCancel').onclick = resetForm;

  $('#plantForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#plantBtn'); btn.disabled = true;
    try {
      const target = editing || { id: A.uid(), img: '' };
      const oldImg = target.img;
      Object.assign(target, {
        n: $('#pName').value.trim(), s: $('#pSci').value.trim(), c: $('#pCat').value.trim() || 'Other', price: $('#pPrice').value.trim(),
        tag: $('#pTag').value.trim(), e: $('#pEmoji').value.trim() || '🌿', d: $('#pDesc').value.trim()
      });
      const f = $('#pFile').files[0];
      if (f) {
        A.setProgress('plant', 0, 'Uploading photo…');
        const opt = await A.optimizeImage(f);
        target.img = await A.upload(opt.blob, opt.name, 'image', pct => A.setProgress('plant', pct, 'Uploading photo… ' + pct + '%'));
      }
      if (!editing) A.content.plants.push(target);
      await A.save();
      if (f && oldImg) await A.deleteFile(oldImg);
      A.toast(editing ? 'Plant updated' : 'Plant added');
      resetForm();
    } catch (err) { A.toast(err.message, true); }
    A.setProgress('plant', null, ''); btn.disabled = false;
  });

  $('#plantList').addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const i = +b.closest('tr').dataset.i, p = A.content.plants[i];
    if (b.dataset.act === 'edit') return fillForm(p);
    if (!confirm('Delete “' + p.n + '” from the catalogue?')) return;
    try {
      A.content.plants.splice(i, 1);
      if (editing === p) resetForm();
      await A.save(); await A.deleteFile(p.img); A.toast('Plant deleted');
    } catch (err) { A.toast(err.message, true); }
  });

  A.renderers.push(render);
})(window.ADMIN);
