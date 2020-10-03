import { RxO } from '../rxjs'
import { RvdEvent } from '..'

export type NextStateFn<T> = (valueOrCallback: T | NextStateCallbackFn<T>) => void
export type NextStateCallbackFn<T> = (lastValue: T) => T
export type BehaviorState<T> = [RxO<T>, NextStateFn<T>]

export type ConnectReactiveEventFn<E, T = E> = (
  preOperator?: (source$: RxO<E | RvdEvent<Element>>) => RxO<E>
) => (event$: RxO<E>) => RxO<T>

export type ReactiveEventState<E, T = E> = [RxO<T>, ConnectReactiveEventFn<E, T>]

export type CreateStateFn = <T>(initialState: T) => BehaviorState<T>

export type CreateReactiveEventStateFn = <E extends RvdEvent<Element>, T = E>(
  operatorOrPipedOperators?: (source$: RxO<E>) => RxO<T>
) => ReactiveEventState<E, T>
