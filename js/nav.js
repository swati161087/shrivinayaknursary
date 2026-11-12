/* nav.js — mobile menu */
(function (S) {
  S.initNav = function () {
    const menu = S.$('#menu');
    S.$('#burger').onclick = () => menu.classList.toggle('open');
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  };
})(window.SVN = window.SVN || {});
