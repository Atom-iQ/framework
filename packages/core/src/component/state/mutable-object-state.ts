import type { ConnectMutableObjectState, MutableObjectState } from '../../shared/types'
import { BehaviorSubject, Observable } from 'rxjs'
import { distinctUntilChanged, pluck } from 'rxjs/operators'

/**
 * Mutable object state (experimental)
 *
 * Creates internal BehaviorSubject, internal state object (copy of initialState)
 * and mutable object state, with the same properties as internal state, but
 * re-created with getters and setters. Returns mutable object state and
 * connect function - property getters are getting values synchronously
 * from internal state, property setters are setting values in internal
 * state object and then emitting it with subject.
 *
 * State object could be used as static, synchronous value in component functions,
 * but shouldn't be passed to Reactive Virtual DOM (as renderer will treat it as static
 * value). Instead, Observable of property value should be passed, by using connect function.
 * @param initialState
 */
export function mutableObjectState<T extends {}>(initialState: T): MutableObjectState<T> {
  const internalState = Object.assign({}, initialState)
  const stateSubject = new BehaviorSubject<T>(internalState)

  const stream: Observable<T> = stateSubject.asObservable()

  const connect: ConnectMutableObjectState<T> = function (fieldName) {
    if (!fieldName) {
      return stream
    }

    return distinctUntilChanged<T[keyof T]>()(pluck<T, keyof T>(fieldName)(stream))
  }

  const state = {}
  const keys = Object.keys(internalState)

  for (let i = 0, l = keys.length; i < l; ++i) {
    const key = keys[i]
    Object.defineProperty(state, key, {
      configurable: true,
      enumerable: true,
      get: function () {
        return internalState[key]
      },
      set: function (value) {
        internalState[key] = value
        stateSubject.next(internalState)
      }
    })
  }

  return [state as T, connect]
}
