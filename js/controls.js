// -------------------------------------------------------------------------
// 入力、画像保存、放置中のデモ表示
// -------------------------------------------------------------------------
const nameInput = document.getElementById('name');
const kanaInput = document.getElementById('kana');
let lastInput = -Infinity, lastDemo = 0, demoIndex = 0;
const demos = [['さくら', ''], ['はると', ''], ['蒼', 'あお'], ['ゆうき', ''], ['みお', '']];
const isSharePage = document.body.dataset.page === 'share';

function readSharedArtwork() {
  const match = location.hash.match(/^#art=([A-Za-z0-9_-]+)$/);
  if (!match || match[1].length > 1800) return null;

  try {
    const base64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(atob(base64 + '='.repeat((4 - base64.length % 4) % 4)));
    const finite = value => typeof value === 'number' && Number.isFinite(value);
    if (!Array.isArray(data.c) || data.c.length !== 2 || !data.c.every(finite)) return null;
    if (!['julia', 'power', 'burning', 'ship', 'tri', 'newton'].includes(data.shape)) return null;
    if (!Object.prototype.hasOwnProperty.call(THEMES, data.theme)) return null;
    if (![data.spread, data.rot, data.iter, data.hb, data.hr, data.sat, data.val, data.ft, data.pw].every(finite)) return null;
    if (data.c.some(value => Math.abs(value) > 100) || data.iter < 1 || data.iter > 300) return null;
    if (data.ft < 0 || data.ft > 5 || data.pw < 0.005 || data.pw > 10) return null;
    if (data.spread < 0 || data.spread > 4 || data.hr < 0 || data.hr > 1) return null;
    if (data.sat < 0 || data.sat > 1 || data.val < 0 || data.val > 1) return null;
    return data;
  } catch {
    return null;
  }
}

const sharedArtwork = isSharePage ? readSharedArtwork() : null;

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

document.getElementById('save').onclick = async () => {
  const originalWidth = canvas.width, originalHeight = canvas.height;
  canvas.width = 1920;
  canvas.height = 1080;
  const savedAA = aa;
  aa = 2;
  draw();
  const actualShape = Object.values(SHAPES).find(item => item.t === target.ft)?.label || SHAPES[shape]?.label;
  const artwork = composeArtworkForSave(
    canvas,
    state.name || nameInput.value,
    state.kana || kanaInput.value,
    actualShape,
    THEMES[theme]?.label
  );
  aa = savedAA;
  const blob = await new Promise(resolve => artwork.toBlob(resolve, 'image/png'));
  canvas.width = originalWidth;
  canvas.height = originalHeight;

  if (!blob) {
    document.getElementById('share-hint')?.replaceChildren('画像を作れませんでした。もう一度お試しください。');
    return;
  }

  const filename = 'fractal_' + (nameInput.value.trim() || 'demo') + '.png';
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '名前フラクタル' });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 60000);
};

const shareButton = document.getElementById('open-share');
if (shareButton) {
  const dialog = document.getElementById('share-dialog');
  const qrCanvas = document.getElementById('share-qr');
  const status = document.getElementById('share-status');
  const shareLink = document.getElementById('share-url');

  shareButton.addEventListener('click', async () => {
    dialog.showModal();
    lastInput = performance.now();

    const currentShape = Object.entries(SHAPES).find(([, item]) => item.t === current.ft)?.[0];
    const driftSpeed = (current.ft === 2 || current.ft === 3) ? 0.00001 : 0.00003;
    const snapshot = {
      name: state.name,
      kana: state.kana,
      c: current.c,
      spread: current.spread,
      rot: current.rot + (performance.now() - animationStart) * driftSpeed,
      iter: current.iter,
      hb: current.hb,
      hr: current.hr,
      sat: current.sat,
      val: current.val,
      ft: current.ft,
      pw: current.pw,
      shape: currentShape || 'julia',
      theme
    };
    const token = btoa(JSON.stringify(snapshot))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const url = new URL('share.html', location.href);
    url.hash = 'art=' + token;
    shareLink.href = url.href;
    shareLink.textContent = url.href;

    if (location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      status.textContent = 'QRを使うには、GitHub Pagesなどに公開したURLから開いてください。';
      qrCanvas.getContext('2d').clearRect(0, 0, qrCanvas.width, qrCanvas.height);
      return;
    }

    if (!window.QRCode) {
      status.textContent = 'QR作成ライブラリを読み込めませんでした。下のリンクをコピーしてお試しください。';
      return;
    }

    try {
      await QRCode.toCanvas(qrCanvas, url.href, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#0d1733', light: '#ffffff' }
      });
      status.textContent = 'スマホのカメラで読み取ってください。';
    } catch (error) {
      console.error('QRコードを作成できませんでした。', error);
      status.textContent = 'QRを作れませんでした。下のリンクをコピーしてお試しください。';
    }
  });

  document.getElementById('copy-share-link').addEventListener('click', async () => {
    const link = shareLink.href;
    try {
      await navigator.clipboard.writeText(link);
      status.textContent = '共有リンクをコピーしました。';
    } catch {
      status.textContent = 'リンクを選択してコピーしてください。';
      shareLink.focus();
    }
  });
}

if (!isSharePage) {
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
}

if (isSharePage && sharedArtwork) {
  theme = sharedArtwork.theme;
  shape = sharedArtwork.shape;
  nameInput.value = sharedArtwork.name || '作品';
  kanaInput.value = sharedArtwork.kana || '';
  state = { name: nameInput.value, kana: kanaInput.value, demo: false };
  target = {
    c: sharedArtwork.c,
    spread: sharedArtwork.spread,
    rot: sharedArtwork.rot,
    iter: sharedArtwork.iter,
    hb: sharedArtwork.hb,
    hr: sharedArtwork.hr,
    sat: sharedArtwork.sat,
    val: sharedArtwork.val,
    ft: sharedArtwork.ft,
    pw: sharedArtwork.pw
  };
  current = JSON.parse(JSON.stringify(target));
  frozenRotation = sharedArtwork.rot;
  document.getElementById('ttl').textContent = 'あなたのフラクタル作品';
  document.getElementById('prm').textContent = '形：' + SHAPES[shape].label + '　色：' + THEMES[theme].label
    + '　細かさ ' + Math.round(sharedArtwork.iter);
  document.getElementById('share-hint').textContent = '下のボタンから、この作品をPNG画像で保存できます。';
  const hue = (((sharedArtwork.hb + sharedArtwork.hr / 2) % 1) + 1) % 1;
  document.documentElement.style.setProperty('--accent', 'hsl(' + Math.round(hue * 360) + ' 55% 72%)');
  markChips();
} else if (isSharePage) {
  apply(demos[0][0], demos[0][1], true);
  document.getElementById('ttl').textContent = '作品データが見つかりません';
  document.getElementById('prm').textContent = '共有リンクが途中で切れているか、正しくありません。';
  document.getElementById('share-hint').textContent = '作品を作った画面から、もう一度共有リンクを発行してください。';
  document.getElementById('save').disabled = true;
} else {
  apply(demos[0][0], demos[0][1], true);
  demoIndex = 1;
}

requestAnimationFrame(frame);
