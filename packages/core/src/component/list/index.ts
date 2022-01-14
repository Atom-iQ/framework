import { RvdListNode, RvdListProps } from 'types'
import { Observable } from '@atom-iq/rx'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

export function keyedList<T>(
  render: RvdListProps<T>['render'],
  keyBy: keyof T | '',
  data: Observable<T[]>
): RvdListNode<T> {
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
  render: RvdListProps<T>['render'],
  data: Observable<T[]>
): RvdListNode<T> {
  return {
    type: RvdListType.NonKeyed,
    flag: RvdNodeFlags.List,
    props: {
      render,
      data
    }
  }
}
