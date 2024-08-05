import nodemailer from 'nodemailer'

const account = await nodemailer.createTestAccount()

export const mail = nodemailer.createTransport({
  host: account.smtp.host,
  secure: account.smtp.secure,
  port: account.smtp.port,
  debug: true,
  auth: {
    user: account.user,
    pass: account.pass,
  },
})
