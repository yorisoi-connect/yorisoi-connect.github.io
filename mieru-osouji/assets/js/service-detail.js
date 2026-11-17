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
        ページの頭（.page-hero）が画面から消えたら出す。
        料金（#price）かオプション（#options）が画面に入っている間は隠す
     ------------------------------------------------------------------ */
  var jump = document.querySelector('[data-price-jump]');
  var hero = document.querySelector('.page-hero');
  var targets = ['price', 'options']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (jump && hero && 'IntersectionObserver' in window) {
    var heroVisible = true;
    var visible = {};   // 画面に入っている料金・オプションの id

    function update() {
      var anyTarget = Object.keys(visible).some(function (k) { return visible[k]; });
      jump.classList.toggle('is-shown', !heroVisible && !anyTarget);
    }

    new IntersectionObserver(function (entries) {
      heroVisible = entries[entries.length - 1].isIntersecting;
      update();
    }).observe(hero);

    var targetObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      update();
    }, { rootMargin: '-15% 0px -15% 0px' });

    targets.forEach(function (t) { targetObserver.observe(t); });
  }
});
