import {
  pgTable,
  serial,
  varchar,
  numeric,
  integer,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const promoTypeEnum = pgEnum("promo_type", ["percent", "fixed"]);

export const promos = pgTable("promos", {
  id: serial("id").primaryKey(),

  code: varchar("code", { length: 50 })
    .notNull()
    .unique(),

  type: promoTypeEnum("type")
    .notNull(),

  value: numeric("value", { precision: 12, scale: 2 })
    .notNull(),

  maxUsage: integer("max_usage")
    .notNull()
    .default(1),

  usedCount: integer("used_count")
    .notNull()
    .default(0),

  expiresAt: date("expires_at"),

  isActive: boolean("is_active")
    .notNull()
    .default(true),
});