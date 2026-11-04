# 名前フラクタル

名前とふりがなから、その人だけのフラクタル模様を作るブラウザーアプリです。蒼阿祭の専門展示用に制作しました。WebGL を使って描画するため、インストールせずにブラウザーで利用できます。

## できること

- 名前から形や色などのパラメーターを決め、フラクタルを描画します。同じ入力と選択内容なら、同じ模様を再現できます。
- 形は「おまかせ」を含む7項目、色は「おまかせ」を含む5項目から選べます。
- 45秒間操作がないとデモ表示に戻り、その後は8秒ごとにサンプル名・形・色が切り替わります。
- 「画像を保存」からQRコードを表示します。スマートフォンで読み取ると同じ作品が開き、縦長の画像を作成して保存できます。
- [explanation.html](explanation.html) で、フラクタルのしくみを紹介します。

## ファイル構成

```text
index.html                 入口。作品ページへ自動転送
name-fractal.html          作品ページとアプリのHTML
explanation.html           フラクタルの解説ページ
css/
  style.css                作品ページのレイアウトと見た目
  explanation.css          解説ページの見た目
  fonts.css                同梱フォントの読み込み
fonts/
  NotoSansJP-Medium-subset.woff2
  NotoSansJP-Black-subset.woff2
                            ページと保存画像に使う日本語フォント
icons/
  save.svg, new.svg, info.svg
  info.png, add_photo.png, add_box.png
                            画面で使うアイコン画像
js/
  webgl-renderer.js        WebGL の初期化とフラクタル描画
  name-parameters.js       名前から描画パラメーターを作成
  presets-ui.js            形・色のプリセットと表示更新
  animation.js             描画ループ、動き、画質調整
  export-artwork.js        保存画像のタイトル・情報欄を作成
  controls.js              名前入力と放置デモ
  qrcode.js                QRコード生成ライブラリ
  share.js                 QRコード表示とスマートフォン側の画像作成
  menu.js                  形・色メニューの開閉
```

## 使い方

`index.html` をブラウザーで開くと作品ページに移動します。名前を入力し、必要なら形や色を選んで「作る」を押してください。「画像を保存」を押すとQRコードが表示されます。

スマートフォンへの受け渡しでは画像データ自体を送らず、名前・ふりがな・形・色をURLに含めます。スマートフォン側で作品を再描画し、画像を作成します。

## 公開とQRコードのURL

QRコードのリンク先は `js/share.js` の `SHARE_BASE_URL` に設定されています。現在は次のURLです。

```text
https://name-fractal.ooowwwhiro.workers.dev/name-fractal.html
```

公開先を変更したときは、ここを新しい公開先の `name-fractal.html` のURLに変更してから再公開してください。設定を更新しないと、QRコードは以前の公開先を開きます。ローカルの変更をスマートフォンで確認する場合も、その変更を公開先へ反映する必要があります。

## 公開時に知っておくこと

- 公開したサイトは、URLを知っている人が閲覧できます。
- QRコードのURLには名前とふりがなが含まれます。文字列はURL向けに変換されていますが、画像をサーバーへ送る仕組みではありません。
- 展示で利用する場合は、名前などがURLに含まれることを来場者に案内してください。
- ソースを公開する前に、公開したくない個人情報や秘密情報が含まれていないことを確認してください。

## 使用ライブラリ

- [QR Code Generator for JavaScript](http://www.d-project.com/)（Kazuhiko Arase 作、MIT ライセンス）: `js/qrcode.js`
  - 「QR Code」は株式会社デンソーウェーブの登録商標です。
