import { createId } from '@paralleldrive/cuid2';
import { text, timestamp, pgTable } from 'drizzle-orm/pg-core'

export const restaurants = pgTable("restaurant", {
  id: text("id").$defaultFn(() => createId()).primaryKey(),
  name: text("name").notNull(),
  description: text('description'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});