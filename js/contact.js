/* contact.js — fills contact details (top bar, contact section, footer, WhatsApp button, map) */
(function (S) {
  S.renderContact = function (c) {
    const $ = S.$, wa = S.digits(c.whatsapp), tel = String(c.phone).replace(/[^\d+]/g, '');
    $('#tb-phone').textContent = '📞 ' + c.phone;
    $('#c-address').textContent = c.address;
    $('#c-hours').textContent = c.hours;
    const cp = $('#c-phone'); cp.textContent = c.phone; cp.href = 'tel:' + tel;
    const cw = $('#c-wa'); cw.textContent = 'Chat with us'; cw.href = 'https://wa.me/' + wa;
    const ce = $('#c-email'); ce.textContent = c.email; ce.href = 'mailto:' + c.email;
    $('#floatWa').href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Hello ' + S.SITE_NAME + ", I'd like to know more about your plants.");
    $('#f-phone').textContent = '📞 ' + c.phone;
    $('#f-email').textContent = '✉️ ' + c.email;
    $('#f-address').textContent = '📍 ' + c.address;
    $('#year').textContent = new Date().getFullYear();
    const src = S.mapSrc(c.mapEmbed);
    if (src) $('#map').innerHTML = '<iframe src="' + S.esc(src) + '" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe>';
  };
})(window.SVN = window.SVN || {});
