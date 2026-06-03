import { Hono } from "hono";
import { db } from "../db";

import { bookings } from "../db/schema/bookings";
import { payments } from "../db/schema/payments";

import { sql } from "drizzle-orm";

import { authMiddleware } from "../middleware/auth";
import { adminOnly } from "../middleware/role";

const app = new Hono();


// =========================
// BOOKING REPORT
// =========================
app.get("/", (c) => {
  return c.json({
    message: "reports route works"
  });
});

app.get(
  "/bookings",
  authMiddleware,
  adminOnly,
  async (c) => {

    const totalBookings = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(bookings);

    const pendingBookings = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(bookings)
      .where(sql`status = 'pending'`);

    const verifiedBookings = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(bookings)
      .where(sql`status = 'verified'`);

    const cancelledBookings = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(bookings)
      .where(sql`status = 'cancelled'`);

    const totalRevenue = await db
      .select({
        revenue: sql<number>`coalesce(sum(amount),0)`,
      })
      .from(payments)
      .where(sql`status = 'verified'`);

    return c.json({
      totalBookings:
        totalBookings[0].count,

      pendingBookings:
        pendingBookings[0].count,

      verifiedBookings:
        verifiedBookings[0].count,

      cancelledBookings:
        cancelledBookings[0].count,

      totalRevenue:
        totalRevenue[0].revenue,
    });
  }
);

export default app;