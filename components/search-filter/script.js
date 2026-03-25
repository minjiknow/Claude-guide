/* ===== SEARCH FILTER COMPONENT ===== */

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

  function setDefaultDateValues(root) {
    var dateFrom = root.querySelector('#dateFrom');
    var dateTo = root.querySelector('#dateTo');
    if (!dateFrom || !dateTo) return;

    var dates = defaultDates();
    dateFrom.value = fmtDate(dates.from);
    dateTo.value = fmtDate(dates.to);
  }

  function initDatepickers(root) {
    var dateFrom = root.querySelector('#dateFrom');
    var dateTo = root.querySelector('#dateTo');
    if (!dateFrom || !dateTo || dateFrom.dataset.bound === 'true') return;

    dateFrom.dataset.bound = 'true';
    dateTo.dataset.bound = 'true';

    setDefaultDateValues(root);

    if (typeof AirDatepicker === 'undefined') return;

    var dates = defaultDates();
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
      var triggerFrom = fromIcon.querySelector('.datepickerIcon');
      if (triggerFrom) triggerFrom.addEventListener('click', function () { fromPicker.show(); });
    }
    dateFrom.addEventListener('click', function () { fromPicker.show(); });
    dateFrom.addEventListener('focus', function () { fromPicker.show(); });

    var toIcon = dateTo.closest('.datepickerWrap');
    if (toIcon) {
      var triggerTo = toIcon.querySelector('.datepickerIcon');
      if (triggerTo) triggerTo.addEventListener('click', function () { toPicker.show(); });
    }
    dateTo.addEventListener('click', function () { toPicker.show(); });
    dateTo.addEventListener('focus', function () { toPicker.show(); });
  }

  function adjustTimeInput(input, delta) {
    var max = input.id.endsWith('H') ? 23 : 59;
    var value = parseInt(input.value, 10);
    if (isNaN(value)) value = 0;
    value += delta;
    if (value < 0) value = max;
    if (value > max) value = 0;
    input.value = String(value).padStart(2, '0');
  }

  function clampTimeInput(input) {
    var max = input.id.endsWith('H') ? 23 : 59;
    var value = parseInt(input.value, 10);
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(max, value));
    input.value = String(value).padStart(2, '0');
  }

  function initTimepickers(root) {
    root.querySelectorAll('.timepickerWrap').forEach(function (wrap) {
      if (wrap.dataset.bound === 'true') return;
      wrap.dataset.bound = 'true';

      var displayInput = wrap.querySelector('.timeInput');
      var panel = wrap.querySelector('.timepickerPanel');
      if (!displayInput || !panel) return;

      function updateDisplay() {
        var h = wrap.querySelector('[id$="H"]');
        var m = wrap.querySelector('[id$="M"]');
        if (h && m) displayInput.value = h.value.padStart(2, '0') + ':' + m.value.padStart(2, '0');
      }

      function togglePanel(e) {
        e.stopPropagation();
        var isOpen = wrap.classList.contains('is-open');
        root.querySelectorAll('.timepickerWrap.is-open').forEach(function (el) {
          el.classList.remove('is-open');
        });
        if (!isOpen) wrap.classList.add('is-open');
      }

      displayInput.addEventListener('click', togglePanel);
      var icon = wrap.querySelector('.timepickerIcon');
      if (icon) icon.addEventListener('click', togglePanel);

      panel.querySelectorAll('.tpickerBtn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var target = wrap.querySelector('#' + btn.dataset.target);
          if (!target) return;
          adjustTimeInput(target, btn.dataset.action === 'up' ? 1 : -1);
          updateDisplay();
        });
      });

      panel.querySelectorAll('.tpickerVal').forEach(function (input) {
        input.addEventListener('change', function () {
          clampTimeInput(input);
          updateDisplay();
        });
      });

      updateDisplay();
    });

    document.addEventListener('click', function () {
      root.querySelectorAll('.timepickerWrap.is-open').forEach(function (wrap) {
        wrap.classList.remove('is-open');
      });
    });
  }

  function resetDropboxes(root) {
    root.querySelectorAll('[data-component="dropbox"]').forEach(function (el) {
      if (el._dropboxInstance) el._dropboxInstance.reset();
    });
  }

  function bindFallbackDropbox(el) {
    if (el.dataset.dropboxFallbackBound === 'true') return;
    el.dataset.dropboxFallbackBound = 'true';

    var isMulti = el.dataset.multi === 'true';
    var trigger = el.querySelector('.selected-text');
    var optionList = el.querySelector('.dropbox-option');
    var items = Array.prototype.slice.call(el.querySelectorAll('.dropbox-option li'));
    var placeholder = trigger ? trigger.textContent.trim() : '선택';
    var selected = [];

    function open() {
      el.classList.add('active');
      if (optionList) optionList.classList.add('active');
      var combo = el.closest('.inputCombo');
      if (combo) combo.classList.add('is-dropbox-open');
    }

    function close() {
      el.classList.remove('active');
      if (optionList) optionList.classList.remove('active');
      var combo = el.closest('.inputCombo');
      if (combo) combo.classList.remove('is-dropbox-open');
    }

    function updateDisplay() {
      if (!trigger) return;
      if (!selected.length) {
        trigger.textContent = placeholder;
        el.classList.remove('has-value');
        return;
      }

      trigger.textContent = selected.map(function (item) { return item.text; }).join(', ');
      el.classList.add('has-value');
    }

    function getItemData(item) {
      var textNode = item.querySelector('.option-text');
      var text = textNode ? textNode.textContent.trim() : '';
      var value = item.dataset.value !== undefined ? item.dataset.value : text;
      return { value: value, text: text };
    }

    el.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = el.classList.contains('active');
      root.querySelectorAll('[data-component="dropbox"].active').forEach(function (activeEl) {
        activeEl.classList.remove('active');
        var activeOptions = activeEl.querySelector('.dropbox-option');
        if (activeOptions) activeOptions.classList.remove('active');
        var combo = activeEl.closest('.inputCombo');
        if (combo) combo.classList.remove('is-dropbox-open');
      });
      if (!isOpen) open();
    });

    items.forEach(function (item) {
      item.addEventListener('click', function (event) {
        event.stopPropagation();
        var data = getItemData(item);

        if (isMulti) {
          var index = selected.findIndex(function (entry) {
            return entry.value === data.value;
          });

          if (index > -1) {
            selected.splice(index, 1);
            item.classList.remove('selected');
          } else {
            selected.push(data);
            item.classList.add('selected');
          }

          updateDisplay();
          return;
        }

        items.forEach(function (entry) { entry.classList.remove('selected'); });
        item.classList.add('selected');
        selected = [data];
        updateDisplay();
        close();
      });
    });

    el._dropboxInstance = {
      reset: function () {
        selected = [];
        items.forEach(function (item) { item.classList.remove('selected'); });
        updateDisplay();
        close();
      }
    };
  }

  function ensureDropboxes(root) {
    root.querySelectorAll('[data-component="dropbox"]').forEach(function (el) {
      if (el._dropboxInstance) return;

      if (window.Dropbox) {
        el._dropboxInstance = new window.Dropbox(el);
        return;
      }

      bindFallbackDropbox(el);
    });

    if (!document.body.dataset.searchFilterDropboxFallbackBound) {
      document.body.dataset.searchFilterDropboxFallbackBound = 'true';
      document.addEventListener('click', function () {
        document.querySelectorAll('[data-component="dropbox"].active').forEach(function (el) {
          el.classList.remove('active');
          var optionList = el.querySelector('.dropbox-option');
          if (optionList) optionList.classList.remove('active');
          var combo = el.closest('.inputCombo');
          if (combo) combo.classList.remove('is-dropbox-open');
        });
      });
    }
  }

  function collectFilters(root) {
    var filterText1 = root.querySelector('#filterText1');
    var filterText2 = root.querySelector('#filterText2');

    return {
      agent: filterText1 ? filterText1.value.trim() : '',
      keyword: filterText2 ? filterText2.value.trim() : ''
    };
  }

  function dispatchSearch(root) {
    document.dispatchEvent(new CustomEvent('search-filter:submit', {
      detail: collectFilters(root)
    }));
  }

  function resetFilter(root, silent) {
    var filterText1 = root.querySelector('#filterText1');
    var filterText2 = root.querySelector('#filterText2');
    var timeFromVal = root.querySelector('#timeFromVal');
    var timeToVal = root.querySelector('#timeToVal');
    var timeFromH = root.querySelector('#timeFromH');
    var timeFromM = root.querySelector('#timeFromM');
    var timeToH = root.querySelector('#timeToH');
    var timeToM = root.querySelector('#timeToM');

    if (filterText1) filterText1.value = '';
    if (filterText2) filterText2.value = '';
    if (timeFromH) timeFromH.value = '00';
    if (timeFromM) timeFromM.value = '00';
    if (timeToH) timeToH.value = '23';
    if (timeToM) timeToM.value = '59';
    if (timeFromVal) timeFromVal.value = '00:00';
    if (timeToVal) timeToVal.value = '23:59';

    root.querySelectorAll('input[type="radio"]').forEach(function (input) {
      input.checked = input.defaultChecked;
    });

    setDefaultDateValues(root);

    var dateFrom = root.querySelector('#dateFrom');
    var dateTo = root.querySelector('#dateTo');
    if (dateFrom && dateFrom._airPicker) {
      dateFrom._airPicker.clear();
      dateFrom._airPicker.selectDate(defaultDates().from);
    }
    if (dateTo && dateTo._airPicker) {
      dateTo._airPicker.clear();
      dateTo._airPicker.selectDate(defaultDates().to);
    }

    resetDropboxes(root);

    if (!silent) {
      document.dispatchEvent(new CustomEvent('search-filter:reset'));
    }
  }

  function initSearchFilter(root) {
    if (!root || root.dataset.searchFilterBound === 'true') return;
    root.dataset.searchFilterBound = 'true';

    ensureDropboxes(root);
    initDatepickers(root);
    initTimepickers(root);

    var searchBtn = root.querySelector('#searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', function () {
      dispatchSearch(root);
    });

    root.querySelectorAll('.filterSearchBtn').forEach(function (button) {
      button.addEventListener('click', function () {
        dispatchSearch(root);
      });
    });

    var dropboxSearchBtn = root.querySelector('#dropboxSearchBtn');
    if (dropboxSearchBtn) dropboxSearchBtn.addEventListener('click', function () {
      dispatchSearch(root);
    });

    var resetBtn = root.querySelector('#resetBtn');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      resetFilter(root, false);
    });

    var dropboxResetBtn = root.querySelector('#dropboxResetBtn');
    if (dropboxResetBtn) dropboxResetBtn.addEventListener('click', function () {
      resetFilter(root, false);
    });

    ['#filterText1', '#filterText2'].forEach(function (selector) {
      var input = root.querySelector(selector);
      if (!input) return;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') dispatchSearch(root);
      });
    });

    document.addEventListener('search-filter:reset-request', function () {
      resetFilter(root, false);
    });

    resetFilter(root, true);
  }

  function initAll() {
    document.querySelectorAll('.searchCard').forEach(initSearchFilter);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.SearchFilter = {
    initAll: initAll
  };
})();
