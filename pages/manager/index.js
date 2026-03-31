/* =============================================
   MANAGER PAGE SCRIPT (jQuery 4.0)
   ============================================= */

/* ===== 더미 데이터 설정 ===== */
var DUMMY_CONFIG = {
  showScreen: true   // 화면 버튼 표시 여부 (true: 항상 표시, false: 랜덤)
};

/* ===== DROPBOX (CUSTOM SELECT) COMPONENT ===== */
/* 단일 선택: data-component="dropbox"            */
/* 멀티 선택: data-component="dropbox" data-multi="true" */

(function ($) {
  'use strict';

  // 드롭박스 열기: active 클래스 추가, inputCombo 안에 있으면 is-dropbox-open도 추가
  function _open($el) {
    $el.removeClass('is-up');
    $el.addClass('active');
    $el.find('.dropbox-option').addClass('active');
    $el.closest('.inputCombo').addClass('is-dropbox-open');

    // 뷰포트 아래로 잘리면 위로 열기
    var $option = $el.find('.dropbox-option');
    var rect = $option[0].getBoundingClientRect();
    if (rect.bottom > window.innerHeight) {
      $el.addClass('is-up');
    }
  }

  // 드롭박스 닫기: active 클래스 제거
  function _close($el) {
    $el.removeClass('active is-up');
    $el.find('.dropbox-option').removeClass('active');
    $el.closest('.inputCombo').removeClass('is-dropbox-open');
  }

  // 문서 클릭 시 열린 드롭박스 모두 닫기 (외부 클릭 닫힘)
  $(document).on('click', function () {
    $('[data-component="dropbox"].active').each(function () {
      _close($(this));
    });
  });

  // Dropbox 생성자: el 요소를 받아 단일/멀티 모드 초기화
  function Dropbox(el) {
    this.$el = $(el);
    this.isMulti = this.$el.attr('data-multi') === 'true'; // data-multi="true" 이면 멀티 선택 모드
    this.$trigger = this.$el.find('.selected-text');
    this.$optionList = this.$el.find('.dropbox-option');
    this.$items = this.$el.find('.dropbox-option li');
    this.placeholder = this.$trigger.text().trim() || '선택';
    this._selected = []; // 선택된 항목 배열 { value, text }
    this._bindEvents();
  }

  Dropbox.prototype._bindEvents = function () {
    var self = this;

    // 드롭박스 클릭: is-disabled면 무시, 그 외 다른 드롭박스 닫고 현재 토글
    this.$el.on('click', function (e) {
      e.stopPropagation();
      if (self.$el.hasClass('is-disabled')) return;
      var isOpen = self.$el.hasClass('active');
      $('[data-component="dropbox"].active').each(function () {
        if (this !== self.$el[0]) _close($(this));
      });
      isOpen ? _close(self.$el) : _open(self.$el);
    });

    // 옵션 항목 클릭: 멀티면 토글, 단일이면 선택 후 닫기
    this.$items.on('click', function (e) {
      e.stopPropagation();
      if (self.isMulti) {
        self._toggleItem($(this));
      } else {
        self._selectItem($(this));
        _close(self.$el);
      }
    });
  };

  // 단일 선택: 기존 선택 해제 후 클릭한 항목 selected 처리
  Dropbox.prototype._selectItem = function ($li) {
    this.$items.removeClass('selected');
    $li.addClass('selected');
    var label = $li.find('.option-text').text().trim();
    var value = $li.attr('data-value') !== undefined ? $li.attr('data-value') : label;
    this._selected = [{ value: value, text: label }];
    this._updateDisplay();
  };

  // 멀티 선택: 이미 선택된 항목이면 해제, 아니면 추가
  Dropbox.prototype._toggleItem = function ($li) {
    var label = $li.find('.option-text').text().trim();
    var value = $li.attr('data-value') !== undefined ? $li.attr('data-value') : label;
    var idx = -1;
    $.each(this._selected, function (i, s) {
      if (s.value === value) { idx = i; return false; }
    });
    if (idx > -1) {
      this._selected.splice(idx, 1);
      $li.removeClass('selected');
    } else {
      this._selected.push({ value: value, text: label });
      $li.addClass('selected');
    }
    this._updateDisplay();
  };

  // 선택 표시 업데이트: 선택 없으면 placeholder, 있으면 선택 텍스트 콤마 연결
  Dropbox.prototype._updateDisplay = function () {
    if (!this.$trigger.length) return;
    if (this._selected.length === 0) {
      this.$trigger.text(this.placeholder);
      this.$el.removeClass('has-value');
    } else {
      this.$trigger.text($.map(this._selected, function (s) { return s.text; }).join(', '));
      this.$el.addClass('has-value');
    }
  };

  // getValue: 단일이면 value 문자열, 멀티이면 value 배열 반환
  Dropbox.prototype.getValue = function () {
    if (this.isMulti) return $.map(this._selected, function (s) { return s.value; });
    return this._selected.length ? this._selected[0].value : null;
  };

  // reset: 선택 초기화 후 드롭박스 닫기
  Dropbox.prototype.reset = function () {
    this._selected = [];
    this.$items.removeClass('selected');
    this._updateDisplay();
    _close(this.$el);
  };

  // 페이지 내 모든 [data-component="dropbox"] 초기화 (중복 방지)
  function initAll() {
    $('[data-component="dropbox"]').each(function () {
      if (!$.data(this, 'dropboxInstance')) {
        $.data(this, 'dropboxInstance', new Dropbox(this));
      }
    });
  }

  $(function () { initAll(); });

  window.Dropbox = Dropbox; // 외부 컴포넌트에서 참조 가능하도록 전역 노출
}(jQuery));


/* ===== SUBTREE COMPONENT ===== */

(function ($) {
  'use strict';

  function initSubtree() {
    $('.subtreePanel').each(function () {
      var $panel = $(this);
      if ($panel.data('subtreeBound')) return; // 이미 바인딩된 패널 스킵
      $panel.data('subtreeBound', true);

      // 트리 패널 클릭 이벤트: 클릭된 노드 탐색
      $panel.on('click', function (e) {
        var $node = $(e.target).closest('.subtreeNode');
        if (!$node.length) return;

        var $item = $node.closest('.subtreeItem');
        var $children = $item.find('> .subtreeChildren');

        // 자식 노드가 있으면 is-open 토글 (펼치기/접기)
        if ($children.length) $item.toggleClass('is-open');

        // 모든 노드의 is-active 해제 후 클릭한 노드만 활성화
        $panel.find('.subtreeNode').removeClass('is-active');
        $node.addClass('is-active');
      });
    });
  }

  $(function () { initSubtree(); });

  window.initSubtree = initSubtree; // 외부에서 재초기화 가능하도록 전역 노출
}(jQuery));


/* ===== SEARCH FILTER COMPONENT ===== */

(function ($) {
  'use strict';

  // AirDatepicker 한국어 로케일 설정
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

  // Date → 'YYYY-MM-DD' 문자열 변환
  function fmtDate(date) {
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  // 기본 날짜 범위: 오늘 기준 -30일 ~ 오늘
  function defaultDates() {
    var today = new Date();
    var from = new Date(today);
    from.setDate(today.getDate() - 30);
    return { from: from, to: today };
  }

  // 날짜 인풋에 기본값 직접 설정 (AirDatepicker 없을 때도 동작)
  function setDefaultDateValues($root) {
    var dates = defaultDates();
    $root.find('#dateFrom').val(fmtDate(dates.from));
    $root.find('#dateTo').val(fmtDate(dates.to));
  }

  // AirDatepicker 초기화: #dateFrom ~ #dateTo 범위 선택
  function initDatepickers($root) {
    var $dateFrom = $root.find('#dateFrom');
    var $dateTo = $root.find('#dateTo');
    if (!$dateFrom.length || !$dateTo.length || $dateFrom.data('bound')) return;

    $dateFrom.data('bound', true);
    $dateTo.data('bound', true);

    setDefaultDateValues($root);

    if (typeof AirDatepicker === 'undefined') return; // 라이브러리 미로드 시 스킵

    var dates = defaultDates();

    // 시작일 달력: '오늘' 버튼 + 초기화 버튼
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

    // 종료일 달력: minDate를 시작일로 제한
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

    // 인스턴스를 요소에 보관 (reset 시 재활용)
    $dateFrom.data('airPicker', fromPicker);
    $dateTo.data('airPicker', toPicker);

    // 캘린더 아이콘 클릭 시 달력 열기
    // 키보드 직접 입력 차단 (readonly 대신 JS로 처리)
    $dateFrom.add($dateTo).on('keydown', function (e) { e.preventDefault(); });

    $dateFrom.closest('.datepickerWrap').find('.datepickerIcon').on('click', function () { fromPicker.show(); });
    $dateFrom.on('click focus', function () { fromPicker.show(); });

    $dateTo.closest('.datepickerWrap').find('.datepickerIcon').on('click', function () { toPicker.show(); });
    $dateTo.on('click focus', function () { toPicker.show(); });
  }

  // 시간 ▲▼ 버튼: 시(0~23) / 분(0~59) 범위 내 순환 증감
  function adjustTimeInput($input, delta) {
    var max = $input.attr('id').slice(-1) === 'H' ? 23 : 59; // id가 H로 끝나면 시, M이면 분
    var value = parseInt($input.val(), 10);
    if (isNaN(value)) value = 0;
    value += delta;
    if (value < 0) value = max;  // 0 미만이면 최대값으로 순환
    if (value > max) value = 0;  // 최대 초과면 0으로 순환
    $input.val(String(value).padStart(2, '0'));
  }

  // 시간 직접 입력 후 범위 초과 값 보정
  function clampTimeInput($input) {
    var max = $input.attr('id').slice(-1) === 'H' ? 23 : 59;
    var value = parseInt($input.val(), 10);
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(max, value));
    $input.val(String(value).padStart(2, '0'));
  }

  // 커스텀 타임피커 초기화: .timepickerWrap 단위로 개별 바인딩
  function initTimepickers($root) {
    $root.find('.timepickerWrap').each(function () {
      var $wrap = $(this);
      if ($wrap.data('bound')) return; // 중복 바인딩 방지
      $wrap.data('bound', true);

      var $displayInput = $wrap.find('.timeInput');  // 표시용 읽기전용 인풋 (HH:MM)
      var $panel = $wrap.find('.timepickerPanel');   // ▲▼ 패널
      if (!$displayInput.length || !$panel.length) return;

      // 시/분 값 → 표시용 인풋 업데이트
      function updateDisplay() {
        var $h = $wrap.find('[id$="H"]');
        var $m = $wrap.find('[id$="M"]');
        if ($h.length && $m.length) {
          $displayInput.val($h.val().padStart(2, '0') + ':' + $m.val().padStart(2, '0'));
        }
      }

      // 패널 토글: 다른 타임피커 먼저 닫고 현재 열기
      function togglePanel(e) {
        e.stopPropagation();
        var isOpen = $wrap.hasClass('is-open');
        $root.find('.timepickerWrap.is-open').removeClass('is-open');
        if (!isOpen) $wrap.addClass('is-open');
      }

      // 표시 인풋 / 시계 아이콘 클릭 시 패널 열기
      $displayInput.on('click', togglePanel);
      $wrap.find('.timepickerIcon').on('click', togglePanel);

      // ▲▼ 버튼: data-action="up|down", data-target="timeFromH" 등
      $panel.find('.tpickerBtn').on('click', function (e) {
        e.stopPropagation();
        var $target = $wrap.find('#' + $(this).attr('data-target'));
        if (!$target.length) return;
        adjustTimeInput($target, $(this).attr('data-action') === 'up' ? 1 : -1);
        updateDisplay();
      });

      // 시/분 직접 입력 후 change 시 값 보정
      $panel.find('.tpickerVal').on('change', function () {
        clampTimeInput($(this));
        updateDisplay();
      });

      updateDisplay(); // 초기 표시값 세팅
    });

    // 외부 클릭 시 열린 타임피커 패널 모두 닫기
    $(document).on('click', function () {
      $root.find('.timepickerWrap.is-open').removeClass('is-open');
    });
  }

  // 필터 영역 내 모든 드롭박스 초기화 상태로 리셋
  function resetDropboxes($root) {
    $root.find('[data-component="dropbox"]').each(function () {
      var inst = $.data(this, 'dropboxInstance');
      if (inst) inst.reset();
    });
  }

  // Dropbox 클래스 없을 때 사용하는 경량 폴백 바인딩
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
      // 같은 searchCard 내 다른 드롭박스 닫기
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

  // 필터 내 드롭박스 초기화: Dropbox 클래스 있으면 사용, 없으면 폴백 바인딩
  function ensureDropboxes($root) {
    $root.find('[data-component="dropbox"]').each(function () {
      if ($.data(this, 'dropboxInstance')) return; // 이미 초기화된 경우 스킵

      if (window.Dropbox) {
        $.data(this, 'dropboxInstance', new window.Dropbox(this));
        return;
      }

      bindFallbackDropbox(this);
    });

    // 외부 클릭 시 열린 드롭박스 닫기 (한 번만 등록)
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

  // 현재 필터 값 수집: 인풋 텍스트 → { agent, keyword } 객체 반환
  function collectFilters($root) {
    return {
      agent: $root.find('#filterText1').val().trim(),
      keyword: $root.find('#filterText2').val().trim()
    };
  }

  // 검색 실행: 'search-filter:submit' 이벤트 발행 → ResultsTable이 수신
  function dispatchSearch($root) {
    $(document).trigger('search-filter:submit', [collectFilters($root)]);
  }

  // 필터 초기화: 모든 인풋/날짜/시간/라디오/드롭박스 기본값으로 복원
  // silent=true 이면 'search-filter:reset' 이벤트를 발행하지 않음 (초기 로드 시 사용)
  function resetFilter($root, silent) {
    $root.find('#filterText1').val('');
    $root.find('#filterText2').val('');

    // 시간 패널 값 초기화 (시작: 00:00, 종료: 23:59)
    $root.find('#timeFromH').val('00');
    $root.find('#timeFromM').val('00');
    $root.find('#timeToH').val('23');
    $root.find('#timeToM').val('59');
    $root.find('#timeFromVal').val('00:00');
    $root.find('#timeToVal').val('23:59');

    // 라디오: HTML defaultChecked 기준으로 복원
    $root.find('input[type="radio"]').each(function () {
      $(this).prop('checked', this.defaultChecked);
    });

    setDefaultDateValues($root);

    // AirDatepicker 인스턴스가 있으면 날짜도 재선택
    var fromPicker = $root.find('#dateFrom').data('airPicker');
    var toPicker = $root.find('#dateTo').data('airPicker');
    if (fromPicker) { fromPicker.clear(); fromPicker.selectDate(defaultDates().from); }
    if (toPicker) { toPicker.clear(); toPicker.selectDate(defaultDates().to); }

    resetDropboxes($root);

    if (!silent) {
      $(document).trigger('search-filter:reset');
    }
  }

  // .searchCard 하나를 받아 드롭박스/날짜피커/타임피커/버튼 이벤트 전체 바인딩
  function initSearchFilter(el) {
    var $root = $(el);
    if ($root.data('searchFilterBound')) return;
    $root.data('searchFilterBound', true);

    ensureDropboxes($root);
    initDatepickers($root);
    initTimepickers($root);

    // 검색 버튼 클릭
    $root.find('#searchBtn').on('click', function () { dispatchSearch($root); });

    // 필드 옆 돋보기 버튼 클릭 (.filterSearchBtn)
    $root.find('.filterSearchBtn').on('click', function () { dispatchSearch($root); });

    // 상단 드롭박스 행의 검색 버튼
    $root.find('#dropboxSearchBtn').on('click', function () { dispatchSearch($root); });

    // 초기화 버튼 클릭
    $root.find('#resetBtn').on('click', function () { resetFilter($root, false); });

    // 상단 드롭박스 행의 초기화 버튼
    $root.find('#dropboxResetBtn').on('click', function () { resetFilter($root, false); });

    // 텍스트 인풋 Enter 키 → 검색 실행
    $root.find('#filterText1, #filterText2').on('keydown', function (e) {
      if (e.key === 'Enter') dispatchSearch($root);
    });

    // 새로고침 버튼(initRefresh)에서 발행하는 reset 요청 수신
    $(document).on('search-filter:reset-request', function () {
      resetFilter($root, false);
    });

    resetFilter($root, true); // 초기 로드: 조용히 기본값 세팅
  }

  // 페이지 내 모든 .searchCard 초기화
  function initAll() {
    $('.searchCard').each(function () { initSearchFilter(this); });
  }

  $(function () { initAll(); });

  window.SearchFilter = {
    initAll: initAll // 외부에서 재초기화 가능하도록 전역 노출
  };
}(jQuery));


/* ===== RESULTS TABLE ===== */

(function ($) {
  // 더미 데이터용 상수 (실제 연동 시 API 응답으로 교체)
  var AGENTS = ['김민준', '이서연', '박지훈', '최수아', '정다은', '강현우', '윤채원'];
  var WORK_TYPES = ['일반상담', '불만처리', '가입안내', '해지처리', '기술지원'];
  var BRANCHES = ['2356', '1234', '5678', '9012', '3456'];

  // 숫자를 지정 자릿수로 0 채우기 ('1' → '01')
  function pad(value, length) {
    return String(value).padStart(length || 2, '0');
  }

  // min~max 사이 랜덤 정수
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 배열에서 랜덤 항목 하나 반환
  function randItem(items) {
    return items[randInt(0, items.length - 1)];
  }

  // count개의 더미 레코드 생성 (녹취일자, 상담원, 전화번호 등)
  function generateData(count) {
    return Array.from({ length: count }, function (_, index) {
      var hour = pad(randInt(8, 18));
      var minute = pad(randInt(0, 59));
      var second = pad(randInt(0, 59));
      var day = pad(randInt(1, 28));
      var month = pad(randInt(1, 12));

      return {
        no: index + 1,
        date: '2025-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second,
        callTime: randInt(30, 600),      // 통화시간 (초)
        agent: randItem(AGENTS),
        phone: '010' + pad(randInt(1000, 9999), 4) + pad(randInt(1000, 9999), 4),
        branch: randItem(BRANCHES),
        customer: randItem(['이름A', '이름B', '이름C', '이름D', '이름E']),
        custNo: 'C' + pad(randInt(10000, 99999), 5),
        workType: randItem(WORK_TYPES),
        hasScreen: DUMMY_CONFIG.showScreen ? true : Math.random() > 0.3
      };
    });
  }

  // 테이블 상태 초기화: 전체 데이터, 필터 데이터, 현재 페이지, 정렬 정보
  function createState($root) {
    var $pageSel = $root.find('#pageSizeSelect');
    var pageSize = parseInt($pageSel.find('.dropbox-option li.selected').attr('data-value') || '10', 10);
    var allData = generateData(87); // 총 87건 더미 데이터

    return {
      allData: allData,
      filteredData: allData.slice(), // 검색 필터 적용 후 결과
      currentPage: 1,
      pageSize: isNaN(pageSize) ? 10 : pageSize,
      sortKey: null,         // 현재 정렬 컬럼 키
      sortDirection: 'asc'  // 'asc' | 'desc'
    };
  }

  // 전체 페이지 수 계산 (최소 1)
  function totalPages(state) {
    return Math.max(1, Math.ceil(state.filteredData.length / state.pageSize));
  }

  // 검색 결과 건수 업데이트: 테이블 하단 + 카드 헤더
  function updateCounts($root, state) {
    $root.find('#totalCount').text(state.filteredData.length.toLocaleString());
    $('#headerCount').text(state.filteredData.length.toLocaleString());
  }

  // 전체 선택 체크박스 상태 동기화 (전체/일부/없음)
  function syncCheckAll($root) {
    var $checkAll = $root.find('#checkAll');
    if (!$checkAll.length) return;

    var total = $root.find('.rowCheck').length;
    var checked = $root.find('.rowCheck:checked').length;
    $checkAll.prop('indeterminate', checked > 0 && checked < total); // 일부 선택 → 중간 상태
    $checkAll.prop('checked', total > 0 && checked === total);
  }

  // 행 이벤트 바인딩: 더블클릭 선택 + 체크박스 변경 + 메모 버튼 클릭
  function bindRowEvents($root) {
    $root.find('.tableBody tr').on('dblclick', function () {
      $(this).toggleClass('is-selected');
      $(this).find('.rowCheck').prop('checked', $(this).hasClass('is-selected'));
      syncCheckAll($root);
    });

    $root.find('.rowCheck').on('change', function () {
      $(this).closest('tr').toggleClass('is-selected', $(this).prop('checked'));
      syncCheckAll($root);
    });

    // 메모 버튼 클릭 → 사이드 패널 오픈
    $root.find('.tableBody .is-memo').on('click', function () {
      var rowData = $(this).closest('tr').data('row');
      if (rowData && window.SidePanel) {
        window.SidePanel.open(rowData);
      }
    });
  }

  // 두 행 값 비교: date는 timestamp, 숫자는 수치비교, 문자열은 한국어 로케일 비교
  function compareValues(a, b, key, direction) {
    var asc = direction === 'asc';
    var left = a[key];
    var right = b[key];

    if (key === 'date') {
      left = new Date(left).getTime();
      right = new Date(right).getTime();
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return asc ? left - right : right - left;
    }

    return asc
      ? String(left).localeCompare(String(right), 'ko')
      : String(right).localeCompare(String(left), 'ko');
  }

  // filteredData를 현재 sortKey/sortDirection으로 정렬 (sortKey 없으면 스킵)
  function sortRows(state) {
    if (!state.sortKey) return;
    state.filteredData.sort(function (a, b) {
      return compareValues(a, b, state.sortKey, state.sortDirection);
    });
  }

  // 현재 페이지 행 렌더링: 아이콘 버튼(듣기/화면/메모) + 데이터 셀
  function renderRows($root, state) {
    var $tbody = $root.find('#tableBody');
    if (!$tbody.length) return;

    var start = (state.currentPage - 1) * state.pageSize; // 현재 페이지 시작 인덱스
    var rows = state.filteredData.slice(start, start + state.pageSize);

    // 검색 결과 없을 때 빈 상태 메시지 표시
    if (!rows.length) {
      $tbody.html(
        '<tr><td colspan="13">' +
          '<div class="tableEmpty">' +
            '<div class="tableEmptyIcon">' +
              '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
                '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
              '</svg>' +
            '</div>' +
            '<div class="tableEmptyText">검색 결과가 없습니다.</div>' +
          '</div>' +
        '</td></tr>'
      );
      syncCheckAll($root);
      updateCounts($root, state);
      return;
    }

    var playButton =
      '<button class="tableIconBtn is-play" type="button" title="녹취 듣기" aria-label="녹취 듣기">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<mask id="mask0_621_3013" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">' +
            '<rect width="16" height="16" fill="#D9D9D9"/>' +
          '</mask>' +
          '<g mask="url(#mask0_621_3013)">' +
            '<path d="M9.33333 13.816V12.4493C10.3333 12.1604 11.1389 11.6048 11.75 10.7826C12.3611 9.9604 12.6667 9.02707 12.6667 7.98263C12.6667 6.93818 12.3611 6.00485 11.75 5.18263C11.1389 4.3604 10.3333 3.80485 9.33333 3.51596V2.14929C10.7111 2.4604 11.8333 3.15763 12.7 4.24096C13.5667 5.32429 14 6.57151 14 7.98263C14 9.39374 13.5667 10.641 12.7 11.7243C11.8333 12.8076 10.7111 13.5048 9.33333 13.816ZM2 9.99929V5.99929H4.66667L8 2.66596V13.3326L4.66667 9.99929H2ZM9.33333 10.666V5.29929C9.85556 5.54374 10.2639 5.9104 10.5583 6.39929C10.8528 6.88818 11 7.42151 11 7.99929C11 8.56596 10.8528 9.09096 10.5583 9.57429C10.2639 10.0576 9.85556 10.4215 9.33333 10.666ZM6.66667 5.89929L5.23333 7.33263H3.33333V8.66596H5.23333L6.66667 10.0993V5.89929Z" fill="white"/>' +
          '</g>' +
        '</svg>' +
      '</button>';

    var memoButton =
      '<button class="tableIconBtn is-memo" type="button" title="메모" aria-label="메모">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<mask id="mask0_621_3229" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">' +
            '<rect width="16" height="16" fill="#D9D9D9"/>' +
          '</mask>' +
          '<g mask="url(#mask0_621_3229)">' +
            '<path d="M3.33333 13.9993C2.96667 13.9993 2.65278 13.8687 2.39167 13.6076C2.13056 13.3465 2 13.0326 2 12.666V3.33263C2 2.96596 2.13056 2.65207 2.39167 2.39096C2.65278 2.12985 2.96667 1.99929 3.33333 1.99929H9.28333L7.95 3.33263H3.33333V12.666H12.6667V8.03262L14 6.69929V12.666C14 13.0326 13.8694 13.3465 13.6083 13.6076C13.3472 13.8687 13.0333 13.9993 12.6667 13.9993H3.33333ZM6 9.99929V7.16596L12.1167 1.04929C12.25 0.915959 12.4 0.815959 12.5667 0.749292C12.7333 0.682625 12.9 0.649292 13.0667 0.649292C13.2444 0.649292 13.4139 0.682625 13.575 0.749292C13.7361 0.815959 13.8833 0.915959 14.0167 1.04929L14.95 1.99929C15.0722 2.13263 15.1667 2.27985 15.2333 2.44096C15.3 2.60207 15.3333 2.76596 15.3333 2.93263C15.3333 3.09929 15.3028 3.26318 15.2417 3.42429C15.1806 3.5854 15.0833 3.73263 14.95 3.86596L8.83333 9.99929H6ZM7.33333 8.66596H8.26667L12.1333 4.79929L11.6667 4.33263L11.1833 3.86596L7.33333 7.71596V8.66596Z" fill="#19973C"/>' +
          '</g>' +
        '</svg>' +
      '</button>';

    var html = $.map(rows, function (row, index) {
      var screenButton = row.hasScreen
        ? '<button class="tableIconBtn is-screen" type="button" title="화면 보기" aria-label="화면 보기">' +
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
              '<mask id="mask0_621_3127" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">' +
                '<rect width="16" height="16" fill="#D9D9D9"/>' +
              '</mask>' +
              '<g mask="url(#mask0_621_3127)">' +
                '<path d="M6.33325 11L10.9999 7.99998L6.33325 4.99998V11ZM7.99992 14.6666C7.0777 14.6666 6.21103 14.4916 5.39992 14.1416C4.58881 13.7916 3.88325 13.3166 3.28325 12.7166C2.68325 12.1166 2.20825 11.4111 1.85825 10.6C1.50825 9.78887 1.33325 8.9222 1.33325 7.99998C1.33325 7.07776 1.50825 6.21109 1.85825 5.39998C2.20825 4.58887 2.68325 3.88331 3.28325 3.28331C3.88325 2.68331 4.58881 2.20831 5.39992 1.85831C6.21103 1.50831 7.0777 1.33331 7.99992 1.33331C8.92214 1.33331 9.78881 1.50831 10.5999 1.85831C11.411 2.20831 12.1166 2.68331 12.7166 3.28331C13.3166 3.88331 13.7916 4.58887 14.1416 5.39998C14.4916 6.21109 14.6666 7.07776 14.6666 7.99998C14.6666 8.9222 14.4916 9.78887 14.1416 10.6C13.7916 11.4111 13.3166 12.1166 12.7166 12.7166C12.1166 13.3166 11.411 13.7916 10.5999 14.1416C9.78881 14.4916 8.92214 14.6666 7.99992 14.6666ZM7.99992 13.3333C9.48881 13.3333 10.7499 12.8166 11.7833 11.7833C12.8166 10.75 13.3333 9.48887 13.3333 7.99998C13.3333 6.51109 12.8166 5.24998 11.7833 4.21665C10.7499 3.18331 9.48881 2.66665 7.99992 2.66665C6.51103 2.66665 5.24992 3.18331 4.21659 4.21665C3.18325 5.24998 2.66659 6.51109 2.66659 7.99998C2.66659 9.48887 3.18325 10.75 4.21659 11.7833C5.24992 12.8166 6.51103 13.3333 7.99992 13.3333Z" fill="white"/>' +
              '</g>' +
            '</svg>' +
          '</button>'
        : '';

      return '<tr data-row=\'' + JSON.stringify(row) + '\'>' +
        '<td class="col-check"><input type="checkbox" class="tableCheckbox rowCheck" aria-label="행 선택"></td>' +
        '<td class="col-icon">' + playButton + '</td>' +
        '<td class="col-no">' + (start + index + 1) + '</td>' +
        '<td class="col-icon">' + screenButton + '</td>' +
        '<td class="col-icon">' + memoButton + '</td>' +
        '<td class="col-date">' + row.date + '</td>' +
        '<td class="col-num">' + row.callTime + '</td>' +
        '<td class="col-text">' + row.agent + '</td>' +
        '<td class="col-num">' + row.phone + '</td>' +
        '<td class="col-num">' + row.branch + '</td>' +
        '<td class="col-text">' + row.customer + '</td>' +
        '<td class="col-num">' + row.custNo + '</td>' +
        '<td class="col-text">' + row.workType + '</td>' +
      '</tr>';
    }).join('');

    $tbody.html(html);
    bindRowEvents($root);
    syncCheckAll($root);
    updateCounts($root, state);
  }

  // 페이지 정보 텍스트 업데이트 ('현재 / 전체 페이지', 스크린리더용)
  function renderPageInfo($root, state) {
    $root.find('#pageInfo').text(state.currentPage + ' / ' + totalPages(state) + ' 페이지');
  }

  // 페이지네이션 버튼 렌더링: « ‹ 1 2 … 10 › » 구조, 10개씩 그룹
  function renderPagination($root, state) {
    var $pagination = $root.find('#pagination');
    if (!$pagination.length) return;

    var total = totalPages(state);
    var current = state.currentPage;
    var groupSize = 10;
    var groupStart = Math.floor((current - 1) / groupSize) * groupSize + 1; // 현재 그룹 시작 페이지
    var groupEnd = Math.min(groupStart + groupSize - 1, total);
    var html = '';

    // 처음/이전 버튼: 1페이지면 disabled
    html += '<button class="pageBtn is-nav" ' + (current === 1 ? 'disabled' : '') + ' data-page="1" title="처음" aria-label="처음">«</button>';
    html += '<button class="pageBtn is-nav" ' + (current === 1 ? 'disabled' : '') + ' data-page="' + (current - 1) + '" title="이전" aria-label="이전">‹</button>';

    // 현재 그룹 페이지 번호 버튼
    for (var page = groupStart; page <= groupEnd; page++) {
      html += '<button class="pageBtn' + (page === current ? ' is-active' : '') + '" data-page="' + page + '"' +
        (page === current ? ' aria-current="page"' : '') + '>' + page + '</button>';
    }

    // 다음/마지막 버튼: 마지막 페이지면 disabled
    html += '<button class="pageBtn is-nav" ' + (current === total ? 'disabled' : '') + ' data-page="' + (current + 1) + '" title="다음" aria-label="다음">›</button>';
    html += '<button class="pageBtn is-nav" ' + (current === total ? 'disabled' : '') + ' data-page="' + total + '" title="마지막" aria-label="마지막">»</button>';

    $pagination.html(html);

    // 활성 버튼에만 클릭 이벤트 바인딩 (disabled 제외)
    $pagination.find('.pageBtn:not(:disabled)').on('click', function () {
      var p = parseInt($(this).attr('data-page'), 10);
      if (!isNaN(p)) {
        state.currentPage = p;
        render($root, state);
      }
    });

    renderPageInfo($root, state);
  }

  // 테이블 전체 재렌더링 (페이지 범위 보정 후 행 + 페이지네이션)
  function render($root, state) {
    var total = totalPages(state);
    if (state.currentPage > total) state.currentPage = total;
    if (state.currentPage < 1) state.currentPage = 1;
    renderRows($root, state);
    renderPagination($root, state);
  }

  // 검색 필터 적용: agent(상담원명) + keyword(고객명/업무구분) 포함 여부로 필터링
  function applyFilters($root, state, filters) {
    var agent = String(filters && filters.agent ? filters.agent : '').trim().toLowerCase();
    var keyword = String(filters && filters.keyword ? filters.keyword : '').trim().toLowerCase();

    state.filteredData = $.grep(state.allData, function (row) {
      var matchAgent = !agent || row.agent.toLowerCase().indexOf(agent) > -1;
      var matchKeyword = !keyword ||
        row.customer.toLowerCase().indexOf(keyword) > -1 ||
        row.workType.toLowerCase().indexOf(keyword) > -1;
      return matchAgent && matchKeyword;
    });

    sortRows(state);
    state.currentPage = 1;
    render($root, state);
  }

  // 테이블 초기화: 전체 데이터로 복원 후 재렌더링
  function resetTable($root, state) {
    state.filteredData = state.allData.slice();
    sortRows(state);
    state.currentPage = 1;
    render($root, state);
  }

  // 전체 선택 체크박스 (#checkAll) 이벤트: 모든 행 체크/해제 연동
  function initCheckAll($root) {
    $root.find('#checkAll').on('change', function () {
      var checked = $(this).prop('checked');
      $root.find('.rowCheck').prop('checked', checked).each(function () {
        $(this).closest('tr').toggleClass('is-selected', checked);
      });
    });
  }

  // 페이지 사이즈 변경 (#pageSizeSelect): 1페이지로 돌아가고 재렌더링
  function initPageSize($root, state) {
    var $dropbox = $root.find('#pageSizeSelect');
    $dropbox.find('.dropbox-option li').on('click', function () {
      var $item = $(this);
      var nextSize = parseInt($item.attr('data-value'), 10);
      $dropbox.find('.dropbox-option li').removeClass('selected');
      $item.addClass('selected');
      $dropbox.find('.selected-text').text($item.find('.option-text').text());
      $dropbox.addClass('has-value');
      $dropbox.removeClass('active is-up');
      $dropbox.find('.dropbox-option').removeClass('active');
      state.pageSize = isNaN(nextSize) ? 10 : nextSize;
      state.currentPage = 1;
      render($root, state);
    });
  }

  // 컬럼 정렬 초기화: .is-sortable 헤더 클릭 시 오름/내림 토글
  // keys 배열: 컬럼 인덱스와 state 키 매핑 (null = 정렬 불가 컬럼)
  function initSort($root, state) {
    var keys = [null, null, null, null, null, 'date', 'callTime', 'agent', 'phone', 'branch', 'customer', 'custNo', 'workType'];
    var $headers = $root.find('.table th');

    $headers.each(function (index) {
      var $header = $(this);
      if (!$header.hasClass('is-sortable')) return;

      $header.on('click', function () {
        var key = keys[index];
        if (!key) return;

        // 같은 컬럼 재클릭 시 방향 반전, 다른 컬럼이면 asc로 초기화
        if (state.sortKey === key) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = key;
          state.sortDirection = 'asc';
        }

        // 모든 헤더 data-sort 제거 후 클릭한 헤더에만 설정 (CSS 화살표 표시용)
        $headers.removeAttr('data-sort');
        $header.attr('data-sort', state.sortDirection);

        sortRows(state);
        render($root, state);
      });
    });
  }

  // .resultsCard 하나를 받아 체크박스/페이지/정렬/이벤트 전체 초기화
  function initTable(el) {
    var $root = $(el);
    if ($root.data('resultsTableBound')) return;
    $root.data('resultsTableBound', true);

    var state = createState($root);
    $root.data('resultsTableState', state); // 외부 접근용 (디버깅 등)

    initCheckAll($root);
    initPageSize($root, state);
    initSort($root, state);

    // SearchFilter에서 검색 이벤트 수신 → 필터 적용
    $(document).on('search-filter:submit', function (_, filters) {
      applyFilters($root, state, filters || {});
    });

    // SearchFilter에서 초기화 이벤트 수신 → 테이블 리셋
    $(document).on('search-filter:reset', function () {
      resetTable($root, state);
    });

    render($root, state); // 초기 렌더링
  }

  // 페이지 내 모든 .resultsCard 초기화
  function initAll() {
    $('.resultsCard').each(function () { initTable(this); });
  }

  $(function () { initAll(); });

  window.ResultsTable = { initAll: initAll }; // 외부 재초기화 가능하도록 전역 노출
}(jQuery));


/* ===== SIDE PANEL ===== */
(function ($) {

  var $panel, $backdrop, $title, $bodyOn, $bodyOff;

  function initPanelDropboxes($root) {
    $root.find('[data-component="dropbox"]').each(function () {
      if ($.data(this, 'dropboxInstance')) return;
      if (window.Dropbox) {
        $.data(this, 'dropboxInstance', new window.Dropbox(this));
      }
    });
  }

  function openPanel(rowData) {
    $title.text('메모 — ' + rowData.no + '번 행');

    $bodyOn.html(
      '<div class="panelForm">' +
        '<div class="panelScrollArea">' +

          '<div class="panelSection">' +
            '<h3 class="panelSectionTitle">제목 <span class="panelRequired">*</span></h3>' +

            '<div class="filterRow">' +
              '<div class="filterField">' +
                '<span class="filterLabel">타이틀</span>' +
                '<div class="dropbox h-sm w-full" data-component="dropbox">' +
                  '<p class="selected-text">' + rowData.agent + '</p>' +
                  '<ul class="dropbox-option">' +
                    '<li class="is-selected"><p class="option-text">' + rowData.agent + '</p></li>' +
                  '</ul>' +
                '</div>' +
              '</div>' +
              '<div class="filterField">' +
                '<span class="filterLabel">타이틀</span>' +
                '<div class="search h-sm w-full">' +
                  '<input class="searchInput w-full" type="text" value="' + rowData.customer + '" autocomplete="off" />' +
                  '<button class="searchButton filterSearchBtn" type="button" title="검색" aria-label="검색">' +
                    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="filterRow">' +
              '<div class="filterField">' +
                '<span class="filterLabel">타이틀</span>' +
                '<input class="filterInput h-sm w-full" type="text" value="' + rowData.workType + '" />' +
              '</div>' +
            '</div>' +

            '<div class="filterRow">' +
              '<div class="filterField">' +
                '<span class="filterLabel">타이틀</span>' +
                '<div class="search h-sm w-full">' +
                  '<input class="searchInput w-full" type="text" value="' + rowData.branch + '" autocomplete="off" />' +
                  '<button class="searchButton filterSearchBtn" type="button" title="검색" aria-label="검색">' +
                    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
                  '</button>' +
                '</div>' +
              '</div>' +
              '<div class="filterField">' +
                '<span class="filterLabel">타이틀</span>' +
                '<input class="filterInput h-sm w-full" type="text" placeholder="입력하세요" />' +
              '</div>' +
              '<button class="btn is-primary h-sm" type="button">버튼</button>' +
            '</div>' +
          '</div>' +

          '<div class="panelSection">' +
            '<h3 class="panelSectionTitle">제목</h3>' +

            '<div class="filterRow">' +
              '<div class="filterField">' +
                '<span class="filterLabel">타이틀</span>' +
                '<input class="filterInput h-sm w-full" type="text" value="' + rowData.customer + '" />' +
              '</div>' +
            '</div>' +

            '<div class="filterRow">' +
              '<div class="filterField">' +
                '<span class="filterLabel">타이틀</span>' +
                '<div class="dropbox h-sm w-full" data-component="dropbox">' +
                  '<p class="selected-text">' + rowData.workType + '</p>' +
                  '<ul class="dropbox-option">' +
                    '<li class="is-selected"><p class="option-text">' + rowData.workType + '</p></li>' +
                  '</ul>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="filterRow">' +
              '<div class="filterField">' +
                '<textarea class="panelTextarea" placeholder="입력하세요" maxlength="999"></textarea>' +
                '<div class="panelCharCount"><span class="panelCharCurrent">0</span>/999</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +
        '<div class="panelFooter">' +
          '<button class="btn panelFooterBtn w-full" type="button">버튼</button>' +
        '</div>' +
      '</div>'
    );

    initPanelDropboxes($bodyOn);

    $bodyOn.find('.panelTextarea').on('input', function () {
      $(this).closest('.filterField').find('.panelCharCurrent').text($(this).val().length);
    });

    $bodyOff.html('<p class="panelEmptyText">Tap_off 탭 내용입니다.</p>');

    var tabInstance = window.Tab && window.Tab.getInstance($('#sidePanelTab')[0]);
    if (tabInstance) tabInstance.reset();

    $backdrop.addClass('is-open');
    $panel.addClass('is-open');
    $panel.attr('aria-hidden', 'false');
    $('body').css('overflow', 'hidden');
  }

  function closePanel() {
    $backdrop.removeClass('is-open');
    $panel.removeClass('is-open');
    $panel.attr('aria-hidden', 'true');
    $('body').css('overflow', '');
  }

  function initSidePanel() {
    $panel    = $('#sidePanel');
    $backdrop = $('#sideBackdrop');
    $title    = $('#sidePanelTitle');
    $bodyOn   = $('#sidePanelBodyOn');
    $bodyOff  = $('#sidePanelBodyOff');

    if (!$panel.length) return;

    $backdrop.on('click', closePanel);

    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' && $panel.hasClass('is-open')) closePanel();
    });
  }

  $(function () { initSidePanel(); });

  window.SidePanel = { open: openPanel, close: closePanel };

}(jQuery));


/* ===== PAGE SHELL SCRIPT ===== */

(function ($) {

  // LNB 사이드바 초기화: 아이콘 스트립 ↔ 텍스트 메뉴 연동
  function initSidebar() {
    var $lnbIcons = $('#lnbIcons');
    var $lnbText = $('#lnbText');
    if (!$lnbIcons.length || !$lnbText.length) return;

    var $iconItems = $lnbIcons.find('.lnbIconItem');  // 좌측 아이콘 목록
    var $textItems = $lnbText.find('.lnbItem');       // 텍스트 1depth 메뉴 목록
    var $links2 = $lnbText.find('.lnbLink2depth');    // 2depth 링크 목록

    // 아이콘 클릭: 이미 활성이면 닫기, 아니면 해당 텍스트 메뉴 열기
    $iconItems.on('click', function () {
      var $icon = $(this);
      var $targetItem = $('#' + $icon.attr('data-target'));
      var isActive = $icon.hasClass('is-active');

      if (isActive) {
        $icon.removeClass('is-active');
        $textItems.find('.lnbLink1depth').removeClass('is-active');
        $lnbText.removeClass('is-open');
        return;
      }

      // 다른 아이콘/메뉴 모두 비활성화 후 현재 것만 활성화
      $iconItems.removeClass('is-active');
      $textItems.removeClass('is-open');
      $textItems.find('.lnbLink1depth').removeClass('is-active');
      $icon.addClass('is-active');
      $targetItem.addClass('is-open');
      $targetItem.find('.lnbLink1depth').addClass('is-active');
      $lnbText.addClass('is-open');
    }).on('keydown', function (e) {
      // Enter / Space 키보드 접근성 지원
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $(this).trigger('click');
      }
    });

    // 1depth 텍스트 메뉴 클릭: 아코디언 펼치기/접기 + 아이콘 동기화
    $textItems.each(function () {
      var $item = $(this);
      $item.find('.lnbLink1depth').on('click', function () {
        var wasOpen = $item.hasClass('is-open');
        $textItems.removeClass('is-open');
        $textItems.find('.lnbLink1depth').removeClass('is-active');

        if (!wasOpen) {
          $item.addClass('is-open');
          $(this).addClass('is-active');
          // 해당 메뉴에 연결된 아이콘 활성화
          $iconItems.each(function () {
            $(this).toggleClass('is-active', $(this).attr('data-target') === $item.attr('id'));
          });
        } else {
          $iconItems.removeClass('is-active');
        }
      });
    });

    // 2depth 링크 클릭: 클릭한 링크만 is-active, 이벤트 버블링 차단
    $links2.on('click', function (e) {
      e.stopPropagation();
      $links2.removeClass('is-active');
      $(this).addClass('is-active');
    });
  }

  // 로그인 연장 타이머: 99:59부터 1초씩 감소, 클릭 시 리셋
  function initLoginTimer() {
    var $timer = $('#loginTimer');
    if (!$timer.length) return;

    var total = 99 * 60 + 59; // 초 단위 총 시간
    var intervalId = setInterval(function () {
      if (total <= 0) {
        clearInterval(intervalId);
        $timer.text('00:00');
        return;
      }
      total -= 1;
      $timer.text(
        String(Math.floor(total / 60)).padStart(2, '0') + ':' +
        String(total % 60).padStart(2, '0')
      );
    }, 1000);

    // .gnbLoginExtend 클릭 시 타이머 리셋
    $timer.closest('.gnbLoginExtend').on('click', function () {
      total = 99 * 60 + 59;
    });
  }

  // 즐겨찾기 버튼 (#favBtn): 클릭 시 is-active 토글 + aria-pressed 업데이트
  function initFavorite() {
    $('#favBtn').on('click', function () {
      var isActive = $(this).toggleClass('is-active').hasClass('is-active');
      $(this).attr('aria-pressed', isActive);
    }).on('keydown', function (e) {
      // Enter / Space 키보드 접근성 지원
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $(this).trigger('click');
      }
    });
  }

  // 새로고침 버튼 (#refreshBtn): SearchFilter에 reset 요청 이벤트 발행
  function initRefresh() {
    $('#refreshBtn').on('click', function () {
      $(document).trigger('search-filter:reset-request');
    });
  }

  // 앱 진입점: 모든 컴포넌트 순서대로 초기화
  $(function () {
    initSidebar();
    initLoginTimer();
    initFavorite();
    initRefresh();
  });

}(jQuery));
