/* main.js — starts everything on the public page */
(async function (S) {
  const data = await S.loadContent();
  S.initNav();
  S.renderContact(data.contact);
  S.initCatalogue(data.plants);   // must come before initQuote's first render
  S.initQuote(data.contact);
  S.initCarousel(data.gallery);
  S.initVideos(data.videos);
})(window.SVN);
