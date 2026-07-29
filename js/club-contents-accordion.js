(function () {
  var items = document.querySelectorAll('.club-contents .accordion-item');
  if (!items.length) return;

  // No WAAPI or user prefers reduced motion: leave the native
  // <details name="room-accordion"> exclusive-group behavior as authored
  // in the HTML (instant open/close, still fully functional).
  if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var DURATION = 360;
  var EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
  var controllers = [];

  items.forEach(function (item) {
    // Exclusivity (only one open at a time) is re-implemented in JS below
    // so the previously-open item can be animated shut instead of the
    // browser's native same-name group snapping it closed instantly.
    item.removeAttribute('name');

    var summary = item.querySelector('.accordion-item__summary');
    var body = item.querySelector('.accordion-item__body');
    var animation = null;

    function animateTo(open) {
      if (animation) animation.cancel();
      item.style.overflow = 'hidden';
      var startHeight = item.offsetHeight + 'px';
      if (open) item.open = true;
      var endHeight = open
        ? (summary.offsetHeight + body.offsetHeight) + 'px'
        : summary.offsetHeight + 'px';

      animation = item.animate(
        { height: [startHeight, endHeight] },
        { duration: DURATION, easing: EASING }
      );
      animation.onfinish = function () {
        animation = null;
        item.style.height = '';
        item.style.overflow = '';
        if (!open) item.open = false;
      };
      animation.oncancel = function () {
        animation = null;
      };
    }

    controllers.push({ item: item, animateTo: animateTo });

    summary.addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !item.open;
      if (willOpen) {
        controllers.forEach(function (other) {
          if (other.item !== item && other.item.open) {
            other.animateTo(false);
          }
        });
      }
      animateTo(willOpen);
    });
  });
})();
