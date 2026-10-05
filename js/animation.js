// -------------------------------------------------------------------------
    // 描画とフレームレートに応じた解像度調整
    // -------------------------------------------------------------------------
    const lerp = (start, end, amount) => start + (end - start) * amount;

    function step() {
      const amount = 0.06;
      current.c = [
        lerp(current.c[0], target.c[0], amount),
        lerp(current.c[1], target.c[1], amount)
      ];
      current.ft = target.ft;
      current.pw = target.pw;
      for (const key of ['hb', 'hr', 'sat', 'val', 'spread', 'rot', 'iter']) {
        current[key] = lerp(current[key], target[key], amount);
      }
    }

    function draw() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.constant, current.c[0], current.c[1]);
      gl.uniform1f(uniforms.hueBase, current.hb);
      gl.uniform1f(uniforms.hueRange, current.hr);
      gl.uniform1f(uniforms.saturation, current.sat);
      gl.uniform1f(uniforms.value, current.val);
      gl.uniform1f(uniforms.spread, current.spread);
      gl.uniform1f(
        uniforms.rotation,
        current.rot + ((current.ft === 2 || current.ft === 3) ? 0 : (performance.now() - animationStart) * 0.00003)
      );
      gl.uniform1f(uniforms.iterations, current.iter);
      gl.uniform1f(uniforms.fractalType, current.ft);
      gl.uniform1f(uniforms.power, current.pw);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    let scale = 0.75, accumulatedTime = 0, frameCount = 0, lastFrame = performance.now();

    function resize() {
      canvas.width = Math.max(2, Math.floor(innerWidth * scale));
      canvas.height = Math.max(2, Math.floor(innerHeight * scale));
    }

    addEventListener('resize', resize);
    resize();

    function frame(now) {
      accumulatedTime += now - lastFrame;
      lastFrame = now;
      frameCount++;

      if (frameCount >= 30) {
        const averageFrameTime = accumulatedTime / frameCount;
        accumulatedTime = 0;
        frameCount = 0;

        if (averageFrameTime > 26 && scale > 0.35) {
          scale = Math.max(0.35, scale * 0.85);
          resize();
        } else if (averageFrameTime < 15 && scale < 1) {
          scale = Math.min(1, scale * 1.1);
          resize();
        }
      }

      step();
      draw();
      requestAnimationFrame(frame);
    }
