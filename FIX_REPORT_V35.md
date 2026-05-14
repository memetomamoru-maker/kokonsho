# 古今掌 v35 修正レポート

正パッケージ: `kokonsho_github_ready_package_v35_new_pcworld_illustrated.zip`
起点: `kokonsho_github_ready_package_v34_hero_pcworld_fix.zip` だが、v34 の「旧壁紙流用」方針は破棄。

## 方針
- 「前の壁紙みたいに」は構図や役割の参考にとどめる
- 旧壁紙をそのまま使わない
- 親子向け・妖精主役の新しい世界観で PC 背景を新規作成する

## 今回の修正

### 1. PC背景を新規イラストに差し替え
- 旧水墨背景は不使用
- 妖精マスコットを参照して、新しい PC 用イラスト背景を作成
- 画面の左右に妖精・和風モチーフ・花・巻物・雲などを配置
- 中央はアプリ本体が読みやすいよう、大きく余白を確保
- 親子向け・子ども向けのやわらかいパステル世界観に統一

使用ファイル:
- `assets/images/kokonsho_pc_background.webp`

### 2. PC 表示時の見え方を調整
- 背景イラストが見えるよう、PC時のオーバーレイ濃度を軽くした
- アプリ本体カードの不透明度もわずかに下げ、背景世界観が感じられるように調整
- スマホでは引き続き PC 背景を表示しない

### 3. 既存のヘッダー安定化は維持
- v34 で入れた grid ベースのヒーロー配置は維持
- 妖精、タイトル、吹き出しの重なりを起こしにくい構造のまま継続

## 画像容量
- `assets/images/kokonsho_pc_background.webp`: 77,654 bytes
- `assets/images/fairy_mascot.webp`: 48,556 bytes

## 維持した仕様
- 外部JSON / HTML内蔵JSON の二重保持
- 全160件データ維持
- ふりがな表示維持
- ホーム / さがす / すき / クイズ の4タブ構成維持
- スマホでは背景画像を非表示

## 今後の正
- 今後の正パッケージは `kokonsho_github_ready_package_v35_new_pcworld_illustrated.zip` とする
