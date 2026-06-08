import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema/users";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const auth = new Hono();

//register

auth.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

auth.post("/register", async (c) => {
  const { username, email, password } = await c.req.json();

  // cek email sudah dipakai
  const existingEmail = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (existingEmail) {
    return c.json({ message: "Email sudah dipakai" }, 400);
  }

  // cek username juga (optional tapi bagus)
  const existingUsername = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.username, username),
  });

  if (existingUsername) {
    return c.json({ message: "Username sudah dipakai" }, 400);
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    username,
    email,
    password: hashed,
    role: "user",
  });

  return c.json({ message: "Register sukses" });
});

//login email
auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (!user) {
    return c.json({ message: "User tidak ditemukan" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return c.json({ message: "Password salah" }, 401);
  }

  const token = await generateToken({
  id: user.id,
  email: user.email,
  role: user.role,
  exp: Math.floor(Date.now() / 1000) + 60 * 60,
});

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

export default auth;