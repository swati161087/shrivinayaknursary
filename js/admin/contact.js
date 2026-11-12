/* admin/contact.js — contact details */
(function (A) {
  const $ = A.$;
  function render() {
    const c = A.content.contact;
    $('#cPhone').value = c.phone; $('#cWa').value = c.whatsapp; $('#cEmail').value = c.email;
    $('#cHours').value = c.hours; $('#cAddress').value = c.address; $('#cMap').value = c.mapEmbed;
  }
  $('#contactForm').addEventListener('submit', async e => {
    e.preventDefault();
    const map = $('#cMap').value.trim();
    if (map && !SVN.mapSrc(map)) return A.toast('The map code is not valid. Paste the full <iframe> code from Google Maps.', true);
    A.content.contact = {
      phone: $('#cPhone').value.trim(), whatsapp: SVN.digits($('#cWa').value), email: $('#cEmail').value.trim(),
      hours: $('#cHours').value.trim(), address: $('#cAddress').value.trim(), mapEmbed: SVN.mapSrc(map)
    };
    try { await A.save(); A.toast('Contact details saved'); } catch (err) { A.toast(err.message, true); }
  });
  A.renderers.push(render);
})(window.ADMIN);
