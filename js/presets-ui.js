// -------------------------------------------------------------------------
    // 形と色のプリセット、現在の選択状態
    // -------------------------------------------------------------------------
    const THEMES = {
      auto: { label: 'おまかせ', f: h => ({ b: h, r: .12, s: .45, v: .85 }) },
      cool: { label: '寒色', f: h => ({ b: .5 + (h - .5) * .06, r: .22, s: .5, v: .9 }) },
      warm: { label: '暖色', f: h => ({ b: -.02 + (h - .5) * .06, r: .14, s: .55, v: .92 }) },
      vivid: { label: 'ビビッド', f: h => ({ b: h, r: .6, s: .95, v: 1 }) },
      pastel: { label: 'パステル', f: h => ({ b: h, r: .35, s: .28, v: .97 }) }
    };
    const themeKeys = Object.keys(THEMES);

    const SHAPES = {
      auto: { label: 'おまかせ' },
      julia: { label: 'ジュリア', t: 0, k: 1 },
      power: { label: 'べき乗', t: 1, k: .5 },
      ship: { label: '燃える船', t: 2, k: .8 },
      tri: { label: 'トリコーン', t: 3, k: .85 },
      newton: { label: 'ニュートン', t: 4, k: 1 }
    };
    const shapeKeys = ['julia', 'power', 'ship', 'tri', 'newton'];
    const randomItem = items => items[Math.floor(Math.random() * items.length)];

    let theme = randomItem(themeKeys);
    let shape = randomItem(shapeKeys);
    let touched = false;
    let state = { name: '', kana: '', demo: true };
    let current = null;
    let target = null;
    let animationStart = performance.now();

    function markChips() {
      for (const button of document.querySelectorAll('.chip')) {
        const selected = button.dataset.k === (button.dataset.g === 'shapes' ? shape : theme);
        button.setAttribute('aria-pressed', String(selected));
      }
    }

    function apply(name, kana, demo) {
      state = { name, kana, demo };
      const parameters = paramsOf(name, kana);
      const colors = THEMES[theme].f(parameters.nh);
      const shapeKey = shape === 'auto' ? shapeKeys[parameters.sk] : shape;
      const selectedShape = SHAPES[shapeKey];
      const power = selectedShape.t === 1 ? parameters.pj : parameters.pn;
      const constant = (selectedShape.t < 4 && pickC(name, kana, selectedShape.t, power, parameters.iter))
        || [parameters.c[0] * selectedShape.k, parameters.c[1] * selectedShape.k];

      target = {
        c: constant,
        spread: parameters.spread,
        rot: parameters.rot,
        iter: parameters.iter,
        hb: colors.b,
        hr: colors.r,
        sat: colors.s,
        val: colors.v,
        ft: selectedShape.t,
        pw: power
      };

      if (!current) current = JSON.parse(JSON.stringify(target));

      const [real, imaginary] = target.c;
      document.getElementById('ttl').textContent = '「' + name + '」のフラクタル' + (demo ? '（デモ）' : '');
      document.getElementById('prm').innerHTML = 'c = ' + real.toFixed(3) + (imaginary < 0 ? ' − ' : ' + ')
        + Math.abs(imaginary).toFixed(3) + 'i<br>'
        + '形：' + selectedShape.label + '　色：' + THEMES[theme].label + '<br>'
        + '細かさ ' + parameters.iter + '　回転 ' + Math.round(parameters.rot * 180 / Math.PI) + '°';

      const hue = (((colors.b + colors.r / 2) % 1) + 1) % 1;
      document.documentElement.style.setProperty(
        '--accent',
        'hsl(' + Math.round(hue * 360) + ' ' + Math.round(25 + colors.s * 45) + '% 72%)'
      );
      markChips();
    }

    function addChips(box, dictionary, keys, setSelection) {
      for (const key of keys) {
        const button = document.createElement('button');
        button.className = 'chip';
        button.dataset.g = box;
        button.dataset.k = key;
        button.textContent = dictionary[key].label;
        button.onclick = () => {
          setSelection(key);
          touched = true;
          lastInput = performance.now();
          apply(state.name, state.kana, state.demo);
        };
        document.getElementById(box).appendChild(button);
      }
    }

    addChips('shapes', SHAPES, ['auto', ...shapeKeys], key => { shape = key; });
    addChips('themes', THEMES, themeKeys, key => { theme = key; });
