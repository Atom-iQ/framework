export interface Setoid<T> {
  equals: <A, B>(s: Setoid<A>, b: Setoid<B>) => boolean
}

export interface Ord<T> extends Setoid<T> {
  lte: <A, B>(a: Ord<A>, b: Ord<B>) => boolean
}

export interface Semigroup<T> {
  concat: <A, B>(a: Semigroup<A>, b: Semigroup<B>) => Semigroup<A & B>
}

export interface Monoid<T> extends Semigroup<T> {
  empty: <A>() => Monoid<A>
}

export interface Group<T> {
  invert: <A>(a: Group<A>) => Group<A>
}

export interface Semigroupoid<T, U> {
  compose: <A, B, C>(a: Semigroupoid<A, B>, b: Semigroupoid<B, C>) => Semigroupoid<A, C>
}

export interface Category<T, U> {
  id: <A, B>() => Category<A, B>
}

export interface Filterable<T> {
  filter: <A>(a: (a: A) => boolean, s: Filterable<A>) => Filterable<A>
}

export interface Functor<T> {
  map: <A, B>(f: (a: A) => B, s: Functor<A>) => Functor<B>
}

export interface Bifunctor<T> {
  bimap: <A, B, C, D>(fn1: (a: A) => B, fn2: (c: C) => D, s: Bifunctor<A & C>) => Bifunctor<B & D>
}

export interface Apply<T> extends Functor<T> {
  ap: <A, B>(f: (a: Apply<A>) => Apply<B>, s: Apply<A>) => Apply<B>
}

export interface Applicative<T> extends Apply<T> {
  of: <A>(a: A) => Applicative<A>
}

export interface Chain<T> extends Apply<T> {
  chain: <A, B>(f: (a: A) => Chain<B>, s: Chain<A>) => Chain<B>
}

export interface Monad<T> extends Applicative<T>, Chain<T> {}

export interface Foldable<T> {
  reduce: <A, B>(f: (a: A, b: B) => A, a: A, s: Foldable<B>) => A
}

export interface Extend<T> extends Functor<T> {
  extend: <A, B>(f: (a: Extend<A>) => B, s: Extend<A>) => Extend<B>
}

export interface Comonad<T> extends Extend<T> {
  extract: <A>(s: Comonad<A>) => A
}

export interface Traversable<T> extends Functor<T>, Foldable<T> {
  traverse: <X extends Applicative<B>, Y extends Applicative<Traversable<X>>, A, B>(
    x: X,
    f: (a: A) => X,
    s: Traversable<A>
  ) => Y
}
