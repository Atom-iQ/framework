import {
  CreatedChild,
  CreatedChildrenManager,
  RvdChild,
  RvdFragmentElement,
  RvdFragmentNode,
  RvdNode,
  RvdObservableNode
} from '@@types'
import { switchMap } from 'rxjs/operators'
import { isRvdNode } from './check-type'
import { syncObservable } from './observable'
import { merge } from 'rxjs'

export const childrenArrayToFragment = (children: RvdChild[]): RvdFragmentElement => ({
  props: null,
  type: '_Fragment',
  children
})

export const switchNestedFragments = (
  baseIndex: string,
  createdChildren: CreatedChildrenManager
) => (fragmentNode: RvdFragmentNode): RvdObservableNode => {
  const obs: RvdObservableNode[] = Object.entries(fragmentNode)
    .map(([index, fragmentChild]) => {
      return switchMap((child: RvdFragmentNode | RvdNode) => {
        if (isRvdNode(child)) {
          return syncObservable({ ...child, indexInFragment: `${baseIndex}.${index}` })
        } else {
          return switchNestedFragments(`${baseIndex}.${index}`, createdChildren)(child)
        }
      })(fragmentChild)
    })
  return merge(...obs)
}

export const getFlattenFragmentChildren = (
  createdChildren: CreatedChildrenManager,
  onlyIndexes = false
) => (all: (CreatedChild | string)[], index: string): (CreatedChild | string)[] => {
  const child = createdChildren.get(index) || createdChildren.getFragment(index)
  return child.fragmentChildIndexes ?
    all.concat(child.fragmentChildIndexes.reduce(
      getFlattenFragmentChildren(createdChildren, onlyIndexes), [])
    ) : all.concat(onlyIndexes ? child.index : child)
}
