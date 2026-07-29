(function () {
  var section = document.querySelector('.pricing');
  if (!section) return;

  var textTargets = Array.prototype.slice.call(
    section.querySelectorAll('.pricing__heading, .pricing__note, .pricing__disclaimer')
  );

  var LINE_DELAY_S = 0.1;

  // Same word-wrapping approach as the rest of the site's reveal scripts:
  // walk TEXT nodes only, so surrounding markup (<br>, <strong>) survives.
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

  // Each target (heading, note, disclaimer) line-groups independently.
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

  var headerRevealed = false;
  var resizeTimer;
  window.addEventListener('resize', function () {
    if (headerRevealed) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(assignLineDelays, 150);
  });

  var heading = section.querySelector('.pricing__heading');
  var disclaimer = section.querySelector('.pricing__disclaimer');

  function revealHeader() {
    headerRevealed = true;
    section.classList.add('is-revealed');
  }

  function revealDisclaimer() {
    if (disclaimer) disclaimer.classList.add('is-revealed');
  }

  var cards = Array.prototype.slice.call(section.querySelectorAll('.pricing__card'));

  if (!('IntersectionObserver' in window)) {
    revealHeader();
    revealDisclaimer();
    cards.forEach(function (card) {
      card.classList.add('reveal-card--visible');
    });
    return;
  }

  // Heading + note reveal together, once near the top of the section.
  if (heading) {
    var headerObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealHeader();
            obs.unobserve(heading);
          }
        });
      },
      { threshold: 0.4 }
    );
    headerObserver.observe(heading);
  } else {
    revealHeader();
  }

  // Disclaimer text reveals on its own, since it's well below the cards.
  if (disclaimer) {
    var disclaimerObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealDisclaimer();
            obs.unobserve(disclaimer);
          }
        });
      },
      { threshold: 0.4 }
    );
    disclaimerObserver.observe(disclaimer);
  }

  // Cards fade/rise in individually as each one scrolls into view — same
  // mechanism as the club-contents cards.
  if (cards.length) {
    var cardObserver = new IntersectionObserver(
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
    cards.forEach(function (card) {
      cardObserver.observe(card);
    });
  }
})();
