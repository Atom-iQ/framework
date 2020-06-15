import {isObservable, of, Operator} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {RxO} from 'rx-ui-shared';
import {RxChild} from 'rx-ui-shared/src/types/dom/props';

export const pipe = function<T, R = unknown>(
  $: RxO<T>,
  ...args: Operator<unknown, unknown>[]
): RxO<R> {
  // Problem with rxjs pipe typing
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return $.pipe(...args);
};
export const p = pipe;

export const mapString = function($: RxO<string>, mapFn: (str: string) => string): RxO<string> {
  return p($, map(mapFn));
};
export const mS = mapString;

export const observableIf = function<T>(
  $: RxO<T>,
  ifTrue: RxChild,
  ifFalse?: RxChild
): RxChild {
  const getIfTrue$ = () => isObservable(ifTrue) ? ifTrue : of(ifTrue);
  const getIfFalse$ = () => ifFalse && isObservable(ifFalse) ?
    ifFalse :
    of(ifFalse || null);

  const shouldMap = ifFalse ?
    !isObservable(ifTrue) && !isObservable(ifFalse) :
    !isObservable(ifTrue);

  return p(
    $,
    shouldMap ?
      map((value: T) => {
        const booleanValue = Boolean(value);
        return booleanValue ? ifTrue : (ifFalse || null);
      }) :
      switchMap((value: T) => {
        const booleanValue = Boolean(value);
        return booleanValue ? getIfTrue$() : getIfFalse$();
      })
  );
};

export const oIf = observableIf;
