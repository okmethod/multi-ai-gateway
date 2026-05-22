import type { Context, Next } from "hono";
import type { Env } from "@/types/env";
import { timingSafeEqual } from "@/utils/crypto";

/** X-App-Secret ヘッダーを検証する POST /api/chat 用の認証ミドルウェア */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<Response | void> {
  const provided = c.req.header("x-app-secret") ?? "";
  const isValid = await timingSafeEqual(provided, c.env.APP_SECRET);
  if (!isValid) {
    return c.json({ detail: "Forbidden" }, 403);
  }
  await next();
}
