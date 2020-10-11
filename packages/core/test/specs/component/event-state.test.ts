import { eventState } from '../../../src/component/state'
import { Subject, throwError } from 'rxjs'
import { RvdEvent, RxO } from '../../../src/shared/types'
import { map } from 'rxjs/operators'

interface MockEvent extends RvdEvent<Element> {
  testField: {
    value: string
  }
  test?: string
}

const TestEvent: MockEvent = ({
  testField: {
    value: 'test'
  }
} as unknown) as MockEvent

describe('eventState function', () => {
  let mockEventSubject: Subject<MockEvent>
  let mockEvent$: RxO<MockEvent>

  beforeEach(() => {
    mockEventSubject = new Subject<MockEvent>()
    mockEvent$ = mockEventSubject.asObservable()
  })

  test('should connect event and replay last value', done => {
    const [state, connectEvent] = eventState<MockEvent>()
    connectEvent()(mockEvent$).subscribe()

    state.subscribe(value => {
      expect(value).toEqual(TestEvent)
    })

    mockEventSubject.next(TestEvent)

    state.subscribe(value => {
      expect(value).toEqual(TestEvent)
      done()
    })
  })

  test('should connect event and replay last, transformed (by main operator) value', done => {
    const [state, connectEvent] = eventState<MockEvent, string>(
      map((event: MockEvent) => event.testField.value)
    )
    connectEvent()(mockEvent$).subscribe()

    state.subscribe(value => {
      expect(value).toEqual('test')
    })

    mockEventSubject.next(TestEvent)

    state.subscribe(value => {
      expect(value).toEqual('test')
      done()
    })
  })

  test('should connect event and replay last, transformed (by event operator) value', done => {
    const [state, connectEvent] = eventState<MockEvent>()
    connectEvent(map((event: MockEvent) => ({ ...event, test: 'test' })))(mockEvent$).subscribe()

    state.subscribe(({ test }) => {
      expect(test).toEqual('test')
    })

    mockEventSubject.next(TestEvent)

    state.subscribe(({ test }) => {
      expect(test).toEqual('test')
      done()
    })
  })

  test('connected event error, should cause state error', done => {
    const [state, connectEvent] = eventState<MockEvent, string>(
      map((event: MockEvent) => event.testField.value)
    )
    connectEvent()(throwError(() => 'TEST_ERROR')).subscribe()

    state.subscribe(
      value => {
        expect(value).toEqual('test')
      },
      error => {
        expect(error).toEqual('TEST_ERROR')
        done()
      }
    )
  })

  // eslint-disable-next-line max-len
  test('should connect event and replay last value, transformed separately per connection', done => {
    const [state, connectEvent] = eventState<MockEvent, string>(
      map((event: MockEvent) => event.testField.value)
    )
    connectEvent(
      map((event: MockEvent) => ({
        ...event,
        testField: {
          value: `${(event as MockEvent).testField.value} event 1`
        }
      }))
    )(mockEvent$).subscribe()

    const secondMockEventSubject = new Subject<MockEvent>()
    const secondMockEvent$ = mockEventSubject.asObservable()

    connectEvent(
      map((event: MockEvent) => ({
        ...event,
        testField: {
          value: `${(event as MockEvent).testField.value} event 2`
        }
      }))
    )(secondMockEvent$).subscribe()

    let count = 0

    state.subscribe(value => {
      if (count === 0) {
        expect(value).toEqual('test event 1')
        count++
      } else {
        expect(value).toEqual('test event 2')
        done()
      }
    })

    mockEventSubject.next(TestEvent)

    secondMockEventSubject.next(TestEvent)
  })
})
