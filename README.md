# 名前フラクタル

名前やふりがなからフラクタル模様を作る、ブラウザーで動作するアプリです。

## ローカルで開く

`index.html` をブラウザーで開くと、作品ページに移動します。解説ページは `explanation.html` です。

## GitHub Pagesで公開する（公開するときに実施）

現在、GitHub Pagesの公開設定は行っていません。公開するタイミングで、リポジトリの管理者が次の設定を行ってください。

1. GitHubでこのリポジトリを開き、**Settings** を選びます。
2. 左側の **Pages** を開きます。
3. **Build and deployment** の **Source** を **Deploy from a branch** にします。
4. **Branch** で `index.html` があるブランチを選びます（通常は `main`）。
5. フォルダーに **/(root)** を選び、**Save** を押します。
6. Pages設定画面に公開URLが表示されたら、**Visit site** からサイトを確認します。

公開URLは通常 `https://<ユーザー名>.github.io/<リポジトリ名>/` の形式です。`index.html` が入口となり、作品ページへ自動で移動します。

公開には数分かかる場合があります。ページが表示されないときは少し待って再読み込みし、リポジトリの **Actions** タブでPagesの公開処理にエラーがないか確認してください。

## 文化祭後に公開を停止する

文化祭が終わったら、サイトだけを非公開にできます。リポジトリやソースファイルは削除されません。

1. GitHubでこのリポジトリを開き、**Settings** → **Pages** を選びます。
2. Pages設定画面で、公開URL (**Your site is live at**) の横にあるメニューを開きます。
3. **Unpublish site** を選び、公開を停止します。

公開停止中は、配布したQRコードやURLからサイトを開けません。再公開する場合は、**Settings** → **Pages** で公開元ブランチとフォルダーを設定し直し、そのブランチに変更を反映して再デプロイします。

詳しくは[GitHub Pagesの公開停止手順](https://docs.github.com/en/pages/getting-started-with-github-pages/unpublishing-a-github-pages-site)を参照してください。

## 公開前に確認すること

- 公開したサイトはインターネットから閲覧できます。リポジトリが非公開でも、GitHub Pagesで公開したサイト自体は公開状態になります。
- リポジトリやサイトに、公開したくない個人情報・秘密情報が含まれていないことを確認してください。
- GitHub Pagesの利用条件はリポジトリのプランや組織設定によって異なることがあります。利用可能かGitHubのPages設定画面で確認してください。
- ファイルを更新した後は、公開元に選んだブランチへ変更を反映すると、サイトにも更新が反映されます。

詳しくは[GitHub Pagesの公開元設定](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)と[GitHub Pagesの概要](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)を参照してください。

## スマホで作品を保存する

作品ページの右上にある **スマホに保存** を押すと、作品を再現するURLのQRコードが表示されます。スマホで読み取ると `share.html` が開き、同じ設定の作品をスマホ上で描画します。**画像を保存** を押すとPNGを保存できます。対応ブラウザーでは端末の共有メニューが開くので、そこから写真やファイルに保存してください。

QRコードには名前やふりがなを含めず、描画に必要な数値だけをURLのフラグメントに入れます。画像ファイル自体をサーバーへアップロードする方式ではありません。

この機能はGitHub PagesなどHTTPSで公開した後に使えます。ローカルの `file://` 表示では、スマホが開ける公開URLにならないためQRを発行しません。QR画像の作成にはブラウザーから [node-qrcode](https://github.com/soldair/node-qrcode) の配布ファイルを読み込みます。読み込めない場合は共有URLをコピーして利用してください。
