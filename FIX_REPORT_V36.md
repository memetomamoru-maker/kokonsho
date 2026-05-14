# 古今掌 v36 修正レポート

正パッケージ: `kokonsho_github_ready_package_v36_kokon_shou_duo.zip`
起点: `kokonsho_github_ready_package_v35_new_pcworld_illustrated.zip`

## 今回の修正

### 1. ココン＋ショウ構成を反映
- ココン: 古典の世界から来た案内役の妖精
- ショウ: 現代の小学生側の相棒キャラ
- クイズ画面の案内画像をココンからショウに変更
- クイズ画面文言を `ショウと ことばで あそぼう` に変更

### 2. ショウ画像を追加
追加ファイル:
- `assets/images/shou_mascot.webp`

キャラクターシートからショウを切り出し、WebP圧縮して追加。

### 3. PC背景をココン＋ショウ版に差し替え
- 旧壁紙は不使用
- 新しく生成したココン＋ショウのPC背景を使用
- 左側にココン、右側にショウ、中央にアプリ本体を置ける余白を確保した構成
- 旧壁紙の「左右に世界観、中央は可読性」という設計思想だけを継承

### 4. PC表示の背景透過バランスを微調整
- 背景の白ベールを少し薄くし、2人の世界観が見えるよう調整
- アプリ本体は可読性を落としすぎない範囲で半透明を維持

## 画像容量
- `assets/images/kokonsho_pc_background.webp`: 93,698 bytes
- `assets/images/fairy_mascot.webp`: 48,556 bytes
- `assets/images/shou_mascot.webp`: 22,094 bytes
- `assets/images/ogp.png`: 294,840 bytes

## 検証
- 外部JSON: 160件
- HTML内蔵JSON: 160件
- 外部JSONとHTML内蔵JSON一致
- JS構文チェックOK
- `古今抄` 表記なし
- `shou_mascot.webp` 参照あり

## 今後の正
- 今後の正パッケージは `kokonsho_github_ready_package_v36_kokon_shou_duo.zip` とする
