/* ===== DROPBOX (CUSTOM SELECT) COMPONENT ===== */

(function ($) {
  'use strict';

  function _open($el) {
    $el.removeClass('is-up');
    $el.addClass('active');
    $el.find('.dropbox-option').addClass('active');
    $el.closest('.inputCombo').addClass('is-dropbox-open');

    // 뷰포트 아래로 잘리면 위로 열기
    var $option = $el.find('.dropbox-option');
    var rect = $option[0].getBoundingClientRect();
    if (rect.bottom > window.innerHeight) {
      $el.addClass('is-up');
    }
  }

  function _close($el) {
    $el.removeClass('active is-up');
    $el.find('.dropbox-option').removeClass('active');
    $el.closest('.inputCombo').removeClass('is-dropbox-open');
  }

  $(document).on('click', function () {
    $('[data-component="dropbox"].active').each(function () {
      _close($(this));
    });
  });

  function Dropbox(el) {
    this.$el = $(el);
    this.isMulti = this.$el.attr('data-multi') === 'true';
    this.$trigger = this.$el.find('.selected-text');
    this.$optionList = this.$el.find('.dropbox-option');
    this.$items = this.$el.find('.dropbox-option li');
    this.placeholder = this.$trigger.text().trim() || '선택';
    this._selected = [];
    this._bindEvents();
  }

  Dropbox.prototype._bindEvents = function () {
    var self = this;

    this.$el.on('click', function (e) {
      e.stopPropagation();
      if (self.$el.hasClass('is-disabled')) return;
      var isOpen = self.$el.hasClass('active');
      $('[data-component="dropbox"].active').each(function () {
        if (this !== self.$el[0]) _close($(this));
      });
      isOpen ? _close(self.$el) : _open(self.$el);
    });

    this.$items.on('click', function (e) {
      e.stopPropagation();
      if (self.isMulti) {
        self._toggleItem($(this));
      } else {
        self._selectItem($(this));
        _close(self.$el);
      }
    });
  };

  Dropbox.prototype._selectItem = function ($li) {
    this.$items.removeClass('selected');
    $li.addClass('selected');
    var label = $li.find('.option-text').text().trim();
    var value = $li.attr('data-value') !== undefined ? $li.attr('data-value') : label;
    this._selected = [{ value: value, text: label }];
    this._updateDisplay();
  };

  Dropbox.prototype._toggleItem = function ($li) {
    var label = $li.find('.option-text').text().trim();
    var value = $li.attr('data-value') !== undefined ? $li.attr('data-value') : label;
    var idx = -1;
    $.each(this._selected, function (i, s) {
      if (s.value === value) { idx = i; return false; }
    });
    if (idx > -1) {
      this._selected.splice(idx, 1);
      $li.removeClass('selected');
    } else {
      this._selected.push({ value: value, text: label });
      $li.addClass('selected');
    }
    this._updateDisplay();
  };

  Dropbox.prototype._updateDisplay = function () {
    if (!this.$trigger.length) return;
    if (this._selected.length === 0) {
      this.$trigger.text(this.placeholder);
      this.$el.removeClass('has-value');
    } else {
      this.$trigger.text($.map(this._selected, function (s) { return s.text; }).join(', '));
      this.$el.addClass('has-value');
    }
  };

  Dropbox.prototype.getValue = function () {
    if (this.isMulti) return $.map(this._selected, function (s) { return s.value; });
    return this._selected.length ? this._selected[0].value : null;
  };

  Dropbox.prototype.reset = function () {
    this._selected = [];
    this.$items.removeClass('selected');
    this._updateDisplay();
    _close(this.$el);
  };

  function initAll() {
    $('[data-component="dropbox"]').each(function () {
      if (!$.data(this, 'dropboxInstance')) {
        $.data(this, 'dropboxInstance', new Dropbox(this));
      }
    });
  }

  $(function () { initAll(); });

  window.Dropbox = Dropbox;
}(jQuery));
