/* ===== PAGINATION MODULE ===== */

const Pagination = (() => {
  let state = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    onPageChange: null
  };

  function totalPages() {
    return Math.max(1, Math.ceil(state.totalItems / state.pageSize));
  }

  function render() {
    const container = document.getElementById('pagination');
    if (!container) return;

    const total = totalPages();
    const cur = state.currentPage;
    const maxVisible = 10; // 한 번에 보여줄 페이지 번호 수

    // 페이지 그룹 계산
    const groupSize = maxVisible;
    const groupStart = Math.floor((cur - 1) / groupSize) * groupSize + 1;
    const groupEnd = Math.min(groupStart + groupSize - 1, total);

    let html = '';

    // 처음으로
    html += `<button class="pagination__btn pagination__btn--nav" ${cur === 1 ? 'disabled' : ''} data-page="1" title="처음">«</button>`;
    // 이전
    html += `<button class="pagination__btn pagination__btn--nav" ${cur === 1 ? 'disabled' : ''} data-page="${cur - 1}" title="이전">‹</button>`;

    // 페이지 번호
    for (let p = groupStart; p <= groupEnd; p++) {
      html += `<button class="pagination__btn${p === cur ? ' active' : ''}" data-page="${p}">${p}</button>`;
    }

    // 다음
    html += `<button class="pagination__btn pagination__btn--nav" ${cur === total ? 'disabled' : ''} data-page="${cur + 1}" title="다음">›</button>`;
    // 마지막으로
    html += `<button class="pagination__btn pagination__btn--nav" ${cur === total ? 'disabled' : ''} data-page="${total}" title="마지막">»</button>`;

    container.innerHTML = html;

    // 이벤트
    container.querySelectorAll('.pagination__btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page, 10);
        if (!isNaN(p) && p !== cur) {
          goTo(p);
        }
      });
    });

    // 페이지 정보 업데이트
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) pageInfo.textContent = `${cur} / ${total} 페이지`;

    const totalCountEl = document.getElementById('totalCount');
    if (totalCountEl) totalCountEl.textContent = state.totalItems.toLocaleString();

    const totalPagesEl = document.getElementById('totalPages');
    if (totalPagesEl) totalPagesEl.textContent = total;
  }

  function goTo(page) {
    const total = totalPages();
    if (page < 1) page = 1;
    if (page > total) page = total;
    state.currentPage = page;
    render();
    if (typeof state.onPageChange === 'function') {
      state.onPageChange(page, state.pageSize);
    }
  }

  function init({ totalItems, pageSize = 10, currentPage = 1, onPageChange }) {
    state.totalItems = totalItems;
    state.pageSize = pageSize;
    state.currentPage = currentPage;
    state.onPageChange = onPageChange;
    render();
  }

  function update({ totalItems, pageSize, currentPage }) {
    if (totalItems !== undefined) state.totalItems = totalItems;
    if (pageSize !== undefined) state.pageSize = pageSize;
    if (currentPage !== undefined) state.currentPage = currentPage;
    render();
  }

  return { init, update, goTo, get currentPage() { return state.currentPage; }, get pageSize() { return state.pageSize; } };
})();
