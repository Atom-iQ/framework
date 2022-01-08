export function arrRemove<T>(arr: T[] | undefined | null, item: T): void {
  if (arr) {
    const index = arr.indexOf(item)
    0 <= index && arr.splice(index, 1)
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {}

export const compose =
  <A, B, C>(f: (b: B) => C, g: (a: A) => B) =>
  (x: A): C =>
    f(g(x))

export function isFunction(value: unknown): value is Function {
  return typeof (value as Function) === 'function'
}
