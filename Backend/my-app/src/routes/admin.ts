import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { adminOnly } from "../middleware/role";

const admin = new Hono();

// semua route di sini otomatis butuh login + admin
admin.use("*", authMiddleware, adminOnly);

// contoh route admin
admin.get("/dashboard", (c) => {
  return c.json({
    message: "Welcome admin dashboard",
  });
});

// contoh manage user
admin.get("/users", (c) => {
  return c.json({
    message: "List users (admin only area)",
  });
});

export default admin;