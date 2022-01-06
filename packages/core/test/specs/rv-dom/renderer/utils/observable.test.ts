import { unsubscribe } from 'rvd/renderer/utils'
import { Subscription } from 'rxjs'

describe('Observable utils', () => {
  test('unsubscribe should unsubscribe subscription from input object', done => {
    const withSub = {
      sub: new Subscription(() => {
        expect(unsub).toBeCalledTimes(1)
        done()
      })
    }

    const unsub = jest.fn(unsubscribe)
    unsub(withSub)
  })
})
