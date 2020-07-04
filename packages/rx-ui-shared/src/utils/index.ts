import {TOrTInCallback, UnknownObject} from '../..';
import {Observable} from 'rxjs';

export const ERROR_MSG = 'Default Error :/';

export const isArray = Array.isArray;

export function isStringOrNumber(value: unknown): value is string | number {
  const type = typeof value;

  return type === 'string' || type === 'number';
}

export function isNullOrUndef(value: unknown): value is undefined | null {
  return value === void 0 || value === null;
}

export function isInvalid(value: unknown): value is null | boolean | undefined {
  return (
    value === null ||
    value === false ||
    value === true ||
    value === void 0
  );
}

export function isFunction(
  value: unknown
): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isObservable(value: unknown): value is Observable<unknown> {
  return value instanceof Observable;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === void 0;
}

export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

export function throwError(message?: string): void {
  if (!message) {
    message = ERROR_MSG;
  }
  throw new Error(`rx-UI Error: ${message}`);
}

export function combineFrom(
  first: UnknownObject | null,
  second: UnknownObject | null
): UnknownObject {
  const out: UnknownObject = {};
  if (first) {
    Object.keys(first).forEach(key => out[key] = first[key]);
  }
  if (second) {
    Object.keys(second).forEach(key => out[key] = second[key]);
  }
  return out;
}


export function getElementIndexInArray<T = unknown>(
  elementOrCallback: TOrTInCallback<T, boolean>,
  array: T[]
): number  {
  return isFunction(elementOrCallback) ?
    array.findIndex(elementOrCallback) :
    array.indexOf(elementOrCallback);
}

export function isElementFirstInArray<T = unknown>(
  elementOrCallback: TOrTInCallback<T, boolean>,
  array: T[]
): boolean {
  return isIndexFirstInArray(
    getElementIndexInArray(elementOrCallback, array)
  );
}

export function isIndexFirstInArray<T = unknown>(
  index: number
): boolean {
  return index === 0;
}

export function isElementLastInArray<T = unknown>(
  elementOrCallback: TOrTInCallback<T, boolean>,
  array: T[]
): boolean {
  return isIndexLastInArray(
    getElementIndexInArray(elementOrCallback, array),
    array
  );
}

export function isIndexLastInArray<T = unknown>(
  index: number,
  array: T[]
): boolean {
  return index === array.length - 1;
}
