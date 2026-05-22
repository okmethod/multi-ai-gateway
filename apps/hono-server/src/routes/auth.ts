import { Hono } from "hono";
import type { Env } from "@/types/env";
import { timingSafeEqual } from "@/utils/crypto";

const auth = new Hono<{ Bindings: Env }>();

auth.get("/", async (c) => {
  const secret = c.req.query("secret") ?? "";
  const authorized = await timingSafeEqual(secret, c.env.APP_SECRET);
  return c.json({ authorized });
});

export default auth;
