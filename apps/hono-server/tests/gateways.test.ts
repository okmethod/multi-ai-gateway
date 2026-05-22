import { describe, it, expect, vi, afterEach } from "vitest";
import { streamStub } from "@/services/gateway/stub";
import { getGateway } from "@/services/gateway/protocol";
import type { ChatRequest } from "@/schemas/chat";
import type { Env } from "@/types/env";

const mockRequest: ChatRequest = {
  app_id: "default",
  message: "hello",
  history: [],
  provider: "stub",
};

const mockEnv: Env = {
  APP_SECRET: "test-secret",
  AI_GATEWAY_BASE_URL: "http://gateway.test",
  AI_GATEWAY_TOKEN: "test-token",
  GEMINI_MODEL: "gemini-test",
  CLAUDE_MODEL: "claude-test",
  GROQ_MODEL: "groq-test",
  ALLOWED_ORIGINS: "http://localhost:5173",
};

describe("getGateway", () => {
  it.each(["stub", "gemini", "claude", "groq"] as const)('"%s" に対応するゲートウェイを返す', (provider) => {
    const fn = getGateway(provider);
    expect(typeof fn).toBe("function");
  });
});

describe("streamStub", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("11 チャンクを yield する", async () => {
    vi.useFakeTimers();
    const gen = streamStub(mockRequest, mockEnv, "test prompt");
    const chunks: string[] = [];

    const collect = async () => {
      for await (const chunk of gen) {
        chunks.push(chunk);
      }
    };

    const promise = collect();
    // 各チャンク間の 100ms を進める
    for (let i = 0; i < 11; i++) {
      await vi.runAllTimersAsync();
    }
    await promise;
    expect(chunks).toHaveLength(11);
  });

  it('各チャンクが SSE 形式 "data: {...}\\n\\n" である', async () => {
    vi.useFakeTimers();
    const gen = streamStub(mockRequest, mockEnv, "test prompt");
    const collect = async () => {
      const results: string[] = [];
      for await (const chunk of gen) {
        results.push(chunk);
      }
      return results;
    };
    const promise = collect();
    for (let i = 0; i < 11; i++) {
      await vi.runAllTimersAsync();
    }
    const chunks = await promise;
    for (const chunk of chunks) {
      expect(chunk).toMatch(/^data: \{.*\}\n\n$/);
      const data = JSON.parse(chunk.replace(/^data: /, "").trim()) as {
        stub: boolean;
        text: string;
      };
      expect(data.stub).toBe(true);
      expect(typeof data.text).toBe("string");
    }
  });
});
