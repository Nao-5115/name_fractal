// -------------------------------------------------------------------------
// 入力、画像保存、放置中のデモ表示
// -------------------------------------------------------------------------
const nameInput = document.getElementById('name');
const kanaInput = document.getElementById('kana');
let lastInput = -Infinity, lastDemo = 0, demoIndex = 0;
const demos = [['さくら', ''], ['はると', ''], ['蒼', 'あお'], ['ゆうき', ''], ['みお', '']];

function make() {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }
  if (state.demo && !touched) {
    theme = 'auto';
    shape = 'auto';
  }
  lastInput = performance.now();
  apply(name, kanaInput.value.trim(), false);
}

document.getElementById('go').onclick = make;

for (const input of [nameInput, kanaInput]) {
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) make();
  });
  input.addEventListener('input', () => {
    lastInput = performance.now();
  });
}

document.getElementById('save').onclick = () => {
  const originalWidth = canvas.width, originalHeight = canvas.height;
  canvas.width = 1920;
  canvas.height = 1080;
  const savedAA = aa;
  aa = 2;
  draw();
  aa = savedAA;
  canvas.toBlob(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fractal_' + (nameInput.value.trim() || 'demo') + '.png';
    link.click();
  });
  canvas.width = originalWidth;
  canvas.height = originalHeight;
};

setInterval(() => {
  const now = performance.now();
  if (now - lastInput > 45000 && now - lastDemo > 8000) {
    const [name, kana] = demos[demoIndex++ % demos.length];
    lastDemo = now;
    const otherThemes = themeKeys.filter(key => key !== theme);
    theme = otherThemes[Math.floor(Math.random() * otherThemes.length)];
    touched = false;
    shape = randomItem(shapeKeys.filter(key => key !== shape));
    apply(name, kana, true);
  }
}, 1000);

apply(demos[0][0], demos[0][1], true);
demoIndex = 1;
requestAnimationFrame(frame);
