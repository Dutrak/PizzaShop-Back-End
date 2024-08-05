import jwt from '@elysiajs/jwt'
import { env } from '../env'
import Elysia, { t, type Static } from 'elysia'
import { UnauthorizedError } from './errors/unauthorized-error'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET,
      schema: jwtPayload,
    }),
  )
  .derive({ as: 'scoped' }, ({ jwt, cookie }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const token = await jwt.sign(payload)

        cookie.auth.set({
          value: token,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 Days
          path: '/',
        })
      },
      signOut: () => {
        cookie.auth.remove()
      },

      getCurrentUser: async () => {
        const authCookie = cookie.auth

        const payload = await jwt.verify(authCookie.value)

        if (!payload) throw new UnauthorizedError()

        return {
          userid: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
