import eventState from '../../../src/component/state/event-state'
import { Subject } from 'rxjs'
import { RvdEvent, RxO } from '../../../src/shared/types'
import { map } from 'rxjs/operators'

interface MockEvent extends RvdEvent<Element> {
  testField: {
    value: string
  }
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
    const [state, connectEvent] = eventState<MockEvent, string>(map(event => event.testField.value))
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

  // eslint-disable-next-line max-len
  test('should connect event and replay last value, transformed separately per connection', done => {
    const [state, connectEvent] = eventState<MockEvent, string>(map(event => event.testField.value))
    connectEvent(
      map(event => ({
        ...event,
        testField: {
          value: `${(event as MockEvent).testField.value} event 1`
        }
      }))
    )(mockEvent$).subscribe()

    const secondMockEventSubject = new Subject<MockEvent>()
    const secondMockEvent$ = mockEventSubject.asObservable()

    connectEvent(
      map(event => ({
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
