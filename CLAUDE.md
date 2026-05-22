# CLAUDE.md

---

## 行動原則

- **回答は日本語で簡潔に行う**
- **コミット前に必ず lint/format を実行する**
- **サブエージェントを積極活用しトークン節約する**:
  - 3ファイル以上の調査・コード検索 → Explore
  - 実装計画の策定 → Plan
  - テスト/Lint/ビルド実行 → Bash (background可)

---

## プロジェクト概要

複数 LLM プロバイダー（Gemini, Claude, Groq）への統一ゲートウェイプロキシ

- **リポジトリ**: https://github.com/okmethod/multi-ai-gateway
- **技術スタック**: TypeScript 6, Node.js 24
- **デプロイ先**: Cloudflare Workers (Wrangler v4)

## ディレクトリ

- `apps/hono-server/`: Hono サーバー（LLM ゲートウェイプロキシ）
