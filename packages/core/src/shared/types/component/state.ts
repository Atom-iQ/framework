import type { RvdEvent } from '..'
import { Observable } from 'rxjs'

export type NextStateFn<T> = (valueOrCallback: T | NextStateCallbackFn<T>) => void
export type NextStateCallbackFn<T> = (lastValue: T) => T
export type BehaviorState<T> = [Observable<T>, NextStateFn<T>]

export type ConnectReactiveEventFn<E, T = E> = (
  preOperator?: (source$: Observable<E | RvdEvent<Element>>) => Observable<E>
) => (event$: Observable<E>) => Observable<T>

export type ReactiveEventState<E, T = E> = [Observable<T>, ConnectReactiveEventFn<E, T>]

export type CreateStateFn = <T>(initialState: T) => BehaviorState<T>

export type CreateReactiveEventStateFn = <E extends RvdEvent<Element>, T = E>(
  operatorOrPipedOperators?: (source$: Observable<E>) => Observable<T>
) => ReactiveEventState<E, T>
