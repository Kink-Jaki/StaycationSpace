import type { Context, Next } from "hono";
import { verify } from "hono/jwt";

export const authMiddleware = async (c: Context, next: Next) => {
  const header = c.req.header("Authorization");

  if (!header) {
    return c.json({ message: "No token" }, 401);
  }

  const token = header.split(" ")[1];

  if (!token) {
    return c.json({ message: "Invalid token format" }, 401);
  }

  try {
    const payload = await verify(
      token,
      process.env.JWT_SECRET!,
      "HS256"
    ) as { id: number; email: string; role: string };

    // simpan payload JWT ke context
    c.set("user", payload);

    await next();
  } catch (err) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
};