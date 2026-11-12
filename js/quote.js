/* quote.js — "Add to Quote" list and the quotation form (WhatsApp / email) */
(function (S) {
  const items = {};           // plant name -> quantity
  const listeners = [];
  const q = S.quote = {
    has: n => n in items,
    toggle(n) { if (n in items) delete items[n]; else items[n] = 1; q.render(); },
    onChange(fn) { listeners.push(fn); },
    render() {
      const $ = S.$, names = Object.keys(items);
      $('#selCount').textContent = names.length;
      $('#fabCount').textContent = names.length;
      $('#quoteFab').style.display = names.length ? 'block' : 'none';
      const list = $('#selList');
      list.innerHTML = names.length ? '' : '<span class="sel-empty">Nothing selected yet — add plants from the catalogue, or just describe your needs below.</span>';
      names.forEach(n => {
        const chip = document.createElement('span'); chip.className = 'chip';
        chip.innerHTML = S.esc(n) + ' × <input type="number" min="1" value="' + items[n] + '" aria-label="Quantity for ' + S.esc(n) + '"><button type="button" aria-label="Remove ' + S.esc(n) + '">×</button>';
        chip.querySelector('input').onchange = e => { items[n] = Math.max(1, parseInt(e.target.value, 10) || 1); };
        chip.querySelector('button').onclick = () => { delete items[n]; q.render(); };
        list.appendChild(chip);
      });
      listeners.forEach(fn => fn());
    }
  };

  S.initQuote = function (contact) {
    const $ = S.$, g = id => $('#' + id).value.trim(), wa = S.digits(contact.whatsapp);

    function message() {
      const lines = ['Hello ' + S.SITE_NAME + ', I would like a quotation.', '', 'Name: ' + g('name'), 'Phone: ' + g('phone')];
      if (g('email')) lines.push('Email: ' + g('email'));
      if (g('city')) lines.push('City: ' + g('city'));
      lines.push('Requirement: ' + $('#type').value);
      const names = Object.keys(items);
      if (names.length) lines.push('', 'Selected plants:', ...names.map((n, i) => (i + 1) + '. ' + n + ' – Qty: ' + items[n]));
      if (g('message')) lines.push('', 'Details: ' + g('message'));
      return lines.join('\n');
    }
    function valid() {
      const m = $('#msg'); m.className = 'msg';
      if (!g('name')) { m.textContent = 'Please enter your name.'; $('#name').focus(); return false; }
      if (!/^[+\d][\d\s-]{7,}$/.test(g('phone'))) { m.textContent = 'Please enter a valid phone number.'; $('#phone').focus(); return false; }
      if (g('email') && !/^\S+@\S+\.\S+$/.test(g('email'))) { m.textContent = 'Please enter a valid email address.'; $('#email').focus(); return false; }
      m.textContent = ''; return true;
    }
    function done() { const m = $('#msg'); m.className = 'msg ok'; m.textContent = 'Thank you! Your request is ready to send — we’ll get back to you shortly.'; }

    $('#sendWa').onclick = () => { if (!valid()) return; window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(message()), '_blank'); done(); };
    $('#sendMail').onclick = () => { if (!valid()) return; location.href = 'mailto:' + contact.email + '?subject=' + encodeURIComponent('Quotation Request – ' + g('name')) + '&body=' + encodeURIComponent(message()); done(); };
    $('#quoteForm').addEventListener('submit', e => e.preventDefault());
    q.render();
  };
})(window.SVN = window.SVN || {});
