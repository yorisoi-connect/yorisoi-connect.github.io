/* ==========================================================================
   みえる！おそうじ スクロールで動く背景の泡
   ヒーローの下からお問い合わせの上までに、大・中・小の泡を不規則に置く。
   泡はスクロールに少し遅れて縦にだけ動く（泡ごとに遅れ方が違うので奥行きが出る）。
   左右には動かさない（画面に出入りすると視線が取られるため）。
   文字やカードの後ろに置く（.section > .container を手前に出している）。
   配置は乱数の種を固定しているので、開くたびに変わらない。
   動きを減らす設定（prefers-reduced-motion）のときは止まったまま見せる。
   ========================================================================== */

(function () {
  var main = document.querySelector('main');
  var hero = document.querySelector('.hero');
  var contact = document.getElementById('contact');
  if (!main || !hero || !contact) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 目標の位置へ1フレームごとに近づく割合（小さいほどゆっくり動く） */
  var EASE = 0.06;

  /* 画面幅ごとの泡の数と大きさの倍率、左右の端からの内側への寄せ（%）。
     スマホはカードが画面幅いっぱいで泡が隠れやすいので、数を増やして内側に置く */
  function sizeClass() {
    var w = window.innerWidth;
    if (w <= 600) return { name: 'phone', count: 30, scale: 0.6, inset: 12 };
    if (w <= 1040) return { name: 'tablet', count: 24, scale: 0.8, inset: 6 };
    return { name: 'pc', count: 26, scale: 1, inset: 0 };
  }

  /* 種を固定した乱数（0以上1未満） */
  function seededRandom(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var field = document.createElement('div');
  field.className = 'drift-bubbles';
  field.setAttribute('aria-hidden', 'true');
  main.appendChild(field);

  var bubbles = [];
  var current = null;
  var fieldTop = 0;   /* 文書の先頭から泡の範囲の上端まで */
  var fieldH = 0;
  var viewH = 0;
  var running = false;

  function build() {
    current = sizeClass();
    field.innerHTML = '';
    bubbles = [];

    var random = seededRandom(20261105);
    function rand(min, max) { return min + random() * (max - min); }

    var lastLarge = false;
    var lastLeft = false;

    for (var i = 0; i < current.count; i++) {
      var roll = random();
      var kind = roll < 0.45 ? 'small' : roll < 0.8 || lastLarge ? 'medium' : 'large';
      lastLarge = kind === 'large';

      /* 左右が続きすぎないよう、前と反対側に寄りやすくする */
      var left = random() < 0.65 ? !lastLeft : lastLeft;
      lastLeft = left;

      var size, x, opacity;
      if (kind === 'large') {
        size = rand(150, 250);
        x = left ? rand(-6, 10) + current.inset : rand(90, 106) - current.inset;
        opacity = rand(0.3, 0.42);
      } else if (kind === 'medium') {
        size = rand(56, 104);
        x = left ? rand(0, 24) + current.inset : rand(76, 100) - current.inset;
        opacity = rand(0.45, 0.6);
      } else {
        size = rand(14, 34);
        x = rand(current.inset / 2, 100 - current.inset / 2);
        opacity = rand(0.6, 0.85);
      }
      size *= current.scale;

      var outer = document.createElement('span');
      var inner = document.createElement('span');
      outer.className = 'drift-bubble';
      outer.style.left = x.toFixed(1) + '%';
      outer.style.opacity = opacity.toFixed(2);
      inner.className = kind === 'small' && random() < 0.4 ? 'bubble bubble-dot' : 'bubble';
      inner.style.setProperty('--x', (-size / 2).toFixed(1) + 'px');
      inner.style.setProperty('--y', '0px');
      inner.style.setProperty('--s', size.toFixed(1) + 'px');
      inner.style.setProperty('--d', (-rand(0, 7)).toFixed(1) + 's');
      outer.appendChild(inner);
      field.appendChild(outer);

      bubbles.push({
        el: outer,
        size: size,
        yRatio: (i + rand(0.1, 0.9)) / current.count,
        /* 画面の真ん中からの距離に掛ける係数（大きいほど長く画面に残る） */
        follow: reduced ? 0 : rand(0.2, 0.6),
        homeY: 0,
        curY: 0
      });
    }
  }

  /* 泡の範囲と各泡の位置を測り直す（文字の折り返しなどでページの高さが変わるたび） */
  function measure() {
    var scrollY = window.pageYOffset;
    var mainTop = main.getBoundingClientRect().top + scrollY;
    fieldTop = hero.getBoundingClientRect().bottom + scrollY;
    fieldH = contact.getBoundingClientRect().top + scrollY - fieldTop;
    viewH = window.innerHeight;

    field.style.top = fieldTop - mainTop + 'px';
    field.style.height = fieldH + 'px';

    bubbles.forEach(function (b) {
      b.homeY = b.yRatio * fieldH - b.size / 2;
    });
  }

  function targetOf(b) {
    var center = window.pageYOffset + viewH / 2;
    var delta = center - (fieldTop + b.homeY + b.size / 2);
    /* 上下の端で切れて見えないよう、泡の範囲の中に収める */
    return Math.max(-b.homeY, Math.min(delta * b.follow, fieldH - b.homeY - b.size));
  }

  function apply(b) {
    b.el.style.transform = 'translate3d(0, ' + (b.homeY + b.curY).toFixed(1) + 'px, 0)';
  }

  /* その場の位置へ直接置く（最初の表示と測り直しのとき） */
  function placeAll() {
    bubbles.forEach(function (b) {
      b.curY = targetOf(b);
      apply(b);
    });
  }

  /* 目標の位置へ毎フレーム少しずつ近づける（スクロールを止めたあとも少し動き続ける） */
  function tick() {
    var moving = false;
    bubbles.forEach(function (b) {
      var dy = targetOf(b) - b.curY;
      if (Math.abs(dy) < 0.1) return;
      b.curY += dy * EASE;
      apply(b);
      moving = true;
    });
    if (moving) {
      requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  function start() {
    if (running || reduced) return;
    running = true;
    requestAnimationFrame(tick);
  }

  function refresh() {
    if (sizeClass().name !== current.name) build();
    measure();
    placeAll();
  }

  build();
  refresh();

  if (!reduced) window.addEventListener('scroll', start, { passive: true });
  window.addEventListener('resize', refresh);
  window.addEventListener('load', refresh);

  /* FAQの開閉や画像の読み込みでページの高さが変わったとき */
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      measure();
      start();
    }).observe(main);
  }
})();
