// -------------------------------------------------------------------------
// 形と色のプリセット、現在の選択状態
// -------------------------------------------------------------------------
const THEMES = {
  auto: { label: "おまかせ", f: (h) => ({ b: h, r: 0.12, s: 0.45, v: 0.85 }) },
  cool: {
    label: "暖色",
    f: (h) => ({ b: -0.02 + (h - 0.5) * 0.06, r: 0.14, s: 0.55, v: 0.92 }),
  },
  warm: {
    label: "寒色",
    f: (h) => ({ b: 0.5 + (h - 0.5) * 0.06, r: 0.22, s: 0.5, v: 0.9 }),
  },
  vivid: { label: "ビビッド", f: (h) => ({ b: h, r: 0.6, s: 0.95, v: 1 }) },
  pastel: {
    label: "パステル",
    f: (h) => ({ b: h, r: 0.35, s: 0.28, v: 0.97 }),
  },
};
const themeKeys = Object.keys(THEMES);

const SHAPES = {
  auto: { label: "おまかせ" },
  julia: { label: "ジュリア", t: 0, k: 1 },
  power: { label: "べき乗", t: 1, k: 0.5 },
  burning: { label: "燃える船", t: 5, k: 1 },
  ship: { label: "船ジュリア", t: 2, k: 0.8 },
  tri: { label: "トリコーン", t: 3, k: 0.85 },
  newton: { label: "ニュートン", t: 4, k: 1 },
};
const shapeKeys = ["julia", "power", "burning", "ship", "tri", "newton"];
const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

let theme = randomItem(themeKeys);
let shape = randomItem(shapeKeys);
let touched = false;
let state = { name: "", kana: "", demo: true };
let current = null;
let target = null;
let animationStart = performance.now();

function markChips() {
  for (const button of document.querySelectorAll(".chip")) {
    const selected =
      button.dataset.k === (button.dataset.g === "shapes" ? shape : theme);
    button.setAttribute("aria-pressed", String(selected));
  }
}

function apply(name, kana, demo) {
  state = { name, kana, demo };
  const parameters = paramsOf(name, kana);
  const colors = THEMES[theme].f(parameters.nh);
  const shapeKey = shape === "auto" ? shapeKeys[parameters.sk] : shape;
  const selectedShape = SHAPES[shapeKey];
  const isShip = selectedShape.t === 5;
  let power = selectedShape.t === 1 ? parameters.pj : parameters.pn;
  let constant = (selectedShape.t < 4 &&
    pickC(name, kana, selectedShape.t, power, parameters.iter)) || [
    parameters.c[0] * selectedShape.k,
    parameters.c[1] * selectedShape.k,
  ];
  let iterations = parameters.iter;

  if (isShip) {
    // 本物の燃える船：constant = 見ている中心、power = 画面の縦の半分の長さ
    const view = pickShipView(name, kana);
    constant = view.c;
    power = view.zoom;
    iterations = 260;
  }

  target = {
    c: constant,
    spread: parameters.spread,
    rot: parameters.rot,
    iter: iterations,
    hb: colors.b,
    hr: colors.r,
    sat: colors.s,
    val: colors.v,
    ft: selectedShape.t,
    pw: power,
  };

  if (!current) current = JSON.parse(JSON.stringify(target));

  const [real, imaginary] = target.c;
  const title = document.getElementById("ttl");
  const nameLine = document.createElement("span");
  nameLine.className = "title-name";
  nameLine.textContent = "「" + name + "」";
  const fractalLine = document.createElement("span");
  fractalLine.className = "title-fractal";
  fractalLine.append("のフラクタル");
  if (demo) {
    const demoLabel = document.createElement("span");
    demoLabel.className = "title-demo";
    demoLabel.textContent = "（デモ）";
    fractalLine.append(demoLabel);
  }
  if (document.body.classList.contains("viewer")) {
    title.replaceChildren(nameLine, fractalLine);
  } else {
    title.textContent = "「" + name + "」のフラクタル" + (demo ? "（デモ）" : "");
  }
  document.getElementById("prm").innerHTML =
    (isShip ? "見ている場所 = " : "c = ") +
    real.toFixed(3) +
    (imaginary < 0 ? " − " : " + ") +
    Math.abs(imaginary).toFixed(3) +
    "i<br>" +
    "形：" +
    selectedShape.label +
    "　色：" +
    THEMES[theme].label +
    "<br>" +
    "細かさ " +
    iterations +
    "　" +
    (isShip
      ? "拡大 ×" + (1.35 / power).toFixed(1)
      : "回転 " + Math.round((parameters.rot * 180) / Math.PI) + "°");

  markChips();
}

function addChips(box, dictionary, keys, setSelection) {
  for (const key of keys) {
    const button = document.createElement("button");
    button.className = "chip";
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

addChips("shapes", SHAPES, ["auto", ...shapeKeys], (key) => {
  shape = key;
});
addChips("themes", THEMES, themeKeys, (key) => {
  theme = key;
});
