import { Hono } from "hono";
import type { Env } from "@/types/env";
import { chatRequestSchema } from "@/schemas/chat";
import { buildSystemPrompt } from "@/prompts/systemPrompts";
import { getGateway } from "@/services/gateway/protocol";
import { authMiddleware } from "@/middleware/auth";

const chat = new Hono<{ Bindings: Env }>();

chat.post("/", authMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ detail: "Invalid request body", errors: parsed.error.flatten() }, 422);
  }

  const request = parsed.data;
  const systemPrompt = buildSystemPrompt(request.app_id, request.system_prompt);
  const gateway = getGateway(request.provider);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of gateway(request, c.env, systemPrompt)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Gateway stream error:", message);
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ detail: message })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
});

export default chat;
