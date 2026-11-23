/* ==========================================================================
   みえる！おそうじ 動きの追加（2026-11-23）
   1. 作業の流れ：一覧が画面に入ったら .is-playing を付け、番号と点線を順番に出す（CSS 側）
   2. 「上にもどる」ボタン：少しスクロールしたら出す
   どちらも、動きを減らす設定のときは CSS 側で動きを止める
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var flow = document.querySelector('.flow-list');
  if (flow) {
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { flow.classList.add('is-playing'); ob.disconnect(); }
        });
      }, { threshold: 0.2 });
      ob.observe(flow);
    } else {
      flow.classList.add('is-playing');
    }
  }

  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var update = function () { toTop.classList.toggle('is-shown', window.scrollY > 600); };
    window.addEventListener('scroll', update, { passive: true });
    update();
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
});
