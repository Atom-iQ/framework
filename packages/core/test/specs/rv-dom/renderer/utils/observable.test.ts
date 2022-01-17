import { unsubscribe } from 'renderer/utils'
import { TeardownSubscription } from '@atom-iq/rx'

describe('Observable utils', () => {
  test('unsubscribe should unsubscribe subscription from input object', done => {
    const withSub = {
      sub: new TeardownSubscription(() => {
        expect(unsub).toBeCalledTimes(1)
        done()
      })
    }

    const unsub = jest.fn(unsubscribe)
    unsub(withSub)
  })
})
