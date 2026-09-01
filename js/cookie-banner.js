(function () {
  var banner = document.querySelector('[data-cookie-banner]');
  if (!banner) return;

  var STORAGE_KEY = 'cookie-notice-ack';
  if (localStorage.getItem(STORAGE_KEY)) return;

  banner.hidden = false;
  requestAnimationFrame(function () {
    banner.classList.add('cookie-banner--visible');
  });

  var acceptBtn = banner.querySelector('[data-cookie-accept]');
  if (!acceptBtn) return;

  acceptBtn.addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, '1');
    banner.classList.remove('cookie-banner--visible');
    banner.addEventListener('transitionend', function onEnd() {
      banner.hidden = true;
      banner.removeEventListener('transitionend', onEnd);
    });
  });
})();
