# Ethereal Calendar

印刷用の壁掛けカレンダーHTMLを生成するクライアントサイドWebアプリケーション。

テーマ、フォント、画像、日本の祝日を設定し、PDF/HTML/ZIPとして出力。コンビニ印刷にも対応。

## 機能一覧

### カレンダー設定

- **任意の期間指定**: 1〜24ヶ月、開始月・終了月を自由に設定
- **用紙の向き**: 縦 / 横（A4固定）
- **週の開始曜日**: 日曜 / 月曜
- **曜日・月の表記**: 日本語 / 英語短縮 / 英語完全

### 祝日

- **自動取得**: [holidays-jp API](https://holidays-jp.github.io/) から取得（7日間キャッシュ + ハードコードフォールバック）
- **祝日マーク**: ドット / 丸囲み / 下線 / 色のみ
- **手動編集**: 会社の休日等を追加・削除、API祝日の非表示・復元

### デザイン

- **6種のカラーテーマ**: Classic, Monochrome, Dark, Cream, Forest, Minimal
- **Google Fonts**: Montserrat, Inter, Noto Sans JP, IBM Plex Sans, Lato（ウェイト選択可）
- **文字サイズ・余白カスタマイズ**: 月タイトル、日付、曜日のフォントサイズ、セル余白、ヘッダー間隔をスライダーで調整

### 画像

- **プレビュー上で直接操作**: カレンダーページの画像エリアをクリックまたはドラッグ＆ドロップ
- **画像ON/OFF**: デザイン設定で画像なしカレンダーに切り替え可能
- **比率プリセット**: 60:40 / 50:50 / 70:30

### 出力

- **PDF**: ブラウザの印刷ダイアログから直接PDF保存
- **HTML**: 単一HTMLファイル（画像base64埋め込み + 設定JSON埋め込み）
- **ZIP**: HTML + 画像ファイル

### インポート/エクスポート

- **設定をJSON保存/読込**: カレンダー設定をファイルで保存・復元
- **HTMLから読込**: エクスポートしたHTMLファイルから設定を復元して編集を再開

### UI

- **リアルタイムプレビュー**: A4比率の連続スクロール表示 + 月ジャンプナビゲーション
- **レスポンシブ対応**: PC（2カラム）/ スマホ（ボトムシート設定）
- **日本語UI**: 全インターフェースが日本語
- **印刷ガイド**: ヘルプモーダルにブラウザPDF化 + コンビニ印刷の手順

## 技術スタック

| カテゴリ         | 技術                                               |
| ---------------- | -------------------------------------------------- |
| フレームワーク   | React 19 + TypeScript                              |
| ビルドツール     | [Vite+](https://viteplus.dev/) (Vite 8 + Rolldown) |
| スタイリング     | Tailwind CSS v4                                    |
| UIコンポーネント | shadcn/ui (base-ui)                                |
| 状態管理         | Zustand                                            |
| デザインシステム | Ethereal Glass                                     |
| Lint / Format    | Oxlint + Oxfmt (Vite+内蔵)                         |
| 型チェック       | tsgo (Vite+内蔵)                                   |
| テスト           | Vitest + @testing-library/react + Playwright       |
| ZIP生成          | JSZip                                              |

## 前提条件

- [Vite+](https://viteplus.dev/) CLIがグローバルインストール済みであること

```bash
# macOS/Linux
curl -fsSL https://vite.plus | bash

# Windows (PowerShell)
irm https://vite.plus/ps1 | iex
```

## 開発の始め方

```bash
# 依存関係のインストール
vp install

# 開発サーバーの起動
vp dev

# コードチェック（フォーマット + lint + 型チェック）
vp check

# テスト実行
vp test

# プロダクションビルド
vp build
```

## プロジェクト構成

```
src/
├── components/
│   ├── ui/                 # shadcn/ui プリミティブ
│   ├── sidebar/            # 設定パネル（アコーディオン、複数同時展開可）
│   ├── preview/            # カレンダープレビュー（A4ページ、画像D&D）
│   ├── download/           # 出力ボタン（PDF/HTML/ZIPドロップダウン）
│   └── layout/             # ヘッダー、ヘルプモーダル、ボトムシート
├── stores/
│   ├── calendarStore.ts    # Zustandストア（同期setterのみ）
│   └── types.ts            # 全型定義
├── lib/
│   ├── dateUtils.ts        # 純粋関数: 月範囲生成、グリッド計算
│   ├── holidayUtils.ts     # 純粋関数: 祝日マージ
│   ├── holidayService.ts   # DI対応: API取得 + キャッシュ
│   ├── themeUtils.ts       # 純粋関数: テーマ解決
│   ├── layoutUtils.ts      # 純粋関数: 画像/グリッド比率
│   ├── imageService.ts     # DI対応: 画像リサイズ + base64変換
│   ├── htmlGenerator.ts    # 純粋関数: PageData[] → HTML（設定JSON埋め込み対応）
│   ├── htmlImporter.ts     # HTMLからの設定復元
│   ├── zipGenerator.ts     # 純粋関数: PageData[] → ZIP
│   ├── settingsExport.ts   # 設定のJSON化 / JSON復元
│   ├── themes.ts           # 6テーマ定義
│   ├── fonts.ts            # 5フォントプリセット
│   └── constants.ts        # A4寸法、デフォルト値
└── hooks/
    ├── useFontLoader.ts    # Google Fonts動的ロード
    ├── useHolidays.ts      # 祝日API取得 → ストア書き込み
    └── useImageUpload.ts   # 画像リサイズ → ストア書き込み
```

## アーキテクチャ

- **完全クライアントサイド**: バックエンド・DB不要。画像・設定データはブラウザ外に送信しない
- **テスト容易性重視**: 純粋関数によるロジック分離、外部APIの依存注入、Container/Presentational分離
- **印刷対応出力**: `@page` CSS、`print-color-adjust: exact`、プレビューと一致するインラインスタイル
- **レスポンシブ**: PC（サイドバー + プレビュー）/ スマホ（ボトムシート + FAB）

## テスト

```bash
# ユニットテスト（104テスト）
vp test

# ウォッチモード
vp test --watch

# カバレッジレポート
vp test --coverage

# E2Eテスト（13テスト）
npx playwright test
```

## ドキュメント

| ファイル                | 内容                                 |
| ----------------------- | ------------------------------------ |
| `docs/requirements.md`  | 90項目の要件チェックリスト           |
| `docs/design.md`        | アーキテクチャ、型定義、データフロー |
| `docs/design-system.md` | Ethereal Glass デザインシステム      |

## デプロイ

静的ホスティングのみで運用可能。`dist/` フォルダを以下のいずれかにデプロイ:

- GitHub Pages
- Cloudflare Pages
- Vercel
- Netlify

```bash
vp build
```

## ライセンス

MIT
