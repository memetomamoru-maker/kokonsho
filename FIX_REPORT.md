# 古今掌 v22 修正内容レポート

## 正のファイル

`kokonsho_github_ready_package_v22_exact_background.zip`

## 起点

`kokonsho_github_ready_package_v21_reference_bg.zip`

## 修正理由

v21ではPC背景表示のCSS構造は添付HTMLの方式に戻していたが、背景画像そのものがユーザー指定の正画像と一致しているかの確認が不十分だった。
今回、ユーザーが提示した `kokonsho_pc_background(2).webp` を正のPC背景画像として扱い、ZIP内の `assets/images/kokonsho_pc_background.webp` を差し替えた。

## 修正内容

- `assets/images/kokonsho_pc_background.webp` をユーザー提示の正背景画像に差し替え
- 新規画像生成なし
- 画像の加工なし
- ファイル名は既存参照に合わせて `kokonsho_pc_background.webp` のまま維持
- v21のUIUX修正は維持
  - コピー機能なし
  - `GENRES` / `CARDS` / `HYAKUNIN` / `RONGO` 表示なし
  - ジャンルボタンは `genre` から自動生成
  - スマホ背景は非表示
  - 一覧表示改善
  - ランダム押下色戻し
  - スマホファーストビュー圧縮

## 検証結果

- 背景画像のMD5一致確認済み
  - ZIP内 `assets/images/kokonsho_pc_background.webp`
  - ユーザー提示 `kokonsho_pc_background(2).webp`
- 百人一首：100件
- 論語：60件
- 合計：160件
- 外部JSONとHTML内蔵JSON：一致
- 「読み解きメモ」表記：あり
- 「入試メモ」表記：なし
- コピー機能：なし
- `GENRES` / `CARDS` / `HYAKUNIN` / `RONGO`：画面用HTML上に表示なし
- 縦スワイプ処理：なし
- ホイール送り処理：なし
- PC背景：ユーザー指定画像を使用
- スマホ背景：非表示指定を維持

## 今後の起点

今後は `kokonsho_github_ready_package_v22_exact_background.zip` を正のGitHub/Vercel用ZIPとして扱う。
