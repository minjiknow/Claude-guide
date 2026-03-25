/* ===== SUBTREE COMPONENT ===== */

(function () {
  'use strict';

  function initSubtree() {
    document.querySelectorAll('.subtreePanel').forEach(function (panel) {
      if (panel.dataset.subtreeBound === 'true') return;
      panel.dataset.subtreeBound = 'true';

      panel.addEventListener('click', function (e) {
        var node = e.target.closest('.subtreeNode');
        if (!node) return;

        var item = node.closest('.subtreeItem');
        var children = item ? item.querySelector(':scope > .subtreeChildren') : null;

        if (children) item.classList.toggle('is-open');

        panel.querySelectorAll('.subtreeNode').forEach(function (n) {
          n.classList.remove('is-active');
        });
        node.classList.add('is-active');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubtree);
  } else {
    initSubtree();
  }

  window.initSubtree = initSubtree;
})();
