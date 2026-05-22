import { z } from "zod";

export const llmProviderSchema = z.enum(["stub", "gemini", "claude", "groq"]);
export type LLMProvider = z.infer<typeof llmProviderSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string(),
  image_url: z.string().optional(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  app_id: z.string(),
  system_prompt: z.string().optional(),
  message: z.string(),
  image_url: z.string().optional(),
  history: z.array(chatMessageSchema).default([]),
  provider: llmProviderSchema.default("stub"),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;
