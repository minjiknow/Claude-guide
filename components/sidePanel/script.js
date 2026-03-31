/* =============================================
   SIDE PANEL COMPONENT
   사용법:
     HTML 구조:
       <div class="sideBackdrop" id="sideBackdrop" aria-hidden="true"></div>
       <aside class="sidePanel" id="sidePanel" role="dialog" aria-modal="true" aria-labelledby="sidePanelTitle">
         <div class="sidePanelHeader">
           <h2 class="sidePanelTitle" id="sidePanelTitle">제목</h2>
         </div>
         <div data-component="tab" class="tabWrap" id="sidePanelTab">
           <div class="tabList" role="tablist">
             <button class="tabBtn" data-tab-target="tabPanel1" type="button" role="tab">탭1</button>
             <button class="tabBtn" data-tab-target="tabPanel2" type="button" role="tab">탭2</button>
           </div>
           <div class="tabContent">
             <div class="tabPanel" id="tabPanel1" role="tabpanel">
               <div class="sidePanelBody" id="sidePanelBodyOn"></div>
             </div>
             <div class="tabPanel" id="tabPanel2" role="tabpanel">
               <div class="sidePanelBody" id="sidePanelBodyOff"></div>
             </div>
           </div>
         </div>
       </aside>

     JS:
       window.SidePanel.open({
         title    : '패널 제목',
         contentOn : '탭1에 들어갈 HTML 문자열',
         contentOff: '탭2에 들어갈 HTML 문자열',
         onOpen   : function() { }  // 패널 열린 후 콜백
       });
       window.SidePanel.close();
   ============================================= */

(function ($) {
  'use strict';

  var $panel, $backdrop, $title, $bodyOn, $bodyOff;

  function open(opts) {
    opts = opts || {};

    if (opts.title !== undefined)      $title.text(opts.title);
    if (opts.contentOn !== undefined)  $bodyOn.html(opts.contentOn);
    if (opts.contentOff !== undefined) $bodyOff.html(opts.contentOff);

    // 첫 번째 탭으로 초기화
    var tabInstance = window.Tab && window.Tab.getInstance($('#sidePanelTab')[0]);
    if (tabInstance) tabInstance.reset();

    $backdrop.addClass('is-open');
    $panel.addClass('is-open');
    $panel.attr('aria-hidden', 'false');
    $('body').css('overflow', 'hidden');

    if (typeof opts.onOpen === 'function') opts.onOpen();
  }

  function close() {
    $backdrop.removeClass('is-open');
    $panel.removeClass('is-open');
    $panel.attr('aria-hidden', 'true');
    $('body').css('overflow', '');
  }

  function init() {
    $panel    = $('#sidePanel');
    $backdrop = $('#sideBackdrop');
    $title    = $('#sidePanelTitle');
    $bodyOn   = $('#sidePanelBodyOn');
    $bodyOff  = $('#sidePanelBodyOff');

    if (!$panel.length) return;

    // 백드롭 클릭으로 닫기
    $backdrop.on('click', close);

    // ESC 키로 닫기
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' && $panel.hasClass('is-open')) close();
    });
  }

  $(function () { init(); });

  window.SidePanel = { open: open, close: close };

}(jQuery));
