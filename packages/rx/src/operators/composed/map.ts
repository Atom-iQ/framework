import { OperatorObserver } from '../../observer'
import { Observable, Observer, Subscription } from '../../types'
import { empty, isEmptyObservable } from '../../observable'
import { compose } from '../../utils'

import { FilterMap } from './filterMap'
import { Filter } from './filter'

export class Map<A, B> implements Observable<B> {
  public readonly f: (a: A) => B
  public readonly source: Observable<A>

  constructor(f: (a: A) => B, source: Observable<A>) {
    this.f = f
    this.source = source
  }

  subscribe(observer: Observer<B>): Subscription {
    return this.source.subscribe(new MapObserver(this.f, observer))
  }

  /**
   * Create a mapped source, fusing adjacent map.map, filter.map,
   * and filter.map.map if possible
   * @param {function(*):*} f mapping function
   * @param {{run:function}} source source to map
   * @returns {Map|FilterMap} mapped source, possibly fused
   */
  static create<A, B>(f: (a: A) => B, source: Observable<A>): Observable<B> {
    if (isEmptyObservable(source)) {
      return empty()
    }

    if (source instanceof Map) {
      return new Map(compose(f, source.f), source.source)
    }

    if (source instanceof Filter) {
      return new FilterMap(source.p, f, source.source)
    }

    return new Map(f, source)
  }
}

class MapObserver<A, B> extends OperatorObserver<A, B> implements Observer<A> {
  private readonly f: (a: A) => B

  constructor(f: (a: A) => B, observer: Observer<B>) {
    super(observer)
    this.f = f
  }

  next(v: A): void {
    const f = this.f
    this.observer.next(f(v))
  }
}
