# Ethereal Calendar

印刷用カレンダーHTMLを生成するクライアントサイドSPA。

## ドキュメント

- `docs/requirements.md` — 90項目の要件チェックリスト（機能・非機能・設計要件）
- `docs/design.md` — アーキテクチャ、型定義、データフロー、コンポーネント階層
- `docs/design-system.md` — Ethereal Glass デザインシステム（カラー、タイポグラフィ、コンポーネント、アクセシビリティ、レスポンシブ戦略）

## 開発コマンド

- `vp dev` — 開発サーバー
- `vp check --fix` — フォーマット + lint + 型チェック
- `vp test --run` — ユニットテスト（104テスト）
- `npx playwright test` — E2Eテスト（13テスト、事前に `vp dev` が必要）

## コミットルール

- 変更ごとに分けてコミットする（まとめない）
- 各コミット前に `vp check --fix` と `vp test --run` を通す
