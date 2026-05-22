import { describe, it, expect } from "vitest";
import app from "@/index";
import type { Env } from "@/types/env";

const mockEnv: Env = {
  APP_SECRET: "test-secret",
  AI_GATEWAY_BASE_URL: "http://gateway.test",
  AI_GATEWAY_TOKEN: "test-token",
  GEMINI_MODEL: "gemini-test",
  CLAUDE_MODEL: "claude-test",
  GROQ_MODEL: "groq-test",
  ALLOWED_ORIGINS: "http://localhost:5173",
};

const validBody = { app_id: "default", message: "hello", provider: "stub" };

describe("POST /api/chat", () => {
  it("X-App-Secret なしで 403 を返す", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      },
      mockEnv,
    );
    expect(res.status).toBe(403);
  });

  it("不正な X-App-Secret で 403 を返す", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-App-Secret": "wrong" },
        body: JSON.stringify(validBody),
      },
      mockEnv,
    );
    expect(res.status).toBe(403);
  });

  it("正しい認証で text/event-stream を返す", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-App-Secret": "test-secret" },
        body: JSON.stringify(validBody),
      },
      mockEnv,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
  });

  it("不正なリクエストボディで 422 を返す", async () => {
    const res = await app.request(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-App-Secret": "test-secret" },
        body: JSON.stringify({ invalid: true }),
      },
      mockEnv,
    );
    expect(res.status).toBe(422);
  });
});
