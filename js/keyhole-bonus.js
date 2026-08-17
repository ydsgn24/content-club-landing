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

  // The keyhole now opens DURING the scroll that first carries it into
  // view, not after — progress tracks .keyhole-bonus's own top edge from
  // the moment it appears at the bottom of the viewport (rect.top ===
  // innerHeight) through to fully settled at its pinned position
  // (rect.top === 0), so it's already open by the time it locks in place
  // instead of sitting there closed and static until the pin "arrives".
  // Past that point rect.top goes negative (still pinned, consuming the
  // rest of .keyhole-bonus's extra height) and progress just clamps at 1
  // — that remaining scroll is pure hold-open reading time, no separate
  // zoom fraction needed anymore (see the CSS file header for why this
  // replaced the old timed scroll-lock).
  var OPEN_THRESHOLD = 0.98;

  var ticking = false;

  function render() {
    ticking = false;
    var rect = root.getBoundingClientRect();
    var vh = window.innerHeight;
    var maskProgress = vh > 0 ? 1 - rect.top / vh : (rect.top <= 0 ? 1 : 0);
    maskProgress = Math.min(Math.max(maskProgress, 0), 1);

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
