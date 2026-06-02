import { Hono } from "hono";
import { db } from "../db";
import { promos } from "../db/schema/promos";
import { eq } from "drizzle-orm";
import { adminOnly } from "../middleware/role";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();


// =========================
// CREATE PROMO
// =========================
app.post("/",authMiddleware,adminOnly, async (c) => {
  const body = await c.req.json();

  const promo = await db
    .insert(promos)
    .values({
      code: body.code,
      type: body.type,
      value: body.value,
      maxUsage: body.maxUsage,
      expiresAt: body.expiresAt,
      isActive: true,
    })
    .returning();

  return c.json(promo[0]);
});


// =========================
// GET ALL PROMOS
// =========================
app.get("/", async (c) => {
  const data = await db
    .select()
    .from(promos);

  return c.json(data);
});


// =========================
// GET PROMO BY ID
// =========================
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const data = await db
    .select()
    .from(promos)
    .where(eq(promos.id, id));

  if (!data[0]) {
    return c.json(
      { message: "Promo tidak ditemukan" },
      404
    );
  }

  return c.json(data[0]);
});


// =========================
// VALIDATE PROMO CODE
// =========================
app.post("/validate", async (c) => {
  const { code } = await c.req.json();

  const promo = await db.query.promos.findFirst({
    where: (p, { eq }) => eq(p.code, code),
  });

  if (!promo) {
    return c.json(
      { message: "Promo tidak ditemukan" },
      404
    );
  }

  if (!promo.isActive) {
    return c.json(
      { message: "Promo tidak aktif" },
      400
    );
  }

  if (
    promo.expiresAt &&
    new Date(promo.expiresAt) < new Date()
  ) {
    return c.json(
      { message: "Promo sudah kadaluarsa" },
      400
    );
  }

  if (promo.usedCount >= promo.maxUsage) {
    return c.json(
      { message: "Promo sudah habis" },
      400
    );
  }

  return c.json({
    valid: true,
    promo,
  });
});


// =========================
// UPDATE PROMO
// =========================
app.put("/:id",authMiddleware,adminOnly, async (c) => {
  const id = Number(c.req.param("id"));

  const body = await c.req.json();

  const updated = await db
    .update(promos)
    .set({
      code: body.code,
      type: body.type,
      value: body.value,
      maxUsage: body.maxUsage,
      expiresAt: body.expiresAt,
      isActive: body.isActive,
    })
    .where(eq(promos.id, id))
    .returning();

  if (!updated[0]) {
    return c.json(
      { message: "Promo tidak ditemukan" },
      404
    );
  }

  return c.json(updated[0]);
});


// =========================
// TOGGLE ACTIVE
// =========================
app.patch("/:id/toggle",authMiddleware,adminOnly, async (c) => {
  const id = Number(c.req.param("id"));

  const promo = await db
    .select()
    .from(promos)
    .where(eq(promos.id, id));

  if (!promo[0]) {
    return c.json(
      { message: "Promo tidak ditemukan" },
      404
    );
  }

  const updated = await db
    .update(promos)
    .set({
      isActive: !promo[0].isActive,
    })
    .where(eq(promos.id, id))
    .returning();

  return c.json(updated[0]);
});


// =========================
// DELETE PROMO
// =========================
app.delete("/:id",authMiddleware,adminOnly, async (c) => {
  const id = Number(c.req.param("id"));

  await db
    .delete(promos)
    .where(eq(promos.id, id));

  return c.json({
    message: "Promo deleted",
  });
});

export default app;