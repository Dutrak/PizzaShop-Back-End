import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'

export const getProfile = new Elysia()
  .use(auth)
  .get('/me', async ({ getCurrentUser }) => {
    const { userid } = await getCurrentUser()

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userid)
      },
    })

    if (!user) throw new Error('Resource not Found')

    return user
  })
