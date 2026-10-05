// -------------------------------------------------------------------------
    // WebGL の準備
    // -------------------------------------------------------------------------
    const canvas = document.getElementById('cv');
    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      antialias: false
    });

    if (!gl) {
      document.getElementById('ttl').textContent = 'このブラウザではWebGLが使えません';
      throw new Error('no webgl');
    }

    // z → z² + c をピクセルごとに繰り返すフラグメントシェーダー。
    const vertexShaderSource = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fragmentShaderSource = `precision highp float;
      uniform vec2 res, c;
      uniform float hb, hr, sat, val, spread, rot, iter, ft, pw;

      vec3 hsv(float h, float s, float v) {
        vec3 k = clamp(abs(mod(h * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
        return v * mix(vec3(1.), k, s);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - .5 * res) / min(res.x, res.y) * 3.0;
        float s = sin(rot), k = cos(rot);
        vec2 z = mat2(k, -s, s, k) * uv;
        float n = 0., root = 0.;
        bool esc = false;

        if (ft < 3.5) {
          float dd = (ft > .5 && ft < 1.5) ? pw : 2.;
          for (int i = 0; i < 300; i++) {
            if (float(i) >= iter) break;
            if (ft > 1.5 && ft < 2.5) z = abs(z);
            if (ft > 2.5) z.y = -z.y;
            if (dd > 2.5) {
              float r = length(z), a = atan(z.y, z.x) * dd;
              z = pow(r, dd) * vec2(cos(a), sin(a));
            } else {
              z = vec2(z.x * z.x - z.y * z.y, 2. * z.x * z.y);
            }
            z += c;
            if (dot(z, z) > 256.) {
              esc = true;
              n = float(i);
              break;
            }
          }
        } else {
          float ar = 1. + .3 * c.x;
          for (int i = 0; i < 80; i++) {
            if (float(i) >= min(iter, 60.)) break;
            float r = length(z) + 1e-5, a = atan(z.y, z.x);
            vec2 p1 = pow(r, pw - 1.) * vec2(cos(a * (pw - 1.)), sin(a * (pw - 1.)));
            vec2 pn = vec2(p1.x * z.x - p1.y * z.y, p1.x * z.y + p1.y * z.x);
            vec2 f = pn - vec2(1., 0.);
            vec2 d = pw * p1;
            z -= ar * vec2(f.x * d.x + f.y * d.y, f.y * d.x - f.x * d.y) / (dot(d, d) + 1e-9);
            float kk = floor(atan(z.y, z.x) / (6.28318 / pw) + .5);
            float ra = kk * 6.28318 / pw;
            vec2 t = z - vec2(cos(ra), sin(ra));
            if (dot(t, t) < 1e-4) {
              root = mod(kk, pw);
              esc = true;
              n = float(i);
              break;
            }
          }
        }

        float gi = .5 + .5 * sin(3. * length(uv) + .9 * uv.x);
        vec3 inner = hsv(hb + hr * gi, sat * .9, val * (.28 + .30 * gi));
        vec3 col = inner;
        float q = iter;

        if (esc) {
          if (ft > 3.5) {
            float h = hb + hr * (root / pw);
            col = hsv(h, sat, val * (.7 + .3 * mod(root, 2.))) * (1. - .75 * smoothstep(0., 40., n));
          } else {
            float dd = (ft > .5 && ft < 1.5) ? pw : 2.;
            float m = n + 2. - log2(log2(dot(z, z))) / log2(dd);
            q = min(m, iter);
            float h = hb + hr * (.5 + .5 * sin(6.28318 * m * .02 * spread));
            vec3 o = hsv(h, sat, val) * mix(.2, 1., smoothstep(2., 18., m));
            col = mix(inner, o, 1. - smoothstep(.25 * iter, .75 * iter, m));
          }
        }

        #ifdef HASD
          if (ft < 3.5) {
            float f = smoothstep(2., 12., fwidth(q));
            col = mix(col, hsv(hb + hr * gi, sat * .9, val * .5), f);
          }
        #endif

        gl_FragColor = vec4(col, 1.);
      }`;

    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }

      return shader;
    }

    const program = gl.createProgram();
    const hasDerivatives = !!gl.getExtension('OES_standard_derivatives');
    const derivativePrefix = hasDerivatives
      ? '#extension GL_OES_standard_derivatives : enable\n#define HASD 1\n'
      : '';

    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, derivativePrefix + fragmentShaderSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniform = name => gl.getUniformLocation(program, name);
    const uniforms = {
      resolution: uniform('res'),
      constant: uniform('c'),
      hueBase: uniform('hb'),
      hueRange: uniform('hr'),
      saturation: uniform('sat'),
      value: uniform('val'),
      spread: uniform('spread'),
      rotation: uniform('rot'),
      iterations: uniform('iter'),
      fractalType: uniform('ft'),
      power: uniform('pw')
    };
