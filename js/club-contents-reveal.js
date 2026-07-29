(function () {
  var section = document.querySelector('.club-contents');
  if (!section) return;

  var introTarget = section.querySelector('.club-contents__intro');
  var textTargets = section.querySelectorAll('.club-contents__icon-caption, .club-contents__offer');

  var LINE_DELAY_S = 0.12;

  // Same word-wrapping approach as js/video-teaser-reveal.js: walk TEXT
  // nodes only, so surrounding markup survives untouched.
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

  textTargets.forEach(wrapWords);
  var words = section.querySelectorAll(
    '.club-contents__icon-caption .reveal-word, .club-contents__offer .reveal-word'
  );

  // Each target line-groups independently (caption offsetTop and offer
  // offsetTop overlap by coincidence otherwise), so group per-target.
  function assignLineDelays() {
    textTargets.forEach(function (target) {
      var lineTops = [];
      var targetWords = target.querySelectorAll('.reveal-word');
      targetWords.forEach(function (word) {
        var top = word.offsetTop;
        var lineIndex = lineTops.indexOf(top);
        if (lineIndex === -1) {
          lineTops.push(top);
          lineIndex = lineTops.length - 1;
        }
        word.style.setProperty('--reveal-delay', (lineIndex * LINE_DELAY_S) + 's');
      });
    });
  }

  assignLineDelays();

  var headerRevealed = false;
  var resizeTimer;
  window.addEventListener('resize', function () {
    if (headerRevealed) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(assignLineDelays, 150);
  });

  function revealHeader() {
    headerRevealed = true;
    section.classList.add('club-contents--revealed');
  }

  if (!introTarget || !('IntersectionObserver' in window)) {
    revealHeader();
  } else {
    var introObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealHeader();
            obs.unobserve(introTarget);
          }
        });
      },
      { threshold: 0.4 }
    );
    introObserver.observe(introTarget);
  }

  // Per-card reveal: independent of the header above, since the section is
  // much taller than one screen — each card should rise/fade in on its own
  // as it individually scrolls into view, not all at once with the header.
  var cards = section.querySelectorAll('.accordion-item, .club-card');
  if (!cards.length) return;

  if (!words.length && !('IntersectionObserver' in window)) return;

  if (!('IntersectionObserver' in window)) {
    cards.forEach(function (card) {
      card.classList.add('reveal-card--visible');
    });
    return;
  }

  var cardObserver = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // Cards that cross the threshold together (same scroll frame)
          // stagger relative to each other; cards entering minutes apart
          // in scroll time don't inherit any artificial extra delay.
          el.style.transitionDelay = (i * 0.08) + 's';
          el.classList.add('reveal-card--visible');
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  cards.forEach(function (card) {
    cardObserver.observe(card);
  });
})();
