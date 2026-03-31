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
        hasScreen: Math.random() > 0.3  // 30% 확률로 화면 녹화 없음
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

  // 행 이벤트 바인딩: 더블클릭 선택 + 체크박스 변경 시 행 강조
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

      return '<tr>' +
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
