/* ===== MAIN APP ===== */

/* ── 더미 데이터 ── */
const AGENTS = ['김민준', '이서연', '박지훈', '최수아', '정다은', '강현우', '윤채원'];
const WORK_TYPES = ['일반상담', '불만처리', '가입안내', '해지처리', '기술지원'];
const BRANCHES = ['2356', '1234', '5678', '9012', '3456'];

function pad(n, len = 2) { return String(n).padStart(len, '0'); }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randItem(arr) { return arr[randInt(0, arr.length - 1)]; }

function generateData(count) {
  return Array.from({ length: count }, (_, i) => {
    const h = pad(randInt(8, 18));
    const m = pad(randInt(0, 59));
    const s = pad(randInt(0, 59));
    const day = pad(randInt(1, 28));
    const mon = pad(randInt(1, 12));
    return {
      no: i + 1,
      date: `2025-${mon}-${day} ${h}:${m}:${s}`,
      callTime: randInt(30, 600),
      agent: randItem(AGENTS),
      phone: `010${pad(randInt(1000,9999),4)}${pad(randInt(1000,9999),4)}`,
      branch: randItem(BRANCHES),
      customer: randItem(['이름A', '이름B', '이름C', '이름D', '이름E']),
      custNo: `C${pad(randInt(10000,99999), 5)}`,
      workType: randItem(WORK_TYPES),
      hasPlay: true,
      hasScreen: Math.random() > 0.3,
      hasMemo: Math.random() > 0.5
    };
  });
}

const allData = generateData(87);
let filteredData = [...allData];

/* ── 테이블 렌더링 ── */
function renderTable(page, pageSize) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  const start = (page - 1) * pageSize;
  const rows = filteredData.slice(start, start + pageSize);

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="13">
        <div class="table-empty">
          <div class="table-empty__icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div class="table-empty__text">검색 결과가 없습니다.</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((row, idx) => {
    const playBtn = `<button class="table-icon-btn table-icon-btn--play" title="녹취 듣기">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    </button>`;
    const screenBtn = row.hasScreen
      ? `<button class="table-icon-btn table-icon-btn--screen" title="화면 보기">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </button>`
      : '';
    const memoBtn = `<button class="table-icon-btn table-icon-btn--memo" title="메모">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
      </svg>
    </button>`;

    return `<tr>
      <td class="col-check"><input type="checkbox" class="table-checkbox row-check"></td>
      <td class="col-icon">${playBtn}</td>
      <td class="col-no">${start + idx + 1}</td>
      <td class="col-icon">${screenBtn}</td>
      <td class="col-icon">${memoBtn}</td>
      <td class="col-date">${row.date}</td>
      <td class="col-num">${row.callTime}</td>
      <td class="col-text">${row.agent}</td>
      <td class="col-num">${row.phone}</td>
      <td class="col-num">${row.branch}</td>
      <td class="col-text">${row.customer}</td>
      <td class="col-num">${row.custNo}</td>
      <td class="col-text">${row.workType}</td>
    </tr>`;
  }).join('');

  // 행 클릭 선택
  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('dblclick', () => {
      tr.classList.toggle('selected');
      const cb = tr.querySelector('.row-check');
      if (cb) cb.checked = tr.classList.contains('selected');
      syncCheckAll();
    });
    tr.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
    });
  });

  // row-check 변경
  tbody.querySelectorAll('.row-check').forEach(cb => {
    cb.addEventListener('change', syncCheckAll);
  });

  syncCheckAll();
  updateTotalCount();
}

function updateTotalCount() {
  const el = document.getElementById('totalCount');
  if (el) el.textContent = filteredData.length.toLocaleString();
}

/* ── 전체 체크 ── */
function initCheckAll() {
  const checkAll = document.getElementById('checkAll');
  if (!checkAll) return;
  checkAll.addEventListener('change', () => {
    document.querySelectorAll('.row-check').forEach(cb => {
      cb.checked = checkAll.checked;
      const tr = cb.closest('tr');
      if (tr) tr.classList.toggle('selected', checkAll.checked);
    });
  });
}

function syncCheckAll() {
  const checkAll = document.getElementById('checkAll');
  if (!checkAll) return;
  const all = document.querySelectorAll('.row-check');
  const checked = document.querySelectorAll('.row-check:checked');
  checkAll.indeterminate = checked.length > 0 && checked.length < all.length;
  checkAll.checked = all.length > 0 && checked.length === all.length;
}

/* ── 조회 ── */
function doSearch() {
  const agent = (document.getElementById('filterText1')?.value || '').trim().toLowerCase();
  const keyword = (document.getElementById('filterText2')?.value || '').trim().toLowerCase();

  filteredData = allData.filter(row => {
    const matchAgent = !agent || row.agent.toLowerCase().includes(agent);
    const matchKey = !keyword || row.customer.toLowerCase().includes(keyword) || row.workType.toLowerCase().includes(keyword);
    return matchAgent && matchKey;
  });

  Pagination.update({ totalItems: filteredData.length, currentPage: 1 });
  renderTable(1, Pagination.pageSize);
}

/* ── 초기화 ── */
function resetSearch() {
  ['filterSelect1', 'filterText1', 'filterText2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filteredData = [...allData];
  Pagination.update({ totalItems: filteredData.length, currentPage: 1 });
  renderTable(1, Pagination.pageSize);
}

/* ── 페이지 사이즈 ── */
function onPageSizeChange(size) {
  Pagination.update({ pageSize: parseInt(size, 10), currentPage: 1 });
  renderTable(1, parseInt(size, 10));
}

/* ── 소트 ── */
function initSort() {
  document.querySelectorAll('.data-table th.sortable').forEach(th => {
    let asc = true;
    th.addEventListener('click', () => {
      const allTh = [...document.querySelectorAll('.data-table th')];
      const idx = allTh.indexOf(th);
      const keys = [null, null, null, null, null, 'date', 'callTime', 'agent', 'phone', 'branch', 'customer', 'custNo', 'workType'];
      const key = keys[idx];
      if (!key) return;

      filteredData.sort((a, b) => {
        const va = a[key], vb = b[key];
        if (typeof va === 'number') return asc ? va - vb : vb - va;
        return asc ? String(va).localeCompare(String(vb), 'ko') : String(vb).localeCompare(String(va), 'ko');
      });
      asc = !asc;

      allTh.forEach(t => t.removeAttribute('data-sort'));
      th.setAttribute('data-sort', asc ? 'desc' : 'asc');

      renderTable(Pagination.currentPage, Pagination.pageSize);
    });
  });
}

/* ── Enter 키 ── */
function initSearchEnter() {
  ['filterText1', 'filterText2'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch();
    });
  });
}

/* ── 즐겨찾기 ── */
function initFavorite() {
  const fav = document.querySelector('.page-header__fav');
  if (fav) {
    fav.addEventListener('click', () => fav.classList.toggle('active'));
  }
}

/* ── 초기화 ── */
let _appReady = false;
function initApp() {
  if (_appReady) return;
  if (!document.getElementById('tableBody')) return;
  _appReady = true;

  Pagination.init({
    totalItems: allData.length,
    pageSize: 10,
    currentPage: 1,
    onPageChange(page, size) {
      renderTable(page, size);
    }
  });

  // 페이지 사이즈 select 기본값 맞추기
  const psEl = document.getElementById('pageSizeSelect');
  if (psEl) psEl.value = '10';

  renderTable(1, 10);
  initCheckAll();
  initSort();
  initSearchEnter();
  initFavorite();
  updateTotalCount();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
