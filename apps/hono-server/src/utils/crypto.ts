/**
 * HMAC-SHA256 を使ったタイミング攻撃耐性のある文字列比較。
 * 固定長のHMAC出力をXOR蓄積で比較するため、入力の内容が処理時間に漏れない。
 */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = crypto.getRandomValues(new Uint8Array(32));
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const [aSig, bSig] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);
  const aBytes = new Uint8Array(aSig);
  const bBytes = new Uint8Array(bSig);
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}
