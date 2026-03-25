(function () {
  var AGENTS = ['김민준', '이서연', '박지훈', '최수아', '정다은', '강현우', '윤채원'];
  var WORK_TYPES = ['일반상담', '불만처리', '가입안내', '해지처리', '기술지원'];
  var BRANCHES = ['2356', '1234', '5678', '9012', '3456'];

  function pad(value, length) {
    return String(value).padStart(length || 2, '0');
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randItem(items) {
    return items[randInt(0, items.length - 1)];
  }

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
        callTime: randInt(30, 600),
        agent: randItem(AGENTS),
        phone: '010' + pad(randInt(1000, 9999), 4) + pad(randInt(1000, 9999), 4),
        branch: randItem(BRANCHES),
        customer: randItem(['이름A', '이름B', '이름C', '이름D', '이름E']),
        custNo: 'C' + pad(randInt(10000, 99999), 5),
        workType: randItem(WORK_TYPES),
        hasScreen: Math.random() > 0.3
      };
    });
  }

  function createState(root) {
    var pageSizeSelect = root.querySelector('#pageSizeSelect');
    var pageSize = parseInt(pageSizeSelect ? pageSizeSelect.value : '10', 10);
    var allData = generateData(87);

    return {
      allData: allData,
      filteredData: allData.slice(),
      currentPage: 1,
      pageSize: Number.isNaN(pageSize) ? 10 : pageSize,
      sortKey: null,
      sortDirection: 'asc'
    };
  }

  function totalPages(state) {
    return Math.max(1, Math.ceil(state.filteredData.length / state.pageSize));
  }

  function updateCounts(root, state) {
    var totalCount = root.querySelector('#totalCount');
    if (totalCount) totalCount.textContent = state.filteredData.length.toLocaleString();

    var headerCount = document.getElementById('headerCount');
    if (headerCount) headerCount.textContent = state.filteredData.length.toLocaleString();
  }

  function syncCheckAll(root) {
    var checkAll = root.querySelector('#checkAll');
    if (!checkAll) return;

    var all = root.querySelectorAll('.rowCheck');
    var checked = root.querySelectorAll('.rowCheck:checked');
    checkAll.indeterminate = checked.length > 0 && checked.length < all.length;
    checkAll.checked = all.length > 0 && checked.length === all.length;
  }

  function bindRowEvents(root) {
    root.querySelectorAll('.tableBody tr').forEach(function (row) {
      row.addEventListener('dblclick', function () {
        row.classList.toggle('is-selected');
        var checkbox = row.querySelector('.rowCheck');
        if (checkbox) checkbox.checked = row.classList.contains('is-selected');
        syncCheckAll(root);
      });
    });

    root.querySelectorAll('.rowCheck').forEach(function (checkbox) {
      checkbox.addEventListener('change', function () {
        var row = checkbox.closest('tr');
        if (row) row.classList.toggle('is-selected', checkbox.checked);
        syncCheckAll(root);
      });
    });
  }

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

  function sortRows(state) {
    if (!state.sortKey) return;
    state.filteredData.sort(function (a, b) {
      return compareValues(a, b, state.sortKey, state.sortDirection);
    });
  }

  function renderRows(root, state) {
    var tbody = root.querySelector('#tableBody');
    if (!tbody) return;

    var start = (state.currentPage - 1) * state.pageSize;
    var rows = state.filteredData.slice(start, start + state.pageSize);

    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="13">' +
          '<div class="tableEmpty">' +
            '<div class="tableEmptyIcon">' +
              '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
                '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
              '</svg>' +
            '</div>' +
            '<div class="tableEmptyText">검색 결과가 없습니다.</div>' +
          '</div>' +
        '</td></tr>';
      syncCheckAll(root);
      updateCounts(root, state);
      return;
    }

    tbody.innerHTML = rows.map(function (row, index) {
      var playButton =
        '<button class="tableIconBtn is-play" type="button" title="녹취 듣기" aria-label="녹취 듣기">' +
          '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' +
        '</button>';

      var screenButton = row.hasScreen
        ? '<button class="tableIconBtn is-screen" type="button" title="화면 보기" aria-label="화면 보기">' +
            '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="2"></circle></svg>' +
          '</button>'
        : '';

      var memoButton =
        '<button class="tableIconBtn is-memo" type="button" title="메모" aria-label="메모">' +
          '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>' +
            '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"></path>' +
          '</svg>' +
        '</button>';

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

    bindRowEvents(root);
    syncCheckAll(root);
    updateCounts(root, state);
  }

  function renderPageInfo(root, state) {
    var pageInfo = root.querySelector('#pageInfo');
    if (!pageInfo) return;
    pageInfo.textContent = state.currentPage + ' / ' + totalPages(state) + ' 페이지';
  }

  function renderPagination(root, state) {
    var pagination = root.querySelector('#pagination');
    if (!pagination) return;

    var total = totalPages(state);
    var current = state.currentPage;
    var groupSize = 10;
    var groupStart = Math.floor((current - 1) / groupSize) * groupSize + 1;
    var groupEnd = Math.min(groupStart + groupSize - 1, total);
    var html = '';

    html += '<button class="pageBtn is-nav" ' + (current === 1 ? 'disabled' : '') + ' data-page="1" title="처음" aria-label="처음">«</button>';
    html += '<button class="pageBtn is-nav" ' + (current === 1 ? 'disabled' : '') + ' data-page="' + (current - 1) + '" title="이전" aria-label="이전">‹</button>';

    for (var page = groupStart; page <= groupEnd; page += 1) {
      html += '<button class="pageBtn' + (page === current ? ' is-active' : '') + '" data-page="' + page + '"' +
        (page === current ? ' aria-current="page"' : '') + '>' + page + '</button>';
    }

    html += '<button class="pageBtn is-nav" ' + (current === total ? 'disabled' : '') + ' data-page="' + (current + 1) + '" title="다음" aria-label="다음">›</button>';
    html += '<button class="pageBtn is-nav" ' + (current === total ? 'disabled' : '') + ' data-page="' + total + '" title="마지막" aria-label="마지막">»</button>';

    pagination.innerHTML = html;

    pagination.querySelectorAll('.pageBtn:not(:disabled)').forEach(function (button) {
      button.addEventListener('click', function () {
        var page = parseInt(button.dataset.page, 10);
        if (!Number.isNaN(page)) {
          state.currentPage = page;
          render(root, state);
        }
      });
    });

    renderPageInfo(root, state);
  }

  function render(root, state) {
    var total = totalPages(state);
    if (state.currentPage > total) state.currentPage = total;
    if (state.currentPage < 1) state.currentPage = 1;
    renderRows(root, state);
    renderPagination(root, state);
  }

  function applyFilters(root, state, filters) {
    var agent = String(filters && filters.agent ? filters.agent : '').trim().toLowerCase();
    var keyword = String(filters && filters.keyword ? filters.keyword : '').trim().toLowerCase();

    state.filteredData = state.allData.filter(function (row) {
      var matchAgent = !agent || row.agent.toLowerCase().includes(agent);
      var matchKeyword = !keyword ||
        row.customer.toLowerCase().includes(keyword) ||
        row.workType.toLowerCase().includes(keyword);
      return matchAgent && matchKeyword;
    });

    sortRows(state);
    state.currentPage = 1;
    render(root, state);
  }

  function resetTable(root, state) {
    state.filteredData = state.allData.slice();
    sortRows(state);
    state.currentPage = 1;
    render(root, state);
  }

  function initCheckAll(root) {
    var checkAll = root.querySelector('#checkAll');
    if (!checkAll) return;

    checkAll.addEventListener('change', function () {
      root.querySelectorAll('.rowCheck').forEach(function (checkbox) {
        checkbox.checked = checkAll.checked;
        var row = checkbox.closest('tr');
        if (row) row.classList.toggle('is-selected', checkAll.checked);
      });
    });
  }

  function initPageSize(root, state) {
    var pageSizeSelect = root.querySelector('#pageSizeSelect');
    if (!pageSizeSelect) return;

    pageSizeSelect.addEventListener('change', function () {
      var nextSize = parseInt(pageSizeSelect.value, 10);
      state.pageSize = Number.isNaN(nextSize) ? 10 : nextSize;
      state.currentPage = 1;
      render(root, state);
    });
  }

  function initSort(root, state) {
    var keys = [null, null, null, null, null, 'date', 'callTime', 'agent', 'phone', 'branch', 'customer', 'custNo', 'workType'];
    var headers = Array.from(root.querySelectorAll('.table th'));

    headers.forEach(function (header) {
      if (!header.classList.contains('is-sortable')) return;

      header.addEventListener('click', function () {
        var key = keys[headers.indexOf(header)];
        if (!key) return;

        if (state.sortKey === key) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = key;
          state.sortDirection = 'asc';
        }

        headers.forEach(function (item) {
          item.removeAttribute('data-sort');
        });
        header.setAttribute('data-sort', state.sortDirection);

        sortRows(state);
        render(root, state);
      });
    });
  }

  function initTable(root) {
    if (root.dataset.resultsTableBound === 'true') return;
    root.dataset.resultsTableBound = 'true';

    var state = createState(root);
    root._resultsTableState = state;

    initCheckAll(root);
    initPageSize(root, state);
    initSort(root, state);

    document.addEventListener('search-filter:submit', function (event) {
      applyFilters(root, state, event.detail || {});
    });

    document.addEventListener('search-filter:reset', function () {
      resetTable(root, state);
    });

    render(root, state);
  }

  function initAll() {
    document.querySelectorAll('.resultsCard').forEach(initTable);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.ResultsTable = { initAll: initAll };
})();
