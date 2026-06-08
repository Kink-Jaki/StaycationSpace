import { Hono } from "hono";
import { db } from "../db";

import { reviews } from "../db/schema/reviews";
import { bookings } from "../db/schema/bookings";
import { authMiddleware } from "../middleware/auth";

import { eq, desc } from "drizzle-orm";

const app = new Hono();
app.use(authMiddleware);


// =========================
// CREATE REVIEW
// =========================
app.post("/",authMiddleware, async (c) => {
  const body = await c.req.json();
  const user = c.get("user");

  const {
    bookingId,
    spaceId,
    rating,
    comment,
  } = body;
  const userId = user.id;

  // validasi rating
  if (rating < 1 || rating > 5) {
    return c.json(
      {
        message: "Rating harus 1-5",
      },
      400
    );
  }

  // cek booking
  const booking = await db.query.bookings.findFirst({
    where: (b, { eq }) => eq(b.id, bookingId),
  });

  if (!booking) {
    return c.json(
      {
        message: "Booking tidak ditemukan",
      },
      404
    );
  }

  if (booking.userId !== user.id) {
    return c.json(
      {
        message: "Booking bukan milik user ini",
      },
      403
    );
  }

  if (booking.spaceId !== spaceId) {
    return c.json(
      {
        message: "Space tidak sesuai dengan booking",
      },
      400
    );
  }

  // hanya booking verified
  if (booking.status !== "verified") {
    return c.json(
      {
        message:
          "Booking belum selesai/diverifikasi",
      },
      400
    );
  }

  const review = await db
    .insert(reviews)
    .values({
      bookingId,
      spaceId,
      userId: user.id,
      rating,
      comment,
    })
    .returning();

  return c.json(review[0]);
});


// =========================
// GET ALL REVIEWS
// =========================
app.get("/", async (c) => {
  const data = await db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt));

  return c.json(data);
});


// =========================
// GET REVIEW BY ID
// =========================
app.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const data = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id));

  if (!data[0]) {
    return c.json(
      {
        message: "Review tidak ditemukan",
      },
      404
    );
  }

  return c.json(data[0]);
});


// =========================
// GET REVIEWS BY SPACE
// =========================
app.get("/space/:spaceId", async (c) => {
  const spaceId = Number(
    c.req.param("spaceId")
  );

  const data = await db
    .select()
    .from(reviews)
    .where(eq(reviews.spaceId, spaceId))
    .orderBy(desc(reviews.createdAt));

  return c.json(data);
});


// =========================
// UPDATE REVIEW
// =========================
app.put("/:id",authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));

  const body = await c.req.json();

  const updated = await db
    .update(reviews)
    .set({
      rating: body.rating,
      comment: body.comment,
    })
    .where(eq(reviews.id, id))
    .returning();

  if (!updated[0]) {
    return c.json(
      {
        message: "Review tidak ditemukan",
      },
      404
    );
  }

  return c.json(updated[0]);
});


// =========================
// DELETE REVIEW
// =========================
app.delete("/:id",authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));

  await db
    .delete(reviews)
    .where(eq(reviews.id, id));

  return c.json({
    message: "Review deleted",
  });
});


// =========================
// AVERAGE RATING SPACE
// =========================
app.get("/space/:spaceId/rating", async (c) => {
  const spaceId = Number(
    c.req.param("spaceId")
  );

  const data = await db.query.reviews.findMany({
    where: (r, { eq }) =>
      eq(r.spaceId, spaceId),
  });

  if (data.length === 0) {
    return c.json({
      averageRating: 0,
      totalReviews: 0,
    });
  }

  const total = data.reduce(
    (sum, r) => sum + r.rating,
    0
  );

  const average =
    total / data.length;

  return c.json({
    averageRating: Number(
      average.toFixed(1)
    ),
    totalReviews: data.length,
  });
});

export default app;
