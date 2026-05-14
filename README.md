# 古今抄

読み継がれるには、理由がある。

古今抄は、古典を「超訳」と「基本訳」でめくるスマホWebアプリです。

## 収録

- 百人一首: 100件
- 論語: 60件
- 合計: 160件

## 機能

- 超訳 / 基本訳のタブ切り替え
- ジャンル切り替え
- 検索
- ランダム表示
- カード一覧
- コピー
- 読み解きメモの開閉
- スマホ縦スワイプ
- PCホイール・上下キー操作
- PWA manifest
- ホーム画面追加用アイコン

## デプロイ

このフォルダの中身をGitHubリポジトリ直下に置いてください。

推奨リポジトリ名:

```txt
kokonsho
```

推奨URL:

```txt
kokonsho.vercel.app
```

## ファイル構成

```txt
index.html
manifest.webmanifest
vercel.json
README.md
data/kokonsho_160.json
assets/icons/
assets/images/ogp.png
```

## 注意

この `index.html` は単体でも動くようにデータを埋め込んでいます。
`data/kokonsho_160.json` は今後の実装差し替え用・管理用として同梱しています。
