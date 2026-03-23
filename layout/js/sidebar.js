/* ===== SIDEBAR TOGGLE ===== */

let _sidebarReady = false;

function initSidebar() {
  if (_sidebarReady) return;

  const lnbIcons = document.getElementById('lnbIcons');
  const lnbText  = document.getElementById('lnbText');

  if (!lnbIcons || !lnbText) return;
  _sidebarReady = true;

  const iconItems = lnbIcons.querySelectorAll('.lnb-icon-item');
  const textItems = lnbText.querySelectorAll('.lnb-text__item');
  const links2    = lnbText.querySelectorAll('.lnb-text__link-2depth');

  /* ─────────────────────────────────────
   * ① 아이콘 클릭 → 텍스트 패널 열기/토글
   * ───────────────────────────────────── */
  iconItems.forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId   = icon.dataset.target;
      const targetItem = document.getElementById(targetId);
      const isActive   = icon.classList.contains('active');

      if (isActive) {
        /* 같은 아이콘 재클릭 → 패널 닫기 */
        icon.classList.remove('active');
        lnbText.classList.remove('visible');
        return;
      }

      /* 다른 아이콘 클릭 */
      iconItems.forEach(el => el.classList.remove('active'));
      icon.classList.add('active');

      textItems.forEach(el => el.classList.remove('open'));
      if (targetItem) targetItem.classList.add('open');

      lnbText.classList.add('visible');
    });
  });

  /* ─────────────────────────────────────
   * ② 1Depth 텍스트 클릭 → 아코디언
   * ───────────────────────────────────── */
  textItems.forEach(item => {
    const link1 = item.querySelector('.lnb-text__link-1depth');
    if (!link1) return;

    link1.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      textItems.forEach(el => el.classList.remove('open'));

      if (!wasOpen) {
        item.classList.add('open');
        /* 아이콘 active 동기화 */
        iconItems.forEach(el => {
          el.classList.toggle('active', el.dataset.target === item.id);
        });
      } else {
        /* 닫으면 아이콘도 비활성 */
        iconItems.forEach(el => el.classList.remove('active'));
      }
    });
  });

  /* ─────────────────────────────────────
   * ③ 2Depth 클릭 → active 처리
   * ───────────────────────────────────── */
  links2.forEach(link => {
    link.addEventListener('click', e => {
      e.stopPropagation();
      links2.forEach(el => el.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebar);
} else {
  initSidebar();
}
