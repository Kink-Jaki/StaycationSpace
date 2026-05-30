import {
  pgTable,
  serial,
  integer,
  numeric,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { spaces }    from "./spaces";
import { customers } from "./customers";
import { promos }    from "./promos";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "done",
]);

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),

  spaceId: integer("space_id")
    .notNull()
    .references(() => spaces.id),

  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),

  promoId: integer("promo_id")
    .references(() => promos.id),

  startTime: timestamp("start_time")
    .notNull(),

  endTime: timestamp("end_time")
    .notNull(),

  totalPrice: numeric("total_price", { precision: 12, scale: 2 })
    .notNull(),

  status: bookingStatusEnum("status")
    .notNull()
    .default("pending"),

  notes: text("notes"),

  createdAt: timestamp("created_at")
    .defaultNow(),
});