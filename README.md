# 古今抄

読み継がれるには、理由がある。

## 現在の収録

- 百人一首: 100件
- 論語: 60件
- 合計: 160件

## 仕様

- 超訳 / 基本訳のタブ切り替え
- 下部固定ナビで前へ / 次へ
- 縦スワイプは主操作から外しています
- ジャンル切り替え
- 検索
- ランダム表示
- カード一覧
- コピー
- 読み解きメモの開閉
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

## メモ

`data/kokonsho_160.json` も同梱していますが、現状の `index.html` は確認しやすいようにデータを直埋めしています。
将来実装では外部JSON読み込みに切り替えても構いません。
