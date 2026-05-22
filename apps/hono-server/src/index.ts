import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "@/types/env";
import health from "@/routes/health";
import auth from "@/routes/auth";
import chat from "@/routes/chat";

const app = new Hono<{ Bindings: Env }>();

// ALLOWED_ORIGINS は環境変数からカンマ区切りで取得するため、リクエストごとにミドルウェアを生成する
app.use("*", async (c, next) => {
  const origins = c.env.ALLOWED_ORIGINS ? c.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) : [];
  return cors({
    origin: origins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Accept", "Cache-Control", "Origin", "X-App-Secret"],
    exposeHeaders: ["Content-Disposition"],
    credentials: false,
  })(c, next);
});

app.route("/api/health", health);
app.route("/api/auth", auth);
app.route("/api/chat", chat);

export default app;
