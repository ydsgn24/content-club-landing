(function () {
  var section = document.querySelector('.objections');
  if (!section) return;

  var textTargets = Array.prototype.slice.call(
    section.querySelectorAll('.objections__title, .objections__answer')
  );
  if (!textTargets.length) return;

  var LINE_DELAY_S = 0.1;

  // Same word-wrapping approach as js/video-teaser-reveal.js and
  // js/club-contents-reveal.js: walk TEXT nodes only, so surrounding markup
  // survives untouched.
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

  // Each target (title, answer) line-groups independently, so a word in
  // one never gets matched to a line in the other by coincidence.
  function assignLineDelays() {
    textTargets.forEach(function (target) {
      var lineTops = [];
      var words = target.querySelectorAll('.reveal-word');
      words.forEach(function (word) {
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

  var revealed = false;
  var resizeTimer;
  window.addEventListener('resize', function () {
    if (revealed) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(assignLineDelays, 150);
  });

  function reveal() {
    revealed = true;
    section.classList.add('is-revealed');
  }

  if (!('IntersectionObserver' in window)) {
    reveal();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal();
          obs.unobserve(section);
        }
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(section);
})();
