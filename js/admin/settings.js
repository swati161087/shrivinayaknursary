/* admin/settings.js — change password */
(function (A) {
  const $ = A.$;
  $('#pwForm').addEventListener('submit', async e => {
    e.preventDefault();
    if ($('#pwNew').value !== $('#pwNew2').value) return A.toast('The new passwords do not match', true);
    $('#pwBtn').disabled = true;
    try {
      await A.api('/api/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: $('#pwCur').value, next: $('#pwNew').value }) });
      $('#pwForm').reset(); A.toast('Password updated');
    } catch (err) { A.toast(err.message, true); }
    $('#pwBtn').disabled = false;
  });
})(window.ADMIN);
