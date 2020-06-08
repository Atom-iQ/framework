import {isObservable, of, Operator} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Rx, rxComponent} from 'rx-ui-shared';

export const pipe = function<T>(
  $: Rx<T>,
  ...args: Operator<unknown, unknown>[]
): Rx<unknown> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return $.pipe(...args);
};
export const p = pipe;

export const mapString = function<T>($: Rx<T>, mapFn: (str: string) => string) {
  return p($, map(mapFn));
};
export const mS = mapString;

export const observableIf = function<T>(
  $: Rx<T>,
  ifTrue: rxComponent.RxChild,
  ifFalse: rxComponent.RxChild = null
): Rx<unknown> {
  const getIfTrue$ = () => isObservable(ifTrue) ? ifTrue : of(ifTrue);
  const getIfFalse$ = () => isObservable(ifFalse) ? ifFalse : of(ifFalse);

  const shouldMap = !isObservable(ifTrue) && !isObservable(ifFalse);

  return p(
    $,
    shouldMap ?
      map((value: T) => {
        const booleanValue = Boolean(value);
        return booleanValue ? ifTrue : ifFalse;
      }) :
      switchMap((value: T) => {
        const booleanValue = Boolean(value);
        return booleanValue ? getIfTrue$() : getIfFalse$();
      })
  );
};

export const oIf = observableIf;
