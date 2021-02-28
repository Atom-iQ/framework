import type { RvdEvent } from '..'
import { Observable } from 'rxjs'

/* -------------------------------------------------------------------------------------------
 * Behavior State - factory - createState()
 * ------------------------------------------------------------------------------------------- */

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
 * Observable state (transformed from event) and corresponding connectEvent function
 */
export type EventState<SyntheticEvent extends RvdEvent, T = SyntheticEvent> = [
  Observable<T>,
  ConnectEventFn<SyntheticEvent>
]
/**
 * Connect event function, takes preOperator to apply on event, before transforming it to state,
 * returns Atom-iQ RED Reactive event handler
 */
export type ConnectEventFn<SyntheticEvent extends RvdEvent> = () => (event: SyntheticEvent) => void
