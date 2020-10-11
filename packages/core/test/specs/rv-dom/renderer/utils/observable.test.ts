import {
  nullObservable,
  syncObservable,
  unsubscribe
} from '../../../../../src/rv-dom/renderer/utils'
import { Subscription } from 'rxjs'

describe('Observable utils', () => {
  test('syncObservable should return one time, completed Observable', done => {
    syncObservable('test').subscribe({
      next: v => expect(v).toBe('test'),
      complete: () => done()
    })
  })

  test('nullObservable should return null, sync Observable', done => {
    nullObservable().subscribe({
      next: v => expect(v).toBe(null),
      complete: () => done()
    })
  })

  test('unsubscribe should unsubscribe subscription from input object', done => {
    const withSub = {
      subscription: new Subscription(() => {
        expect(unsub).toBeCalledTimes(1)
        done()
      })
    }

    const unsub = jest.fn(unsubscribe)
    unsub(withSub)
  })
})
