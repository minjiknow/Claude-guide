/* ===== DROPBOX (CUSTOM SELECT) COMPONENT ===== */
/* 단일 선택: data-component="dropbox"            */
/* 멀티 선택: data-component="dropbox" data-multi="true" */

(function () {
  'use strict';

  /* ── 내부 열기/닫기 헬퍼 ── */
  function _open(el) {
    el.classList.add('active');
    var opt = el.querySelector('.dropbox-option');
    if (opt) opt.classList.add('active');
    var combo = el.closest('.inputCombo');
    if (combo) combo.classList.add('is-dropbox-open');
  }

  function _close(el) {
    el.classList.remove('active');
    var opt = el.querySelector('.dropbox-option');
    if (opt) opt.classList.remove('active');
    var combo = el.closest('.inputCombo');
    if (combo) combo.classList.remove('is-dropbox-open');
  }

  /* ── 외부 클릭 시 전체 닫기 ── */
  document.addEventListener('click', function () {
    document.querySelectorAll('[data-component="dropbox"].active').forEach(_close);
  });

  /* ── Dropbox 생성자 ── */
  function Dropbox(el) {
    this.el          = el;
    this.isMulti     = el.dataset.multi === 'true';
    this.trigger     = el.querySelector('.selected-text');
    this.optionList  = el.querySelector('.dropbox-option');
    this.items       = Array.prototype.slice.call(el.querySelectorAll('.dropbox-option li'));
    this.placeholder = this.trigger ? this.trigger.textContent.trim() : '선택';
    this._selected   = [];   /* [{ value, text }] */

    this._bindEvents();
  }

  /* ── 이벤트 바인딩 ── */
  Dropbox.prototype._bindEvents = function () {
    var self = this;

    /* 트리거(박스) 클릭 → 토글 */
    this.el.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = self.el.classList.contains('active');
      /* 다른 드롭박스 모두 닫기 */
      document.querySelectorAll('[data-component="dropbox"].active').forEach(function (d) {
        if (d !== self.el) _close(d);
      });
      isOpen ? _close(self.el) : _open(self.el);
    });

    /* 옵션 항목 클릭 */
    this.items.forEach(function (li) {
      li.addEventListener('click', function (e) {
        e.stopPropagation();
        if (self.isMulti) {
          self._toggleItem(li);        /* 멀티: 닫지 않음 */
        } else {
          self._selectItem(li);
          _close(self.el);             /* 단일: 선택 후 닫기 */
        }
      });
    });
  };

  /* ── 단일 선택 ── */
  Dropbox.prototype._selectItem = function (li) {
    this.items.forEach(function (item) { item.classList.remove('selected'); });
    li.classList.add('selected');
    var textEl = li.querySelector('.option-text');
    var label  = textEl ? textEl.textContent.trim() : '';
    var value  = li.dataset.value !== undefined ? li.dataset.value : label;
    this._selected = [{ value: value, text: label }];
    this._updateDisplay();
  };

  /* ── 멀티 토글 ── */
  Dropbox.prototype._toggleItem = function (li) {
    var textEl = li.querySelector('.option-text');
    var label  = textEl ? textEl.textContent.trim() : '';
    var value  = li.dataset.value !== undefined ? li.dataset.value : label;
    var idx    = -1;
    this._selected.forEach(function (s, i) { if (s.value === value) idx = i; });

    if (idx > -1) {
      this._selected.splice(idx, 1);
      li.classList.remove('selected');
    } else {
      this._selected.push({ value: value, text: label });
      li.classList.add('selected');
    }
    this._updateDisplay();
  };

  /* ── 표시 텍스트 업데이트 ── */
  Dropbox.prototype._updateDisplay = function () {
    if (!this.trigger) return;
    if (this._selected.length === 0) {
      this.trigger.textContent = this.placeholder;
      this.el.classList.remove('has-value');
    } else {
      this.trigger.textContent = this._selected.map(function (s) { return s.text; }).join(', ');
      this.el.classList.add('has-value');
    }
  };

  /* ── 공개 API ── */

  /** 현재 선택값 반환. 단일: string|null, 멀티: string[] */
  Dropbox.prototype.getValue = function () {
    if (this.isMulti) {
      return this._selected.map(function (s) { return s.value; });
    }
    return this._selected.length ? this._selected[0].value : null;
  };

  /** 선택 초기화 */
  Dropbox.prototype.reset = function () {
    this._selected = [];
    this.items.forEach(function (li) { li.classList.remove('selected'); });
    this._updateDisplay();
    _close(this.el);
  };

  /* ── 자동 초기화 ── */
  function initAll() {
    document.querySelectorAll('[data-component="dropbox"]').forEach(function (el) {
      if (!el._dropboxInstance) {
        el._dropboxInstance = new Dropbox(el);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  /* ── 전역 노출 ── */
  window.Dropbox = Dropbox;
})();
