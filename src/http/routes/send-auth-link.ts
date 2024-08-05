import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { createId } from '@paralleldrive/cuid2'
import { authLinks } from '../../db/schema'
import { env } from '../../env'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { mail } from '../../lib/mail'
import nodemailer from 'nodemailer'

export const sendAuthLink = new Elysia().post(
  '/authenticate',
  async ({ body, set }) => {
    const { email } = body

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userFromEmail) throw new ResourceNotFoundError()

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)
    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirectUrl', env.AUTH_REDIRECT_URL)

    // Enviar um e-mail
    const info = await mail.sendMail({
      from: {
        name: 'Pizza Shop',
        address: 'admin@pizzashop.com',
      },
      to: email,
      subject: 'Authenticate to Pizza Shop',
      html: `<h1>Pizza Shop</h1> <p> Use the following link to authenticate on Pizza Shop: <a>${authLink.toString()}</a> </p>`,
    })

    console.log(authLink.toString())
    console.log(nodemailer.getTestMessageUrl(info))

    set.status = 204
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
    error({ error, set }) {
      if (error instanceof ResourceNotFoundError) {
        set.status = 404
        return { message: error.message }
      }
    },
  },
)
