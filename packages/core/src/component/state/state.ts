import {BehaviorSubject} from 'rxjs';
import {RxO, RxBS, isFunction, rxComponent} from 'rx-ui-shared';
import {first} from 'rxjs/operators';

const rxState = function<T extends unknown = unknown>(
  initialState: T
): rxComponent.RxState<T> {
  const stateSubject: RxBS<T> =
    new BehaviorSubject(initialState);

  const state$: RxO<T> = stateSubject.asObservable();
  const setState: rxComponent.RxSetStateFn<T> = valueOrCallback  => {
    if (isFunction(valueOrCallback)) {
      state$.pipe(
        first()
      ).subscribe(valueOrCallback);
    } else {
      stateSubject.next(<T>valueOrCallback);
    }
  };

  return [state$, setState, stateSubject];
};

export default rxState;
