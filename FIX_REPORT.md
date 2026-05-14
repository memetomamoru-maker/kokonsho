# 古今抄 v20 修正内容レポート

## 新しい正のZIP

`kokonsho_github_ready_package_v20_pc_bg_header_fix.zip`

## 修正の前提

起点は `kokonsho_github_ready_package_v19_uiux_minfix.zip`。
今回も新規画像生成はしていません。既存の `ogp.png` を素材として、PC背景用WebPを再編集しました。

## 今回の問題

1. PC版で背景がほぼ見えない
   - v19の `kokonsho_pc_background.webp` が白地に近く、さらに `centerVeil` が強すぎたため、実機では壁紙が消えたように見えていました。

2. ヘッダー右上の `CARDS` / `GENRES` がユーザー向きでない
   - `GENRES` は内部管理っぽく、しかも現時点では `2` と出るため、「百人一首と論語だけの小さなアプリ」に見えてしまう問題がありました。

## 修正内容

### 1. PC背景を見える状態に戻した

- `assets/images/kokonsho_pc_background.webp` を再作成。
- 新規生成ではなく、既存 `assets/images/ogp.png` のロゴ・印・タイトル要素を背景用に再配置・透過・圧縮。
- CSS側も調整し、PCでは背景が見えるが、中央カードや一覧の可読性は落ちないようにした。
- スマホでは引き続き背景画像を非表示。

### 2. `CARDS` / `GENRES` の統計カードを削除

- ヘッダー右上の `160 CARDS` / `2 GENRES` を削除。
- `GENRES` という内部的な英語表記を画面から撤去。
- 「2ジャンルしかない」印象を避け、将来ジャンル追加前提の見え方に寄せた。

### 3. PCヘッダーを少し圧縮

- PC版のヘッダー余白を少し圧縮。
- タイトル・コピー・説明の階層は維持。
- スマホ版のファーストビュー圧縮仕様はv19から維持。

## 維持した仕様

- 百人一首 final_v5 反映済み
- 論語 content_checked 反映済み
- 外部JSON `data/kokonsho_160.json` とHTML内蔵JSONは一致
- 表示は「読み解きメモ」
- 「入試メモ」はなし
- 縦スワイプ処理なし
- ホイール送り処理なし
- コピー機能なし
- 下部固定ナビが主操作
- ランダムボタンの押下色は一瞬で戻る
- 一覧はスマホで表示されたことが分かる仕様
- 百人一首と論語のタグ色分けあり
- `genre` からジャンルボタン自動生成
- 将来ジャンル追加前提の構造を維持

## 検証結果

- データ件数：160件
  - 百人一首：100件
  - 論語：60件
- 外部JSONとHTML内蔵JSON：一致
- `GENRES` / `CARDS` 表記：なし
- `入試メモ` 表記：なし
- `読み解きメモ` 表記：あり
- `wheel` 処理：なし
- `touchstart` / `touchmove` / `touchend`：なし
- PC背景WebP：存在確認済み

## 今後の正

今後は `kokonsho_github_ready_package_v20_pc_bg_header_fix.zip` を正として扱う。
