(function () {
  var section = document.querySelector('.what-if');
  var track = document.querySelector('.what-if__track');
  var spreads = document.querySelector('.what-if__spreads');
  var bg = document.querySelector('.what-if__bg');
  if (!section || !track || !spreads || !bg) return;

  var DESIGN_W = 2241;
  var PARALLAX_FACTOR = 0.35;
  var desktopQuery = window.matchMedia('(min-width: 1200px)');

  var PAGE_CENTERS = [371.5, 1120.5, 1870.5];
  var HALF_CENTERS = [197.75, 545.25, 946.75, 1294.25, 1696.75, 2044.25];

  var current = null; // active controller (mobile or desktop)

  // ---------------------------------------------------------------------
  // Mobile/tablet: scroll-distance drives 6 snapping half-spread frames.
  // ---------------------------------------------------------------------
  function createMobileController() {
    var stepTargets = [];
    var maxScroll = 0;
    var bgTravel = 0;
    var ticking = false;

    function computeSteps() {
      track.style.transition = 'none';
      var trackWidth = track.offsetWidth;
      var designToPx = trackWidth / DESIGN_W;
      var viewportWidth = window.innerWidth;
      maxScroll = Math.max(trackWidth - viewportWidth, 0);
      bgTravel = maxScroll * PARALLAX_FACTOR;

      stepTargets = HALF_CENTERS.map(function (center) {
        var target = center * designToPx - viewportWidth / 2;
        return Math.min(Math.max(target, 0), maxScroll);
      });

      section.style.height = (HALF_CENTERS.length * window.innerHeight) + 'px';
      void track.offsetHeight;
      track.style.transition = '';
      render();
    }

    function render() {
      ticking = false;
      var stepCount = HALF_CENTERS.length;
      var rect = section.getBoundingClientRect();
      var pinRange = (stepCount - 1) * window.innerHeight;
      var rawProgress = pinRange > 0 ? -rect.top / pinRange : 0;
      rawProgress = Math.min(Math.max(rawProgress, 0), 1);

      var stepIndex = Math.round(rawProgress * (stepCount - 1));
      stepIndex = Math.min(Math.max(stepIndex, 0), stepCount - 1);

      track.style.transform = 'translate3d(' + (-stepTargets[stepIndex]) + 'px, 0, 0)';
      bg.style.backgroundPositionX = (-rawProgress * bgTravel) + 'px';
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(render);
        ticking = true;
      }
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(computeSteps, 150);
    }

    return {
      start: function () {
        computeSteps();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
      },
      stop: function () {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);
        track.style.transform = '';
        track.style.transition = '';
      }
    };
  }

  // ---------------------------------------------------------------------
  // Desktop: one wheel gesture = one whole spread (3 total), via wheel
  // interception rather than scroll distance. The section only needs
  // enough slack height to reliably detect "currently pinned" regardless
  // of how far a single scroll gesture jumps.
  // ---------------------------------------------------------------------
  function createDesktopController() {
    var stepCount = PAGE_CENTERS.length;
    var stepIndex = 0;
    var bgTravel = 0;
    // A single physical wheel gesture (a mouse click-tick, or a trackpad
    // flick with momentum) fires many 'wheel' events, not one — a
    // trackpad's inertia alone can keep emitting events for over a
    // second. Committing a step per event (or per fixed cooldown after
    // one) let one gesture blow through multiple frames. Instead a
    // gesture is tracked as "live" for as long as events keep arriving;
    // only once it goes quiet do we consider it over, and only the
    // event that STARTS a fresh (post-silence) gesture commits a step.
    var GESTURE_SILENCE_MS = 220;
    var gestureLive = false;
    var silenceTimer;

    function computeSteps() {
      section.style.height = (window.innerHeight * 2) + 'px';
      var trackWidth = spreads.offsetWidth; // == viewport width, one slot per step
      bgTravel = trackWidth * PARALLAX_FACTOR;
      render();
    }

    function render() {
      spreads.style.transform = 'translate3d(' + (-stepIndex * window.innerWidth) + 'px, 0, 0)';
      bg.style.backgroundPositionX = (-(stepIndex / (stepCount - 1)) * bgTravel) + 'px';
    }

    function isPinned() {
      var rect = section.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom >= window.innerHeight;
    }

    function onWheel(e) {
      if (!isPinned()) return;

      var goingDown = e.deltaY > 0;
      var goingUp = e.deltaY < 0;
      if (!goingDown && !goingUp) return;

      if (goingDown && stepIndex >= stepCount - 1) return; // release to next section
      if (goingUp && stepIndex <= 0) return; // release to previous section

      e.preventDefault();

      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(function () { gestureLive = false; }, GESTURE_SILENCE_MS);

      if (gestureLive) return; // mid-gesture: swallow, don't step again
      gestureLive = true;

      if (goingDown) stepIndex = Math.min(stepIndex + 1, stepCount - 1);
      if (goingUp) stepIndex = Math.max(stepIndex - 1, 0);
      render();
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(computeSteps, 150);
    }

    return {
      start: function () {
        stepIndex = 0;
        computeSteps();
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('resize', onResize);
      },
      stop: function () {
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);
        clearTimeout(silenceTimer);
        spreads.style.transform = '';
      }
    };
  }

  function applyMode() {
    if (current) current.stop();
    bg.style.backgroundPositionX = '0px';
    current = desktopQuery.matches ? createDesktopController() : createMobileController();
    current.start();
  }

  applyMode();
  desktopQuery.addEventListener('change', applyMode);
})();
