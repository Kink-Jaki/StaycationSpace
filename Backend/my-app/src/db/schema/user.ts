import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

/* =========================
   ENUM ROLE
========================= */
export const roleEnum = pgEnum("role", ["user", "admin"]);

/* =========================
   USERS TABLE
========================= */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  username: varchar("username", { length: 50 })
    .notNull()
    .unique(),

  email: varchar("email", { length: 100 })
    .notNull()
    .unique(),

  password: varchar("password", { length: 255 })
    .notNull(),

  role: roleEnum("role")
    .notNull()
    .default("user"),

  createdAt: timestamp("created_at")
    .defaultNow(),
});

