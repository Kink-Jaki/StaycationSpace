import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();
declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: number;
      email: string;
      role: string;
    };
  }
}
app.use("*", authMiddleware);

// =========================
// GET PROFILE
// =========================
app.get("/", async (c) => {
  const user = c.get("user");

  const profile = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, user.id),
  });

  return c.json(profile);
});

// =========================
// UPDATE PROFILE
// =========================
app.patch("/", async (c) => {
  const user = c.get("user");

  const body = await c.req.json();

  const updated = await db
    .update(users)
    .set({
      username: body.username,
      email: body.email,
      phone: body.phone,
      updatedAt: new Date(),
      address: body.address,
    })
    .where(eq(users.id, user.id))
    .returning();

  return c.json({
    message: "Profile updated",
    data: updated[0],
  });
});

export default app;