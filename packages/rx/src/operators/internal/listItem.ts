import { Observable, Observer, Subscription } from '../../types'
import { OperatorObserver } from '../../observer/operatorObserver'

export const nonKeyedListItem = <T>(
  i: number,
  n: keyof T | undefined,
  source: Observable<T[]>
): Observable<T | T[keyof T]> => new NonKeyedListItem<T>(i, n, source)

export const keyedListItem = <T>(
  k: string | number,
  n: keyof T | undefined,
  source: Observable<Record<string | number, T>>
): Observable<T | T[keyof T]> => new KeyedListItem(k, n, source)

class NonKeyedListItem<T> implements Observable<T | T[keyof T]> {
  private readonly i: number
  private readonly n: keyof T | undefined
  private readonly source: Observable<T[]>

  constructor(i: number, n: keyof T | undefined, source: Observable<T[]>) {
    this.i = i
    this.n = n
    this.source = source
  }

  subscribe(observer: Observer<T | T[keyof T]>): Subscription {
    return this.source.subscribe(new NonKeyedListItemObserver<T>(this.i, this.n, observer))
  }
}

class NonKeyedListItemObserver<T>
  extends OperatorObserver<T[], T | T[keyof T]>
  implements Observer<T[]>
{
  private readonly i: number
  private readonly n: keyof T | undefined

  constructor(i: number, n: keyof T | undefined, observer: Observer<T | T[keyof T]>) {
    super(observer)
    this.i = i
    this.n = n
  }

  next(d: T[]): void {
    const i = this.i
    const n = this.n
    d && d[i] && this.observer.next(n ? d[i][n] : d[i])
  }
}

class KeyedListItem<T> implements Observable<T | T[keyof T]> {
  private readonly k: string | number
  private readonly n: keyof T | undefined
  private readonly source: Observable<Record<string | number, T>>

  constructor(
    k: string | number,
    n: keyof T | undefined,
    source: Observable<Record<string | number, T>>
  ) {
    this.k = k
    this.n = n
    this.source = source
  }

  subscribe(observer: Observer<T | T[keyof T]>): Subscription {
    return this.source.subscribe(new KeyedListItemObserver<T>(this.k, this.n, observer))
  }
}

class KeyedListItemObserver<T>
  extends OperatorObserver<Record<string | number, T>, T | T[keyof T]>
  implements Observer<Record<string | number, T>>
{
  private readonly k: string | number
  private readonly n: keyof T | undefined

  constructor(k: string | number, n: keyof T | undefined, observer: Observer<T | T[keyof T]>) {
    super(observer)
    this.k = k
    this.n = n
  }

  next(d: Record<string | number, T>): void {
    const k = this.k
    const n = this.n
    d[k] && this.observer.next(n ? d[k][n] : d[k])
  }
}
