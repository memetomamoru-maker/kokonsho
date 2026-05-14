# 古今掌 v27 リブランディング修正レポート

新しい正ファイル:
- `kokonsho_github_ready_package_v27_rebrand_kokonsho.zip`

## 今回の目的
サービス名を `古今抄` から `古今掌` に統一変更し、名称変更の影響があるUI・メタ情報・PWA設定・アプリアイコン・OGP画像をまとめて反映する。

## 実施内容

### 1. サービス名の全面置換
以下の表示・設定を `古今掌` に変更。
- `index.html`
  - `<title>`
  - `apple-mobile-web-app-title`
  - `og:title`
  - 画面上部のロゴ見出し
- `manifest.webmanifest`
  - `name`
  - `short_name`
- `README.md`
- `package_report.txt`
- 既存の修正レポート見出し内の名称

### 2. ロゴまわりの変更
- ヘッダーの印章風マークを `古` から `掌` に変更
- ローマ字表記 `KOKONSHO` はそのまま維持

### 3. アプリアイコン差し替え
既存ファイル名を維持したまま、以下のアイコン画像を `掌` ベースの新ビジュアルに差し替え。
- `assets/icons/apple-touch-icon.png`
- `assets/icons/favicon-16.png`
- `assets/icons/favicon-32.png`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `assets/icons/maskable-512.png`

補足:
- 新規画像生成は行っていない
- 既存ブランド方針に合わせ、Pythonで静的に再描画した
- 背景色・赤い枠・和の印章感は維持

### 4. OGP画像差し替え
- `assets/images/ogp.png` を `古今掌` 表記へ差し替え
- タグライン `読み継がれるには、理由がある。` は維持
- 既存トーンに合わせて静的に再作成

## 変更していないもの
- データ内容（百人一首100件、論語60件、toneType付き160件）
- 超訳ファーストUI
- PC背景画像
- スマホ背景非表示仕様
- コピーなし、縦スワイプなし、ホイール送りなし
- 一覧、検索、ジャンル自動生成、ランダム仕様
- `data/kokonsho_160.json` などの内部ファイル名

## 今後の正ファイル
- `kokonsho_github_ready_package_v27_rebrand_kokonsho.zip`
