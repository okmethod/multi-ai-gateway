export interface Env {
  readonly APP_SECRET: string;
  readonly AI_GATEWAY_BASE_URL: string;
  readonly AI_GATEWAY_TOKEN: string;
  readonly GEMINI_MODEL: string;
  readonly CLAUDE_MODEL: string;
  readonly GROQ_MODEL: string;
  readonly ALLOWED_ORIGINS: string;
}
