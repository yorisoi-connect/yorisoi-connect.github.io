/* ==========================================================================
   みえる！おそうじ 料金カードのカルーセル
   カードの並びは CSS の横スクロール（scroll-snap）で動くので、JSなしでもスワイプで見られる。
   このスクリプトは左右ボタンで「いま見えている枚数ぶん」送る役と、端でボタンを無効にする役だけ。
   ========================================================================== */

(function () {
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('[data-carousel-track]');
    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;

    /* いま一度に見えているカードの枚数ぶんの幅（カード幅＋すきま × 枚数） */
    function pageWidth() {
      var card = track.firstElementChild;
      if (!card) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var unit = card.getBoundingClientRect().width + gap;
      var perView = Math.max(1, Math.floor((track.clientWidth + gap) / unit));
      return perView * unit;
    }

    function update() {
      var max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max;
    }

    prev.addEventListener('click', function () {
      track.scrollBy({ left: -pageWidth() });
    });

    next.addEventListener('click', function () {
      track.scrollBy({ left: pageWidth() });
    });

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
