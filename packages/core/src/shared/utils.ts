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

/**
 * Functional implementation of basic for loop, that's iterating over array items. It looks similar
 * to native Array.prototype.forEach() method, doing "exactly" the same. But forEach() couldn't
 * be used in top performance framework, because unfortunately declarative Array instance methods,
 * like forEach, are a lot slower than classic, most basic version of imperative for loop.
 *
 * However Atom-iQ is written with functional, declarative approach, using a lot of functional
 * programming concepts, especially closures and partial application - in most of the framework
 * code. In fact, the Atom-iQ RVD Renderer is composed from partially applicable functions and multiple
 * levels of the closure scopes.
 * Because of following functional approach, Atom-iQ has own, internal, declarative and functional
 * abstraction over the fastest imperative JavaScript statements/operations - based on JS declarative
 * Array instance methods, some Object static methods and custom, own solutions. But in Atom-iQ, they
 * are a functions, instead of methods - they're taking Array/Object reference or other supported
 * value as first argument, instead of using it as this reference in methods.
 * That functions should be internal, because they are "unsafe" - as long as they are used only internally,
 * it could be assumed, that they will be always called with correct values, so, for better performance,
 * they has not any checks, conditions, and error or edge case handling - they are only calling "raw"
 * imperative statements/operations - thanks to it, they had nice functional interface and great
 * performance, similar to imperative statements performance. But "external" functions, dedicated
 * to users should have those additional checks.
 *
 * @param array
 * @param callback
 */
export function arrayLoop<T>(array: T[], callback: (item: T, index: number) => void): void {
  for (let i = 0, l = array.length; i < l; ++i) callback(array[i], i)
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

export function objectLoop<T extends {}>(
  object: T,
  callback: (value: T[Extract<keyof T, string>], key: keyof T) => void
): void {
  for (const key in object) callback(object[key], key)
}

export function arrayEvery<T>(array: T[], predicate: (item: T, index: number) => boolean): boolean {
  for (let i = 0, l = array.length; i < l; ++i) {
    if (!predicate(array[i], i)) return false
  }
  return true
}

export function arraySome<T>(array: T[], predicate: (item: T, index: number) => boolean): boolean {
  for (let i = 0, l = array.length; i < l; ++i) {
    if (predicate(array[i], i)) return true
  }
  return false
}

export function arrayLast<T>(array: T[]): T {
  return array[array.length - 1]
}
