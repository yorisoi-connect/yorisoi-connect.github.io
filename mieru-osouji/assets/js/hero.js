/* ==========================================================================
   みえる！おそうじ ファーストビューの拭き取り演出
   流れ：「料金」「作業」「仕上がり」の汚れを、布巾を持った手が順番に拭き取る
        （1語ごとに左下→上の真ん中→下の真ん中→右上の3ストローク）→ 見出しの
        まわりにキラキラ → 「すべて」の下にマーカーが引かれる
   汚れはこのスクリプトが作るので、JSが動かない環境では最初からきれいな見出しになる。
   動きを減らす設定（prefers-reduced-motion）のときは演出せず完成形だけ見せる。
   ========================================================================== */

(function () {
  var title = document.getElementById('hero-title');
  if (!title) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    title.classList.add('is-ready');
    return;
  }

  var DIRT_COLORS = ['#8C7B62', '#9C8A6C', '#7A6C56', '#A99677', '#6F624E'];
  var SPARKLE_COLORS = ['#B5D84A', '#9ACD8A', '#C6E26E'];

  var HAND_SVG =
    '<svg viewBox="0 0 64 64" aria-hidden="true" stroke="#2E4A33" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">' +
      '<path fill="#E3F4A6" d="M9 22C7 15 12 10 19 11L47 9C54 8 58 13 57 20L55 47C55 54 50 57 43 56L16 55C9 55 6 50 7 43Z"/>' +
      '<path fill="#fff" d="M22 37C17 36 13 32 13.5 28.5C14 25.5 17.5 25.5 19.5 27.5L23 31"/>' +
      '<rect fill="#fff" x="21" y="15" width="7" height="22" rx="3.5"/>' +
      '<rect fill="#fff" x="28.5" y="12" width="7" height="24" rx="3.5"/>' +
      '<rect fill="#fff" x="36" y="14" width="7" height="22" rx="3.5"/>' +
      '<rect fill="#fff" x="43.5" y="19" width="6.5" height="18" rx="3.25"/>' +
      '<path fill="#fff" stroke="none" d="M22.2 32.2H48.8L48 42C47 47.5 42.5 49.8 36 49.8H30C24.5 49.8 21 46.5 20.3 42Z"/>' +
      '<path fill="none" d="M21 31L19 42C20 47 24 51 30 51H36C43 51 48 48 49 42L50 31"/>' +
    '</svg>';

  var SPARKLE_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C12.8 7 17 11.2 24 12C17 12.8 12.8 17 12 24C11.2 17 7 12.8 0 12C7 11.2 11.2 7 12 0Z"/></svg>';

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /* duration ミリ秒かけて onFrame(0〜1) を毎フレーム呼ぶ */
  function tween(duration, onFrame) {
    return new Promise(function (resolve) {
      var start = null;
      function step(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        onFrame(easeInOut(t));
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  /* 見出しの左上を原点にした矩形 */
  function boxOf(el) {
    var t = title.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return { x: r.left - t.left, y: r.top - t.top, w: r.width, h: r.height };
  }

  /* 文字の上に泥のかたまりを敷き詰めて完全に隠す。
     高さは行の高さ（line-height）ではなく文字の大きさに合わせる。
     行の高さに合わせると、スマホで折り返したとき上下の行の汚れが重なる */
  function addDirt(word) {
    var box = boxOf(word);
    var fontSize = parseFloat(getComputedStyle(word).fontSize);
    var padX = fontSize * 0.06;
    var areaW = box.w + padX * 2;
    var areaH = fontSize * 1.2;
    var offsetY = (box.h - areaH) / 2;
    var layer = document.createElement('span');
    layer.className = 'dirt';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.left = -padX + 'px';
    layer.style.top = offsetY + 'px';
    layer.style.width = areaW + 'px';
    layer.style.height = areaH + 'px';

    var rows = 3;
    var step = areaH / rows;
    var cols = Math.ceil(areaW / step);
    var stepX = areaW / cols;
    var blobs = [];

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        /* 隣の「」まではみ出さないよう、かたまりの中心を範囲の内側に寄せる */
        var size = step * rand(1.35, 1.65);
        var cx = Math.min(Math.max((c + 0.5) * stepX + rand(-0.15, 0.15) * step, size * 0.45), areaW - size * 0.45);
        var cy = Math.min(Math.max((r + 0.5) * step + rand(-0.15, 0.15) * step, size * 0.4), areaH - size * 0.4);
        var blob = document.createElement('span');
        blob.className = 'dirt-blob';
        blob.style.left = cx - size / 2 + 'px';
        blob.style.top = cy - size / 2 + 'px';
        blob.style.width = size + 'px';
        blob.style.height = size * rand(0.8, 1) + 'px';
        blob.style.background = pick(DIRT_COLORS);
        blob.style.borderRadius = rand(40, 60) + '% ' + rand(40, 60) + '% ' + rand(40, 60) + '% ' + rand(40, 60) + '%';
        blob.style.transform = 'rotate(' + rand(0, 180) + 'deg)';
        layer.appendChild(blob);
        blobs.push({ el: blob, x: box.x - padX + cx, y: box.y + offsetY + cy, wiped: false });
      }
    }

    /* 上下の縁に飛び散った小さなしみ */
    for (var i = 0; i < 4; i++) {
      var dot = document.createElement('span');
      var d = step * rand(0.25, 0.45);
      var dx = rand(0.1, 0.9) * areaW;
      var dy = Math.random() < 0.5 ? rand(-0.08, 0) * areaH : rand(1, 1.08) * areaH;
      dot.className = 'dirt-blob';
      dot.style.left = dx - d / 2 + 'px';
      dot.style.top = dy - d / 2 + 'px';
      dot.style.width = d + 'px';
      dot.style.height = d + 'px';
      dot.style.borderRadius = '50%';
      dot.style.background = pick(DIRT_COLORS);
      layer.appendChild(dot);
      blobs.push({ el: dot, x: box.x - padX + dx, y: box.y + offsetY + dy, wiped: false });
    }

    word.appendChild(layer);
    return { word: word, layer: layer, blobs: blobs, box: box };
  }

  function wipeBlob(blob) {
    if (blob.wiped) return;
    blob.wiped = true;
    blob.el.classList.add('is-wiped');
  }

  function placeHand(hand, x, y, tilt) {
    hand.style.transform =
      'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%) rotate(' + tilt + 'deg)';
  }

  /* 1語ぶん：左下 → 上の真ん中 → 下の真ん中 → 右上 */
  function wipeWord(dirt, hand) {
    var b = dirt.box;
    var points = [
      { x: b.x, y: b.y + b.h },
      { x: b.x + b.w / 2, y: b.y },
      { x: b.x + b.w / 2, y: b.y + b.h },
      { x: b.x + b.w, y: b.y }
    ];
    var radius = b.h * 0.8;
    var baseTilt = -45;

    function rub(x, y) {
      dirt.blobs.forEach(function (blob) {
        if (!blob.wiped && Math.hypot(blob.x - x, blob.y - y) < radius) wipeBlob(blob);
      });
    }

    function stroke(from, to, tiltFrom, tiltTo) {
      var len = Math.hypot(to.x - from.x, to.y - from.y);
      return tween(Math.max(220, len * 2), function (t) {
        var x = from.x + (to.x - from.x) * t;
        var y = from.y + (to.y - from.y) * t;
        placeHand(hand, x, y, tiltFrom + (tiltTo - tiltFrom) * t);
        rub(x, y);
      });
    }

    placeHand(hand, points[0].x, points[0].y, baseTilt);
    hand.classList.add('is-on');
    return wait(150)
      .then(function () { return stroke(points[0], points[1], baseTilt, baseTilt + 3); })
      .then(function () { return stroke(points[1], points[2], baseTilt + 3, baseTilt - 2); })
      .then(function () { return stroke(points[2], points[3], baseTilt - 2, baseTilt + 2); })
      .then(function () {
        dirt.blobs.forEach(wipeBlob);
        hand.classList.remove('is-on');
        return wait(320);
      })
      .then(function () { dirt.layer.remove(); });
  }

  /* 見出しの文字が実際にある範囲（中央寄せなので見出し要素の幅とは違う） */
  function textBounds() {
    var t = title.getBoundingClientRect();
    var range = document.createRange();
    range.selectNodeContents(title);
    var rects = range.getClientRects();
    var left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (var i = 0; i < rects.length; i++) {
      if (rects[i].width === 0) continue;
      left = Math.min(left, rects[i].left);
      top = Math.min(top, rects[i].top);
      right = Math.max(right, rects[i].right);
      bottom = Math.max(bottom, rects[i].bottom);
    }
    return { x: left - t.left, y: top - t.top, w: right - left, h: bottom - top };
  }

  /* 見出しのまわり（枠線に沿って）にキラキラを散らす */
  function sparkle() {
    var b = textBounds();
    var em = parseFloat(getComputedStyle(title).fontSize);
    var count = 10;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      var size = em * rand(0.3, 0.55);
      var p = (i + rand(0, 0.8)) / count;
      var perimeter = 2 * (b.w + b.h);
      var dist = p * perimeter;
      var out = em * rand(0.15, 0.5);
      var x, y;
      if (dist < b.w) {
        x = b.x + dist; y = b.y - out;
      } else if (dist < b.w + b.h) {
        x = b.x + b.w + out; y = b.y + (dist - b.w);
      } else if (dist < 2 * b.w + b.h) {
        x = b.x + b.w - (dist - b.w - b.h); y = b.y + b.h + out;
      } else {
        x = b.x - out; y = b.y + b.h - (dist - 2 * b.w - b.h);
      }
      s.className = 'sparkle';
      s.innerHTML = SPARKLE_SVG;
      s.style.left = x - size / 2 + 'px';
      s.style.top = y - size / 2 + 'px';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.color = pick(SPARKLE_COLORS);
      s.style.animationDelay = rand(0, 0.7) + 's';
      title.appendChild(s);
      s.addEventListener('animationend', function (e) { e.currentTarget.remove(); });
    }
  }

  /* is-intro を外すと、CSS のトランジションで「すべて」の下にマーカーが引かれる */
  function finish() {
    title.classList.remove('is-intro');
  }

  function run() {
    title.classList.add('is-intro');
    var dirts = Array.prototype.map.call(title.querySelectorAll('.dirty'), addDirt);
    title.classList.add('is-ready');

    var hand = document.createElement('span');
    hand.className = 'wiper';
    hand.setAttribute('aria-hidden', 'true');
    hand.innerHTML = HAND_SVG;
    title.appendChild(hand);

    var chain = wait(400);
    dirts.forEach(function (dirt) {
      chain = chain.then(function () { return wipeWord(dirt, hand); });
    });
    chain
      .then(function () {
        hand.remove();
        sparkle();
        return wait(900);
      })
      .then(finish);
  }

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () { requestAnimationFrame(run); });
})();
