import type { Context, Next } from "hono";

export const adminOnly = async (
  c: Context,
  next: Next
) => {
  const user = c.get("user");

  if (!user) {
    return c.json(
      { message: "Unauthorized" },
      401
    );
  }

  if (user.role !== "admin") {
    return c.json(
      { message: "LU BUKAN ADMIN, GABOLEH YA MANIEZZ" },
      403
    );
  }

  await next();
};