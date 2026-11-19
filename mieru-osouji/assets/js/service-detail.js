/* ==========================================================================
   みえる！おそうじ サービス詳細ページ用スクリプト
   機能：料金のタブ切り替え（[data-tabs]） / 「料金を見る」固定ボタンの出し入れ（[data-price-jump]）
   JS が動かないときは、タブのパネルは全部縦に並び、固定ボタンは出ない（CSS 側で html.js のときだけ切り替える）
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. タブ（WAI-ARIA の tabs パターン。左右キーでも移動できる）
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });

    var current = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    if (current) select(current, false);
  });

  /* ------------------------------------------------------------------
     2. 「料金を見る」固定ボタン
        ページを開いたときから出しておき、料金（#price）かオプション（#options）が
        画面に入っている間だけ隠す（2026-11-19：早く出すように変更）
     ------------------------------------------------------------------ */
  var jump = document.querySelector('[data-price-jump]');
  var targets = ['price', 'options']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (jump) {
    jump.classList.add('is-shown');

    if ('IntersectionObserver' in window) {
      var visible = {};   // 画面に入っている料金・オプションの id

      var targetObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        var anyTarget = Object.keys(visible).some(function (k) { return visible[k]; });
        jump.classList.toggle('is-shown', !anyTarget);
      }, { rootMargin: '-15% 0px -15% 0px' });

      targets.forEach(function (t) { targetObserver.observe(t); });
    }
  }
});
