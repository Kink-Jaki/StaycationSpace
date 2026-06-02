import { Hono } from "hono";
import { db } from "../db";

import { bookings } from "../db/schema/bookings";
import { spaces } from "../db/schema/spaces";

import { eq, and, lt, gt, sql } from "drizzle-orm";

const app = new Hono();


// =========================
// CREATE BOOKING
// =========================
app.post("/", async (c) => {
  const body = await c.req.json();

  const {
    spaceId,
    customerId,
    promoId,
    startTime,
    endTime,
    notes,
  } = body;

  // cek space
  const space = await db.query.spaces.findFirst({
    where: (s, { eq }) => eq(s.id, spaceId),
  });

  if (!space) {
    return c.json(
      { message: "Space tidak ditemukan" },
      404
    );
  }

  // cek bentrok jadwal
  const conflict = await db.query.bookings.findFirst({
    where: (b, { and, eq, lt, gt }) =>
      and(
        eq(b.spaceId, spaceId),

        lt(b.startTime, new Date(endTime)),
        gt(b.endTime, new Date(startTime)),

        sql`${b.status} != 'cancelled'`
      ),
  });

  if (conflict) {
    return c.json(
      {
        message: "Jadwal booking bentrok",
      },
      400
    );
  }

  // hitung durasi jam
  const start = new Date(startTime);
  const end = new Date(endTime);

  const durationMs = end.getTime() - start.getTime();

  const durationHours = durationMs / (1000 * 60 * 60);

  // hitung total harga
  const totalPrice =
    Number(space.pricePerHour) * durationHours;

  // create booking
  const booking = await db
    .insert(bookings)
    .values({
      spaceId,
      customerId,
      promoId,
      startTime: start,
      endTime: end,
      totalPrice: String(totalPrice),
      notes,
      status: "pending",
    })
    .returning();

  return c.json(booking[0]);
});


// =========================
// GET ALL BOOKINGS
// =========================
app.get("/", async (c) => {
  const data = await db.select().from(bookings);

  return c.json(data);
});


// =========================
// GET BOOKING BY ID
// =========================
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const data = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id));

  if (!data[0]) {
    return c.json(
      { message: "Booking tidak ditemukan" },
      404
    );
  }

  return c.json(data[0]);
});


// =========================
// UPDATE BOOKING STATUS
// =========================
app.patch("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));

  const body = await c.req.json();

  const updated = await db
    .update(bookings)
    .set({
      status: body.status,
    })
    .where(eq(bookings.id, id))
    .returning();

  return c.json(updated[0]);
});


// =========================
// CHECK AVAILABILITY
// =========================
app.get("/availability/check", async (c) => {
  const spaceId = Number(c.req.query("spaceId"));

  const startTime = c.req.query("startTime");
  const endTime = c.req.query("endTime");

  if (!spaceId || !startTime || !endTime) {
    return c.json(
      {
        message: "Parameter tidak lengkap",
      },
      400
    );
  }

  const conflict = await db.query.bookings.findFirst({
    where: (b, { and, eq, lt, gt }) =>
      and(
        eq(b.spaceId, spaceId),

        lt(b.startTime, new Date(endTime)),
        gt(b.endTime, new Date(startTime)),

        sql`${b.status} != 'cancelled'`
      ),
  });

  return c.json({
    available: !conflict,
  });
});


// =========================
// DELETE BOOKING
// =========================
app.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  await db
    .delete(bookings)
    .where(eq(bookings.id, id));

  return c.json({
    message: "Booking deleted",
  });
});

export default app;