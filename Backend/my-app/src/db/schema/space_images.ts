import {
  pgTable,
  serial,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { spaces } from "./spaces";

export const spaceImages = pgTable("space_images", {
  id: serial("id").primaryKey(),

  spaceId: integer("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),

  imageUrl: varchar("image_url", { length: 500 })
    .notNull(),

  sortOrder: integer("sort_order")
    .notNull()
    .default(0),
});