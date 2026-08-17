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
              root.classList.add('keyhole-bonus--open', 'keyhole-bonus--text');
              obs.unobserve(root);
            }
          });
        },
        { threshold: 0.3 }
      );
      staticObserver.observe(root);
    } else {
      root.classList.add('keyhole-bonus--open', 'keyhole-bonus--text');
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
  //
  // Text/badge/CTA get their OWN, much earlier threshold, decoupled from
  // OPEN_THRESHOLD: the closed→open mask-size values are tuned (per
  // breakpoint, see keyhole-bonus.css) to visually cover the whole frame
  // well before progress actually reaches 1 — OPEN_THRESHOLD just governs
  // when the mask gets dropped outright as a belt-and-suspenders cleanup,
  // not when the photo first LOOKS fully open. Gating text on that same
  // late threshold left a long stretch where the photo already read as
  // fully revealed but no text had appeared yet — looked like a blank
  // photo with nothing on it. TEXT_THRESHOLD fires as soon as there's
  // enough opened photo behind the text for it to read against (this
  // site's cream text needs the photo, not the plain cream section
  // background, for contrast), without waiting for the mask cleanup.
  var TEXT_THRESHOLD = 0.4;
  var OPEN_THRESHOLD = 0.98;

  var ticking = false;

  function render() {
    ticking = false;
    var rect = root.getBoundingClientRect();
    var vh = window.innerHeight;
    var maskProgress = vh > 0 ? 1 - rect.top / vh : (rect.top <= 0 ? 1 : 0);
    maskProgress = Math.min(Math.max(maskProgress, 0), 1);

    photo.style.setProperty('--progress', maskProgress);
    root.classList.toggle('keyhole-bonus--text', maskProgress >= TEXT_THRESHOLD);
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
