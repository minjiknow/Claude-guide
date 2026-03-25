/**
 * input/script.js
 */

$(function () {
  initInput();
});

function initInput() {
  // 이메일 유효성 예시
  $('#input-error').on('input', function () {
    var $input = $(this);
    var $wrapper = $input.closest('.input');
    var val = $input.val();
    var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    if (val.length > 0 && !isValid) {
      $wrapper.addClass('is-error');
    } else {
      $wrapper.removeClass('is-error');
    }
  });
}
