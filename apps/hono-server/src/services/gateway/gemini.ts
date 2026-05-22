import type { Env } from "@/types/env";
import type { ChatRequest } from "@/schemas/chat";
import { fetchAndStream } from "@/utils/sse";
import { parseDataUrl } from "@/utils/image";

type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };

/** HTTPS URL を fetch して inline_data パーツに変換する（Cloudflare Workers 上で実行） */
async function fetchUrlAsInlinePart(imageUrl: string): Promise<GeminiPart | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const mimeType = res.headers.get("content-type") ?? "image/jpeg";
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    return { inline_data: { mime_type: mimeType, data: btoa(binary) } };
  } catch {
    return null;
  }
}

/** テキスト + 任意の画像パーツから Gemini パーツ配列を構築する */
function buildParts(text: string, imagePart?: GeminiPart): GeminiPart[] {
  return imagePart ? [imagePart, { text }] : [{ text }];
}

/** imageUrl を GeminiPart に解決する（data URL はパース、HTTPS URL はサーバー fetch） */
async function resolveImagePart(imageUrl?: string): Promise<GeminiPart | undefined> {
  if (!imageUrl) return undefined;
  const parsed = parseDataUrl(imageUrl);
  if (parsed) return { inline_data: { mime_type: parsed.mimeType, data: parsed.data } };
  return (await fetchUrlAsInlinePart(imageUrl)) ?? undefined;
}

/** data URL のみを同期で GeminiPart に変換する（履歴メッセージ用） */
function parseDataUrlAsPart(imageUrl?: string): GeminiPart | undefined {
  if (!imageUrl) return undefined;
  const parsed = parseDataUrl(imageUrl);
  return parsed ? { inline_data: { mime_type: parsed.mimeType, data: parsed.data } } : undefined;
}

/** Gemini (Google AI Studio) へのリクエストボディを構築する */
function buildGeminiBody(request: ChatRequest, systemPrompt: string, currentImagePart?: GeminiPart) {
  const historyContents = request.history.map((msg) => ({
    role: msg.role,
    // 履歴の image_url は data URL のみ対応（HTTPS fetch は初回メッセージのみ）
    parts: buildParts(msg.content, parseDataUrlAsPart(msg.image_url)),
  }));

  return {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [...historyContents, { role: "user", parts: buildParts(request.message, currentImagePart) }],
  };
}

/** AI Gateway 経由で Gemini にリクエストし、SSE をストリームする */
export async function* streamGemini(
  request: ChatRequest,
  env: Env,
  systemPrompt: string,
): AsyncGenerator<string, void, unknown> {
  const url = `${env.AI_GATEWAY_BASE_URL}/google-ai-studio/v1beta/models/${env.GEMINI_MODEL}:streamGenerateContent?alt=sse`;

  // 現在のメッセージに画像がある場合、サーバー側で fetch して inline_data に変換する
  const currentImagePart = await resolveImagePart(request.image_url);

  yield* fetchAndStream(url, env.AI_GATEWAY_TOKEN, buildGeminiBody(request, systemPrompt, currentImagePart));
}
