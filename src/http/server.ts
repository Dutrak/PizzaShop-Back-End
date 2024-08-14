import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

import { UnauthorizedError } from './errors/unauthorized-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { signOut } from './routes/sign-out'
import { getProfile } from './routes/get-profile'
import { getManagedRestaurants } from './routes/get-managed-restaurants'

import { getOrderDetails } from './routes/get-order-details'
import { approveOrder } from './routes/approve-order'
import { cancelOrder } from './routes/cancel-order'
import { deliverOrder } from './routes/deliver-order'
import { dispatchOrder } from './routes/dispatch-order'
import { getOrders } from './routes/get-orders'
import { getMonthRevenue } from './routes/get-month-revenue'
import { getDayOrdersAmount } from './routes/get-day-orders-amount'
import { getMonthOrdersAmount } from './routes/get-month-orders-amout'
import { getMonthCanceledOrdersAmount } from './routes/get-month-canceled-orders-amount'
import { getPopularProducts } from './routes/get-popular-products'
import { getDailyRevenueInPeriod } from './routes/get-daily-revenue-in-period'
import { updateProfile } from './routes/update-profile'

const app = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    RESOURCE_NOT_FOUND: ResourceNotFoundError,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { message: error.message, code }
      }
      case 'VALIDATION': {
        set.status = error.toResponse().status
        return error.all.map((e) => {
          return {
            field: e.path,
            message: e.summary,
          }
        })
      }
      case 'RESOURCE_NOT_FOUND': {
        set.status = 404
        return { message: error.message, code }
      }
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
    }
  })
  .use(
    cors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  )
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(updateProfile)
  .use(getManagedRestaurants)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(cancelOrder)
  .use(deliverOrder)
  .use(dispatchOrder)
  .use(getOrders)
  .use(getMonthRevenue)
  .use(getDayOrdersAmount)
  .use(getMonthOrdersAmount)
  .use(getMonthCanceledOrdersAmount)
  .use(getPopularProducts)
  .use(getDailyRevenueInPeriod)

app.listen(3333, () => {
  console.log('Http Server Running')
})
