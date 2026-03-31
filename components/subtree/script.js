/* ===== SUBTREE COMPONENT ===== */

(function ($) {
  'use strict';

  function initSubtree() {
    $('.subtreePanel').each(function () {
      var $panel = $(this);
      if ($panel.data('subtreeBound')) return;
      $panel.data('subtreeBound', true);

      $panel.on('click', function (e) {
        var $node = $(e.target).closest('.subtreeNode');
        if (!$node.length) return;

        var $item = $node.closest('.subtreeItem');
        var $children = $item.find('> .subtreeChildren');

        if ($children.length) $item.toggleClass('is-open');

        $panel.find('.subtreeNode').removeClass('is-active');
        $node.addClass('is-active');
      });
    });
  }

  $(function () { initSubtree(); });

  window.initSubtree = initSubtree;
}(jQuery));
