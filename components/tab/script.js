/* =============================================
   TAB COMPONENT
   사용법:
     <div data-component="tab">
       <div class="tabList" role="tablist">
         <button class="tabBtn" data-tab-target="panel1" type="button">Tab 1</button>
         <button class="tabBtn" data-tab-target="panel2" type="button">Tab 2</button>
       </div>
       <div class="tabContent">
         <div class="tabPanel" id="panel1">...</div>
         <div class="tabPanel" id="panel2">...</div>
       </div>
     </div>
   ============================================= */

(function ($) {
  'use strict';

  function Tab(el) {
    this.$el    = $(el);
    this.$btns  = this.$el.find('.tabBtn');
    this._init();
  }

  // 초기화: 이미 active 탭 없으면 첫 번째 활성화 + 클릭 이벤트 바인딩
  Tab.prototype._init = function () {
    var self = this;

    if (!this.$btns.filter('.is-active').length) {
      this.activate(this.$btns.first());
    }

    this.$btns.on('click', function () {
      self.activate($(this));
    });
  };

  // 탭 활성화: 버튼 + 대응 패널에 is-active 적용
  Tab.prototype.activate = function ($btn) {
    if (!$btn || !$btn.length) return;

    var target = $btn.attr('data-tab-target');

    this.$btns
      .removeClass('is-active')
      .attr('aria-selected', 'false');

    this.$el.find('.tabPanel').removeClass('is-active');

    $btn
      .addClass('is-active')
      .attr('aria-selected', 'true');

    if (target) {
      $('#' + target).addClass('is-active');
    }
  };

  // 첫 번째 탭으로 초기화
  Tab.prototype.reset = function () {
    this.activate(this.$btns.first());
  };

  // 인스턴스 접근
  Tab.getInstance = function (el) {
    return $(el).data('tabInstance') || null;
  };

  // 자동 초기화
  function initAll(ctx) {
    var $targets = ctx
      ? $(ctx).find('[data-component="tab"]').addBack('[data-component="tab"]')
      : $('[data-component="tab"]');

    $targets.each(function () {
      if (!$(this).data('tabInstance')) {
        $(this).data('tabInstance', new Tab(this));
      }
    });
  }

  $(function () { initAll(); });

  window.Tab = {
    init       : initAll,
    getInstance: Tab.getInstance,
    Tab        : Tab
  };

}(jQuery));