// -------------------------------------------------------------------------
    // 名前からフラクタルのパラメーターを作る
    // -------------------------------------------------------------------------
    function fnv(value, seed) {
      let hash = (2166136261 ^ seed) >>> 0;
      for (const character of value) {
        hash ^= character.codePointAt(0);
        hash = Math.imul(hash, 16777619);
      }
      hash ^= hash >>> 15;
      hash = Math.imul(hash, 2246822507);
      hash ^= hash >>> 13;
      return (hash >>> 0) / 4294967296;
    }

    function paramsOf(name, kana) {
      const characters = Array.from(name);
      const angle = fnv(name, 1) * Math.PI * 2;
      const radius = 0.70 + 0.10 * fnv(kana || name, 2);

      return {
        c: [radius * Math.cos(angle), radius * Math.sin(angle)],
        nh: (characters[0].codePointAt(0) % 360) / 360,
        sk: Math.floor(fnv(name, 3) * 5),
        pj: 3 + Math.floor(fnv(name, 4) * 3),
        pn: 3 + Math.floor(fnv(name, 5) * 4),
        spread: 0.75 + 0.15 * Math.min(characters.length, 8),
        rot: (characters[characters.length - 1].codePointAt(0) % 360) * Math.PI / 180,
        iter: Math.min(60 + 20 * characters.length, 260)
      };
    }

    // -------------------------------------------------------------------------
    // c の選び方：形がつぶれない値を、名前のシードから探す
    // -------------------------------------------------------------------------
    function stepJS(type, power, z, c) {
      let x = z[0], y = z[1];
      if (type === 2) {
        x = Math.abs(x);
        y = Math.abs(y);
      }
      if (type === 3) y = -y;

      let nextX, nextY;
      if (type === 1) {
        const radius = Math.hypot(x, y);
        const angle = Math.atan2(y, x) * power;
        const magnitude = Math.pow(radius, power);
        nextX = magnitude * Math.cos(angle);
        nextY = magnitude * Math.sin(angle);
      } else {
        nextX = x * x - y * y;
        nextY = 2 * x * y;
      }
      return [nextX + c[0], nextY + c[1]];
    }

    function boundedJS(type, power, c) {
      let z = [0, 0];
      for (let index = 0; index < 200; index++) {
        z = stepJS(type, power, z, c);
        if (z[0] * z[0] + z[1] * z[1] > 100) return false;
      }
      return true;
    }

    function edgeJS(type, power, c, iterations) {
      const width = 64, height = 36;
      const grid = new Int8Array(width * height);
      const maxIterations = Math.min(iterations, 120);
      let insideCount = 0, edgeCount = 0;

      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
          let z = [(column - width / 2) / height * 3, (row - height / 2) / height * 3];
          let escapedAt = -1;

          for (let iteration = 0; iteration < maxIterations; iteration++) {
            z = stepJS(type, power, z, c);
            if (z[0] * z[0] + z[1] * z[1] > 256) {
              escapedAt = iteration;
              break;
            }
          }

          grid[row * width + column] = escapedAt < 0 ? -1 : escapedAt < 6 ? 0 : 1;
          if (escapedAt < 0) insideCount++;
        }
      }

      for (let row = 0; row < height - 1; row++) {
        for (let column = 0; column < width - 1; column++) {
          const cell = grid[row * width + column];
          if (cell !== grid[row * width + column + 1]) edgeCount++;
          if (cell !== grid[(row + 1) * width + column]) edgeCount++;
        }
      }

      return { e: edgeCount, ins: insideCount / (width * height) };
    }

    const radiusRanges = [[.3, 1], [.15, .6], [.3, 1.2], [.3, 1.2]];
    const constantCache = new Map();

    function pickC(name, kana, type, power, iterations) {
      const key = [name, kana, type, power].join('|');
      if (constantCache.has(key)) return constantCache.get(key);

      let seed = Math.floor(fnv(name + '|' + kana, 6) * 4294967296) >>> 0;
      const random = () => {
        seed = (seed + 0x6D2B79F5) >>> 0;
        let value = seed;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
      };

      const [minRadius, maxRadius] = radiusRanges[type];
      let best = null, bestScore = -1, found = 0;
      for (let attempt = 0; attempt < 120 && found < 8; attempt++) {
        const angle = random() * Math.PI * 2;
        const radius = minRadius + (maxRadius - minRadius) * random();
        const c = [radius * Math.cos(angle), radius * Math.sin(angle)];
        if (!boundedJS(type, power, c)) continue;

        found++;
        const outline = edgeJS(type, power, c, iterations);
        if (outline.ins > .02 && outline.ins < .7 && outline.e > bestScore) {
          bestScore = outline.e;
          best = c;
        }
      }

      constantCache.set(key, best);
      return best;
    }
