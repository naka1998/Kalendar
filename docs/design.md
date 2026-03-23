# Kalendar 設計ドキュメント

## 1. 概要

Kalendar は完全クライアントサイドのSPAで、印刷用の壁掛けカレンダーHTMLを生成する。ユーザーがレイアウト、画像、祝日、カラーテーマを設定し、単一HTMLファイル（またはZIP）としてダウンロードしてブラウザ印刷する。

**設計原則**:

- ビジネスロジックは全て純粋関数で実装（DOMやモック不要でテスト可能）
- 外部API（fetch, localStorage, Canvas）は依存注入で抽象化
- Container/Presentational コンポーネント分離
- Zustandストアは同期setterのみ（副作用なし）

---

## 2. 型定義

### 2.1 設定型

```typescript
type Orientation = "portrait" | "landscape";
type WeekStart = "sunday" | "monday";
type WeekdayFormat = "ja" | "en-short" | "en-full";
type MonthLabelFormat = "yyyy.mm" | "month-yyyy" | "ja";
type HolidayMarkStyle = "dot" | "circle" | "underline" | "color-only";
type ImageRatio = "60:40" | "50:50" | "70:30";
type PageLayout = "1-month" | "2-month";
type FontWeight = 300 | 400 | 600;
```

### 2.2 カラーテーマ

```typescript
interface ColorTheme {
  id: string;
  name: string;
  colors: {
    background: string; // ページ背景色
    text: string; // 平日文字色
    sunday: string; // 日曜・祝日文字色
    saturday: string; // 土曜文字色
    holidayMark: string; // 祝日記号色
    headerRule: string; // 月ヘッダー罫線色
    gridRule: string; // 行区切り罫線色
    weekdayHeader: string; // 曜日ヘッダー文字色
    monthLabel: string; // 月表記文字色
  };
}
```

### 2.3 グリッドデータ

```typescript
interface DayCell {
  date: string | null; // "YYYY-MM-DD" または null（空セル）
  dayOfMonth: number | null;
  isCurrentMonth: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  isSunday: boolean;
  isSaturday: boolean;
}
```

### 2.4 カレンダースタイル

```typescript
interface CalendarStyle {
  monthFontSize: number; // px (default: 48)
  dayFontSize: number; // px (default: 14)
  weekdayFontSize: number; // px (default: 12)
  cellPadding: number; // px (default: 8)
  headerGap: number; // px (default: 8)
}
```

### 2.5 HTML生成入力型

```typescript
interface HtmlGeneratorInput {
  pages: PageData[]; // 月ごとのページデータ
  orientation: Orientation;
  fontFamily: string;
  fontWeight: FontWeight;
  googleFontsUrl: string;
}

interface PageData {
  monthLabel: string;
  grid: DayCell[][];
  weekdayHeaders: string[];
  theme: ColorTheme;
  holidayMarkStyle: HolidayMarkStyle;
  imageBase64: string | null;
  imageRatio: ImageRatio;
}
```

---

## 3. アーキテクチャ

### 3.1 レイヤー分離

```
┌─────────────────────────────────────────────┐
│  UIレイヤー（Reactコンポーネント）              │
│  ├── Presentational: propsのみ、ストア依存なし │
│  └── Container: ストア接続 + データ準備        │
├─────────────────────────────────────────────┤
│  フックレイヤー（副作用）                       │
│  ├── useHolidays: fetch → ストア書き込み      │
│  └── useImageUpload: リサイズ → ストア書き込み  │
├─────────────────────────────────────────────┤
│  ストアレイヤー（Zustand - 同期のみ）           │
│  └── 純粋な状態更新のみ。async/fetchなし       │
├─────────────────────────────────────────────┤
│  ロジックレイヤー（lib/ - 純粋関数）            │
│  ├── dateUtils, holidayUtils, themeUtils     │
│  ├── layoutUtils, htmlGenerator              │
│  └── 副作用なし、ブラウザAPIなし               │
├─────────────────────────────────────────────┤
│  サービスレイヤー（lib/ - 依存注入）            │
│  ├── holidayService (fetcher + cache)        │
│  └── imageService (resizer)                  │
│  依存を注入可能。デフォルトは実際のブラウザAPI。  │
│  テスト時はモックを注入。                       │
└─────────────────────────────────────────────┘
```

### 3.2 レイヤー別テスト容易性

| レイヤー                  | テスト手法                      | 必要なモック               |
| ------------------------- | ------------------------------- | -------------------------- |
| ロジック（lib/ 純粋関数） | 入力→出力のアサーション         | なし                       |
| サービス（lib/ DI）       | モックfetcher/cache/resizer注入 | インターフェースモックのみ |
| ストア                    | setter呼び出し → 状態検証       | なし                       |
| フック                    | モックサービスをパラメータ注入  | サービスモック             |
| Presentational            | propsで描画 → DOM検証           | なし                       |
| Container                 | ストアとの統合テスト            | 最小限                     |
| E2E                       | Playwrightブラウザテスト        | なし（実アプリ）           |

### 3.3 コンポーネントアーキテクチャ

```
App.tsx
├── Header.tsx (レイアウト: タイトル + ヘルプ + 出力ボタン)
│   ├── HelpModal.tsx (印刷手順ガイド)
│   └── DownloadButton.tsx (PDF/HTML/ZIP ドロップダウン)
├── Sidebar.tsx (コンテナ: アコーディオン、複数同時展開可)
│   ├── BasicSection.tsx (期間, 向き, 曜日, 表記)
│   ├── HolidaySection.tsx (取得状態, マーク, 手動追加/削除)
│   ├── DesignSection.tsx (テーマ, フォント, 文字サイズ, 画像設定)
│   └── SettingsActions.tsx (設定保存/読込/HTMLから読込)
├── PreviewArea.tsx (コンテナ: 連続スクロール + 月ジャンプ)
│   └── CalendarPageContainer.tsx (コンテナ: ストア → props + 画像操作)
│       └── CalendarPage.tsx (プレゼンテーショナル: 画像D&D対応)
│           └── CalendarGrid.tsx (プレゼンテーショナル: カスタマイズ可能なサイズ)
├── BottomSheet.tsx (モバイル: スライドアップ設定パネル)
└── FAB (モバイル: 設定ボタン、md:hidden)
```

**プレゼンテーショナルコンポーネント**（`CalendarPage`, `CalendarGrid`）:

- 全データをpropsで受け取る（calendarStyleを含む）
- テーマカラーとサイズはインラインスタイルで適用（HTMLエクスポートと一致）
- ストアへの依存ゼロ — propsだけでテスト可能
- CalendarPageは画像のクリック/D&Dアップロード、ホバー削除に対応

**コンテナコンポーネント**（`CalendarPageContainer`）:

- Zustandストアから読み取り
- `lib/` の純粋関数で派生データを計算
- 計算結果をプレゼンテーショナルコンポーネントに渡す

---

## 4. データフロー

### 4.1 祝日データフロー

```
アプリマウント
  → useHolidays(service)
    → service.fetchHolidays()
      → キャッシュ確認（TTL: 7日）
        → 有効: キャッシュ返却
        → 期限切れ/なし: API取得
          → 成功: キャッシュ保存 + 返却
          → 失敗: 期限切れキャッシュ or フォールバック
    → store.setApiHolidays(data)

描画時 (CalendarGridContainer)
  → mergeHolidays(apiHolidays, manualHolidays, removedHolidays)  // 純粋関数
  → enrichDayCells(grid, mergedHolidays)  // 純粋関数
  → 結果をCalendarGrid（プレゼンテーショナル）に渡す
```

### 4.2 画像処理フロー

```
ユーザーがファイルをドロップ
  → useImageUpload(imageService)
    → バリデーション: MIME type, ファイルサイズ
    → imageService.resizeImage(file)
      → 画像の寸法を取得
      → リサイズ計算（長辺最大2400px）
      → Canvasに描画、base64エクスポート
    → store.setImage(monthKey, { base64, fileName, mimeType })

描画時 (CalendarPage)
  → <img src={base64} style={{ objectFit: 'contain' }} />
```

### 4.3 エクスポートフロー

```
出力ボタンクリック → モード選択 (PDF / HTML / ZIP)

PDF:
  → generateSingleHtml(input) → Blob URL → window.open → window.print()

HTML:
  → exportSettings(store) → settingsJson
  → generateSingleHtml(input, settingsJson)
    → <meta name="kalendar-settings"> にJSON埋め込み
  → Blob → ダウンロード

ZIP:
  → generateZip(input) → Blob → ダウンロード
```

### 4.4 HTMLインポートフロー

```
「HTMLから読込」ボタンクリック
  → ファイル選択 (.html)
  → FileReader.readAsText()
  → parseSettingsFromHtml(html)
    → <meta name="kalendar-settings"> のcontent属性を抽出
    → HTMLエンティティをデコード
    → importSettings(json) で設定オブジェクトに変換
  → useCalendarStore.setState(settings)
  → プレビューが設定に基づいて更新
```

---

## 5. テーマ定義

| テーマ     | 背景    | 文字    | 日曜    | 土曜    |
| ---------- | ------- | ------- | ------- | ------- |
| Classic    | #FFFFFF | #1A1A1A | #DC2626 | #2563EB |
| Monochrome | #FFFFFF | #1A1A1A | #4B5563 | #6B7280 |
| Dark       | #1F2937 | #F9FAFB | #FCA5A5 | #93C5FD |
| Cream      | #FFFBEB | #78350F | #DC2626 | #1D4ED8 |
| Forest     | #1A2E1A | #D1FAE5 | #FCA5A5 | #93C5FD |
| Minimal    | #FFFFFF | #9CA3AF | #6B7280 | #9CA3AF |

---

## 6. フォントプリセット

| フォント      | ウェイト      | Google Fonts URL                 |
| ------------- | ------------- | -------------------------------- |
| Montserrat    | 300, 400, 600 | `Montserrat:wght@300;400;600`    |
| Inter         | 300, 400, 600 | `Inter:wght@300;400;600`         |
| Noto Sans JP  | 300, 400, 600 | `Noto+Sans+JP:wght@300;400;600`  |
| IBM Plex Sans | 300, 400, 600 | `IBM+Plex+Sans:wght@300;400;600` |
| Lato          | 300, 400, 700 | `Lato:wght@300;400;700`          |

---

## 7. 出力HTML構造

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Calendar 2026.04 - 2027.03</title>
    <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet" />
    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .page {
        width: 210mm;
        height: 297mm;
        page-break-after: always;
        overflow: hidden;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }
    </style>
  </head>
  <body>
    <div class="page" style="background: #FFFFFF;">
      <div class="image-area">
        <img src="data:image/jpeg;base64,..." />
      </div>
      <div class="calendar-area">
        <div class="month-label" style="color: #111827;">2026.04</div>
        <div class="grid">
          <div class="weekday-header">Sun</div>
          <!-- ... 7ヘッダー ... -->
          <div class="day-cell" style="color: #DC2626;">1<span>·</span></div>
          <!-- ... 日セル ... -->
        </div>
      </div>
    </div>
    <!-- 以降のページ... -->
  </body>
</html>
```

---

## 8. 設計判断

### カレンダー描画のインラインスタイル

カレンダーページのテーマカラーにはインラインの `style` 属性を使用（Tailwindクラスではない）。エクスポートHTMLにはTailwindが存在しないため、プレビューとエクスポートの見た目の一致を保証する。

### テンプレートリテラルによるHTML生成

HTMLは `renderToString` ではなくテンプレートリテラルで生成。React固有の属性が出力に混入するのを避け、クリーンなHTMLを出力する。

### base64画像のZustand保持

画像はbase64文字列としてZustandストアに保持。Blob URLはセッション限定でリロード時に無効化される。base64ならHTMLエクスポートにそのまま使用可能。最大24枚×数MBは許容範囲。

### Zustand単一ストア

全設定項目が密結合（テーマ→グリッド描画、期間→画像割り当て等）。分割すると同期コストが発生する。セレクタで不要なリレンダリングを防止。

### Google Fonts CDNリンク

フォントは `<link>` タグで読み込み、base64埋め込みはしない。埋め込みはフォントあたり200-500KBの肥大化を招く。印刷時にインターネット接続があるのが前提。

### 同期専用ストア + フックでの副作用

Zustandストアは同期setterのみ。非同期処理（API取得、画像リサイズ）はフックでサービスを呼び、結果をストアに書き込む。ストアのテストが自明になる。

### 外部APIの依存注入

`holidayService` と `imageService` は `fetch`, `localStorage`, `Canvas` のインターフェースをパラメータで受け取る。デフォルトは実際のブラウザAPI。テスト時は軽量モックを注入。

### Container/Presentational分離

`CalendarGrid` と `CalendarPage` はpropsのみに依存する純粋なプレゼンテーショナルコンポーネント。コンテナコンポーネントがストアアクセスとデータ計算を担う。プレゼンテーショナルコンポーネントはpropsだけでテスト可能。

---

## 9. 定数

```typescript
// A4寸法
const A4 = {
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
  PORTRAIT_RATIO: 210 / 297, // ≈ 0.707
  LANDSCAPE_RATIO: 297 / 210, // ≈ 1.414
};

// デフォルト値
const DEFAULTS = {
  START_MONTH: "2026-04",
  END_MONTH: "2027-03",
  ORIENTATION: "portrait",
  WEEK_START: "sunday",
  WEEKDAY_FORMAT: "en-short",
  MONTH_LABEL_FORMAT: "yyyy.mm",
  HOLIDAY_MARK_STYLE: "dot",
  THEME_ID: "classic",
  FONT_ID: "montserrat",
  FONT_WEIGHT: 400,
  IMAGE_RATIO: "50:50",
  PAGE_LAYOUT: "1-month",
};

// 画像制約
const IMAGE = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DIMENSION: 2400, // px
  JPEG_QUALITY: 0.85,
  ACCEPTED_TYPES: ["image/jpeg", "image/png"],
};

// キャッシュTTL
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7日間
```
