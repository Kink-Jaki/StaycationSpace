import { Hono } from "hono";
import { db } from "../db";
import { payments } from "../db/schema/payments";
import { bookings } from "../db/schema/bookings";
import { eq } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";

import { authMiddleware } from "../middleware/auth";
import { adminOnly } from "../middleware/role";

const app = new Hono();


// =========================
// CREATE PAYMENT
// =========================
app.post("/",authMiddleware, async (c) => {
  const body = await c.req.json();

  const { bookingId, amount, method } = body;

  const booking = await db.query.bookings.findFirst({
    where: (b, { eq }) => eq(b.id, bookingId),
  });

  if (!booking) {
    return c.json(
      { message: "Booking tidak ditemukan" },
      404
    );
  }

  const payment = await db
    .insert(payments)
    .values({
      bookingId,
      amount,
      method,
      status: "pending",
    })
    .returning();

  return c.json(payment[0]);
});


// =========================
// UPLOAD PAYMENT PROOF
// =========================
app.post("/:id/upload",authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));

  const body = await c.req.parseBody();
  const file = body["file"];

  if (!(file instanceof File)) {
    return c.json(
      { message: "File tidak ditemukan" },
      400
    );
  }

  await mkdir("./uploads/payments", {
    recursive: true,
  });

  const fileName = `${Date.now()}-${file.name}`;

  const path = `./uploads/payments/${fileName}`;

  const buffer = await file.arrayBuffer();

  await writeFile(path, Buffer.from(buffer));

  const imageUrl = `/uploads/payments/${fileName}`;

  const updated = await db
    .update(payments)
    .set({
      proofUrl: imageUrl,
      status: "uploaded",
    })
    .where(eq(payments.id, id))
    .returning();

  return c.json(updated[0]);
});


// =========================
// GET ALL PAYMENTS
// =========================
app.get("/",authMiddleware, async (c) => {
  const bookingId = Number(c.req.query("bookingId"));

  const data = bookingId
    ? await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
    : await db
      .select()
      .from(payments);

  return c.json(data);
});


// =========================
// GET PAYMENT BY ID
// =========================
app.get("/:id",authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));

  const data = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id));

  if (!data[0]) {
    return c.json(
      { message: "Payment tidak ditemukan" },
      404
    );
  }

  return c.json(data[0]);
});


// =========================
// GET PAYMENT BY STATUS
// =========================
app.get("/status/:status",authMiddleware, async (c) => {
  const status = c.req.param("status");

  const data = await db
    .select()
    .from(payments)
    .where(eq(payments.status, status as any));

  return c.json(data);
});


// =========================
// UPDATE PAYMENT STATUS
// =========================
app.patch("/:id/status",authMiddleware,adminOnly, async (c) => {
  const id = Number(c.req.param("id"));

  const { status } = await c.req.json();

  const allowed = [
    "pending",
    "uploaded",
    "verified",
    "rejected",
  ];

  if (!allowed.includes(status)) {
    return c.json(
      { message: "Status tidak valid" },
      400
    );
  }

  const payment = await db
    .update(payments)
    .set({
      status,
    })
    .where(eq(payments.id, id))
    .returning();

  if (!payment[0]) {
    return c.json(
      { message: "Payment tidak ditemukan" },
      404
    );
  }

  if (status === "verified") {
    await db
      .update(bookings)
      .set({
        status: "verified",
      })
      .where(
        eq(bookings.id, payment[0].bookingId)
      );
  }

  if (status === "rejected") {
    await db
      .update(bookings)
      .set({
        status: "cancelled",
      })
      .where(
        eq(bookings.id, payment[0].bookingId)
      );
  }

  return c.json({
    message: "Status payment berhasil diubah",
    payment: payment[0],
  });
});


// =========================
// DELETE PAYMENT
// =========================
app.delete("/:id",authMiddleware,adminOnly, async (c) => {
  const id = Number(c.req.param("id"));

  await db
    .delete(payments)
    .where(eq(payments.id, id));

  return c.json({
    message: "Payment deleted",
  });
});

export default app;
