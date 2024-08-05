import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getManagedRestaurants = new Elysia()
  .use(auth)
  .get('/managed-restaurant', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new UnauthorizedError()

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })

    return managedRestaurant
  })
