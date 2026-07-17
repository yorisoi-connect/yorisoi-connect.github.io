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

});
