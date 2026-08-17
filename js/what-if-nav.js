(function () {
  var section = document.querySelector('.what-if');
  var track = document.querySelector('.what-if__track');
  var spreads = document.querySelector('.what-if__spreads');
  var bg = document.querySelector('.what-if__bg');
  var prevBtn = document.querySelector('.what-if__arrow--prev');
  var nextBtn = document.querySelector('.what-if__arrow--next');
  var mobileDots = Array.prototype.slice.call(document.querySelectorAll('.what-if__dots--mobile .what-if__dot'));
  var desktopDots = Array.prototype.slice.call(document.querySelectorAll('.what-if__dots--desktop .what-if__dot'));
  if (!section || !track || !spreads || !bg) return;

  var DESIGN_W = 2241;
  var PARALLAX_FACTOR = 0.35;
  var desktopQuery = window.matchMedia('(min-width: 1200px)');

  var PAGE_CENTERS = [371.5, 1120.5, 1870.5];
  var HALF_CENTERS = [197.75, 545.25, 946.75, 1294.25, 1696.75, 2044.25];

  var current = null; // active controller (mobile or desktop)

  function syncDots(dots, index) {
    dots.forEach(function (dot, i) {
      var active = i === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  // ---------------------------------------------------------------------
  // Mobile/tablet: prev/next arrows + dots step through 6 half-spread frames.
  // ---------------------------------------------------------------------
  function createMobileController() {
    var stepTargets = [];
    var bgTravel = 0;
    var stepIndex = 0;

    function computeSteps() {
      track.style.transition = 'none';
      var trackWidth = track.offsetWidth;
      var designToPx = trackWidth / DESIGN_W;
      var viewportWidth = window.innerWidth;
      var maxScroll = Math.max(trackWidth - viewportWidth, 0);
      bgTravel = maxScroll * PARALLAX_FACTOR;

      stepTargets = HALF_CENTERS.map(function (center) {
        var target = center * designToPx - viewportWidth / 2;
        return Math.min(Math.max(target, 0), maxScroll);
      });

      void track.offsetHeight;
      track.style.transition = '';
      render();
    }

    function render() {
      var stepCount = HALF_CENTERS.length;
      track.style.transform = 'translate3d(' + (-stepTargets[stepIndex]) + 'px, 0, 0)';
      bg.style.backgroundPositionX = (-(stepIndex / (stepCount - 1)) * bgTravel) + 'px';
      syncDots(mobileDots, stepIndex);
    }

    function goTo(next) {
      stepIndex = Math.min(Math.max(next, 0), HALF_CENTERS.length - 1);
      render();
    }

    function onPrevClick() {
      goTo(stepIndex - 1);
    }

    function onNextClick() {
      goTo(stepIndex + 1);
    }

    var dotHandlers = mobileDots.map(function (dot, i) {
      return function () {
        goTo(i);
      };
    });

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(computeSteps, 150);
    }

    return {
      start: function () {
        stepIndex = 0;
        computeSteps();
        window.addEventListener('resize', onResize);
        if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
        if (nextBtn) nextBtn.addEventListener('click', onNextClick);
        mobileDots.forEach(function (dot, i) {
          dot.addEventListener('click', dotHandlers[i]);
        });
      },
      stop: function () {
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);
        if (prevBtn) prevBtn.removeEventListener('click', onPrevClick);
        if (nextBtn) nextBtn.removeEventListener('click', onNextClick);
        mobileDots.forEach(function (dot, i) {
          dot.removeEventListener('click', dotHandlers[i]);
        });
        track.style.transform = '';
        track.style.transition = '';
      }
    };
  }

  // ---------------------------------------------------------------------
  // Desktop: prev/next arrows + dots step through 3 whole pre-composited
  // spreads.
  // ---------------------------------------------------------------------
  function createDesktopController() {
    var stepCount = PAGE_CENTERS.length;
    var stepIndex = 0;
    var bgTravel = 0;

    function computeSteps() {
      var trackWidth = spreads.offsetWidth; // == viewport width, one slot per step
      bgTravel = trackWidth * PARALLAX_FACTOR;
      render();
    }

    function render() {
      spreads.style.transform = 'translate3d(' + (-stepIndex * window.innerWidth) + 'px, 0, 0)';
      bg.style.backgroundPositionX = (-(stepIndex / (stepCount - 1)) * bgTravel) + 'px';
      syncDots(desktopDots, stepIndex);
    }

    function goTo(next) {
      stepIndex = Math.min(Math.max(next, 0), stepCount - 1);
      render();
    }

    function onPrevClick() {
      goTo(stepIndex - 1);
    }

    function onNextClick() {
      goTo(stepIndex + 1);
    }

    var dotHandlers = desktopDots.map(function (dot, i) {
      return function () {
        goTo(i);
      };
    });

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(computeSteps, 150);
    }

    return {
      start: function () {
        stepIndex = 0;
        computeSteps();
        window.addEventListener('resize', onResize);
        if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
        if (nextBtn) nextBtn.addEventListener('click', onNextClick);
        desktopDots.forEach(function (dot, i) {
          dot.addEventListener('click', dotHandlers[i]);
        });
      },
      stop: function () {
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);
        if (prevBtn) prevBtn.removeEventListener('click', onPrevClick);
        if (nextBtn) nextBtn.removeEventListener('click', onNextClick);
        desktopDots.forEach(function (dot, i) {
          dot.removeEventListener('click', dotHandlers[i]);
        });
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
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', applyMode);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(applyMode);
  }
})();
