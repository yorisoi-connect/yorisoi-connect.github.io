/* ==========================================================================
   よりそいコネクト 共通スクリプト（トップ・会社概要・ブログ）
   機能：文字サイズ切り替え / ヘッダーのスクロール検知 / ハンバーガーメニュー /
        スクロール時の出現アニメ / ブログのカテゴリフィルター
   ※ html.js と html.fs-lg の付与は各ページ冒頭のインラインスクリプトが行う
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. 文字サイズ切り替え（もしもしコールと同じ localStorage キー mc-fs を共有）
     ------------------------------------------------------------------ */
  var fsButtons = document.querySelectorAll('.fs-btn');

  function updateFsButtons() {
    var isLarge = document.documentElement.classList.contains('fs-lg');
    fsButtons.forEach(function (btn) {
      var active = (btn.getAttribute('data-fs') === 'lg') === isLarge;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  fsButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var large = btn.getAttribute('data-fs') === 'lg';
      document.documentElement.classList.toggle('fs-lg', large);
      try {
        localStorage.setItem('mc-fs', large ? 'lg' : 'std');
      } catch (e) { /* 保存できなくても切り替え自体は動かす */ }
      updateFsButtons();
    });
  });

  updateFsButtons();

  /* ------------------------------------------------------------------
     2. ヘッダー：スクロールしたら影を付ける
     ------------------------------------------------------------------ */
  var header = document.getElementById('site-header');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. ハンバーガーメニュー（モバイル）
     ------------------------------------------------------------------ */
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('global-nav');

  function closeMenu() {
    hamburger.classList.remove('is-open');
    nav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
  }

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      hamburger.classList.toggle('is-open', open);
      nav.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });

    // ページ内リンクを押したらメニューを閉じる
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ------------------------------------------------------------------
     4. スクロールで要素を出現表示（.fade-in / .rise / .wipe に .is-visible を付ける）
     ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.fade-in, .rise, .wipe');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    // .wipe は clip-path で完全に切り抜かれていて交差判定が成立しないため、
    // 親要素を監視し、その上端が画面に入ったら見出し本体を出現させる
    var wipeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(':scope > .wipe').forEach(function (el) {
            el.classList.add('is-visible');
          });
          wipeObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });

    revealEls.forEach(function (el) {
      if (el.classList.contains('wipe')) {
        wipeObserver.observe(el.parentElement);
      } else {
        observer.observe(el);
      }
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------
     5. ブログ：カテゴリフィルター（.filter-btn の data-filter と
        .blog-card の data-category を突き合わせる）
     ------------------------------------------------------------------ */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var blogCards = document.querySelectorAll('.blog-card');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');
      filterButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      blogCards.forEach(function (card) {
        var show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !show);
        // 表示し直したカードはふわっと出す（アニメを再生し直すため一度外す）
        card.classList.remove('is-shown');
        if (show) {
          void card.offsetWidth;
          card.classList.add('is-shown');
        }
      });
    });
  });

});
