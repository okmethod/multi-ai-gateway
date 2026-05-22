import { Hono } from "hono";
import type { Env } from "@/types/env";

const health = new Hono<{ Bindings: Env }>();

health.get("/", (c) => {
  return c.json({ message: "alive", app_version: "1.0.0" });
});

export default health;
