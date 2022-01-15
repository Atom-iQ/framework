import type { Observable } from '@atom-iq/rx'

import type {
  RvdKeyedListNode,
  RvdKeyedListProps,
  RvdNonKeyedListNode,
  RvdNonKeyedListProps
} from 'types'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

export function keyedList<T>(
  render: RvdKeyedListProps<T>['render'],
  keyBy: keyof T | '',
  data: Observable<T[]>
): RvdKeyedListNode<T> {
  return {
    type: RvdListType.Keyed,
    flag: RvdNodeFlags.List,
    props: {
      render,
      keyBy,
      data
    }
  }
}

export function nonKeyedList<T>(
  render: RvdNonKeyedListProps<T>['render'],
  data: Observable<T[]>
): RvdNonKeyedListNode<T> {
  return {
    type: RvdListType.NonKeyed,
    flag: RvdNodeFlags.List,
    props: {
      render,
      data
    }
  }
}
