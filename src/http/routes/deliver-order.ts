import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { orders } from '../../db/schema'
import { and, eq } from 'drizzle-orm'

export const deliverOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/deliver',
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new UnauthorizedError()

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId),
        )
      },
    })

    if (!order) throw new ResourceNotFoundError()

    if (order.status !== 'delivering') {
      set.status = 400

      return {
        message:
          'You cannot deliver orders that are not in "delivering" status',
      }
    }

    await db
      .update(orders)
      .set({ status: 'delivered' })
      .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)))

    set.status = 204
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
