# 古今抄

GitHub/Vercel 用パッケージです。

## 現在の正パッケージ

- `kokonsho_github_ready_package_v18_checked_minfix.zip`
- 起点: `kokonsho_github_ready_package_v17_final_with_bg(3).zip`

## 仕様

- 収録データは `data/kokonsho_160.json` を正として読み込みます。
- HTML内にも同内容のJSONをフォールバックとして保持しています。
- 百人一首 final_v5 相当: 100件
- 論語 content_checked 相当: 60件
- 合計: 160件
- `superTranslation`: 超訳
- `basicTranslation`: 基本訳
- `examMemo`: 内部データ名。画面表示は「読み解きメモ」。
- 画面上で「入試メモ」は使用しません。
- 縦スワイプなし。
- ホイール送りなし。
- 下部固定ナビの「前へ」「次へ」を主操作にします。
- コピー機能なし。
- ランダムは下部ナビに配置し、押下色は短時間で戻ります。
- 一覧は横伸び・見切れを抑制しています。
- 百人一首と論語はタグ色を分けています。
- ジャンル切替ボタンは、データ内の `genre` から自動生成します。
- PC版は背景あり。
- スマホ版では背景画像を非表示にします。

## 背景について

アップロードZIP内ではCSSが `assets/images/kokonsho_pc_background.webp` を参照していましたが、該当ファイルが同梱されていませんでした。
そのため、新規画像生成は行わず、ZIP内に既存で入っていた `assets/images/ogp.png` を元に、ぼかし・圧縮したWebPを `assets/images/kokonsho_pc_background.webp` として追加しています。

## デプロイ

このフォルダの中身をGitHubリポジトリ直下に置いてください。
Vercelでは静的サイトとしてそのまま公開できます。


## v19 UIUX minfix

正ファイル: `kokonsho_github_ready_package_v19_uiux_minfix.zip`

スマホ実機向けに、一覧表示の可視化、ランダム押下色の自動復帰、ファーストビュー圧縮を行いました。
