(function () {
  var section = document.querySelector('.founder-intro');
  if (!section) return;

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

  var LINE_DELAY_S = 0.1;

  // Each text target line-groups independently (a quote and its
  // neighbouring paragraph shouldn't have their lines cross-matched just
  // because two words happen to land on the same offsetTop by coincidence).
  function assignLineDelays(targets) {
    targets.forEach(function (target) {
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

  // A "group" is a scroll trigger (usually a container itself) that adds
  // `is-revealed` to a target container once it enters the viewport. The
  // eyebrow group reveals the section-level container (so the same class
  // also drives the sibling logo's handwritten wipe below); the rest
  // reveal themselves. Groups are independent since this section is much
  // taller than one screen — each reveals as it's individually scrolled to.
  function makeGroup(triggerEl, containerEl, textTargets) {
    if (!triggerEl || !containerEl) return null;
    textTargets.forEach(wrapWords);
    return {
      trigger: triggerEl,
      resizeTargets: textTargets,
      reveal: function () {
        containerEl.classList.add('is-revealed');
      }
    };
  }

  var eyebrow = section.querySelector('.founder-intro__eyebrow');
  var block1 = section.querySelector('.founder-intro__block--1');
  var block2 = section.querySelector('.founder-intro__block--2');
  var invite = section.querySelector('.founder-intro__invite');
  var collage = section.querySelector('.founder-intro__collage');

  var groups = [
    makeGroup(eyebrow, section, eyebrow ? [eyebrow] : []),
    makeGroup(
      block1,
      block1,
      block1
        ? Array.prototype.slice.call(
            block1.querySelectorAll('.founder-intro__quote, .founder-intro__paragraph')
          )
        : []
    ),
    makeGroup(
      block2,
      block2,
      block2
        ? Array.prototype.slice.call(
            block2.querySelectorAll('.founder-intro__heading2, .founder-intro__paragraph2')
          )
        : []
    ),
    makeGroup(invite, invite, invite ? [invite] : [])
  ].filter(Boolean);

  var allResizeTargets = [];
  groups.forEach(function (g) {
    allResizeTargets = allResizeTargets.concat(g.resizeTargets);
  });
  assignLineDelays(allResizeTargets);

  var anyRevealed = false;
  var resizeTimer;
  window.addEventListener('resize', function () {
    if (anyRevealed) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      assignLineDelays(allResizeTargets);
    }, 150);
  });

  function revealCollage() {
    if (collage) collage.classList.add('is-revealed');
  }

  if (!('IntersectionObserver' in window)) {
    groups.forEach(function (g) {
      g.reveal();
    });
    revealCollage();
    return;
  }

  var triggerToGroup = new Map();
  groups.forEach(function (g) {
    triggerToGroup.set(g.trigger, g);
  });

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        anyRevealed = true;
        if (entry.target === collage) {
          revealCollage();
        } else {
          var group = triggerToGroup.get(entry.target);
          if (group) group.reveal();
        }
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  groups.forEach(function (g) {
    observer.observe(g.trigger);
  });
  if (collage) observer.observe(collage);
})();
