// -------------------------------------------------------------------------
// 入力、放置中のデモ表示
// （「画像を保存」ボタン＝QRコードの発行と、スマホ側の表示・保存は share.js が担当）
// -------------------------------------------------------------------------
const nameInput = document.getElementById("name");
const kanaInput = document.getElementById("kana");
let lastInput = -Infinity,
  lastDemo = 0,
  demoIndex = 0;
const demos = [
  ["さくら", ""],
  ["はると", ""],
  ["蒼", "あお"],
  ["ゆうき", ""],
  ["みお", ""],
];

// ---- 「つくる」 ----
function make() {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }
  if (state.demo && !touched) {
    theme = "auto";
    shape = "auto";
  }
  lastInput = performance.now();
  apply(name, kanaInput.value.trim(), false);
}

document.getElementById("go").onclick = make;

for (const input of [nameInput, kanaInput]) {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing) make();
  });
  input.addEventListener("input", () => {
    lastInput = performance.now();
  });
}

// ---- 放置中のデモ表示（45秒放置 → 8秒ごとに名前・色・形を切り替え） ----
setInterval(() => {
  const now = performance.now();
  if (now - lastInput > 45000 && now - lastDemo > 8000) {
    const [name, kana] = demos[demoIndex++ % demos.length];
    lastDemo = now;
    const otherThemes = themeKeys.filter((key) => key !== theme);
    theme = otherThemes[Math.floor(Math.random() * otherThemes.length)];
    touched = false;
    shape = randomItem(shapeKeys.filter((key) => key !== shape));
    apply(name, kana, true);
  }
}, 1000);

// ---- 起動 ----
apply(demos[0][0], demos[0][1], true);
demoIndex = 1;
requestAnimationFrame(frame);
