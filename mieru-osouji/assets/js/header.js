/* ==========================================================================
   みえる！おそうじ ヘッダーの出し入れ（全ページ共通）
   ページの一番上には黄色の帯のヘッダーを置き（スクロールでいっしょに流れる）、
   それが画面から消えたら、白いヘッダーを画面の上に固定して上からスッと出す（2026-11-19）。
   固定にするとヘッダーぶん本文が上に詰まるので、そのぶん body に余白を足す
   ========================================================================== */
(function () {
  var header = document.getElementById('site-header');
  if (!header) return;

  var floating = false;

  function update() {
    // 黄色の帯（下に垂れた拭き跡を含む）が画面から出たら固定に切り替える
    var shouldFloat = window.scrollY > header.offsetHeight + 40;
    if (shouldFloat === floating) return;
    floating = shouldFloat;
    header.classList.toggle('is-floating', floating);
    document.body.classList.toggle('header-floating', floating);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
