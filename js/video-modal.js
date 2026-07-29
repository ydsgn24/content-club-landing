(function () {
  var openBtn = document.querySelector('.video-teaser__watch');
  var modal = document.getElementById('video-modal');
  var video = document.getElementById('video-modal-player');
  var closeBtn = modal ? modal.querySelector('[data-close-modal]') : null;

  if (!openBtn || !modal || !video || !closeBtn) return;

  openBtn.addEventListener('click', function () {
    modal.showModal();
    video.play();
  });

  closeBtn.addEventListener('click', function () {
    modal.close();
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.close();
    }
  });

  modal.addEventListener('close', function () {
    video.pause();
    video.currentTime = 0;
  });
})();
