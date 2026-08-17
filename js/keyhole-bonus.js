(function () {
  var root = document.querySelector('[data-keyhole-bonus]');
  if (!root) return;

  // Per product request, this is no longer scroll-scrubbed (mask-size
  // tied 1:1 to scroll distance, "the more you scroll the more it
  // opens") — it's a one-shot reveal instead: the moment the section
  // first appears at the bottom of the viewport, it opens fully on its
  // own via a CSS transition (see .keyhole-bonus__photo), regardless of
  // how far the visitor actually scrolls. IntersectionObserver at
  // threshold 0 fires on that first sliver of visibility, which only
  // happens as a result of the visitor's own scroll/touch gesture, so
  // this doubles as "opens from one touch" without any separate
  // scroll/touch listener needed.
  //
  // .keyhole-bonus--open drives the mask-size transition + text/badge/
  // CTA reveal together, immediately. .keyhole-bonus--mask-cleared comes
  // MASK_TRANSITION_MS later and only drops the mask-image outright —
  // belt-and-suspenders once the transition has visually finished (see
  // the CSS file header for why trusting mask-size math alone is
  // fragile). It has to be delayed and separate: adding it at the same
  // time as --open would swap mask-image to none instantly, skipping
  // the widening-circle animation entirely instead of just cleaning up
  // after it.
  var MASK_TRANSITION_MS = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550;

  function reveal() {
    root.classList.add('keyhole-bonus--open');
    window.setTimeout(function () {
      root.classList.add('keyhole-bonus--mask-cleared');
    }, MASK_TRANSITION_MS);
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal();
            obs.unobserve(root);
          }
        });
      },
      { threshold: 0 }
    );
    observer.observe(root);
  } else {
    reveal();
  }
})();
