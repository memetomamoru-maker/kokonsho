# 古今掌 v29 JSON読み込み復旧レポート

新しい正ファイル:
- `kokonsho_github_ready_package_v29_json_load_fix.zip`

## 原因
v28で保存済みフィルター用のJavaScriptを追加した際、JS側では `savedToggle` を参照していたが、HTML側に `id="savedToggle"` のボタンが存在していなかった。

そのため、ページ読み込み時に以下の処理でエラーが発生し、`loadData()` まで到達していなかった。

```js
$("savedToggle").onclick = ...
```

結果として、外部JSONもHTML内蔵JSONも読み込まれず、カード描画が止まる状態になっていた。

## 修正内容

### 1. 保存済みボタンをHTMLに追加
検索欄横に以下のボタンを追加。

```html
<button class="ghost" id="savedToggle" type="button" aria-pressed="false">保存済み</button>
```

### 2. コントロール行のレイアウトを修正
検索欄、保存済み、一覧の3要素が横並びになるよう、CSSを修正。

```css
.controlsRow {
  grid-template-columns: 1fr auto auto;
}
```

スマホ側も同様に調整。

## 検証結果
- JS構文チェックOK
- JSが参照するIDに欠落なし
- 外部JSON `data/kokonsho_160.json` は160件
- HTML内蔵JSONは160件
- 外部JSONとHTML内蔵JSONは一致
- `古今抄` 表記なし
- `古今掌` 表記あり
- `savedToggle` ボタン存在確認済み

## 変更していないもの
- データ内容
- PC背景
- スマホ背景非表示
- 超訳ファーストUI
- ハート保存仕様
- アプリアイコン
- OGP画像
- コピーなし、縦スワイプなし、ホイール送りなし

## 今後の正ファイル
- `kokonsho_github_ready_package_v29_json_load_fix.zip`
