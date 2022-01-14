import type { ConnectEventFn, EventState, RvdEvent } from 'types'
import { stateSubject } from '@atom-iq/rx'

/**
 * Create event state (ReplaySubject)
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
 * @param initialValue
 * @param transformEvent
 */
export function eventState<SyntheticEvent extends RvdEvent, State = SyntheticEvent>(
  initialValue: State,
  transformEvent?: (event: SyntheticEvent) => State
): EventState<SyntheticEvent, State> {
  /**
   * Replay subject - as it's state, it's good (for most cases), to push last state value
   * to new observers.
   */
  const state = stateSubject<State>(initialValue)
  /**
   * Connect event with state
   * Have to be passed to Reactive Event Handler props
   */
  const connectEvent: ConnectEventFn<SyntheticEvent> = () => event => {
    state.next(transformEvent ? transformEvent(event) : (event as unknown as State))
  }

  return [state, connectEvent]
}
