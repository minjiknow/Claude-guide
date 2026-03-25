/**
 * button/script.js
 */

$(function () {
  initButton();
});

function initButton() {
  // loading 상태 예시: 버튼 클릭 시 로딩 처리
  $('.btn').on('click', function () {
    var $btn = $(this);
    if ($btn.hasClass('is-loading') || $btn.hasClass('is-disabled')) return;

    // 필요 시 is-loading 상태 추가 가능
    // $btn.addClass('is-loading');
  });
}
