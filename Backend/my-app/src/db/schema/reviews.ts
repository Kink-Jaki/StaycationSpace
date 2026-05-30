import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { bookings }  from "./bookings";
import { spaces }    from "./spaces";
import { customers } from "./customers";

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),

  bookingId: integer("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),

  spaceId: integer("space_id")
    .notNull()
    .references(() => spaces.id),

  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),

  rating: integer("rating")
    .notNull(),

  comment: text("comment"),

  createdAt: timestamp("created_at")
    .defaultNow(),
});