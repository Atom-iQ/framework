/* eslint-disable @typescript-eslint/no-explicit-any */

export type AnyFunction = (...args: any[]) => any

export type Predicate<A> = (a: A) => boolean
export type SideEffect<A> = (v: A) => unknown

export type Pipeable<A, B> = (a: A) => B
export type GenericPipeable = <A, B>(a: A) => B

export interface Pipeline {
  <A>(value: A): A
  <A, B>(value: A, fn1: Pipeable<A, B>): B
  <A, B, C>(value: A, fn1: Pipeable<A, B>, fn2: Pipeable<B, C>): C
  <A, B, C, D>(value: A, fn1: Pipeable<A, B>, fn2: Pipeable<B, C>, fn3: Pipeable<C, D>): D
  <A, B, C, D, E>(
    value: A,
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>
  ): E
  <A, B, C, D, E, F>(
    value: A,
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>
  ): F
  <A, B, C, D, E, F, G>(
    value: A,
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>
  ): G
  <A, B, C, D, E, F, G, H>(
    value: A,
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>,
    fn7: Pipeable<G, H>
  ): H
  <A, B, C, D, E, F, G, H, I>(
    value: A,
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>,
    fn7: Pipeable<G, H>,
    fn8: Pipeable<H, I>
  ): I
  <A, B, C, D, E, F, G, H, I, J>(
    value: A,
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>,
    fn7: Pipeable<G, H>,
    fn8: Pipeable<H, I>,
    fn9: Pipeable<I, J>
  ): J
  <A, B, C, D, E, F, G, H, I, J, K>(
    value: A,
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>,
    fn7: Pipeable<G, H>,
    fn8: Pipeable<H, I>,
    fn9: Pipeable<I, J>,
    fn10: Pipeable<J, K>
  ): K
  <A, R>(value: A, ...fns: GenericPipeable[]): R
  <A, F extends GenericPipeable[]>(value: A, ...fns: F): InferPipelineResult<A, F>
  <A, F extends GenericPipeable[], R extends InferPipelineResult<A, F>>(value: A, ...fns: F): R
}

export interface Pipe {
  <A>(): Pipeable<A, A>
  <A, B>(fn1: Pipeable<A, B>): Pipeable<A, B>
  <A, B, C>(fn1: Pipeable<A, B>, fn2: Pipeable<B, C>): Pipeable<A, C>
  <A, B, C, D>(fn1: Pipeable<A, B>, fn2: Pipeable<B, C>, fn3: Pipeable<C, D>): Pipeable<A, D>
  <A, B, C, D, E>(
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>
  ): Pipeable<A, E>
  <A, B, C, D, E, F>(
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>
  ): Pipeable<A, F>
  <A, B, C, D, E, F, G>(
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>
  ): Pipeable<A, G>
  <A, B, C, D, E, F, G, H>(
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>,
    fn7: Pipeable<G, H>
  ): Pipeable<A, H>
  <A, B, C, D, E, F, G, H, I>(
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>,
    fn7: Pipeable<G, H>,
    fn8: Pipeable<H, I>
  ): Pipeable<A, I>
  <A, B, C, D, E, F, G, H, I, J>(
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>,
    fn7: Pipeable<G, H>,
    fn8: Pipeable<H, I>,
    fn9: Pipeable<I, J>
  ): Pipeable<A, J>
  <A, B, C, D, E, F, G, H, I, J, K>(
    fn1: Pipeable<A, B>,
    fn2: Pipeable<B, C>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<F, G>,
    fn7: Pipeable<G, H>,
    fn8: Pipeable<H, I>,
    fn9: Pipeable<I, J>,
    fn10: Pipeable<J, K>
  ): Pipeable<A, K>
  <A, R>(...fns: GenericPipeable[]): Pipeable<A, R>
  <A, F extends GenericPipeable[]>(...fns: F): Pipeable<A, InferPipelineResult<A, F>>
  <A, F extends GenericPipeable[], R extends InferPipelineResult<A, F>>(...fns: F): Pipeable<A, R>
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type InferPipelineResult<A, F extends GenericPipeable[]> = F extends [(a: any) => infer R]
  ? R
  : F extends [...any, (a: any) => infer R]
  ? R
  : A

export interface Compose {
  <A>(): Pipeable<A, A>
  <A, B>(fn1: Pipeable<A, B>): Pipeable<A, B>
  <A, B, C>(fn1: Pipeable<B, C>, fn2: Pipeable<A, B>): Pipeable<A, C>
  <A, B, C, D>(fn1: Pipeable<C, D>, fn2: Pipeable<B, C>, fn3: Pipeable<A, B>): Pipeable<A, D>
  <A, B, C, D, E>(
    fn1: Pipeable<D, E>,
    fn2: Pipeable<C, D>,
    fn3: Pipeable<B, C>,
    fn4: Pipeable<A, B>
  ): Pipeable<A, E>
  <A, B, C, D, E, F>(
    fn1: Pipeable<E, F>,
    fn2: Pipeable<D, E>,
    fn3: Pipeable<C, D>,
    fn4: Pipeable<B, C>,
    fn5: Pipeable<A, B>
  ): Pipeable<A, F>
  <A, B, C, D, E, F, G>(
    fn1: Pipeable<F, G>,
    fn2: Pipeable<E, F>,
    fn3: Pipeable<D, E>,
    fn4: Pipeable<C, D>,
    fn5: Pipeable<B, C>,
    fn6: Pipeable<A, B>
  ): Pipeable<A, G>
  <A, B, C, D, E, F, G, H>(
    fn1: Pipeable<G, H>,
    fn2: Pipeable<F, G>,
    fn3: Pipeable<E, F>,
    fn4: Pipeable<D, E>,
    fn5: Pipeable<C, D>,
    fn6: Pipeable<B, C>,
    fn7: Pipeable<A, B>
  ): Pipeable<A, H>
  <A, B, C, D, E, F, G, H, I>(
    fn1: Pipeable<H, I>,
    fn2: Pipeable<G, H>,
    fn3: Pipeable<F, G>,
    fn4: Pipeable<E, F>,
    fn5: Pipeable<D, E>,
    fn6: Pipeable<C, D>,
    fn7: Pipeable<B, C>,
    fn8: Pipeable<A, B>
  ): Pipeable<A, I>
  <A, B, C, D, E, F, G, H, I, J>(
    fn1: Pipeable<I, J>,
    fn2: Pipeable<H, I>,
    fn3: Pipeable<G, H>,
    fn4: Pipeable<F, G>,
    fn5: Pipeable<E, F>,
    fn6: Pipeable<D, E>,
    fn7: Pipeable<C, D>,
    fn8: Pipeable<B, C>,
    fn9: Pipeable<A, B>
  ): Pipeable<A, J>
  <A, B, C, D, E, F, G, H, I, J, K>(
    fn1: Pipeable<J, K>,
    fn2: Pipeable<I, J>,
    fn3: Pipeable<H, I>,
    fn4: Pipeable<G, H>,
    fn5: Pipeable<F, G>,
    fn6: Pipeable<E, F>,
    fn7: Pipeable<D, E>,
    fn8: Pipeable<C, D>,
    fn9: Pipeable<B, C>,
    fn10: Pipeable<A, B>
  ): Pipeable<A, K>
  <A, R>(...fns: GenericPipeable[]): Pipeable<A, R>
  <A, F extends GenericPipeable[]>(...fns: F): Pipeable<A, InferComposedResult<A, F>>
  <A, F extends GenericPipeable[], R extends InferComposedResult<A, F>>(...fns: F): Pipeable<A, R>
}

export type InferComposedResult<A, F extends Readonly<GenericPipeable[]>> = F extends []
  ? A
  : F[0] extends (...args: any[]) => infer R
  ? R
  : never

export type Curried<F extends (...args: any[]) => any> = F extends () => infer A
  ? () => A
  : F extends (a: infer A) => infer B
  ? Curried1<A, B>
  : F extends (a: infer A, b: infer B) => infer C
  ? Curried2<A, B, C>
  : F extends (a: infer A, b: infer B, c: infer C) => infer D
  ? Curried3<A, B, C, D>
  : F extends (a: infer A, b: infer B, c: infer C, d: infer D) => infer E
  ? Curried4<A, B, C, D, E>
  : (...args: any[]) => any
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface Curried1<A, B> {
  (): Curried1<A, B>
  (a: A): B
}

export type Curried1Result<A, B> = Curried1<A, B> | B

export interface Curried2<A, B, C> {
  (): Curried2<A, B, C>
  (a: A): Pipeable<B, C>
  (a: A, b: B): C
}

export type Curried2Result<A, B, C> = Curried2<A, B, C> | ((b: B) => C) | C

export interface Curried3<A, B, C, D> {
  (): Curried3<A, B, C, D>
  (a: A): Curried2<B, C, D>
  (a: A, b: B): Pipeable<C, D>
  (a: A, b: B, c: C): D
}

export type Curried3Result<A, B, C, D> =
  | Curried3<A, B, C, D>
  | Curried2<B, C, D>
  | ((c: C) => D)
  | D

export interface Curried4<A, B, C, D, E> {
  (): Curried4<A, B, C, D, E>
  (a: A): Curried3<B, C, D, E>
  (a: A, b: B): Curried2<C, D, E>
  (a: A, b: B, c: C): Pipeable<D, E>
  (a: A, b: B, c: C, d: D): E
}

export type Curried4Result<A, B, C, D, E> =
  | Curried4<A, B, C, D, E>
  | Curried3<B, C, D, E>
  | Curried2<C, D, E>
  | ((d: D) => E)
  | E

/**
 * Constructs a new tuple with the specified type at the head.
 * If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.
 */
export type Cons<X, Y extends readonly any[]> = ((arg: X, ...rest: Y) => any) extends (
  ...args: infer U
) => any
  ? U
  : never

/**
 * Extracts the head of a tuple.
 * If you declare `Head<[A, B, C]>` you will get back `A`.
 */
export type Head<X extends readonly any[]> = ((...args: X) => any) extends (
  arg: infer U,
  ...rest: any[]
) => any
  ? U
  : never

/**
 * Extracts the tail of a tuple.
 * If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.
 */
export type Tail<X extends readonly any[]> = ((...args: X) => any) extends (
  arg: any,
  ...rest: infer U
) => any
  ? U
  : never

export type Last<X extends readonly any[]> = ((...args: X) => any) extends (arg: infer L) => any
  ? L
  : ((...args: X) => any) extends (arg: any, ...rest: infer U) => any
  ? Last<U>
  : never

type A = Last<['A', 'B', 'C', 'D']>

/**
 * Extracts the generic value from an Array type.
 * If you have `T extends Array<any>`, and pass a `string[]` to it,
 * `ValueFromArray<T>` will return the actual type of `string`.
 */
export type ValueFromArray<A extends readonly unknown[]> = A extends Array<infer T> ? T : never

/**
 * A simple type to represent a gamut of "falsy" values... with a notable exception:
 * `NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
 * comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
 */
export type Falsy = null | undefined | false | 0 | -0 | 0n | ''

export type TruthyTypesOf<T> = T extends Falsy ? never : T
