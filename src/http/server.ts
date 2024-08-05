import { Elysia } from 'elysia'

import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { signOut } from './routes/sign-out'
import { getProfile } from './routes/get-profile'
import { getManagedRestaurants } from './routes/get-managed-restaurants'

import { UnauthorizedError } from './errors/unauthorized-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

const app = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    RESOURCE_NOT_FOUND: ResourceNotFoundError,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { message: error.message }
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
        return { message: error.message }
      }
      case 'NOT_FOUND': {
        return new Response(null, { status: 404 })
      }
    }
  })
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurants)

app.listen(3333, () => {
  console.log('Http Server Running')
})
