import { describe, it, expect } from "vitest";
import app from "@/index";
import type { Env } from "@/types/env";

const mockEnv: Env = {
  APP_SECRET: "correct-secret",
  AI_GATEWAY_BASE_URL: "http://gateway.test",
  AI_GATEWAY_TOKEN: "test-token",
  GEMINI_MODEL: "gemini-test",
  CLAUDE_MODEL: "claude-test",
  GROQ_MODEL: "groq-test",
  ALLOWED_ORIGINS: "http://localhost:5173",
};

describe("GET /api/auth", () => {
  it("正しい secret で authorized: true を返す", async () => {
    const res = await app.request("/api/auth?secret=correct-secret", {}, mockEnv);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { authorized: boolean };
    expect(body.authorized).toBe(true);
  });

  it("誤った secret で authorized: false を返す", async () => {
    const res = await app.request("/api/auth?secret=wrong-secret", {}, mockEnv);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { authorized: boolean };
    expect(body.authorized).toBe(false);
  });

  it("secret なしで authorized: false を返す", async () => {
    const res = await app.request("/api/auth", {}, mockEnv);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { authorized: boolean };
    expect(body.authorized).toBe(false);
  });
});
