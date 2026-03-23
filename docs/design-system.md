# Design System: Ethereal Glass

## 1. Overview & Creative North Star

**Creative North Star: "The Editorial Architect"**

Ethereal Glass は、機能的なユーティリティとハイエンドな印刷エディトリアルの間を橋渡しするデザインシステム。従来のSaaSの「アプリ的な」密度を排し、広大なホワイトスペース、意図的な非対称性、洗練されたレイヤリング戦略を採用する。デジタルインターフェースを物理的なA4レイアウトのように扱うことで、永続性と高級感を生み出す。

**主要な特徴:**

- ラベルのウルトラワイドトラッキング
- 強いタイポグラフィコントラスト
- 半透明を使った認知負荷の管理

---

## 2. Colors

パレットは「Atmospheric Neutrals（大気的ニュートラル）」と「Precision Blue（精密ブルー）」のプライマリに基づく。

### ルール

#### "No-Line" Rule（罫線なしルール）

セクション分割は `surface` → `surface_container_low` のような背景トーンの変化で実現する。可視的な罫線はカレンダーグリッドやデータ密度の高い構造にのみ許可され、その場合も `outline_variant` の不透明度で1pxに制限する。

#### Surface Hierarchy & Nesting（サーフェス階層とネスト）

深度はスタッキングで作る。`surface_container_lowest`（Pure White）のカードを `surface_container` の背景の上に配置してメインの作業エリアを示す。

#### "Glass & Gradient" Rule（ガラス＆グラデーションルール）

- フローティングオーバーレイ: `rgba(255, 255, 255, 0.8)` + `backdrop-blur: 12px`
- プライマリCTA: `bg-gradient-to-br` で `primary` → `primary_container` の方向性グラデーション

---

## 3. Typography

デュアルフォント戦略で、キャラクターと可読性のバランスを取る。

### フォントファミリー

| 用途                         | フォント              | 特徴                                                                                                 |
| ---------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| Headline（見出し）           | **Plus Jakarta Sans** | Display・Headerレベルに使用。タイトトラッキング、重いウェイト（Extrabold）で権威あるエディトリアル感 |
| Body & Label（本文・ラベル） | **Manrope**           | ジオメトリックサンセリフ。ユーティリティ用                                                           |

### タイプスケール

| レベル        | サイズ             | ウェイト        | トラッキング     | 用途                                                   |
| ------------- | ------------------ | --------------- | ---------------- | ------------------------------------------------------ |
| Display Large | 3rem (48px)        | Extrabold       | tracking-tighter | 月タイトル                                             |
| Header        | 1.125rem - 1.25rem | Bold            | —                | セクションタイトル                                     |
| Label         | 9px - 10px         | Bold, Uppercase | tracking-[0.3em] | メタデータ、サブヘッダー。広がりのある「プレミアム」感 |
| Body          | 0.875rem (14px)    | Medium          | —                | インタラクティブ要素、説明文                           |

---

## 4. Elevation & Depth

階層は **Tonal Layering（色調レイヤリング）** と **Ambient Light（環境光）** で伝達する。

### レイヤリング原則

| サーフェス                 | カラー     | 用途                     |
| -------------------------- | ---------- | ------------------------ |
| `surface_container_low`    | #f0f4f7    | サイドバー               |
| `surface_container`        | #eaeff2    | メインワークスペース背景 |
| `surface_container_lowest` | Pure White | カード、作業エリア       |

### アンビエントシャドウ

**A4-Shadow（シグネチャシャドウ）:**

```css
box-shadow: 0 10px 40px -10px rgba(44, 52, 55, 0.08);
```

デジタルなドロップシャドウではなく、柔らかく自然な光源を模倣する。

### Glassmorphism

`glass-panel` クラスは、すべてのコンテキストメニューやフローティング情報ノードに必須:

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
```

---

## 5. Components

### Buttons

- **Primary**: `rounded-xl` (12px)、グラデーション付き
- **Ghost**: `text-on-surface-variant`、ホバー時に `surface_container_highest` へトランジション

### Inputs & Selects

- ボーダーレス
- `surface_container_high` 背景、フォーカス時に Pure White に変化

### Selection Toggles

- 「Segmented Control」スタイル
- `surface_container_high` トラック上を物理的な白い「ピル」がスライド

### Cards

- A4-Shadowで定義
- 「Paper」オブジェクト: `border-radius: 2px`
- 「UI」オブジェクト: `border-radius: 12px`

### Progress / Ranges

- カスタムスライダー: 4pxトラック + 16px円形サム
- サムに2px白ボーダー（背景に対するポップ感を確保）

---

## 6. Do's and Don'ts

### Do

- 小さな大文字ラベルに極端なレタースペーシング（0.2em - 0.3em）を使う
- 50/50 スプリットレイアウトで画像とデータのバランスを取る
- プライマリブルーは控えめに「意図のアクセント」として使う

### Don't

- テキストに純粋な黒（#000000）を使わない → `on_surface`（#2c3437）でソフトなコントラストに
- レイアウトコンテナに1pxボーダーを使わない
- インタラクティブUI要素にシャープコーナーを使わない → ボタンやサイドバーは `border-radius: 0.75rem` を維持
