import {
  pgTable,
  serial,
  integer,
  numeric,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings";

export const paymentMethodEnum = pgEnum("payment_method", [
  "transfer",
  "cash",
  "qris",
  "other",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "verified",
  "rejected",
  "uploaded",
]);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),

  bookingId: integer("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),

  method: paymentMethodEnum("method")
    .notNull(),

  amount: numeric("amount", { precision: 12, scale: 2 })
    .notNull(),

  proofUrl: varchar("proof_url", { length: 500 }),

  status: paymentStatusEnum("status")
    .notNull()
    .default("pending"),

  paidAt: timestamp("paid_at")
    .defaultNow(),

    createdAt: timestamp("created_at")
  .defaultNow(),
});