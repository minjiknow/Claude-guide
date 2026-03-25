/**
 * common.js
 * 전역 초기화 및 공통 유틸리티
 */

$(function () {
  initDropbox();
});

/**
 * Dropbox 초기화
 * data-component="dropbox" 대상 전체 바인딩
 */
function initDropbox() {
  $('[data-component="dropbox"]').each(function () {
    var $dropbox = $(this);
    var $trigger = $dropbox.find('.selected-text');
    var $options = $dropbox.find('.dropbox-option');

    // 트리거 클릭 → 열기/닫기
    $trigger.on('click', function (e) {
      e.stopPropagation();
      var isOpen = $dropbox.hasClass('is-open');

      // 다른 열린 드롭박스 모두 닫기
      $('[data-component="dropbox"]').not($dropbox).removeClass('is-open');

      $dropbox.toggleClass('is-open', !isOpen);
    });

    // 옵션 선택
    $options.find('li').on('click', function () {
      var $item = $(this);
      var text = $item.find('.option-text').text();

      $options.find('li').removeClass('is-selected');
      $item.addClass('is-selected');
      $trigger.text(text);
      $dropbox.removeClass('is-open');
    });
  });

  // 외부 클릭 시 닫기
  $(document).on('click', function () {
    $('[data-component="dropbox"]').removeClass('is-open');
  });
}
