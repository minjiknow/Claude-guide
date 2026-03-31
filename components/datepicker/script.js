/* ===== DATEPICKER / TIMEPICKER COMPONENT ===== */

(function ($) {
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

  function fmtDate(date) {
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

  function setDefaultDateValues($root) {
    var dates = defaultDates();
    $root.find('#dateFrom').val(fmtDate(dates.from));
    $root.find('#dateTo').val(fmtDate(dates.to));
  }

  function initDatepickers($root) {
    var $dateFrom = $root.find('#dateFrom');
    var $dateTo = $root.find('#dateTo');
    if (!$dateFrom.length || !$dateTo.length || $dateFrom.data('bound')) return;

    $dateFrom.data('bound', true);
    $dateTo.data('bound', true);

    setDefaultDateValues($root);

    if (typeof AirDatepicker === 'undefined') return;

    var dates = defaultDates();

    var fromPicker = new AirDatepicker($dateFrom[0], {
      locale: koLocale,
      dateFormat: 'yyyy-MM-dd',
      startDate: dates.from,
      autoClose: true,
      buttons: [
        { content: '오늘', onClick: function (dp) { dp.selectDate(new Date()); } },
        'clear'
      ]
    });

    var toPicker = new AirDatepicker($dateTo[0], {
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

    $dateFrom.data('airPicker', fromPicker);
    $dateTo.data('airPicker', toPicker);

    // 키보드 직접 입력 차단 (readonly 대신 JS로 처리)
    $dateFrom.add($dateTo).on('keydown', function (e) { e.preventDefault(); });

    $dateFrom.closest('.datepickerWrap').find('.datepickerIcon').on('click', function () { fromPicker.show(); });
    $dateFrom.on('click focus', function () { fromPicker.show(); });

    $dateTo.closest('.datepickerWrap').find('.datepickerIcon').on('click', function () { toPicker.show(); });
    $dateTo.on('click focus', function () { toPicker.show(); });
  }

  function adjustTimeInput($input, delta) {
    var max = $input.attr('id').slice(-1) === 'H' ? 23 : 59;
    var value = parseInt($input.val(), 10);
    if (isNaN(value)) value = 0;
    value += delta;
    if (value < 0) value = max;
    if (value > max) value = 0;
    $input.val(String(value).padStart(2, '0'));
  }

  function clampTimeInput($input) {
    var max = $input.attr('id').slice(-1) === 'H' ? 23 : 59;
    var value = parseInt($input.val(), 10);
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(max, value));
    $input.val(String(value).padStart(2, '0'));
  }

  function initTimepickers($root) {
    $root.find('.timepickerWrap').each(function () {
      var $wrap = $(this);
      if ($wrap.data('bound')) return;
      $wrap.data('bound', true);

      var $displayInput = $wrap.find('.timeInput');
      var $panel = $wrap.find('.timepickerPanel');
      if (!$displayInput.length || !$panel.length) return;

      function updateDisplay() {
        var $h = $wrap.find('[id$="H"]');
        var $m = $wrap.find('[id$="M"]');
        if ($h.length && $m.length) {
          $displayInput.val($h.val().padStart(2, '0') + ':' + $m.val().padStart(2, '0'));
        }
      }

      function togglePanel(e) {
        e.stopPropagation();
        var isOpen = $wrap.hasClass('is-open');
        $root.find('.timepickerWrap.is-open').removeClass('is-open');
        if (!isOpen) $wrap.addClass('is-open');
      }

      // 키보드 직접 입력 차단 (readonly 대신 JS로 처리)
      $displayInput.on('keydown', function (e) { e.preventDefault(); });

      $displayInput.on('click', togglePanel);
      $wrap.find('.timepickerIcon').on('click', togglePanel);

      $panel.find('.tpickerBtn').on('click', function (e) {
        e.stopPropagation();
        var $target = $wrap.find('#' + $(this).attr('data-target'));
        if (!$target.length) return;
        adjustTimeInput($target, $(this).attr('data-action') === 'up' ? 1 : -1);
        updateDisplay();
      });

      $panel.find('.tpickerVal').on('change', function () {
        clampTimeInput($(this));
        updateDisplay();
      });

      updateDisplay();
    });

    $(document).on('click', function () {
      $root.find('.timepickerWrap.is-open').removeClass('is-open');
    });
  }

  // 단독 데모 페이지용 초기화
  function init() {
    var $root = $(document.body);
    initDatepickers($root);
    initTimepickers($root);
  }

  $(function () { init(); });

  // 외부(search-filter 등)에서 사용 가능하도록 전역 노출
  window.DatepickerUtil = {
    koLocale: koLocale,
    fmtDate: fmtDate,
    defaultDates: defaultDates,
    setDefaultDateValues: setDefaultDateValues,
    initDatepickers: initDatepickers,
    initTimepickers: initTimepickers
  };
}(jQuery));
