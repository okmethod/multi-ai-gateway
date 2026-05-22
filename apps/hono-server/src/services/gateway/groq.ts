import type { Env } from "@/types/env";
import type { ChatRequest } from "@/schemas/chat";
import { fetchAndStream } from "@/utils/sse";

type GroqContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

/** テキスト + 任意の画像からコンテンツパーツを構築する */
function buildContent(text: string, imageUrl?: string): string | GroqContentPart[] {
  if (!imageUrl) return text;
  return [
    { type: "image_url", image_url: { url: imageUrl } },
    { type: "text", text },
  ];
}

/** Groq (OpenAI 互換) へのリクエストボディを構築する */
function buildGroqBody(request: ChatRequest, env: Env, systemPrompt: string) {
  // Groq の role は "system" | "user" | "assistant"。history の "model" を "assistant" に変換する
  const historyMessages = request.history.map((msg) => ({
    role: msg.role === "model" ? ("assistant" as const) : ("user" as const),
    content: buildContent(msg.content, msg.image_url),
  }));

  return {
    model: env.GROQ_MODEL,
    stream: true,
    messages: [
      // systemPrompt は先頭に role: "system" として追加
      { role: "system" as const, content: systemPrompt },
      ...historyMessages,
      { role: "user" as const, content: buildContent(request.message, request.image_url) },
    ],
  };
}

/** AI Gateway 経由で Groq にリクエストし、SSE をストリームする */
export async function* streamGroq(
  request: ChatRequest,
  env: Env,
  systemPrompt: string,
): AsyncGenerator<string, void, unknown> {
  const url = `${env.AI_GATEWAY_BASE_URL}/groq/openai/v1/chat/completions`;

  yield* fetchAndStream(url, env.AI_GATEWAY_TOKEN, buildGroqBody(request, env, systemPrompt));
}
