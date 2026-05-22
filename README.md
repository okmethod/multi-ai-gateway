# multi-ai-gateway

> 複数 LLM プロバイダーへの統一ゲートウェイプロキシ

## プロジェクト概要

Gemini (Google)・Claude (Anthropic)・Groq への統一インターフェースを提供する Hono サーバー。
Cloudflare AI Gateway 経由で SSE ストリーミングに対応する。

---

## ディレクトリ構成

```
multi-ai-gateway/
├── apps/
│   └── hono-server/   # バックエンド (Hono + Cloudflare Workers)
└── docs/              # ドキュメント
```

---

## ローカル起動

```bash
docker compose up
```

---

## デプロイ

**バックエンド**（Cloudflare Workers）:

```bash
cd apps/hono-server
npm run deploy
```

シークレットの設定:

```bash
cd apps/hono-server
npm run put-secrets
```

---

**メンテナー**: @okmethod
