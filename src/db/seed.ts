/* eslint-disable drizzle/enforce-delete-with-where */

import { faker } from '@faker-js/faker'
import {
  users,
  restaurants,
  orderItems,
  products,
  orders,
  authLinks,
} from './schema'
import { db } from './connection'
import chalk from 'chalk'
import { createId } from '@paralleldrive/cuid2'

/**
 * Reset Database
 */

await db.delete(users)
await db.delete(restaurants)
await db.delete(orderItems)
await db.delete(orders)
await db.delete(products)
await db.delete(authLinks)

console.log(chalk.yellow('🗸 Database Reset! '))

/**
 * Create Customers
 */

const [customer1, customer2] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])
  .returning()

console.log(chalk.yellow('🗸 Created Customers! '))

/**
 * Create Manager
 */

const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      role: 'manager',
    },
  ])
  .returning({ id: users.id })

console.log(chalk.yellow('🗸 Created Manager! '))

/**
 * Create Restaurant
 */

const [restaurant] = await db
  .insert(restaurants)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning()

console.log(chalk.yellow('🗸 Created Managers! '))

function generateProduct() {
  return {
    name: faker.commerce.productName(),
    restaurantId: restaurant.id,
    description: faker.commerce.productDescription(),
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 })),
  }
}

/**
 * Create Products
 */

const avaliableProducts = await db
  .insert(products)
  .values([
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct(),
    generateProduct(),
  ])
  .returning()

console.log(chalk.yellow('🗸 Created Products! '))

/**
 * Create Orders
 */

type orderItemInsert = typeof orderItems.$inferInsert
type orderInsert = typeof orders.$inferInsert

const orderItemsToInsert: orderItemInsert[] = []
const ordersToInsert: orderInsert[] = []

for (let i = 0; i < 200; i++) {
  const orderId = createId()
  const orderProducts = faker.helpers.arrayElements(avaliableProducts, {
    min: 1,
    max: 3,
  })

  let totalInCents = 0

  orderProducts.forEach((orderProduct) => {
    const quantity = faker.number.int({ min: 1, max: 3 })
    totalInCents += orderProduct.priceInCents * quantity

    orderItemsToInsert.push({
      orderId,
      productId: orderProduct.id,
      priceInCents: orderProduct.priceInCents,
      quantity,
    })
  })

  ordersToInsert.push({
    id: orderId,
    costumerId: faker.helpers.arrayElement([costumer1.id, costumer2.id]),
    restaurantId: restaurant.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'delivering',
      'delivered',
      'canceled',
    ]),
    createdAt: faker.date.recent({ days: 40 }),
  })
}

await db.insert(orders).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToInsert)

console.log(chalk.yellow('🗸 Created Orders! '))

console.log(chalk.greenBright('Database Seeded Sucessfully!'))

process.exit()
