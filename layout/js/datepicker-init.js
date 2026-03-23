/* ===== DATEPICKER / TIMEPICKER INITIALIZATION ===== */

let _pickersReady = false;
let _dpFrom = null;   /* 전역 참조 — 문서 레벨 핸들러에서 사용 */
let _dpTo   = null;
let _lastOpened = null; /* 마지막으로 열린 picker */

/* ──────────────────────────────────────────────────────────────────
 *  핵심 날짜 선택 핸들러 (document · bubble phase)
 *
 *  ◼ AirDatepicker onClickBody 는 .air-datepicker-body 에서 bubble.
 *    이 핸들러는 그보다 늦게(document 도달 후) 실행되지만,
 *    AirDatepicker 내부에 stopPropagation 이 없으므로 반드시 도달함.
 *
 *  ◼ cellEl.adpCell.date : AirDatepicker 가 렌더링 시 DOM 요소에
 *    직접 설정하는 JS 프로퍼티 → 가장 신뢰할 수 있는 날짜 출처.
 *
 *  ◼ 캡처 phase / mousedown stopPropagation 을 일절 사용하지 않아
 *    기존 AirDatepicker 의 inFocus 추적·blur 처리를 해치지 않음.
 * ────────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  if (!_lastOpened) return;

  var cellEl = e.target.closest('.air-datepicker-cell.-day-');
  if (!cellEl) return;
  if (cellEl.classList.contains('-disabled-')) return;

  /* adpCell.date = AirDatepicker 가 세팅한 Date 객체 (가장 정확) */
  var date;
  if (cellEl.adpCell && cellEl.adpCell.date) {
    date = cellEl.adpCell.date;
  } else {
    /* fallback: HTML 어트리뷰트 파싱 */
    var yr = parseInt(cellEl.getAttribute('data-year'),  10);
    var mo = parseInt(cellEl.getAttribute('data-month'), 10); /* 0-indexed */
    var dt = parseInt(cellEl.getAttribute('data-date'),  10);
    if (isNaN(yr) || isNaN(mo) || isNaN(dt)) return;
    date = new Date(yr, mo, dt);
  }

  _lastOpened.selectDate(date);
}, false /* bubble phase */);

/* ── 한국어 로케일 ── */
var koLocale = {
  days: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  daysShort: ['일','월','화','수','목','금','토'],
  daysMin: ['일','월','화','수','목','금','토'],
  months: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthsShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  today: '오늘',
  clear: '초기화',
  dateFormat: 'yyyy-MM-dd',
  timeFormat: 'HH:mm',
  firstDay: 0
};

/* ── 날짜 포맷 헬퍼 ── */
function fmtDate(d) {
  if (!d) return '';
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function initDatepickers() {
  var fromEl = document.getElementById('dateFrom');
  var toEl   = document.getElementById('dateTo');
  if (!fromEl || !toEl) return;

  if (typeof AirDatepicker === 'undefined') {
    console.warn('AirDatepicker not loaded — plain input fallback');
    var t0 = new Date(), p0 = new Date(t0);
    p0.setDate(t0.getDate() - 30);
    fromEl.value = fmtDate(p0);
    toEl.value   = fmtDate(t0);
    return;
  }

  var today    = new Date();
  var dateFrom = new Date(today);
  dateFrom.setDate(today.getDate() - 30);

  try {
    _dpFrom = new AirDatepicker(fromEl, {
      locale:         koLocale,
      dateFormat:     'yyyy-MM-dd',
      selectedDates:  [dateFrom],
      autoClose:      true,
      toggleSelected: false,
      onShow: function () {
        _lastOpened = _dpFrom;
        fromEl.focus(); /* input 에 focus → 외부 클릭 시 blur → 자동 닫힘 */
      },
      onSelect: function (info) {
        var val = Array.isArray(info.formattedDate)
          ? (info.formattedDate[0] || '') : (info.formattedDate || '');
        fromEl.value = val;
        var d = Array.isArray(info.date) ? info.date[0] : info.date;
        if (d) setTimeout(function () { if (_dpTo) _dpTo.update({ minDate: d }); }, 0);
      },
      buttons: [
        { content: '오늘', onClick: function (dp) { dp.selectDate(new Date()); dp.hide(); } },
        'clear'
      ]
    });

    _dpTo = new AirDatepicker(toEl, {
      locale:         koLocale,
      dateFormat:     'yyyy-MM-dd',
      selectedDates:  [today],
      minDate:        dateFrom,
      autoClose:      true,
      toggleSelected: false,
      onShow: function () {
        _lastOpened = _dpTo;
        toEl.focus();
      },
      onSelect: function (info) {
        var val = Array.isArray(info.formattedDate)
          ? (info.formattedDate[0] || '') : (info.formattedDate || '');
        toEl.value = val;
        var d = Array.isArray(info.date) ? info.date[0] : info.date;
        if (d) setTimeout(function () { if (_dpFrom) _dpFrom.update({ maxDate: d }); }, 0);
      },
      buttons: [
        { content: '오늘', onClick: function (dp) { dp.selectDate(new Date()); dp.hide(); } },
        'clear'
      ]
    });

    /* 초기값 보장 */
    fromEl.value = fmtDate(dateFrom);
    toEl.value   = fmtDate(today);

    /* 아이콘 · input 클릭 → 달력 열기 */
    var fromWrap = fromEl.closest('.datepicker-input-wrap');
    if (fromWrap) {
      var fromIcon = fromWrap.querySelector('.datepicker-icon');
      if (fromIcon) fromIcon.addEventListener('click', function () { _dpFrom.show(); });
    }
    fromEl.addEventListener('click', function () { _dpFrom.show(); });

    var toWrap = toEl.closest('.datepicker-input-wrap');
    if (toWrap) {
      var toIcon = toWrap.querySelector('.datepicker-icon');
      if (toIcon) toIcon.addEventListener('click', function () { _dpTo.show(); });
    }
    toEl.addEventListener('click', function () { _dpTo.show(); });

  } catch (err) {
    console.error('DatePicker init error:', err);
  }
}

/* ── Timepicker ── */
function initTimeSpinners() {
  document.querySelectorAll('.timepicker-wrap').forEach(function (wrap) {
    var displayInput = wrap.querySelector('.input--time');
    var panel        = wrap.querySelector('.timepicker-panel');
    if (!displayInput || !panel) return;

    function updateDisplay() {
      var h = wrap.querySelector('[id$="H"]');
      var m = wrap.querySelector('[id$="M"]');
      if (h && m) {
        displayInput.value = h.value.padStart(2, '0') + ':' + m.value.padStart(2, '0');
      }
    }

    function togglePanel(e) {
      e.stopPropagation();
      var isOpen = wrap.classList.contains('open');
      document.querySelectorAll('.timepicker-wrap.open').forEach(function (w) { w.classList.remove('open'); });
      if (!isOpen) wrap.classList.add('open');
    }

    displayInput.addEventListener('click', togglePanel);
    var icon = wrap.querySelector('.timepicker-icon');
    if (icon) icon.addEventListener('click', togglePanel);

    panel.querySelectorAll('.tpicker-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var target = document.getElementById(btn.dataset.target);
        if (target) {
          adjustTimeInput(target, btn.dataset.action === 'up' ? 1 : -1);
          updateDisplay();
        }
      });
    });

    panel.querySelectorAll('.tpicker-val').forEach(function (input) {
      input.addEventListener('change', function () {
        clampInput(input, 0, input.id.endsWith('H') ? 23 : 59);
        updateDisplay();
      });
      input.addEventListener('focus', function () { input.select(); });
      input.addEventListener('wheel', function (e) {
        e.preventDefault();
        adjustTimeInput(input, e.deltaY < 0 ? 1 : -1);
        updateDisplay();
      }, { passive: false });
    });

    updateDisplay();
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.timepicker-wrap.open').forEach(function (w) { w.classList.remove('open'); });
  });
}

function adjustTimeInput(input, delta) {
  if (!input) return;
  var max = input.id.endsWith('H') ? 23 : 59;
  var val = parseInt(input.value, 10) + delta;
  if (val < 0) val = max;
  if (val > max) val = 0;
  input.value = String(val).padStart(2, '0');
}

function clampInput(input, min, max) {
  var val = parseInt(input.value, 10);
  if (isNaN(val)) val = min;
  input.value = String(Math.max(min, Math.min(max, val))).padStart(2, '0');
}

/* ── Login Timer ── */
function initLoginTimer() {
  var el = document.getElementById('loginTimer');
  if (!el) return;
  var total = 99 * 60 + 59;
  var tick = setInterval(function () {
    if (total <= 0) { clearInterval(tick); el.textContent = '00:00'; return; }
    total--;
    el.textContent = String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
  }, 1000);
  var btn = el.closest('.gnb__login-extend');
  if (btn) btn.addEventListener('click', function () { total = 99 * 60 + 59; });
}

/* ── 진입점 ── */
function onPickersReady() {
  if (_pickersReady) return;
  if (!document.getElementById('dateFrom')) return;
  _pickersReady = true;
  initDatepickers();
  initTimeSpinners();
  initLoginTimer();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onPickersReady);
} else {
  onPickersReady();
}
