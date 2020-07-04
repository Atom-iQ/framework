export type UnknownObject = Record<string, unknown>;
export type AnyFunction = (...args: unknown[]) => unknown;
export type TOrEmpty<T> = T | null | undefined;
export type TOrTInCallback<T, R = void> = T | ((arg: T) => R);

