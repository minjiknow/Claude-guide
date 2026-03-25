/* =============================================
   SUBTREE — toggle expand / active
   ============================================= */
(function () {
  document.querySelectorAll('.subtreePanel').forEach(function (panel) {
    panel.addEventListener('click', function (e) {
      var node = e.target.closest('.subtreeNode');
      if (!node) return;

      var item = node.closest('.subtreeItem');
      var children = item ? item.querySelector(':scope > .subtreeChildren') : null;

      // toggle expand if has children
      if (children) {
        item.classList.toggle('is-open');
      }

      // set active
      panel.querySelectorAll('.subtreeNode').forEach(function (n) {
        n.classList.remove('is-active');
      });
      node.classList.add('is-active');
    });
  });
})();
