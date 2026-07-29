(function () {
  var section = document.querySelector('.faq');
  if (!section) return;

  var heading = section.querySelector('.faq__heading');

  function wrapWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    var node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach(function (textNode) {
      var parts = textNode.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          var span = document.createElement('span');
          span.className = 'reveal-word';
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  if (heading) wrapWords(heading);

  function reveal() {
    section.classList.add('is-revealed');
  }

  var items = Array.prototype.slice.call(section.querySelectorAll('.faq-item'));

  if (!('IntersectionObserver' in window)) {
    reveal();
    items.forEach(function (item) {
      item.classList.add('reveal-card--visible');
    });
    return;
  }

  if (heading) {
    var headingObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal();
            obs.unobserve(heading);
          }
        });
      },
      { threshold: 0.4 }
    );
    headingObserver.observe(heading);
  } else {
    reveal();
  }

  if (items.length) {
    var itemObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.style.transitionDelay = (i * 0.08) + 's';
            el.classList.add('reveal-card--visible');
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    items.forEach(function (item) {
      itemObserver.observe(item);
    });
  }
})();
