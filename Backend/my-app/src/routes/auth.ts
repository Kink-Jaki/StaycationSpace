import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema/user";
import { eq } from "drizzle-orm";
import { generateToken } from "../utils/jwt";

const auth = new Hono();

auth.post("/login", async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.username, username),
  });

  if (!user) {
    return c.json(
      { success: false, message: "User tidak ditemukan" },
      401
    );
  }

  if (user.password !== password) {
    return c.json(
      { success: false, message: "Password salah" },
      401
    );
  }

  const token = await generateToken({
    sub: String(user.id),
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  });

  return c.json({
    success: true,
    token,
  });
});

export default auth;