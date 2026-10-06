// -------------------------------------------------------------------------
// 描画と、フレームレートに応じた画質の自動調整
// -------------------------------------------------------------------------
const lerp = (start, end, amount) => start + (end - start) * amount;

function step() {
  const amount = 0.06;
  current.c = [
    lerp(current.c[0], target.c[0], amount),
    lerp(current.c[1], target.c[1], amount)
  ];
  if (current.ft !== target.ft) {
    // 形が変わったときは、場所も倍率も一気に切り替える
    current.c = [target.c[0], target.c[1]];
    current.ft = target.ft;
    current.pw = target.pw;
  } else if (current.ft === 5) {
    // 燃える船どうしの切り替えは、拡大率を対数でなめらかに動かす
    current.pw = Math.exp(lerp(Math.log(current.pw), Math.log(target.pw), amount));
  } else {
    current.pw = target.pw;
  }
  for (const key of ['hb', 'hr', 'sat', 'val', 'spread', 'rot', 'iter']) {
    current[key] = lerp(current[key], target[key], amount);
  }
}

// 画質の状態
//   scale：画面の物理ピクセルに対する描画解像度の割合（0.35〜1）
//   aa   ：1 = ふつう、2 = 1ピクセルを4点で塗って平均（ギザギザが減る。重い）
let scale = 0.75, aa = 1;
const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

function draw() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
  gl.uniform2f(uniforms.constant, current.c[0], current.c[1]);
  gl.uniform1f(uniforms.hueBase, current.hb);
  gl.uniform1f(uniforms.hueRange, current.hr);
  gl.uniform1f(uniforms.saturation, current.sat);
  gl.uniform1f(uniforms.value, current.val);
  gl.uniform1f(uniforms.spread, current.spread);
  // ゆっくり回る速さ。燃える船・トリコーンはノイズがちらつきやすいので遅め
  const driftSpeed = (current.ft === 2 || current.ft === 3) ? 0.00001 : 0.00003;
  gl.uniform1f(uniforms.rotation, current.rot + (performance.now() - animationStart) * driftSpeed);
  gl.uniform1f(uniforms.iterations, current.iter);
  gl.uniform1f(uniforms.fractalType, current.ft);
  gl.uniform1f(uniforms.power, current.pw);
  gl.uniform1f(uniforms.antialias, aa);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

let accumulatedTime = 0, frameCount = 0, lastFrame = performance.now();
let cycle = 0, holdUntil = 0, aaBlockedUntil = 0;

function resize() {
  const ratio = pixelRatio() * scale;
  canvas.width = Math.max(2, Math.floor(innerWidth * ratio));
  canvas.height = Math.max(2, Math.floor(innerHeight * ratio));
}

addEventListener('resize', resize);
resize();

function frame(now) {
  accumulatedTime += now - lastFrame;
  lastFrame = now;
  frameCount++;

  // 30フレームごとに平均を見て、画質を上げ下げする。
  // 60Hz の画面は、余裕があっても1フレーム約16.7msより短くならないので、
  // 「18.5ms 以下 = 60fps を保てている」と見なして画質を上げ、
  // 「24ms 以上 = 落ちている」と見なして画質を下げる。
  if (frameCount >= 30) {
    const averageFrameTime = accumulatedTime / frameCount;
    accumulatedTime = 0;
    frameCount = 0;
    cycle++;

    if (averageFrameTime > 24) {
      if (aa > 1) {
        aa = 1;
        aaBlockedUntil = cycle + 120;
      } else if (scale > 0.35) {
        scale = Math.max(0.35, scale * 0.85);
        resize();
      }
      holdUntil = cycle + 10;
    } else if (averageFrameTime < 18.5 && cycle >= holdUntil) {
      if (scale < 1) {
        scale = Math.min(1, scale * 1.1);
        resize();
      } else if (aa < 2 && cycle >= aaBlockedUntil) {
        aa = 2;
      }
    }
  }

  step();
  draw();
  requestAnimationFrame(frame);
}
