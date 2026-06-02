import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema/users";
import { spaces } from "../db/schema/spaces";
import { bookings } from "../db/schema/bookings";
import { payments } from "../db/schema/payments";
import { reviews } from "../db/schema/reviews";
import { sql, desc } from "drizzle-orm";

const analytics = new Hono();

/* =========================
   OVERVIEW DASHBOARD
========================= */
analytics.get("/overview", async (c) => {
  // total tempat (spaces)
  const totalSpaces = await db
    .select({ count: sql<number>`count(*)` })
    .from(spaces);

  // total omset (payments sukses)
  const totalRevenue = await db
    .select({ sum: sql<number>`coalesce(sum(amount),0)` })
    .from(payments);

  // booking terverifikasi
  const verifiedBookings = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(sql`status = 'verified'`);

  // menunggu pembayaran
  const pendingPayments = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(sql`status = 'pending'`);

  // rating & ulasan terakhir
  const latestReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .orderBy(desc(reviews.createdAt))
    .limit(5);

  return c.json({
    totalSpaces: totalSpaces[0].count,
    totalRevenue: totalRevenue[0].sum,
    verifiedBookings: verifiedBookings[0].count,
    pendingPayments: pendingPayments[0].count,
    latestReviews,
  });
});

export default analytics;