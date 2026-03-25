(function () {
  'use strict';

  var koLocale = {
    days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    daysShort: ['일', '월', '화', '수', '목', '금', '토'],
    daysMin: ['일', '월', '화', '수', '목', '금', '토'],
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    today: '오늘',
    clear: '초기화',
    dateFormat: 'yyyy-MM-dd',
    timeFormat: 'HH:mm',
    firstDay: 0
  };

  function formatDate(date) {
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  function defaultDates() {
    var today = new Date();
    var from = new Date(today);
    from.setDate(today.getDate() - 30);
    return { from: from, to: today };
  }

  function initDatepickers() {
    var dateFrom = document.getElementById('dateFrom');
    var dateTo = document.getElementById('dateTo');
    if (!dateFrom || !dateTo) return;

    var dates = defaultDates();
    dateFrom.value = formatDate(dates.from);
    dateTo.value = formatDate(dates.to);

    if (typeof AirDatepicker === 'undefined') return;

    var fromPicker = new AirDatepicker(dateFrom, {
      locale: koLocale,
      dateFormat: 'yyyy-MM-dd',
      startDate: dates.from,
      autoClose: true,
      buttons: [
        { content: '오늘', onClick: function (dp) { dp.selectDate(new Date()); } },
        'clear'
      ]
    });

    var toPicker = new AirDatepicker(dateTo, {
      locale: koLocale,
      dateFormat: 'yyyy-MM-dd',
      startDate: dates.to,
      minDate: dates.from,
      autoClose: true,
      buttons: [
        { content: '오늘', onClick: function (dp) { dp.selectDate(new Date()); } },
        'clear'
      ]
    });

    dateFrom._airPicker = fromPicker;
    dateTo._airPicker = toPicker;

    var fromIcon = dateFrom.closest('.datepickerWrap');
    if (fromIcon) {
      var fromTrigger = fromIcon.querySelector('.datepickerIcon');
      if (fromTrigger) fromTrigger.addEventListener('click', function () { fromPicker.show(); });
    }
    dateFrom.addEventListener('click', function () { fromPicker.show(); });
    dateFrom.addEventListener('focus', function () { fromPicker.show(); });

    var toIcon = dateTo.closest('.datepickerWrap');
    if (toIcon) {
      var toTrigger = toIcon.querySelector('.datepickerIcon');
      if (toTrigger) toTrigger.addEventListener('click', function () { toPicker.show(); });
    }
    dateTo.addEventListener('click', function () { toPicker.show(); });
    dateTo.addEventListener('focus', function () { toPicker.show(); });
  }

  function adjustInput(input, delta) {
    var max = input.id.endsWith('H') ? 23 : 59;
    var value = parseInt(input.value, 10);
    if (isNaN(value)) value = 0;
    value += delta;
    if (value < 0) value = max;
    if (value > max) value = 0;
    input.value = String(value).padStart(2, '0');
  }

  function clampInput(input) {
    var max = input.id.endsWith('H') ? 23 : 59;
    var value = parseInt(input.value, 10);
    if (isNaN(value)) value = 0;
    input.value = String(Math.max(0, Math.min(max, value))).padStart(2, '0');
  }

  function initTimepickers() {
    document.querySelectorAll('.timepickerWrap').forEach(function (wrap) {
      if (wrap.dataset.bound === 'true') return;
      wrap.dataset.bound = 'true';

      var displayInput = wrap.querySelector('.timeInput');
      var panel = wrap.querySelector('.timepickerPanel');
      if (!displayInput || !panel) return;

      function updateDisplay() {
        var hours = wrap.querySelector('[id$="H"]');
        var minutes = wrap.querySelector('[id$="M"]');
        if (hours && minutes) {
          displayInput.value = hours.value.padStart(2, '0') + ':' + minutes.value.padStart(2, '0');
        }
      }

      function togglePanel(event) {
        event.stopPropagation();
        var isOpen = wrap.classList.contains('is-open');
        document.querySelectorAll('.timepickerWrap.is-open').forEach(function (item) {
          item.classList.remove('is-open');
        });
        if (!isOpen) wrap.classList.add('is-open');
      }

      displayInput.addEventListener('click', togglePanel);

      var icon = wrap.querySelector('.timepickerIcon');
      if (icon) icon.addEventListener('click', togglePanel);

      panel.querySelectorAll('.tpickerBtn').forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          var target = wrap.querySelector('#' + button.dataset.target);
          if (!target) return;
          adjustInput(target, button.dataset.action === 'up' ? 1 : -1);
          updateDisplay();
        });
      });

      panel.querySelectorAll('.tpickerVal').forEach(function (input) {
        input.addEventListener('change', function () {
          clampInput(input);
          updateDisplay();
        });
      });

      updateDisplay();
    });

    document.addEventListener('click', function () {
      document.querySelectorAll('.timepickerWrap.is-open').forEach(function (wrap) {
        wrap.classList.remove('is-open');
      });
    });
  }

  function init() {
    initDatepickers();
    initTimepickers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
