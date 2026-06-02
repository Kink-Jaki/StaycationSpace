import { Hono } from "hono";
import { db } from "../db";

import { payments } from "../db/schema/payments";
import { bookings } from "../db/schema/bookings";

import { eq } from "drizzle-orm";

import { mkdir } from "fs/promises";
import { writeFile } from "fs/promises";

const app = new Hono();


// =========================
// CREATE PAYMENT
// =========================
app.post("/", async (c) => {
  const body = await c.req.json();

  const {
    bookingId,
    amount,
    method,
  } = body;

  // cek booking
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
app.post("/:id/upload", async (c) => {
  const id = Number(c.req.param("id"));

  const body = await c.req.parseBody();

  const file = body["file"];

  if (!(file instanceof File)) {
    return c.json(
      { message: "File tidak ditemukan" },
      400
    );
  }

  // buat folder uploads/payments
  await mkdir("./public/uploads/payments", {
    recursive: true,
  });

  // generate nama file
  const fileName =
    `${Date.now()}-${file.name}`;

  const path =
    `./public/uploads/payments/${fileName}`;

  // convert file
  const buffer = await file.arrayBuffer();

  // save file
  await writeFile(path, Buffer.from(buffer));

  // url image
  const imageUrl =
    `${process.env.BASE_URL}/uploads/payments/${fileName}`;

  // update payment
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
app.get("/", async (c) => {
  const data = await db
    .select()
    .from(payments);

  return c.json(data);
});


// =========================
// GET PAYMENT BY ID
// =========================
app.get("/:id", async (c) => {
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
// VERIFY PAYMENT
// =========================
app.patch("/:id/verify", async (c) => {
  const id = Number(c.req.param("id"));

  // update payment
  const payment = await db
    .update(payments)
    .set({
      status: "verified",
    })
    .where(eq(payments.id, id))
    .returning();

  if (!payment[0]) {
    return c.json(
      { message: "Payment tidak ditemukan" },
      404
    );
  }

  // update booking
  await db
    .update(bookings)
    .set({
      status: "verified",
    })
    .where(eq(bookings.id, payment[0].bookingId));

  return c.json({
    message: "Payment verified",
    payment: payment[0],
  });
});


// =========================
// DELETE PAYMENT
// =========================
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  await db
    .delete(payments)
    .where(eq(payments.id, id));

  return c.json({
    message: "Payment deleted",
  });
});

export default app;