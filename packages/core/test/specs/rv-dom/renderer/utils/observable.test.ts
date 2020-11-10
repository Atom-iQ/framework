import { rvdObserver, unsubscribe } from '../../../../../src/reactive-virtual-dom/renderer/utils'
import { Observer, PartialObserver, Subject, Subscriber, Subscription } from 'rxjs'
import { isFunction } from '../../../../../src/shared'

describe('Observable utils', () => {
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

  test('rvdObserver should return subscriber (should pass RxJS isSubscriber() test)', () => {
    const observer = rvdObserver(value => {
      console.log(value)
    })

    expect(isRxSubscriber(observer)).toBeTruthy()
  })

  test('rvdObserver should correctly subscribe to Observable', done => {
    const subject = new Subject<string>()
    let index = 0
    subject.asObservable().subscribe(
      rvdObserver(value => {
        switch (index) {
          case 0:
            expect(value).toBe('test-1')
            break
          case 1:
            expect(value).toBe('test-2')
            break
          case 2:
            expect(value).toBe('test-3')
            break
          case 3:
            expect(value).toBe('test-4')
            return done()
        }
        ++index
      })
    )
    subject.next('test-1')
    subject.next('test-2')
    subject.next('test-3')
    subject.next('test-4')
  })
})

/**
 * Basic check if passed value is RxJS Subscriber. If it's true, it will be also true
 * in Observable.subscribe() internal check.
 * @param value
 */
function isRxSubscriber<T>(value: Observer<T> | Subscriber<T> | Function | Object): boolean {
  return value && value instanceof Subscriber
}
