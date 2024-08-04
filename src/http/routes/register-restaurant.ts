import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { users, restaurants } from '../../db/schema'

export const registerRestaurant = new Elysia().post(
  '/restaurants',
  async ({ body, set }) => {
    const { restaurantName, restaurantDescription, managerName, email, phone } =
      body

    const [manager] = await db
      .insert(users)
      .values({
        name: managerName,
        email,
        phone,
        role: 'manager',
      })
      .returning({
        id: users.id,
      })

    await db.insert(restaurants).values({
      name: restaurantName,
      description: restaurantDescription,
      managerId: manager.id,
    })

    set.status = 201
  },
  {
    body: t.Object({
      restaurantName: t.String(),
      restaurantDescription: t.String(),
      managerName: t.String(),
      phone: t.String(),
      email: t.String({ format: 'email' }),
    }),
  },
)
