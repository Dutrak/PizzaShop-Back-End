/* eslint-disable drizzle/enforce-delete-with-where */

import { faker } from '@faker-js/faker'
import { users, restaurants } from './schema'
import { db } from './connection'
import chalk from 'chalk'

/**
 * Reset Database
 */

await db.delete(users)
await db.delete(restaurants)

console.log(chalk.yellow('🗸 Database Reset! '))

/**
 * Create Costumers
 */

await db.insert(users).values([
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

console.log(chalk.yellow('🗸 Created Costumers! '))

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

await db.insert(restaurants).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id,
  },
])

console.log(chalk.yellow('🗸 Created Managers! '))
console.log(chalk.greenBright('Database Seeded Sucessfully!'))

process.exit()
