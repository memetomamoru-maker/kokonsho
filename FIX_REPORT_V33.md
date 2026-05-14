# 古今掌 v33 修正レポート

正パッケージ: `kokonsho_github_ready_package_v33_bugfix_pcwallpaper_compress.zip`
起点: `kokonsho_github_ready_package_v32_fairy_app_rebuild.zip`

## 今回の修正

1. ヘッダーのバグ修正
- 妖精画像に混入していた左側の不要な人物断片を除去
- 妖精画像を透過切り出しして再配置
- ヘッダーを再レイアウトし、タイトル・吹き出し・妖精の重なりを解消

2. PC版のかわいい壁紙を追加
- 既存の妖精画像を利用して、PC表示時のみ使う `assets/images/kokonsho_pc_background.webp` を再作成
- 中央は可読性優先で薄いベールを残し、左右に淡い妖精を配置
- スマホでは背景画像を出さない仕様を維持

3. 容量最適化
- `fairy_mascot.webp` を再切り出し・再圧縮
- `kokonsho_pc_background.webp` を再生成し、軽量化
- `ogp.png` を最適化保存

## 画像容量
- `assets/images/fairy_mascot.webp`: 48,556 bytes
- `assets/images/kokonsho_pc_background.webp`: 12,296 bytes
- `assets/images/ogp.png`: 294,840 bytes

## UI調整
- PC時に壁紙レイヤーを body 背景として表示
- アプリ本体はカード感のある浮遊レイヤーに調整
- 小サイズ画面向けにヘッダー文字・吹き出しの微調整を追加
- `smallFairy` は `object-fit: contain` に変更し、切れを防止

## 確認項目
- 外部JSON読み込み維持
- HTML内蔵JSON維持
- 160件データ維持
- ふりがな機能維持
- スマホではPC壁紙非表示

## 今後の正
- 今後の正パッケージは `kokonsho_github_ready_package_v33_bugfix_pcwallpaper_compress.zip` とする
