---
description: Hono サーバーの開発規約・パターン
globs: "apps/hono-server/**/*.ts"
---

# Hono サーバー

- **FW**: Hono v4
- **バリデーション**: Zod v4
- **ランタイム**: Cloudflare Workers (Wrangler v4)

## 開発規約

- ルーター・ミドルウェアすべてに `Bindings: Env` を型付けする（`new Hono<{ Bindings: Env }>()`）
- ミドルウェアの戻り値型は `Promise<Response | void>` を明示する
- リクエストバリデーションは Zod の `safeParse` を使い、失敗時は `422` を返す
- スキーマから型を派生させる（`z.infer<typeof schema>`）。手書き型定義と乖離させない
- エラーレスポンスの詳細は `detail` キーで統一する（`c.json({ detail: '...' }, status)`）
- SSE は Hono の `stream()` ヘルパーを使わず `ReadableStream` を `new Response()` に直渡しする（Cloudflare Workers との相性のため）
- ゲートウェイ関数の戻り値は `AsyncGenerator<string, void, unknown>` に統一する
- プロバイダー追加時の `switch` に `default` 節を書かない（TypeScript の網羅性チェックを活かすため）
