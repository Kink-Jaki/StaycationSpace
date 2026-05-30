import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 })
    .notNull(),

  email: varchar("email", { length: 100 })
    .notNull()
    .unique(),

  phone: varchar("phone", { length: 20 }),

  address: text("address"),

  createdAt: timestamp("created_at")
    .defaultNow(),
});