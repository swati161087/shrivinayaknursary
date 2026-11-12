/* carousel.js — photo carousel (autoplay, arrows, dots, thumbnails, swipe) */
(function (S) {
  S.initCarousel = function (photos) {
    const $ = S.$, esc = S.esc;
    const slides = photos.length
      ? photos.map(p => ({ img: p.img, title: p.title, caption: p.caption, e: '', bg: ['#0f3d27', '#1b6b45'] }))
      : S.PLACEHOLDER_SLIDES.map(p => Object.assign({ img: '' }, p));
    const track = $('#track'), dots = $('#dots'), thumbs = $('#thumbs');
    track.innerHTML = dots.innerHTML = thumbs.innerHTML = '';
    let cur = 0, timer;

    slides.forEach((s, i) => {
      const grad = 'linear-gradient(135deg,' + s.bg[0] + ',' + s.bg[1] + ')';
      const sl = document.createElement('div'); sl.className = 'slide'; sl.style.background = grad;
      sl.innerHTML = esc(s.e) + (s.img ? '<img src="' + esc(s.img) + '" alt="' + esc(s.title || 'Nursery photo') + '"' + (i ? ' loading="lazy"' : '') + '>' : '') +
        (s.title || s.caption ? '<div class="cap">' + esc(s.title) + (s.caption ? '<small>' + esc(s.caption) + '</small>' : '') + '</div>' : '');
      track.appendChild(sl);
      const d = document.createElement('button'); d.className = 'dot'; d.setAttribute('aria-label', 'Slide ' + (i + 1)); d.onclick = () => { go(i); auto(); }; dots.appendChild(d);
      const t = document.createElement('button'); t.style.background = grad; t.setAttribute('aria-label', 'Show slide ' + (i + 1));
      t.innerHTML = esc(s.e) + (s.img ? '<img src="' + esc(s.img) + '" alt="" loading="lazy">' : ''); t.onclick = () => { go(i); auto(); }; thumbs.appendChild(t);
    });

    function go(i) {
      cur = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      [...dots.children].forEach((d, k) => d.classList.toggle('active', k === cur));
      [...thumbs.children].forEach((d, k) => d.classList.toggle('active', k === cur));
    }
    function auto() { clearInterval(timer); if (slides.length > 1) timer = setInterval(() => go(cur + 1), 4500); }

    $('#prev').onclick = () => { go(cur - 1); auto(); };
    $('#next').onclick = () => { go(cur + 1); auto(); };
    const car = $('#carousel');
    car.addEventListener('mouseenter', () => clearInterval(timer));
    car.addEventListener('mouseleave', auto);
    let sx = null;
    car.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); auto(); }
      sx = null;
    });
    const single = slides.length < 2;
    $('#prev').hidden = $('#next').hidden = dots.hidden = thumbs.hidden = single;
    go(0); auto();
  };
})(window.SVN = window.SVN || {});
