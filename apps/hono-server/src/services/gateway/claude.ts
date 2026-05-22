import type { Env } from "@/types/env";
import type { ChatRequest } from "@/schemas/chat";
import { fetchAndStream } from "@/utils/sse";
import { parseDataUrl } from "@/utils/image";

type ClaudeContentPart =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "url"; url: string } }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

/** テキスト + 任意の画像からコンテンツパーツを構築する */
function buildContent(text: string, imageUrl?: string): string | ClaudeContentPart[] {
  if (!imageUrl) return text;
  const parsed = parseDataUrl(imageUrl);
  const imagePart: ClaudeContentPart = parsed
    ? { type: "image", source: { type: "base64", media_type: parsed.mimeType, data: parsed.data } }
    : { type: "image", source: { type: "url", url: imageUrl } };
  return [imagePart, { type: "text", text }];
}

/** Claude (Anthropic) へのリクエストボディを構築する */
function buildClaudeBody(request: ChatRequest, env: Env, systemPrompt: string) {
  // Claude の role は "user" | "assistant"。history の "model" を "assistant" に変換する
  const historyMessages = request.history.map((msg) => ({
    role: msg.role === "model" ? ("assistant" as const) : ("user" as const),
    content: buildContent(msg.content, msg.image_url),
  }));

  return {
    model: env.CLAUDE_MODEL,
    max_tokens: 4096,
    stream: true,
    system: systemPrompt,
    messages: [
      ...historyMessages,
      { role: "user" as const, content: buildContent(request.message, request.image_url) },
    ],
  };
}

/** AI Gateway 経由で Claude にリクエストし、SSE をストリームする */
export async function* streamClaude(
  request: ChatRequest,
  env: Env,
  systemPrompt: string,
): AsyncGenerator<string, void, unknown> {
  const url = `${env.AI_GATEWAY_BASE_URL}/anthropic/v1/messages`;

  yield* fetchAndStream(url, env.AI_GATEWAY_TOKEN, buildClaudeBody(request, env, systemPrompt), {
    "anthropic-version": "2023-06-01",
  });
}
