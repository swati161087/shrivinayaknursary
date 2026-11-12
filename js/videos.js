/* videos.js — "Our Work" video cards (YouTube or uploaded files) */
(function (S) {
  S.initVideos = function (videos) {
    const esc = S.esc, grid = S.$('#videoGrid');
    grid.innerHTML = '';
    const list = videos.length ? videos : S.PLACEHOLDER_VIDEOS.map(v => Object.assign({ youtube: '', file: '' }, v));
    list.forEach(v => {
      const el = document.createElement('div'); el.className = 'video';
      const yt = S.youtubeId(v.youtube);
      let inner = '';
      if (yt) inner = '<img src="https://img.youtube.com/vi/' + encodeURIComponent(yt) + '/hqdefault.jpg" alt="' + esc(v.title) + '" loading="lazy">';
      else if (v.file) inner = '<video src="' + esc(v.file) + '#t=0.1" preload="metadata" muted playsinline></video>';
      const note = (!yt && !v.file) ? '<div class="placeholder-note">Videos will appear here soon</div>' : '';
      el.innerHTML = '<div class="player">' + inner + '<div class="play">▶</div>' + note + '</div>' +
        '<div class="video-info"><h3>' + esc(v.title) + '</h3><p>' + esc(v.description) + '</p></div>';
      const player = el.querySelector('.player');
      player.onclick = () => {
        if (yt) player.innerHTML = '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(yt) + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="' + esc(v.title) + '"></iframe>';
        else if (v.file) player.innerHTML = '<video src="' + esc(v.file) + '" controls autoplay playsinline></video>';
      };
      grid.appendChild(el);
    });
  };
})(window.SVN = window.SVN || {});
