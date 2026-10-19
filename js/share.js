// -------------------------------------------------------------------------
// スマホで受け取る：QRコードの発行と、スマホ側の表示
//
// しくみ：QRコードに入れるのは「画像」ではなく「アプリのURL＋名前・形・色」。
// スマホでURLを開くと、同じ名前から同じフラクタルを描き直して、画像として保存できる。
// -------------------------------------------------------------------------

// ★ ここに、ネットに公開したアプリのURLを入れる
//   例：'https://xxxx.netlify.app/name-fractal.html'
//   空のままなら、いま開いているURLを使う（http / https で開いているときだけ）
const SHARE_BASE_URL =
  "https://fastidious-kelpie-c0725e.netlify.app/name-fractal.html";

// ---- 名前などを、短くて安全な文字列にする（URLに入れるため） ----
function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text) {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (ch) => ch.charCodeAt(0)),
  );
}

function shareBase() {
  if (SHARE_BASE_URL) return SHARE_BASE_URL;
  if (location.protocol === "http:" || location.protocol === "https:") {
    return location.origin + location.pathname;
  }
  return "";
}

function buildShareUrl() {
  const base = shareBase();
  if (!base) return "";
  return (
    base +
    "?q=" +
    toBase64Url([state.name, state.kana, shape, theme].join("\n"))
  );
}

// URLから名前などを取り出す。おかしな中身のときは null（ふつうの画面になる）
function readShared() {
  try {
    const q = new URLSearchParams(location.search).get("q");
    if (!q) return null;
    const [name, kana = "", sharedShape, sharedTheme] =
      fromBase64Url(q).split("\n");
    if (!name || Array.from(name).length > 16 || Array.from(kana).length > 32)
      return null;
    if (!Object.prototype.hasOwnProperty.call(SHAPES, sharedShape)) return null;
    if (!Object.prototype.hasOwnProperty.call(THEMES, sharedTheme)) return null;
    return { name, kana, shape: sharedShape, theme: sharedTheme };
  } catch (error) {
    return null;
  }
}

// ---- ウィンドウ（モーダル） ----
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
let modalTimer = 0,
  modalKeep = 0;

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function closeModal() {
  modal.hidden = true;
  clearTimeout(modalTimer);
  clearInterval(modalKeep);
}

function openModal(nodes, autoCloseMs) {
  modalBody.replaceChildren(...nodes);
  modal.hidden = false;
  clearTimeout(modalTimer);
  clearInterval(modalKeep);
  // 開いている間は、放置デモに切り替わらないようにする
  modalKeep = setInterval(() => {
    lastInput = performance.now();
  }, 1000);
  if (autoCloseMs) modalTimer = setTimeout(closeModal, autoCloseMs);
}

function closeButton(label) {
  const button = el("button", label || "とじる", "sub");
  button.onclick = closeModal;
  return button;
}

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

// ---- パソコン側：QRコードを出す ----
function showQr() {
  if (state.demo) {
    openModal([
      el("p", "先に名前を入れて「つくる」を押してね"),
      el("div", "", "row"),
    ]);
    modalBody.lastChild.appendChild(closeButton());
    return;
  }

  const url = buildShareUrl();
  if (!url) {
    openModal([
      el("h2", "公開URLが未設定です"),
      el(
        "p",
        "js/share.js の SHARE_BASE_URL に、ネットに公開したアプリのURLを入れてください。",
      ),
      el("div", "", "row"),
    ]);
    modalBody.lastChild.appendChild(closeButton());
    return;
  }

  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();

  const box = el("div", "", "qr");
  box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 4, scalable: true });
  const row = el("div", "", "row");
  row.appendChild(closeButton());

  openModal(
    [
      el("h2", "スマホで読みとって、画像を保存しよう📱"),
      box,
      el(
        "p",
        "「" +
          state.name +
          "」のフラクタルがスマホに出るよ。「画像をつくる」ボタンで保存できるよ！",
      ),
    ],
    120000,
  );
}

document.getElementById("share").onclick = showQr;

// ---- スマホ側：画像をつくって、長押しで保存できるようにする ----
function showPhoto(dataUrl) {
  const image = el("img");
  image.src = dataUrl;
  image.alt = state.name + " のフラクタル";

  const row = el("div", "", "row");
  row.appendChild(closeButton());

  openModal([
    image,
    el("p", "画像を長押しして「写真に追加」や「画像を保存」を選んでね"),
    row,
  ]);
}

document.getElementById("vsave").onclick = () => {
  const originalWidth = canvas.width,
    originalHeight = canvas.height,
    savedAA = aa;
  canvas.width = 1200;
  canvas.height = 1500;
  aa = 1; // スマホでは重くなりすぎないよう、解像度を上げるだけにする
  draw();
  const actualShape =
    Object.values(SHAPES).find((item) => item.t === target.ft)?.label ||
    SHAPES[shape]?.label;
  const artwork = composeArtworkForSave(
    canvas,
    state.name,
    state.kana,
    actualShape,
    THEMES[theme]?.label,
  );
  const dataUrl = artwork.toDataURL("image/png");
  aa = savedAA;
  canvas.width = originalWidth;
  canvas.height = originalHeight;
  showPhoto(dataUrl);
};

// ---- 起動：QRコードから開かれたときは、スマホ用の表示にする ----
const shared = readShared();
if (shared) {
  document.body.classList.add("viewer");
  theme = shared.theme;
  shape = shared.shape;
  touched = true;
  lastInput = Infinity; // 放置デモに切り替わらないようにする
  apply(shared.name, shared.kana, false);
}
