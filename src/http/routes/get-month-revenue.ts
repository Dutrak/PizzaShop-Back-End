import Elysia from 'elysia'
import dayjs from 'dayjs'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, eq, gte, sql, sum } from 'drizzle-orm'

export const getMonthRevenue = new Elysia()
  .use(auth)
  .get('/metrics/month-revenue', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new UnauthorizedError()

    const today = dayjs()

    const lastMonth = today.subtract(1, 'month')
    const startOfLastMonth = lastMonth.startOf('month')

    const currentMonthWithYear = today.format('YYYY-MM')
    const lastMonthWithYear = lastMonth.format('YYYY-MM')

    const monthRevenues = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sum(orders.totalInCents).mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfLastMonth.toDate()),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

    const currentMonthRevenue = monthRevenues.find((monthRevenue) => {
      return monthRevenue.monthWithYear === currentMonthWithYear
    })

    const lastMonthRevenue = monthRevenues.find((monthRevenue) => {
      return monthRevenue.monthWithYear === lastMonthWithYear
    })

    const diffFromLastMonth =
      currentMonthRevenue && lastMonthRevenue
        ? (currentMonthRevenue.revenue * 100) / lastMonthRevenue.revenue
        : null

    return {
      revenue: currentMonthRevenue?.revenue || 0,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    }
  })
