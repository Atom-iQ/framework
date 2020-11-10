/**
 * @function isArray
 */
export const isArray = Array.isArray

export function isStringOrNumber(value: unknown): value is string | number {
  const type = typeof value

  return type === 'string' || type === 'number'
}

export function isNullOrUndef(value: unknown): value is undefined | null {
  return value === void 0 || value === null
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false
}

/**
 * n(v) is function, for quick, inline converting string to number.
 * It could optionally take boolean or another number as arg.
 * One letter function name is intentional here, as well as for s(v) function,
 * string - number castings are commonly used "inline" and it should be compact.
 * @param v
 */
export function n<T extends string | boolean | number = string>(v: T): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (v as any) - 0
}

/**
 * s(v) is function, for quick, inline converting number to string.
 * It could optionally take any other supported value type.
 * One letter function name is intentional here, as well as for n(v) function,
 * number - string castings are commonly used "inline" and it should be compact.
 * @param v
 */
export function s<T = number>(v: T): string {
  return '' + v
}

/**
 * Functional implementation of basic imperative for loop, running number of iterations specified
 * in the first argument. On each iteration, it's calling callback function from the second argument,
 * passing current iteration index as a callback's argument. loop() is starting counting its iteration
 * indexes from 0 by default, but it could be changed by the third, optional argument
 * Third argument, startingIterationIndex is optional, allowing starting from different index number.
 * @param iterationsCount
 * @param callback
 * @param initialIterationIndex
 */
export function loop(
  iterationsCount: number,
  callback: (iterationIndex: number) => void,
  initialIterationIndex = 0
): void {
  // Return instantly, when iterations count is 0
  if (!iterationsCount) return
  // Increment iterations count, by (eventual) initial iteration index (defaults to 0),
  // to keep correct number of iterations (starting/initial iterator, will be also incremented
  // by the same number).
  // Probably only alternative here, is passing current iteration index, incremented by initial
  // iteration index to callback, but it will be summing operation, on every iteration, that's
  // completely inefficient, compared to implemented solution - the only one summing operation
  // per loop.
  iterationsCount = iterationsCount + initialIterationIndex
  // Start imperative for loop - init iterator as initial iteration index (0 by default)
  // Call callback function for each iteration.
  for (let i = initialIterationIndex; i < iterationsCount; ++i) callback(i)
}

export function arrayReduce<T, R>(
  array: T[],
  callback: (accumulator: R, current: T, index: number) => R,
  initial: R
): R {
  let result = initial
  for (let i = 0, l = array.length; i < l; ++i) result = callback(result, array[i], i)
  return result
}

export function arrayEvery<T>(array: T[], predicate: (item: T, index: number) => boolean): boolean {
  for (let i = 0, l = array.length; i < l; ++i) {
    if (!predicate(array[i], i)) return false
  }
  return true
}
