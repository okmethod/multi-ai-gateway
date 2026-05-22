/** `data:<mime>;base64,<data>` 形式のデータURLを分解する。非データURLは null を返す */
export function parseDataUrl(url: string): { mimeType: string; data: string } | null {
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !match[1] || !match[2]) return null;
  return { mimeType: match[1], data: match[2] };
}
