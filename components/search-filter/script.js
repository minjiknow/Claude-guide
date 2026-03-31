/* ===== SEARCH FILTER COMPONENT ===== */

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

  function resetDropboxes($root) {
    $root.find('[data-component="dropbox"]').each(function () {
      var inst = $.data(this, 'dropboxInstance');
      if (inst) inst.reset();
    });
  }

  function bindFallbackDropbox(el) {
    var $el = $(el);
    if ($el.data('dropboxFallbackBound')) return;
    $el.data('dropboxFallbackBound', true);

    var isMulti = $el.attr('data-multi') === 'true';
    var $trigger = $el.find('.selected-text');
    var $optionList = $el.find('.dropbox-option');
    var $items = $el.find('.dropbox-option li');
    var placeholder = $trigger.text().trim() || '선택';
    var selected = [];

    function open() {
      $el.removeClass('is-up');
      $el.addClass('active');
      $optionList.addClass('active');
      $el.closest('.inputCombo').addClass('is-dropbox-open');

      var rect = $optionList[0].getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        $el.addClass('is-up');
      }
    }

    function close() {
      $el.removeClass('active is-up');
      $optionList.removeClass('active');
      $el.closest('.inputCombo').removeClass('is-dropbox-open');
    }

    function updateDisplay() {
      if (!selected.length) {
        $trigger.text(placeholder);
        $el.removeClass('has-value');
      } else {
        $trigger.text($.map(selected, function (item) { return item.text; }).join(', '));
        $el.addClass('has-value');
      }
    }

    $el.on('click', function (e) {
      e.stopPropagation();
      if ($el.hasClass('is-disabled')) return;
      var isOpen = $el.hasClass('active');
      $el.closest('.searchCard').find('[data-component="dropbox"].active').each(function () {
        $(this).removeClass('active');
        $(this).find('.dropbox-option').removeClass('active');
        $(this).closest('.inputCombo').removeClass('is-dropbox-open');
      });
      if (!isOpen) open();
    });

    $items.on('click', function (e) {
      e.stopPropagation();
      var $item = $(this);
      var text = $item.find('.option-text').text().trim();
      var value = $item.attr('data-value') !== undefined ? $item.attr('data-value') : text;
      var data = { value: value, text: text };

      if (isMulti) {
        var index = -1;
        $.each(selected, function (i, entry) {
          if (entry.value === data.value) { index = i; return false; }
        });
        if (index > -1) {
          selected.splice(index, 1);
          $item.removeClass('selected');
        } else {
          selected.push(data);
          $item.addClass('selected');
        }
        updateDisplay();
        return;
      }

      $items.removeClass('selected');
      $item.addClass('selected');
      selected = [data];
      updateDisplay();
      close();
    });

    $.data(el, 'dropboxInstance', {
      reset: function () {
        selected = [];
        $items.removeClass('selected');
        updateDisplay();
        close();
      }
    });
  }

  function ensureDropboxes($root) {
    $root.find('[data-component="dropbox"]').each(function () {
      if ($.data(this, 'dropboxInstance')) return;

      if (window.Dropbox) {
        $.data(this, 'dropboxInstance', new window.Dropbox(this));
        return;
      }

      bindFallbackDropbox(this);
    });

    if (!$('body').data('searchFilterDropboxFallbackBound')) {
      $('body').data('searchFilterDropboxFallbackBound', true);
      $(document).on('click', function () {
        $('[data-component="dropbox"].active').each(function () {
          $(this).removeClass('active');
          $(this).find('.dropbox-option').removeClass('active');
          $(this).closest('.inputCombo').removeClass('is-dropbox-open');
        });
      });
    }
  }

  function collectFilters($root) {
    return {
      agent: $root.find('#filterText1').val().trim(),
      keyword: $root.find('#filterText2').val().trim()
    };
  }

  function dispatchSearch($root) {
    $(document).trigger('search-filter:submit', [collectFilters($root)]);
  }

  function resetFilter($root, silent) {
    $root.find('#filterText1').val('');
    $root.find('#filterText2').val('');

    $root.find('#timeFromH').val('00');
    $root.find('#timeFromM').val('00');
    $root.find('#timeToH').val('23');
    $root.find('#timeToM').val('59');
    $root.find('#timeFromVal').val('00:00');
    $root.find('#timeToVal').val('23:59');

    $root.find('input[type="radio"]').each(function () {
      $(this).prop('checked', this.defaultChecked);
    });

    setDefaultDateValues($root);

    var fromPicker = $root.find('#dateFrom').data('airPicker');
    var toPicker = $root.find('#dateTo').data('airPicker');
    if (fromPicker) { fromPicker.clear(); fromPicker.selectDate(defaultDates().from); }
    if (toPicker) { toPicker.clear(); toPicker.selectDate(defaultDates().to); }

    resetDropboxes($root);

    if (!silent) {
      $(document).trigger('search-filter:reset');
    }
  }

  function initSearchFilter(el) {
    var $root = $(el);
    if ($root.data('searchFilterBound')) return;
    $root.data('searchFilterBound', true);

    ensureDropboxes($root);
    initDatepickers($root);
    initTimepickers($root);

    $root.find('#searchBtn').on('click', function () { dispatchSearch($root); });
    $root.find('.filterSearchBtn').on('click', function () { dispatchSearch($root); });
    $root.find('#dropboxSearchBtn').on('click', function () { dispatchSearch($root); });
    $root.find('#resetBtn').on('click', function () { resetFilter($root, false); });
    $root.find('#dropboxResetBtn').on('click', function () { resetFilter($root, false); });

    $root.find('#filterText1, #filterText2').on('keydown', function (e) {
      if (e.key === 'Enter') dispatchSearch($root);
    });

    $(document).on('search-filter:reset-request', function () {
      resetFilter($root, false);
    });

    resetFilter($root, true);
  }

  function initAll() {
    $('.searchCard').each(function () { initSearchFilter(this); });
  }

  $(function () { initAll(); });

  window.SearchFilter = {
    initAll: initAll
  };
}(jQuery));
