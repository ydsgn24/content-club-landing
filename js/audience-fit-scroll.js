(function () {
  var section = document.querySelector('.audience-fit');
  if (!section) return;

  // ---------------------------------------------------------------------
  // Chandelier: one-shot "lowered into place" reveal, same on every
  // breakpoint. Triggers once, the moment it enters the viewport.
  // ---------------------------------------------------------------------
  var chandelier = section.querySelector('.audience-fit__chandelier');
  if (chandelier) {
    var revealChandelier = function () {
      section.classList.add('audience-fit--chandelier-revealed');
    };

    if (!('IntersectionObserver' in window)) {
      revealChandelier();
    } else {
      var chandelierObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealChandelier();
              obs.unobserve(chandelier);
            }
          });
        },
        { threshold: 0.2 }
      );
      chandelierObserver.observe(chandelier);
    }
  }

  // ---------------------------------------------------------------------
  // Cards: mobile/tablet only. Straighten once a card nears the vertical
  // center of the screen, and stay straight as it keeps moving through
  // (drifting off-center while still fully in frame should NOT re-tilt
  // it — that read as a glitch). Tilt only comes back once the card has
  // actually scrolled out of the viewport entirely, so scrolling back
  // down (or back up past it again) straightens it fresh next time.
  // Two separate observers drive the two edges of that behavior.
  // ---------------------------------------------------------------------
  var cards = section.querySelectorAll('.audience-card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  var desktopQuery = window.matchMedia('(min-width: 1200px)');
  var centerObserver = null;
  var viewportObserver = null;

  function startCardObserver() {
    if (centerObserver) return;

    centerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('audience-card--straight');
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    viewportObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            entry.target.classList.remove('audience-card--straight');
          }
        });
      },
      { rootMargin: '0px', threshold: 0 }
    );

    cards.forEach(function (card) {
      centerObserver.observe(card);
      viewportObserver.observe(card);
    });
  }

  function stopCardObserver() {
    if (!centerObserver) return;
    centerObserver.disconnect();
    viewportObserver.disconnect();
    centerObserver = null;
    viewportObserver = null;
    cards.forEach(function (card) {
      card.classList.remove('audience-card--straight');
    });
  }

  function applyCardMode() {
    if (desktopQuery.matches) {
      stopCardObserver();
    } else {
      startCardObserver();
    }
  }

  applyCardMode();
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', applyCardMode);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(applyCardMode);
  }
})();
