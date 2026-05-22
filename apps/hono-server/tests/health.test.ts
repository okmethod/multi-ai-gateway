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

describe("GET /api/health", () => {
  it("200 を返す", async () => {
    const res = await app.request("/api/health", {}, mockEnv);
    expect(res.status).toBe(200);
  });

  it('message: "alive" を含む JSON を返す', async () => {
    const res = await app.request("/api/health", {}, mockEnv);
    const body = (await res.json()) as { message: string; app_version: string };
    expect(body.message).toBe("alive");
    expect(body.app_version).toBeDefined();
  });
});
