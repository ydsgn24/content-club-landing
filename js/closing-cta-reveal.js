(function () {
  var section = document.querySelector('.closing-cta');
  if (!section) return;

  var textTargets = Array.prototype.slice.call(
    section.querySelectorAll(
      '.closing-cta__heading, .closing-cta__text, .closing-cta__heading2, .closing-cta__ps'
    )
  );

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
        word.style.setProperty('--reveal-delay', (lineIndex * 0.1) + 's');
      });
    });
  }

  assignLineDelays();

  var textRevealed = false;
  var resizeTimer;
  window.addEventListener('resize', function () {
    if (textRevealed) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(assignLineDelays, 150);
  });

  function revealText() {
    textRevealed = true;
    section.classList.add('is-revealed');
  }

  var fadeTargets = Array.prototype.slice.call(
    section.querySelectorAll('.closing-cta__angel, .closing-cta__collage, .closing-cta__cta')
  );
  // Lives in <footer class="site-footer">, a sibling of .closing-cta, not a
  // descendant — the navy hands band doubles as the page footer now.
  var hands = document.querySelector('.site-footer__hands');

  if (!('IntersectionObserver' in window)) {
    revealText();
    fadeTargets.forEach(function (el) {
      el.classList.add('is-revealed');
    });
    if (hands) hands.classList.add('site-footer__hands--visible');
    return;
  }

  var headings = Array.prototype.slice.call(section.querySelectorAll('.closing-cta__heading'));
  var textObserver = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealText();
          headings.forEach(function (h) {
            obs.unobserve(h);
          });
        }
      });
    },
    { threshold: 0.3 }
  );
  headings.forEach(function (h) {
    textObserver.observe(h);
  });

  var fadeObserver = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  fadeTargets.forEach(function (el) {
    fadeObserver.observe(el);
  });

  if (hands) {
    var handsObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            hands.classList.add('site-footer__hands--visible');
            obs.unobserve(hands);
          }
        });
      },
      { threshold: 0.3 }
    );
    handsObserver.observe(hands);
  }
})();
