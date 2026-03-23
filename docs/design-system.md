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

### カラートークン

| トークン                    | 値      | 用途                                 |
| --------------------------- | ------- | ------------------------------------ |
| `primary`                   | #005bc4 | プライマリアクション、アクセント     |
| `primary-hover`             | #004ba3 | プライマリのホバー状態               |
| `on-primary`                | #ffffff | プライマリ上のテキスト               |
| `surface`                   | #ffffff | カード、作業エリア                   |
| `surface-container-low`     | #f0f4f7 | サイドバー                           |
| `surface-container`         | #f7f9fb | メインワークスペース背景             |
| `surface-container-high`    | #e1e6ea | インプット背景                       |
| `surface-container-highest` | #d6dce0 | ホバー状態                           |
| `on-surface`                | #2c3437 | メインテキスト（純粋な黒は使わない） |
| `on-surface-variant`        | #596064 | 補足テキスト                         |
| `sunday`                    | #dc2626 | 日曜・祝日                           |
| `saturday`                  | #2563eb | 土曜                                 |

### ルール

#### "No-Line" Rule（罫線なしルール）

セクション分割は `surface` → `surface_container_low` のような背景トーンの変化で実現する。可視的な罫線はカレンダーグリッドやデータ密度の高い構造にのみ許可され、その場合も `outline_variant` の不透明度で1pxに制限する。

#### Surface Hierarchy & Nesting（サーフェス階層とネスト）

深度はスタッキングで作る。`surface_container_lowest`（Pure White）のカードを `surface_container` の背景の上に配置してメインの作業エリアを示す。

#### "Glass & Gradient" Rule（ガラス＆グラデーションルール）

- フローティングオーバーレイ: `rgba(255, 255, 255, 0.8)` + `backdrop-blur: 12px`
- プライマリCTA: 単色 `#005bc4`、角丸 8px、シャドウなし

---

## 3. Typography

デュアルフォント戦略で、キャラクターと可読性のバランスを取る。

### フォントファミリー

| 用途                         | フォント              | 特徴                                                                                                 |
| ---------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| Headline（見出し）           | **Plus Jakarta Sans** | Display・Headerレベルに使用。タイトトラッキング、重いウェイト（Extrabold）で権威あるエディトリアル感 |
| Body & Label（本文・ラベル） | **Manrope**           | ジオメトリックサンセリフ。ユーティリティ用                                                           |

### タイプスケール

| レベル        | デスクトップ    | モバイル        | ウェイト        | トラッキング     | 用途                         |
| ------------- | --------------- | --------------- | --------------- | ---------------- | ---------------------------- |
| Display Large | 3rem (48px)     | 2rem (32px)     | Extrabold       | tracking-tighter | 月タイトル                   |
| Header        | 1.125rem (18px) | 1rem (16px)     | Bold            | —                | セクションタイトル           |
| Body          | 0.875rem (14px) | 0.875rem (14px) | Medium          | —                | インタラクティブ要素、説明文 |
| Label         | 12px            | 12px            | Bold, Uppercase | tracking-[0.3em] | メタデータ、サブヘッダー     |

### 最小フォントサイズ

**全テキスト要素は10px以上を厳守する。** 視覚的な装飾（祝日ドット等）も含む。

---

## 4. Elevation & Depth

階層は **Tonal Layering（色調レイヤリング）** と **Ambient Light（環境光）** で伝達する。

### レイヤリング原則

| サーフェス                 | カラー     | 用途                     |
| -------------------------- | ---------- | ------------------------ |
| `surface_container_low`    | #f0f4f7    | サイドバー               |
| `surface_container`        | #f7f9fb    | メインワークスペース背景 |
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

/* フォールバック: backdrop-filter非対応 or prefers-reduced-transparency */
@supports not (backdrop-filter: blur(12px)) {
  .glass-panel {
    background: rgba(255, 255, 255, 0.95);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .glass-panel {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: none;
  }
}
```

---

## 5. Components

### Buttons

- **Primary**: 単色 `#005bc4`、`rounded-lg` (8px)、シャドウなし。ホバー: `#004ba3`
- **Ghost**: `text-on-surface-variant`、ホバー時に `surface_container_highest` へトランジション
- **FAB（モバイル）**: 白背景、`border: 1px solid #dce4e8`、テキスト/アイコン `#005bc4`、`rounded-xl`

### Inputs & Selects

- ボーダーレス
- `surface_container_high` 背景、フォーカス時に Pure White に変化
- **フォーカスリング**: `outline: 2px solid primary` + `outline-offset: 2px`、またはフォーカス時に薄い primary シャドウを追加

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

## 6. インタラクションとアクセシビリティ

### フォーカス状態

ボーダーレスなフォーム要素はキーボード操作時のフォーカスが視覚的に分かりにくいため、以下を必須とする:

```css
/* フォーカスリング */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* インプットフォーカス: 背景変更 + 薄いシャドウ */
input:focus,
select:focus {
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 91, 196, 0.1);
}
```

### タッチターゲット（Invisible Padding）

ラベルのタイポグラフィ（10px）は視覚的に小さいが、**クリック/タップ判定は最低44px四方を確保する**。

```css
/* 小さなラベルやボタンでも判定領域を確保 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
}
```

### コントラスト比

WCAG AA準拠（4.5:1以上）を確認する対象:

| テキスト       | 色      | 背景    | コントラスト比 |
| -------------- | ------- | ------- | -------------- |
| メインテキスト | #2c3437 | #ffffff | 13.5:1 ✅      |
| 補足テキスト   | #596064 | #ffffff | 6.8:1 ✅       |
| 補足テキスト   | #596064 | #f7f9fb | 6.4:1 ✅       |
| 補足テキスト   | #596064 | #f0f4f7 | 5.9:1 ✅       |
| ラベル（10px） | #596064 | #e1e6ea | 4.6:1 ✅       |

---

## 7. レスポンシブ・適応型戦略

### ブレークポイント

| ブレークポイント | 幅           | レイアウト                                          |
| ---------------- | ------------ | --------------------------------------------------- |
| Desktop          | ≥ 768px (md) | 2カラム（サイドバー + プレビュー）                  |
| Mobile           | < 768px      | シングルカラム（プレビューのみ + ボトムシート設定） |

### A4比率スケーリング

- **デスクトップ**: A4比率を維持したカードで表示
- **モバイル**: スクロール可能なシングルカラムに再構成。A4比率は維持するが、カード幅は画面幅に追従

### タイポグラフィスケーリング

| レベル        | デスクトップ    | モバイル        |
| ------------- | --------------- | --------------- |
| Display Large | 3rem (48px)     | 2rem (32px)     |
| Header        | 1.125rem (18px) | 1rem (16px)     |
| Body          | 0.875rem (14px) | 0.875rem (14px) |
| Label         | 10px            | 10px            |

### モバイル固有のUI

- 設定パネル: ボトムシート（下からスライドアップ、glass-panel、最大85vh）
- 設定ボタン: 画面右下のFAB（白背景、ブルーテキスト）
- ヘッダー: タイトル縮小、サブタイトル非表示

---

## 8. 開発者向け実装ガイド

### Tailwind CSS設定

Ethereal Glass独自のトークンを `@theme` で定義し、Tailwindクラスとして使用する:

```css
@theme {
  --color-surface: #ffffff;
  --color-surface-container-low: #f0f4f7;
  --color-surface-container: #f7f9fb;
  --color-surface-container-high: #e1e6ea;
  --color-on-surface: #2c3437;
  --color-on-surface-variant: #596064;
  --color-sunday: #dc2626;
  --color-saturday: #2563eb;
  --font-heading: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body: "Manrope", system-ui, sans-serif;
  --shadow-a4: 0 10px 40px -10px rgba(44, 52, 55, 0.08);
}
```

使用例:

```html
<div class="bg-surface-container-low text-on-surface font-heading">
  <div class="bg-surface shadow-a4"></div>
</div>
```

### ボタン実装例

```html
<!-- Primary Button -->
<button
  class="bg-[#005bc4] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#004ba3] transition-colors"
>
  出力
</button>

<!-- FAB (Mobile) -->
<button
  class="fixed bottom-8 right-8 bg-white border border-[#dce4e8] text-[#005bc4] px-5 py-3 rounded-xl shadow-[0_4px_12px_rgba(0,91,196,0.08)] flex items-center gap-2 hover:bg-[#f8fafc]"
>
  設定
</button>
```

---

## 9. Do's and Don'ts

### Do

- 小さな大文字ラベルに極端なレタースペーシング（0.2em - 0.3em）を使う
- 50/50 スプリットレイアウトで画像とデータのバランスを取る
- プライマリブルーは控えめに「意図のアクセント」として使う
- 全テキスト要素を10px以上に保つ
- タッチターゲットを44px以上確保する
- フォーカス状態を視覚的に明示する
- コントラスト比をWCAG AA（4.5:1）以上に保つ

### Don't

- テキストに純粋な黒（#000000）を使わない → `on_surface`（#2c3437）でソフトなコントラストに
- レイアウトコンテナに1pxボーダーを使わない
- インタラクティブUI要素にシャープコーナーを使わない → ボタンは `rounded-lg` を維持
- `backdrop-filter` のフォールバックなしで半透明を使わない
- モバイルでデスクトップと同じフォントサイズを強制しない
