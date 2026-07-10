/* ==========================================================================
   もしもしコール 共通スクリプト
   機能：ヘッダーのスクロール検知 / ハンバーガーメニュー /
        FAQアコーディオン / スクロール時のフェードイン / ブログカテゴリフィルター
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. ヘッダー：スクロールで背景色を変える
     ------------------------------------------------------------------ */
  var header = document.getElementById('site-header');

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 読み込み時にも判定

  /* ------------------------------------------------------------------
     2. ハンバーガーメニュー（モバイル）
     ------------------------------------------------------------------ */
  var hamburger = document.getElementById('hamburger');
  var globalNav = document.getElementById('global-nav');

  if (hamburger && globalNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = globalNav.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    });

    // メニュー内のリンクをタップしたら閉じる（ページ内アンカー対策）
    globalNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        globalNav.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------
     3. FAQアコーディオン（開閉アニメーション付き）
     ------------------------------------------------------------------ */
  document.querySelectorAll('.faq-question').forEach(function (button) {
    button.addEventListener('click', function () {
      var answer = button.nextElementSibling;
      var isOpen = button.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        // 閉じる：max-height が none のときに備えて現在の高さを明示してから 0 へ
        button.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        requestAnimationFrame(function () {
          answer.style.maxHeight = '0';
        });
      } else {
        // 開く：scrollHeight までアニメーションし、完了後は none にして見切れを防ぐ
        button.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.addEventListener('transitionend', function onEnd(e) {
          if (e.propertyName === 'max-height' && button.getAttribute('aria-expanded') === 'true') {
            answer.style.maxHeight = 'none';
          }
        }, { once: true });
      }
    });
  });

  /* ------------------------------------------------------------------
     4. スクロールで要素をフェードイン表示（IntersectionObserver）
     ------------------------------------------------------------------ */
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length > 0) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // 一度表示したら監視を解除
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // 非対応ブラウザではそのまま表示
    fadeEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------
     5. マーカーハイライトアニメーション（.marker-text）
     ------------------------------------------------------------------ */
  var markerEls = document.querySelectorAll('.marker-text');

  if ('IntersectionObserver' in window && markerEls.length > 0) {
    var markerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setTimeout(function () {
              entry.target.classList.add('is-marked');
            }, 200);
            markerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.8 }
    );

    markerEls.forEach(function (el) {
      markerObserver.observe(el);
    });
  } else {
    markerEls.forEach(function (el) {
      el.classList.add('is-marked');
    });
  }

  /* ------------------------------------------------------------------
     6. 利用者の声：カルーセル（ページ単位スナップ）
     ------------------------------------------------------------------ */
  (function () {
    var wrap = document.querySelector('.voice-carousel-wrap');
    if (!wrap) return;

    var track = wrap.querySelector('.carousel-track');
    var slides = Array.from(track.querySelectorAll('.carousel-slide'));
    var prevBtn = wrap.querySelector('.carousel-btn-prev');
    var nextBtn = wrap.querySelector('.carousel-btn-next');
    var dotsWrap = document.querySelector('.carousel-dots');
    var currentPage = 0;

    function getSlidesPerView() {
      if (window.innerWidth < 480) return 1;
      if (window.innerWidth < 768) return 2;
      return 3;
    }

    function getPageCount() {
      return Math.ceil(slides.length / getSlidesPerView());
    }

    function updateSlideWidths() {
      var perView = getSlidesPerView();
      slides.forEach(function (s) {
        s.style.flex = '0 0 calc(100% / ' + perView + ')';
      });
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      var pages = getPageCount();
      if (pages <= 1) return;
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === currentPage ? ' is-active' : '');
        dot.setAttribute('aria-label', (i + 1) + 'ページ目');
        (function (idx) {
          dot.addEventListener('click', function () { goTo(idx); });
        })(i);
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsWrap) return;
      Array.from(dotsWrap.querySelectorAll('.carousel-dot')).forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === currentPage);
      });
    }

    function getNavPadding() {
      if (window.innerWidth < 480) return '36px';
      if (window.innerWidth < 768) return '44px';
      return '52px';
    }

    function updateButtons() {
      var pages = getPageCount();
      if (pages <= 1) {
        wrap.style.paddingLeft = '';
        wrap.style.paddingRight = '';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
      } else {
        var pad = getNavPadding();
        wrap.style.paddingLeft = pad;
        wrap.style.paddingRight = pad;
        if (prevBtn) {
          prevBtn.style.display = 'flex';
          prevBtn.disabled = currentPage === 0;
        }
        if (nextBtn) {
          nextBtn.style.display = 'flex';
          nextBtn.disabled = currentPage >= pages - 1;
        }
      }
    }

    function goTo(page) {
      var pages = getPageCount();
      currentPage = Math.max(0, Math.min(page, pages - 1));
      track.style.transform = 'translateX(-' + (currentPage * 100) + '%)';
      updateDots();
      updateButtons();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentPage - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentPage + 1); });

    // タッチスワイプ
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(currentPage + (diff > 0 ? 1 : -1));
    }, { passive: true });

    // ウィンドウリサイズ
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        updateSlideWidths();
        buildDots();
        goTo(Math.min(currentPage, getPageCount() - 1));
      }, 200);
    });

    updateSlideWidths();
    buildDots();
    updateButtons();
  })();

  /* ------------------------------------------------------------------
     8. ブログ：カテゴリフィルター（blog/index.html用）
        - .filter-btn の data-filter 値と
          .blog-card の data-category 値を突き合わせて表示を切り替える
     ------------------------------------------------------------------ */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var blogCards = document.querySelectorAll('.blog-card');

  if (filterButtons.length > 0 && blogCards.length > 0) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        // ボタンのアクティブ状態を更新
        filterButtons.forEach(function (b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');

        // カードの表示・非表示を切り替え
        blogCards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          var show = filter === 'all' || filter === category;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

});
