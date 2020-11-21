import type { RedEvent } from '..'
import { Observable } from 'rxjs'

/* -------------------------------------------------------------------------------------------
 * Behavior State - factory - createState()
 * ------------------------------------------------------------------------------------------- */

/**
 * Create state factory function - takes initial value as optional arg (if not set, state
 * will be null on init), returns created BehaviorState
 */
export type CreateStateFactoryFn<T> = (initialState: T) => BehaviorState<T>
/**
 * Observable state and corresponding nextState function
 */
export type BehaviorState<T> = [Observable<T>, NextStateFn<T>]
/**
 * Next state function - takes value or callback function (described below) as arg
 */
export type NextStateFn<T> = (valueOrCallback: T | NextStateCallbackFn<T>) => void
/**
 * Next state (argument) callback function - takes last value as arg, returns new value
 */
export type NextStateCallbackFn<T> = (lastValue: T) => T

/* -------------------------------------------------------------------------------------------
 * Event State - factory - eventState()
 * ------------------------------------------------------------------------------------------- */

/**
 * Event state factory function - takes optional, operator arg - responsible for transforming
 * synthetic event stream to state
 */
export type EventStateFactoryFn = <
  SyntheticEvent extends RedEvent,
  MappedEvent extends SyntheticEvent = SyntheticEvent,
  T = MappedEvent
>(
  operator?: (source$: Observable<MappedEvent>) => Observable<T>
) => EventState<SyntheticEvent, MappedEvent, T>
/**
 * Observable state (transformed from event) and corresponding connectEvent function
 */
export type EventState<
  SyntheticEvent extends RedEvent,
  MappedEvent extends RedEvent = SyntheticEvent,
  T = MappedEvent
> = [Observable<T | MappedEvent>, ConnectEventFn<SyntheticEvent, MappedEvent>]
/**
 * Connect event function, takes preOperator to apply on event, before transforming it to state,
 * returns Atom-iQ RED Reactive event handler
 */
export type ConnectEventFn<
  SyntheticEvent extends RedEvent,
  MappedEvent extends RedEvent = SyntheticEvent
> = (
  preOperator?: (source$: Observable<SyntheticEvent>) => Observable<MappedEvent>
) => (event$: Observable<SyntheticEvent>) => Observable<MappedEvent>

export type ConnectMutableObjectState<T extends Object> = (
  fieldName?: keyof T
) => Observable<T | T[keyof T]>

export type MutableObjectState<T extends Object> = [T, ConnectMutableObjectState<T>]
