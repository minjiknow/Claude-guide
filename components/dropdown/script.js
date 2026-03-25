/**
 * dropdown/script.js
 * 초기화는 common.js의 initDropbox()에서 처리
 */

$(function () {
  // aria-expanded 상태 동기화
  $(document).on('click', '[data-component="dropbox"] .selected-text', function () {
    var $dropbox = $(this).closest('.dropbox');
    var isOpen = $dropbox.hasClass('is-open');
    $(this).attr('aria-expanded', isOpen ? 'true' : 'false');
  });
});
