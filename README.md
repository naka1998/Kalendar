# Kalendar

印刷用の壁掛けカレンダーHTMLを生成するクライアントサイドWebアプリケーション。

テーマ、フォント、画像、日本の祝日を設定し、単一HTMLファイルとしてダウンロード。ブラウザの印刷機能でPDF化・印刷できます。

## 機能一覧

- **任意の期間指定**: 1〜24ヶ月、開始月・終了月を自由に設定
- **用紙の向き**: 縦 / 横（A4固定）
- **日本の祝日**: [holidays-jp API](https://holidays-jp.github.io/) から自動取得（キャッシュ + フォールバック対応）
- **祝日記号スタイル**: ドット / 丸囲み / 下線 / 色のみ
- **手動祝日**: 会社の休日等を追加・削除可能
- **6種のカラーテーマ**: Classic, Monochrome, Dark, Cream, Forest, Minimal
- **Google Fonts対応**: Montserrat, Inter, Noto Sans JP, IBM Plex Sans, Lato（ウェイト選択可）
- **画像サポート**: 月ごとにJPEG/PNGをアップロード（自動リサイズ）
- **リアルタイムプレビュー**: A4比率の連続スクロール表示
- **ダウンロード**: 単一HTMLファイル（base64埋め込み）またはZIP（画像別ファイル）

## 技術スタック

| カテゴリ         | 技術                                               |
| ---------------- | -------------------------------------------------- |
| フレームワーク   | React 19 + TypeScript                              |
| ビルドツール     | [Vite+](https://viteplus.dev/) (Vite 8 + Rolldown) |
| スタイリング     | Tailwind CSS v4                                    |
| UIコンポーネント | shadcn/ui                                          |
| 状態管理         | Zustand                                            |
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
│   ├── sidebar/            # 設定パネル（アコーディオン形式）
│   ├── preview/            # カレンダープレビュー（A4ページ、スクロール）
│   ├── download/           # ダウンロードボタン + モード選択
│   └── layout/             # ヘッダー、フッター
├── stores/
│   ├── calendarStore.ts    # Zustandストア（同期setterのみ）
│   └── types.ts            # 型定義
├── lib/
│   ├── dateUtils.ts        # 純粋関数: 月範囲生成、グリッド計算
│   ├── holidayUtils.ts     # 純粋関数: 祝日マージ
│   ├── holidayService.ts   # DI対応: API取得 + キャッシュ
│   ├── themeUtils.ts       # 純粋関数: テーマ解決
│   ├── layoutUtils.ts      # 純粋関数: 画像/グリッド比率
│   ├── imageService.ts     # DI対応: 画像リサイズ + base64変換
│   ├── htmlGenerator.ts    # 純粋関数: PageData[] → HTML
│   ├── zipGenerator.ts     # 純粋関数: PageData[] → ZIP
│   ├── themes.ts           # テーマ定義
│   ├── fonts.ts            # フォントプリセット
│   └── constants.ts        # A4寸法、デフォルト値
└── hooks/
    ├── useCalendarMonths.ts
    ├── useHolidays.ts      # 副作用: fetch → ストア書き込み
    └── useImageUpload.ts   # 副作用: リサイズ → ストア書き込み
```

## アーキテクチャ

- **完全クライアントサイド**: バックエンド・DB不要
- **プライバシー**: 画像・設定データはブラウザ外に送信しない（祝日API取得を除く）
- **テスト容易性重視の設計**: 純粋関数によるロジック分離、外部APIの依存注入、Container/Presentational分離
- **印刷対応出力**: `@page` CSS、`print-color-adjust: exact`、プレビューと一致するインラインスタイル

## テスト

```bash
# ユニットテスト（lib/, stores/, hooks/）
vp test

# ウォッチモード
vp test --watch

# カバレッジレポート
vp test --coverage

# E2Eテスト
npx playwright test
```

カバレッジ目標:

- `lib/`（ユーティリティ）: 90%以上
- `stores/`: 85%以上
- `hooks/`: 80%以上
- `components/`: 70%以上

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
