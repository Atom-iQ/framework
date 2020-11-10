import type { ConnectEventFn, EventState, RedEvent } from '../../shared/types'
import { identity, Observable, pipe, ReplaySubject, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'

/**
 * Create event state  ReplaySubject
 * eventState is returning connectEvent, as a second element - the function
 * that's connecting state and event (for certain element) - then state
 * value are computed from incoming events. One state field could be connected
 * to multiple events.
 *
 * eventState is taking an operator (that could be piped before) - it's used to compute
 * state value from events - for all connected events. Additionally connectEvent is
 * also taking an (pre-)operator, called per one concrete event, before calling operator for
 * all events - it's enabling connecting different types of events.
 *
 * @param operator
 */
export function eventState<
  SyntheticEvent extends RedEvent,
  MappedEvent extends SyntheticEvent = SyntheticEvent,
  State = MappedEvent
>(
  operator?: (source$: Observable<MappedEvent>) => Observable<State>
): EventState<SyntheticEvent, MappedEvent, State> {
  /**
   * Replay subject - as it's state, it's good (for most cases), to push last state value
   * to new observers.
   */
  const stateSubject = new ReplaySubject<MappedEvent>(1)

  const state$: Observable<State | MappedEvent> = operator
    ? operator(stateSubject.asObservable())
    : stateSubject.asObservable()
  /**
   * Connect event with state
   * Have to be passed to Reactive Event Handler props
   * @param preOperator
   */
  const connectEvent: ConnectEventFn<SyntheticEvent, MappedEvent> = preOperator => (
    event$: Observable<SyntheticEvent>
  ): Observable<MappedEvent> => {
    return pipe(
      preOperator || identity,
      tap<MappedEvent>(event => stateSubject.next(event)),
      catchError(error => {
        stateSubject.error(error)
        return throwError(() => error)
      })
    )(event$)
  }

  return [state$, connectEvent]
}
