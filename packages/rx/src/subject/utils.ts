export const unsubscribedError = (): Error =>
  new Error('Subject Unsubscribed Error - cannot use unsubscribed Subject')
