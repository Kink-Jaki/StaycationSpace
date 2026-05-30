import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const spaceTypeEnum  = pgEnum("space_type",   ["studio", "villa", "hall", "other"]);
export const spaceStatusEnum = pgEnum("space_status", ["active", "inactive"]);

export const spaces = pgTable("spaces", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 })
    .notNull(),

  type: spaceTypeEnum("type")
    .notNull(),

  description: text("description"),

  pricePerHour: numeric("price_per_hour", { precision: 12, scale: 2 })
    .notNull(),

  capacity: integer("capacity"),

  status: spaceStatusEnum("status")
    .notNull()
    .default("active"),

  createdAt: timestamp("created_at")
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .defaultNow(),
});