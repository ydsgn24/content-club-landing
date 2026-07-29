(function () {
  var openBtns = Array.prototype.slice.call(document.querySelectorAll('[data-open-tariff-modal]'));
  if (!openBtns.length) return;

  openBtns.forEach(function (btn) {
    var modal = document.getElementById('tariff-modal-' + btn.getAttribute('data-open-tariff-modal'));
    if (!modal) return;

    btn.addEventListener('click', function () {
      modal.showModal();
    });
  });

  var modals = Array.prototype.slice.call(document.querySelectorAll('.tariff-modal'));
  modals.forEach(function (modal) {
    var closeBtn = modal.querySelector('[data-close-modal]');
    var form = modal.querySelector('.tariff-modal__form');
    var input = modal.querySelector('.tariff-modal__input');
    var checkboxes = Array.prototype.slice.call(modal.querySelectorAll('.tariff-modal__check input'));
    var submit = modal.querySelector('.tariff-modal__submit');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        modal.close();
      });
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.close();
    });

    // Submit stays disabled until both consent checkboxes are ticked —
    // the Public Offer (п.1.3) requires that active tick before payment,
    // reading the linked text alone isn't enough.
    function syncSubmitState() {
      if (!submit) return;
      submit.disabled = !checkboxes.every(function (c) { return c.checked; });
    }

    checkboxes.forEach(function (c) {
      c.addEventListener('change', syncSubmitState);
    });
    syncSubmitState();

    if (input) {
      input.addEventListener('input', function () {
        input.classList.remove('tariff-modal__input--error');
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (input && !input.checkValidity()) {
          input.classList.add('tariff-modal__input--error');
          input.focus();
          return;
        }

        // Checkboxes gate `submit.disabled` above, so reaching here means
        // the name is filled and both consents are ticked — hand off to
        // this tariff's checkout page (data-checkout-url, one per form).
        var checkoutUrl = form.getAttribute('data-checkout-url');
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      });
    }
  });
})();
