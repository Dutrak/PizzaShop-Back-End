export class AuthLinkExpiredError extends Error {
  constructor() {
    super('Auth Link Expired')
  }
}
