/** fetch してレスポンスを検証し、SSE 行を yield する。全ゲートウェイ共通のフェッチ処理を集約する */
export async function* fetchAndStream(
  url: string,
  token: string,
  body: unknown,
  extraHeaders?: Record<string, string>,
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-aig-authorization": `Bearer ${token}`,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI Gateway error: HTTP ${response.status} - ${text}`);
  }
  yield* readSSELines(response);
}

/**
 * Response ボディを行単位で読み、非空行を SSE イベント文字列 ("data: ...\n\n") として yield する。
 * Cloudflare Workers との相性のため、Hono の `stream()` ヘルパーを使わず、
 * `ReadableStream` を `new Response()` に直渡しする。
 */
export async function* readSSELines(response: Response): AsyncGenerator<string, void, unknown> {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) {
          yield `${line}\n\n`;
        }
      }
    }
    if (buffer.trim()) {
      yield `${buffer}\n\n`;
    }
  } finally {
    reader.releaseLock();
  }
}
