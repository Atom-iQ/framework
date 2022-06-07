import { unsubscribe } from 'renderer/utils'
import { teardownSub } from '@atom-iq/rx'

describe('Observable utils', () => {
  test('unsubscribe should unsubscribe subscription from input object', done => {
    const withSub = {
      sub: teardownSub(() => {
        expect(unsub).toBeCalledTimes(1)
        done()
      })
    }

    const unsub = jest.fn(unsubscribe)
    unsub(withSub)
  })
})
