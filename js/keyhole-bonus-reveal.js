(function () {
  var section = document.querySelector('.keyhole-bonus');
  if (!section) return;

  var textTargets = Array.prototype.slice.call(
    section.querySelectorAll('.keyhole-bonus__title, .keyhole-bonus__subtitle, .keyhole-bonus__text')
  );
  if (!textTargets.length) return;

  // Text only starts revealing once the keyhole mask is mostly open (same
  // moment the old single opacity fade used to kick in), then each line
  // staggers on top of that base delay — baked into --reveal-delay itself
  // since .reveal-word's own transition-delay has no separate base offset.
  var BASE_DELAY_S = 0.55;
  var LINE_DELAY_S = 0.1;

  // Same word-wrapping approach as the rest of the site's reveal scripts:
  // walk TEXT nodes only, so surrounding markup (<br>, the badge <img>)
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

  // Each target (title, subtitle, text) line-groups independently.
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
        word.style.setProperty('--reveal-delay', (BASE_DELAY_S + lineIndex * LINE_DELAY_S) + 's');
      });
    });
  }

  assignLineDelays();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(assignLineDelays, 150);
  });
})();
