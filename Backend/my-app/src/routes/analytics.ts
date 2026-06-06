import { Hono } from "hono";
import { db } from "../db";
import { users } from "../db/schema/users";
import { spaces } from "../db/schema/spaces";
import { bookings } from "../db/schema/bookings";
import { payments } from "../db/schema/payments";
import { reviews } from "../db/schema/reviews";
import { sql, desc } from "drizzle-orm";
import { adminOnly } from "../middleware/role";
import { authMiddleware } from "../middleware/auth";

const analytics = new Hono();
analytics.use("*", authMiddleware, adminOnly);

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
    userId: reviews.userId,
    userName: users.username,  // ambil dari tabel users
  })
  .from(reviews)
  .leftJoin(users, sql`${reviews.userId} = ${users.id}`)  // join ke users
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

analytics.get("/chart", async (c) => {

  const revenueChart = await db.execute(sql`
    SELECT
      TO_CHAR(created_at, 'Mon') as month,
      COALESCE(SUM(amount), 0) as revenue
    FROM payments
    GROUP BY month
    ORDER BY MIN(created_at)
  `);

  const bookingChart = await db.execute(sql`
    SELECT
      TO_CHAR(created_at, 'Mon') as month,
      COUNT(*) as bookings
    FROM bookings
    GROUP BY month
    ORDER BY MIN(created_at)
  `);

  const bookingStatus = await db.execute(sql`
    SELECT
      status,
      COUNT(*) as total
    FROM bookings
    GROUP BY status
  `);

  return c.json({
    revenueChart,
    bookingChart,
    bookingStatus,
  });
});

export default analytics;