/* admin/main.js — login, logout, tabs, startup */
(function (A) {
  const $ = A.$;

  async function loadAndShow() {
    A.content = SVN.normalize(await A.api('/api/content'));
    A.renderAll();
    A.showView('app');
  }

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('#loginMsg'); msg.textContent = '';
    try {
      await A.api('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#loginPw').value }), noRedirect: true });
      await loadAndShow();
    } catch (err) { msg.textContent = err.message; }
  });

  $('#logoutBtn').onclick = async () => {
    try { await A.api('/api/logout', { method: 'POST', noRedirect: true }); } catch (e) { /* ignore */ }
    A.showView('login');
  };

  $('#adminTabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-tab]'); if (!b) return;
    document.querySelectorAll('#adminTabs button').forEach(x => x.classList.toggle('active', x === b));
    document.querySelectorAll('.panel').forEach(p => { p.hidden = p.id !== 'tab-' + b.dataset.tab; });
  });

  (async function start() {
    try {
      const s = await fetch('/api/session', { credentials: 'same-origin' }).then(r => { if (!r.ok) throw new Error(); return r.json(); });
      $('#pwEnvNote').hidden = !s.passwordFromEnv; $('#pwBtn').disabled = !!s.passwordFromEnv;
      if (s.authenticated) await loadAndShow(); else A.showView('login');
    } catch (e) { A.showView('offline'); }
  })();
})(window.ADMIN);
