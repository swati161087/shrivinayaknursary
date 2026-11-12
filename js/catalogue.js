/* catalogue.js — plant cards, category tabs and search */
(function (S) {
  const GRADS = {
    'Indoor': ['#d8f3dc', '#95d5b2'], 'Outdoor': ['#e9f5db', '#b5e48c'], 'Flowering': ['#ffe5ec', '#ffb3c6'],
    'Succulents': ['#e0f2f1', '#80cbc4'], 'Herbs & Veg': ['#fff3cd', '#c5e1a5'], 'Pots & Supplies': ['#f5e6d3', '#d7b79a']
  };
  const FALLBACK = ['#e6f4ec', '#b7e0c8'];

  S.initCatalogue = function (plants) {
    const $ = S.$, esc = S.esc;
    let active = 'All';
    const cats = ['All', ...new Set(plants.map(p => p.c))];
    const tabs = $('#tabs');
    tabs.innerHTML = '';
    cats.forEach(c => {
      const b = document.createElement('button'); b.className = 'tab' + (c === active ? ' active' : ''); b.textContent = c;
      b.onclick = () => { active = c; tabs.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === b)); render(); };
      tabs.appendChild(b);
    });
    $('#search').addEventListener('input', render);
    S.quote.onChange(render);

    function render() {
      const term = $('#search').value.trim().toLowerCase();
      const list = plants.filter(p => (active === 'All' || p.c === active) && (!term || (p.n + ' ' + p.s + ' ' + p.c).toLowerCase().includes(term)));
      const grid = $('#grid'); grid.innerHTML = '';
      $('#empty').style.display = list.length ? 'none' : 'block';
      list.forEach(p => {
        const g = GRADS[p.c] || FALLBACK, added = S.quote.has(p.n);
        const card = document.createElement('article'); card.className = 'card';
        card.innerHTML =
          '<div class="thumb" style="background:linear-gradient(135deg,' + g[0] + ',' + g[1] + ')">' + esc(p.e) +
          (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.n) + '" loading="lazy" onerror="this.remove()">' : '') +
          (p.tag ? '<span class="badge">' + esc(p.tag) + '</span>' : '') + '</div>' +
          '<div class="card-body"><h3>' + esc(p.n) + '</h3>' + (p.s ? '<div class="sci">' + esc(p.s) + '</div>' : '') + '<p>' + esc(p.d) + '</p>' +
          '<div class="card-foot"><span class="price">' + (p.price ? esc(p.price) : 'Price on request') + '</span>' +
          '<button class="btn btn-primary add' + (added ? ' added' : '') + '">' + (added ? '✓ Added' : '+ Add to Quote') + '</button></div></div>';
        card.querySelector('.add').onclick = () => S.quote.toggle(p.n);
        grid.appendChild(card);
      });
    }
    render();
  };
})(window.SVN = window.SVN || {});
