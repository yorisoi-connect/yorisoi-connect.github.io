/* ==========================================================================
   よりそいコネクト 共通計測スクリプト(GA4カスタムイベント)
   全サイト共通で /assets/js/analytics.js として読み込む。
   gtag.js(GA4)が設置されていないページでは何もしない。
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  function sendEvent(eventName, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
  }

  /* ------------------------------------------------------------------
     1. 電話番号タップの計測(click_tel)
        すべての <a href="tel:..."> を対象にする
     ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      sendEvent('click_tel', {
        'phone_number': link.getAttribute('href').replace(/^tel:/, ''),
        'page_path': window.location.pathname
      });
    });
  });

  /* ------------------------------------------------------------------
     2. 重要セクションの閲覧計測(view_section)
        data-ga-section 属性を持つ要素が「50%以上表示」された時点で
        1回だけイベントを送信する。
        ※画面より縦に長いセクションは50%表示に達しないため、
          「セクションがビューポートの50%以上を占めた時点」でも発火させる。
        ※既存のフェードイン用IntersectionObserver(.fade-in)とは
          別インスタンスのため干渉しない。
     ------------------------------------------------------------------ */
  var trackedSections = document.querySelectorAll('[data-ga-section]');

  if ('IntersectionObserver' in window && trackedSections.length > 0) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var halfVisible = entry.intersectionRatio >= 0.5;
          var fillsHalfViewport =
            entry.intersectionRect.height >= window.innerHeight * 0.5;

          if (halfVisible || fillsHalfViewport) {
            sectionObserver.unobserve(entry.target); // 1回だけ送信
            sendEvent('view_section', {
              'section_name': entry.target.getAttribute('data-ga-section'),
              'page_path': window.location.pathname
            });
          }
        });
      },
      // 長いセクションでもビューポート占有率の判定が働くよう、段階的に監視する
      { threshold: [0.1, 0.2, 0.3, 0.4, 0.5] }
    );

    trackedSections.forEach(function (el) {
      sectionObserver.observe(el);
    });
  }

});
