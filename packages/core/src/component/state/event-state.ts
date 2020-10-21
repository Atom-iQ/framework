import type { ConnectReactiveEventFn, CreateReactiveEventStateFn } from '../../shared/types'
import { Observable, pipe, ReplaySubject, throwError } from 'rxjs'
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
export const eventState: CreateReactiveEventStateFn = <E, T = E>(operator) => {
  /**
   * Replay subject - as it's state, it's good (for most cases), to push last state value
   * to new observers.
   */
  const stateSubject = new ReplaySubject<T>(1)

  const state$: Observable<T> = stateSubject.asObservable()
  /**
   * Connect event with state
   * Have to be passed to Reactive Event Handler props
   * @param preOperator
   */
  const connectEvent: ConnectReactiveEventFn<E, T> = preOperator => (event$: Observable<E>) => {
    const source$ = operator
      ? preOperator
        ? operator(preOperator(event$))
        : operator(event$)
      : preOperator
      ? preOperator(event$)
      : event$

    return pipe(
      tap<T>(event => stateSubject.next(event)),
      catchError(error => {
        stateSubject.error(error)
        return throwError(() => error)
      })
    )(source$)
  }

  return [state$, connectEvent]
}
