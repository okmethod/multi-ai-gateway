// 全アプリ共通のシステムプロンプト
const COMMON_PROMPT = "回答は日本語で行ってください。";

// アプリごとに共通のシステムプロンプト
// ゲーム固有のプロンプトは各ユースケース側で定義し、
// リクエストの system_prompt フィールドで渡す。
const APP_PROMPTS: Record<string, string> = {};

/**
 * 共通プロンプトとアプリ固有プロンプトを結合して最終的なシステムプロンプトを生成する
 *
 * @param appId - app_id（appPrompt の fallback 解決に使用）
 * @param appPrompt - クライアントから渡されるアプリ固有プロンプト
 */
export function buildSystemPrompt(appId: string, appPrompt?: string): string {
  return [COMMON_PROMPT, APP_PROMPTS[appId], appPrompt].filter(Boolean).join("\n\n");
}
