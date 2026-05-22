import type { Env } from "@/types/env";
import type { ChatRequest } from "@/schemas/chat";

// テスト用固定チャンク一覧
const STUB_CHUNKS = [
  "私は",
  "ダミーの",
  "LLM",
  "です。",
  "実際の",
  "推論は",
  "せず、",
  "固定の",
  "メッセージを",
  "回答して",
  "います。",
];

/** AI Gateway を呼ばず固定メッセージを 100ms 間隔でストリームするスタブ実装 */
export async function* streamStub(
  _request: ChatRequest,
  _env: Env,
  _systemPrompt: string,
): AsyncGenerator<string, void, unknown> {
  for (const text of STUB_CHUNKS) {
    await new Promise((r) => setTimeout(r, 100));
    yield `data: ${JSON.stringify({ stub: true, text })}\n\n`;
  }
}
