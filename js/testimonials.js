(function () {
  var section = document.querySelector('.testimonials');
  if (!section) return;

  var prevBtn = document.querySelector('.testimonials__arrow--prev');
  var nextBtn = document.querySelector('.testimonials__arrow--next');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.testimonials__dot'));

  // ---------------------------------------------------------------------
  // Mobile/tablet: the golden frame (.testimonials__stage-frame) stays put;
  // only the photo underneath slides sideways into its window, driven by a
  // per-photo --offset custom property rather than scrolling anything.
  // ---------------------------------------------------------------------
  function createStageController() {
    var stage = section.querySelector('.testimonials__stage');
    var photos = stage
      ? Array.prototype.slice.call(stage.querySelectorAll('.testimonials__stage-photo'))
      : [];
    if (!stage || !photos.length) return null;

    var SWIPE_THRESHOLD = 40;
    var index = 0;
    var touchStartX = null;
    var touchStartY = null;

    function render() {
      photos.forEach(function (photo, i) {
        photo.style.setProperty('--offset', i - index);
      });
      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function goTo(next) {
      index = Math.min(Math.max(next, 0), photos.length - 1);
      render();
    }

    function onTouchStart(e) {
      var t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }

    function onTouchEnd(e) {
      if (touchStartX === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - touchStartX;
      var dy = t.clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
      goTo(dx < 0 ? index + 1 : index - 1);
    }

    function onPrevClick() {
      goTo(index - 1);
    }

    function onNextClick() {
      goTo(index + 1);
    }

    var dotHandlers = dots.map(function (dot, i) {
      return function () {
        goTo(i);
      };
    });

    return {
      start: function () {
        index = 0;
        render();
        stage.addEventListener('touchstart', onTouchStart, { passive: true });
        stage.addEventListener('touchend', onTouchEnd, { passive: true });
        if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
        if (nextBtn) nextBtn.addEventListener('click', onNextClick);
        dots.forEach(function (dot, i) {
          dot.addEventListener('click', dotHandlers[i]);
        });
      },
      stop: function () {
        stage.removeEventListener('touchstart', onTouchStart);
        stage.removeEventListener('touchend', onTouchEnd);
        if (prevBtn) prevBtn.removeEventListener('click', onPrevClick);
        if (nextBtn) nextBtn.removeEventListener('click', onNextClick);
        dots.forEach(function (dot, i) {
          dot.removeEventListener('click', dotHandlers[i]);
        });
      }
    };
  }

  // ---------------------------------------------------------------------
  // Desktop: original horizontally-scrolling strip, one frame per item,
  // several visible at once — native scroll-snap gives touch/trackpad
  // swipe for free, this only drives the buttons/dots and reads position.
  // ---------------------------------------------------------------------
  function createTrackController() {
    var viewport = section.querySelector('.testimonials__viewport');
    var track = section.querySelector('.testimonials__track');
    var items = track ? Array.prototype.slice.call(track.querySelectorAll('.testimonials__item')) : [];
    if (!viewport || !track || !items.length) return null;

    var ticking = false;

    function itemStep() {
      var style = getComputedStyle(track);
      return items[0].getBoundingClientRect().width + parseFloat(style.columnGap || style.gap || 0);
    }

    function closestIndex() {
      return Math.round(viewport.scrollLeft / itemStep());
    }

    function setActiveDot() {
      var index = Math.min(closestIndex(), dots.length - 1);
      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(setActiveDot);
        ticking = true;
      }
    }

    function scrollToIndex(index) {
      viewport.scrollTo({ left: index * itemStep(), behavior: 'smooth' });
    }

    function onPrevClick() {
      scrollToIndex(Math.max(closestIndex() - 1, 0));
    }

    function onNextClick() {
      scrollToIndex(Math.min(closestIndex() + 1, items.length - 1));
    }

    var dotHandlers = dots.map(function (dot, i) {
      return function () {
        scrollToIndex(i);
      };
    });

    return {
      start: function () {
        viewport.scrollTo({ left: 0 });
        setActiveDot();
        viewport.addEventListener('scroll', onScroll, { passive: true });
        if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
        if (nextBtn) nextBtn.addEventListener('click', onNextClick);
        dots.forEach(function (dot, i) {
          dot.addEventListener('click', dotHandlers[i]);
        });
      },
      stop: function () {
        viewport.removeEventListener('scroll', onScroll);
        if (prevBtn) prevBtn.removeEventListener('click', onPrevClick);
        if (nextBtn) nextBtn.removeEventListener('click', onNextClick);
        dots.forEach(function (dot, i) {
          dot.removeEventListener('click', dotHandlers[i]);
        });
      }
    };
  }

  var desktopQuery = window.matchMedia('(min-width: 1200px)');
  var current = null;

  function applyMode() {
    if (current) current.stop();
    current = desktopQuery.matches ? createTrackController() : createStageController();
    if (current) current.start();
  }

  applyMode();
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', applyMode);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(applyMode);
  }
})();
