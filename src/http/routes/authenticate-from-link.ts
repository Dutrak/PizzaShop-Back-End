import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import dayjs from 'dayjs'
import { auth } from '../auth'
import { authLinks } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { AuthLinkExpiredError } from '../errors/auth-link-expired-error'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, signUser, redirect }) => {
    const { code, redirectUrl } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) throw new UnauthorizedError()

    const daysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.createdAt,
      'days',
    )

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new AuthLinkExpiredError()
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    await signUser({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurant?.id,
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    return redirect(redirectUrl)
  },
  {
    query: t.Object({
      code: t.String(),
      redirectUrl: t.String(),
    }),
    error({ error, set }) {
      if (error instanceof AuthLinkExpiredError) {
        set.status = 410
        return { message: error.message }
      }
    },
  },
)
