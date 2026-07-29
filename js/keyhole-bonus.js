(function () {
  var root = document.querySelector('[data-keyhole-bonus]');
  if (!root) return;
  var photo = root.querySelector('.keyhole-bonus__photo');
  if (!photo) return;

  // No scroll-jack for reduced-motion users — just reveal it in place once
  // it's in view (matching .keyhole-bonus__pin's position:static and
  // .keyhole-bonus's height:auto reset for this case in the CSS).
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    photo.style.setProperty('--progress', 1);
    if ('IntersectionObserver' in window) {
      var staticObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              root.classList.add('keyhole-bonus--open');
              obs.unobserve(root);
            }
          });
        },
        { threshold: 0.3 }
      );
      staticObserver.observe(root);
    } else {
      root.classList.add('keyhole-bonus--open');
    }
    return;
  }

  // The keyhole opens across only the first ~55% of the pinned scroll
  // distance; the rest holds the fully-open frame on screen (still
  // pinned) so there's real time to read the text and tap the CTA before
  // it releases — see the CSS file header for why this replaced the old
  // timed scroll-lock.
  var ZOOM_FRACTION = 0.55;
  var OPEN_THRESHOLD = 0.98;

  var ticking = false;

  function render() {
    ticking = false;
    var rect = root.getBoundingClientRect();
    var pinnableRange = root.offsetHeight - window.innerHeight;
    var rawProgress = pinnableRange > 0 ? -rect.top / pinnableRange : (rect.top <= 0 ? 1 : 0);
    rawProgress = Math.min(Math.max(rawProgress, 0), 1);

    var maskProgress = Math.min(rawProgress / ZOOM_FRACTION, 1);
    photo.style.setProperty('--progress', maskProgress);
    root.classList.toggle('keyhole-bonus--open', maskProgress >= OPEN_THRESHOLD);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(render);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  render();
})();
