# 古今抄

読み継がれるには、理由がある。

古今抄は、古典を「超訳」と「基本訳」でめくるスマホWebアプリです。

## 収録データ

現在のプレビュー版では以下を収録しています。

- 百人一首 100件
- 論語 60件

合計160件です。

## 主な機能

- 超訳 / 基本訳のタブ切り替え
- スマホ縦スワイプで次へ / 前へ
- PCホイール、上下キー操作
- ジャンル切り替え
- 検索
- ランダム表示
- カード一覧
- コピー
- 読み解きメモの開閉
- PWA manifest
- ホーム画面追加用アイコン

## ファイル構成

```txt
index.html
manifest.webmanifest
data/kokonsho_160.json
assets/icons/favicon-16.png
assets/icons/favicon-32.png
assets/icons/apple-touch-icon.png
assets/icons/icon-192.png
assets/icons/icon-512.png
assets/icons/maskable-512.png
assets/images/ogp.png
```

## ローカル確認

外部JSONを読み込むため、file:// ではなく簡易サーバーで確認してください。

```bash
python3 -m http.server 8000
```

ブラウザで以下を開きます。

```txt
http://localhost:8000
```

## GitHub Pages / Vercel

静的サイトなので、そのままGitHub PagesやVercelにデプロイできます。

Vercelなら、このフォルダをリポジトリとしてPushし、Framework PresetはOtherまたはStaticでOKです。

## デザイン方針

- 白い余白
- 和紙感
- 墨の気配
- 赤い落款
- 読みやすさ最優先
- 本文を上、訳を下
- 「入試メモ」ではなく「読み解きメモ」

## 注意

今後、500件へ拡張する場合は `data/kokonsho_160.json` を統合データに差し替えてください。
