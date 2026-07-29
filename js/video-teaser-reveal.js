(function () {
  var section = document.querySelector('.video-teaser');
  if (!section) return;

  var targets = section.querySelectorAll('.video-teaser__heading, .video-teaser__description');
  if (!targets.length) return;

  var LINE_DELAY_S = 0.12;
  var revealed = false;

  // Wraps every word of a text node in a .reveal-word span, leaving
  // sibling elements (e.g. <br>, <strong>) untouched — a TreeWalker over
  // TEXT nodes only visits the text, so existing markup/line-breaks and
  // bold spans survive exactly as authored.
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

  targets.forEach(wrapWords);
  var words = section.querySelectorAll('.reveal-word');

  // Groups words by their rendered line (shared offsetTop) — measured at
  // runtime so the grouping is correct at whatever width/wrap the current
  // breakpoint produces, not hard-coded to one specific line break.
  function assignLineDelays() {
    var lineTops = [];
    words.forEach(function (word) {
      var top = word.offsetTop;
      var lineIndex = lineTops.indexOf(top);
      if (lineIndex === -1) {
        lineTops.push(top);
        lineIndex = lineTops.length - 1;
      }
      word.style.setProperty('--reveal-delay', (lineIndex * LINE_DELAY_S) + 's');
    });
  }

  assignLineDelays();

  var resizeTimer;
  window.addEventListener('resize', function () {
    if (revealed) return; // already shown — regrouping now would only matter for the hidden state
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(assignLineDelays, 150);
  });

  if (!('IntersectionObserver' in window)) {
    section.classList.add('video-teaser--revealed');
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealed = true;
          section.classList.add('video-teaser--revealed');
          obs.unobserve(section);
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(section);
})();
