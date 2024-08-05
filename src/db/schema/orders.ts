import { createId } from '@paralleldrive/cuid2'
import { text, timestamp, pgTable, pgEnum, integer } from 'drizzle-orm/pg-core'
import { users } from './users'
import { restaurants } from './restuarants'
import { relations } from 'drizzle-orm'
import { orderItems } from './order-items'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'delivering',
  'delivered',
  'canceled',
])

export const orders = pgTable('orders', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  costumerId: text('costumer_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  restaurantId: text('restaurant_id')
    .notNull()
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    }),
  status: orderStatusEnum('status').default('pending'),
  totalInCents: integer('total_in_cents').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const ordersRelations = relations(orders, ({ one, many }) => {
  return {
    customer: one(users, {
      fields: [orders.costumerId],
      references: [users.id],
      relationName: 'order_costumer',
    }),
    restaurant: one(restaurants, {
      fields: [orders.restaurantId],
      references: [restaurants.id],
      relationName: 'order_restaurant',
    }),
    ordersItems: many(orderItems),
  }
})