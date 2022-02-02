import { Observable } from '../../types'
import { empty, isEmptyObservable } from '../../observable'
import { and, callBoth, composeBoth } from '../../utils'

import { Filter } from './filter'
import { FilterMap } from './filterMap'
import { Map } from './map'
import { MapFilter } from './mapFilter'
import { Tap } from './tap'
import { TapMap } from './tapMap'
import { TapFilter } from './tapFilter'
import { MapTap } from './mapTap'
import { FilterTap } from './filterTap'

export const composeMap = <A, B>(f: (a: A) => B, source: Observable<A>): Observable<B> => {
  if (isEmptyObservable(source)) {
    return empty()
  }

  if (source instanceof Map) {
    return new Map(composeBoth(f, source.f), source.s)
  }

  if (source instanceof Filter) {
    return new FilterMap(source.p, f, source.s)
  }

  if (source instanceof FilterMap) {
    return new FilterMap(source.p, composeBoth(f, source.f), source.s)
  }

  if (source instanceof Tap) {
    return new TapMap(source.f, f, source.s)
  }

  if (source instanceof TapMap) {
    return new TapMap(source.t, composeBoth(f, source.f), source.s)
  }

  return new Map(f, source)
}

export const composeFilter = <A>(p: (a: A) => boolean, source: Observable<A>): Observable<A> => {
  if (isEmptyObservable(source)) {
    return source
  }

  if (source instanceof Filter) {
    return new Filter<A>(and(source.p, p), source.s)
  }

  if (source instanceof Map) {
    return new MapFilter(source.f, p, source.s)
  }

  if (source instanceof MapFilter) {
    return new MapFilter(source.f, and(source.p, p), source.s)
  }

  if (source instanceof Tap) {
    return new TapFilter(source.f, p, source.s)
  }

  if (source instanceof TapFilter) {
    return new TapFilter(source.f, and(source.p, p), source.s)
  }

  return new Filter(p, source)
}

export const composeTap = <A>(f: (a: A) => unknown, source: Observable<A>): Observable<A> => {
  if (isEmptyObservable(source)) {
    return source
  }

  if (source instanceof Tap) {
    return new Tap(callBoth<A>(source.f, f), source.s)
  }

  if (source instanceof Map) {
    return new MapTap(source.f, f, source.s)
  }

  if (source instanceof MapTap) {
    return new MapTap(source.f, callBoth<A>(source.t, f), source.s)
  }

  if (source instanceof Filter) {
    return new FilterTap(source.p, f, source.s)
  }

  if (source instanceof FilterTap) {
    return new FilterTap(source.p, callBoth<A>(source.f, f), source.s)
  }

  return new Tap(f, source)
}
