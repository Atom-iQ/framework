import {BehaviorSubject} from 'rxjs';
import {TOrEmpty, Rx, isFunction} from 'rx-ui-shared';
import {first} from 'rxjs/operators';

type SetStateCallback<T> = (value: TOrEmpty<T>) => TOrEmpty<T>;
type SetStateFn<T> =
  (valueOrCallback: TOrEmpty<T> | SetStateCallback<T>) => void;

const rxState = function<T>(
  initialState: TOrEmpty<T>
): [
  Rx<TOrEmpty<T>>,
  SetStateFn<T>,
  Rx<TOrEmpty<T>, BehaviorSubject<TOrEmpty<T>>>
] {
  const stateSubject: BehaviorSubject<TOrEmpty<T>> =
    new BehaviorSubject(initialState);

  const state$: Rx<TOrEmpty<T>> = stateSubject.asObservable();
  const setState: SetStateFn<T> = valueOrCallback  => {
    if (isFunction(valueOrCallback)) {
      state$.pipe(
        first()
      ).subscribe(valueOrCallback);
    } else {
      stateSubject.next(<TOrEmpty<T>>valueOrCallback);
    }
  };

  return [state$, setState, stateSubject];
};

export default rxState;
