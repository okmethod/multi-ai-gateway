import type { Env } from "@/types/env";
import type { ChatRequest, LLMProvider } from "@/schemas/chat";
import { streamStub } from "./stub";
import { streamGemini } from "./gemini";
import { streamClaude } from "./claude";
import { streamGroq } from "./groq";

/** 全ゲートウェイ関数が実装すべき共通インターフェース */
export type GatewayStreamFn = (
  request: ChatRequest,
  env: Env,
  systemPrompt: string,
) => AsyncGenerator<string, void, unknown>;

/** プロバイダー名からゲートウェイ関数を返す。switch の網羅性は TypeScript が保証する */
export function getGateway(provider: LLMProvider): GatewayStreamFn {
  switch (provider) {
    case "stub":
      return streamStub;
    case "gemini":
      return streamGemini;
    case "claude":
      return streamClaude;
    case "groq":
      return streamGroq;
  }
}
