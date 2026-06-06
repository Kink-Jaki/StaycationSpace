import { Hono } from "hono";
import { db } from "../db";
import { bookings } from "../db/schema/bookings";
import { promos } from "../db/schema/promos";
import { eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { adminOnly } from "../middleware/role";


const app = new Hono();
app.use(authMiddleware);


// =========================
// CREATE BOOKING
// =========================
app.post("/", async (c) => {
  const body = await c.req.json();
  const user = c.get("user");

  const {
    spaceId,
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

  const start = new Date(startTime);
  const end = new Date(endTime);

  // validasi waktu
  if (end <= start) {
    return c.json(
      {
        message: "End time harus lebih besar dari start time",
      },
      400
    );
  }

  // hitung durasi
  const durationMs =
    end.getTime() - start.getTime();

  const durationHours =
    durationMs / (1000 * 60 * 60);

  let totalPrice =
    Number(space.pricePerHour) *
    durationHours;

  let promoData = null;

  // =========================
  // APPLY PROMO
  // =========================
  if (promoId) {
    promoData = await db.query.promos.findFirst({
      where: (p, { eq }) =>
        eq(p.id, promoId),
    });

    if (!promoData) {
      return c.json(
        {
          message: "Promo tidak ditemukan",
        },
        404
      );
    }

    if (!promoData.isActive) {
      return c.json(
        {
          message: "Promo tidak aktif",
        },
        400
      );
    }

    if (
      promoData.usedCount >=
      promoData.maxUsage
    ) {
      return c.json(
        {
          message: "Promo sudah habis",
        },
        400
      );
    }

    if (
      promoData.expiresAt &&
      new Date(promoData.expiresAt) <
        new Date()
    ) {
      return c.json(
        {
          message: "Promo sudah kadaluarsa",
        },
        400
      );
    }

    // percent
    if (promoData.type === "percent") {
      totalPrice =
        totalPrice -
        (totalPrice *
          Number(promoData.value)) /
          100;
    }

    // fixed
    if (promoData.type === "fixed") {
      totalPrice =
        totalPrice -
        Number(promoData.value);
    }

    if (totalPrice < 0) {
      totalPrice = 0;
    }
  }

  // =========================
  // CREATE BOOKING
  // =========================
  const booking = await db
    .insert(bookings)
    .values({
      spaceId,
      userId: user.id,
      promoId,
      startTime: start,
      endTime: end,
      totalPrice: totalPrice.toString(),
      notes,
      status: "pending",
    })
    .returning();

  // =========================
  // UPDATE PROMO USAGE
  // =========================
  if (promoData) {
    await db
      .update(promos)
      .set({
        usedCount:
          promoData.usedCount + 1,
      })
      .where(eq(promos.id, promoData.id));
  }

  return c.json({
    booking: booking[0],
    promoApplied:
      promoData?.code ?? null,
    finalPrice: totalPrice,
  });
});


// =========================
// GET BOOKINGS
// =========================
app.get("/", async (c) => {
  const user = c.get("user");

  const data = user.role === "admin"
    ? await db.select().from(bookings)
    : await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, user.id));

  return c.json(data);
});


// =========================
// GET BOOKING BY ID
// =========================
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const user = c.get("user");

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

  if (user.role !== "admin" && data[0].userId !== user.id) {
    return c.json(
      { message: "Anda tidak memiliki akses ke booking ini" },
      403
    );
  }

  return c.json(data[0]);
});


// =========================
// UPDATE BOOKING STATUS
// =========================
app.patch("/:id/status", adminOnly, async (c) => {
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
  const user = c.get("user");

  const booking = await db.query.bookings.findFirst({
    where: (b, { eq }) => eq(b.id, id),
  });

  if (!booking) {
    return c.json(
      { message: "Booking tidak ditemukan" },
      404
    );
  }

  if (user.role !== "admin" && booking.userId !== user.id) {
    return c.json(
      { message: "Anda tidak memiliki akses ke booking ini" },
      403
    );
  }

  await db
    .delete(bookings)
    .where(eq(bookings.id, id));

  return c.json({
    message: "Booking deleted",
  });
});

export default app;
