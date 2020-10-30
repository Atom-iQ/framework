import type { RvdSyntheticEvent } from '..'
import { Observable } from 'rxjs'

export type NextStateFn<T> = (valueOrCallback: T | NextStateCallbackFn<T>) => void
export type NextStateCallbackFn<T> = (lastValue: T) => T
export type BehaviorState<T> = [Observable<T>, NextStateFn<T>]

export type ConnectReactiveEventFn<
  SyntheticEvent extends RvdSyntheticEvent,
  MappedEvent extends RvdSyntheticEvent = SyntheticEvent
> = (
  preOperator?: (source$: Observable<SyntheticEvent>) => Observable<MappedEvent>
) => (event$: Observable<SyntheticEvent>) => Observable<MappedEvent>

export type ReactiveEventState<
  SyntheticEvent extends RvdSyntheticEvent,
  MappedEvent extends RvdSyntheticEvent = SyntheticEvent,
  T = MappedEvent
> = [Observable<T>, ConnectReactiveEventFn<SyntheticEvent, MappedEvent>]

export type CreateStateFn = <T>(initialState: T) => BehaviorState<T>

export type CreateReactiveEventStateFn = <
  SyntheticEvent extends RvdSyntheticEvent,
  MappedEvent extends SyntheticEvent = SyntheticEvent,
  T = MappedEvent
>(
  operatorOrPipedOperators?: (source$: Observable<MappedEvent>) => Observable<T>
) => ReactiveEventState<SyntheticEvent, MappedEvent, T>
