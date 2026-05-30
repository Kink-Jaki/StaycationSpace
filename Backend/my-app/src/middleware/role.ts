import type { Context, Next } from "hono";

export const adminOnly = async (c : Context, next : Next) => {
  const user = c.get("user");

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403);
  }

  await next();
};