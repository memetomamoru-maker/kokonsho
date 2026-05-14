# 古今掌 v34 修正レポート

正パッケージ: `kokonsho_github_ready_package_v34_hero_pcworld_fix.zip`
起点: `kokonsho_github_ready_package_v33_bugfix_pcwallpaper_compress.zip`

## 今回の修正

1. ヘッダー崩れの再修正
- ヒーロー部を absolute 配置中心から grid レイアウトに変更
- 妖精、タイトル、保存数、吹き出しを安定して並ぶ構成に変更
- タイトル下の説明と吹き出しの重なりを解消
- 狭い画面向けの微調整も更新

2. PC版の世界観を前の壁紙寄りに再構成
- 以前の和風ワールド背景 (`kokonsho_pc_background(2).webp`) をベースに採用
- その上に妖精の淡いイラストを重ね、親子向けの世界観に寄せた
- 中央は可読性優先で薄いベールをかけている
- スマホでは引き続きPC背景を非表示

3. 容量管理
- PC背景画像を WebP で再保存
- `assets/images/kokonsho_pc_background.webp`: 42,288 bytes
- `assets/images/fairy_mascot.webp`: 48,556 bytes
- 画像は引き続き軽量運用

## 維持した仕様
- 外部JSON / HTML内蔵JSON の二重保持
- 全160件データ維持
- ふりがな表示維持
- ホーム / さがす / すき / クイズ の4タブ構成維持

## 今後の正
- 今後の正パッケージは `kokonsho_github_ready_package_v34_hero_pcworld_fix.zip` とする
