// import { eventState } from '../../../src/component/state'
// import { Observable, Subject, throwError } from 'rxjs'
// import { RvdEvent } from '../../../src/shared/types'
// import { map } from 'rxjs/operators'
//
// interface MockEvent extends RvdEvent<Element> {
//   testField: {
//     value: string
//   }
//   test?: string
// }
//
// const TestEvent: MockEvent = ({
//   testField: {
//     value: 'test'
//   }
// } as unknown) as MockEvent
//
// describe('eventState function', () => {
//   let mockEventSubject: Subject<MockEvent>
//   let mockEvent$: Observable<MockEvent>
//
//   beforeEach(() => {
//     mockEventSubject = new Subject<MockEvent>()
//     mockEvent$ = mockEventSubject.asObservable()
//   })
//
//   test('should connect event and replay last value', done => {
//     const [state, connectEvent] = eventState<MockEvent>(null)
//     const handler = connectEvent()
//
//     let inited = false
//
//     state.subscribe(value => {
//       if (inited) {
//         expect(value).toEqual(TestEvent)
//         done()
//       } else {
//         expect(value).toEqual(null)
//         inited = true
//       }
//     })
//
//     handler(TestEvent)
//   })
//
//   test('should connect event and replay last, transformed  value', done => {
//     const [state, connectEvent] = eventState<MockEvent, string>(
//       'init',
//       (event: MockEvent) => event.testField.value
//     )
//     const handler = connectEvent()
//
//     let inited = false
//
//     state.subscribe(value => {
//       if (inited) {
//         expect(value).toEqual('test')
//         done()
//       } else {
//         expect(value).toEqual('init')
//         inited = true
//       }
//     })
//
//     handler(TestEvent)
//   })
// })
