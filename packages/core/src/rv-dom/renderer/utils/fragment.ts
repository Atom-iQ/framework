import {
  CreatedChild,
  CreatedChildrenManager,
  RvdChild,
  RvdChildFlags,
  RvdElementFlags,
  RvdFragmentElement
} from '../../../shared/types'
import { _FRAGMENT } from '../../../shared'

export const childrenArrayToFragment = (children: RvdChild[]): RvdFragmentElement => ({
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.Fragment,
  children,
  childFlags:
    children.length === 1
      ? RvdChildFlags.HasSingleUnknownChild
      : RvdChildFlags.HasMultipleUnknownChildren
})

export const getFlattenFragmentChildren = (
  createdChildren: CreatedChildrenManager,
  onlyIndexes = false
) => (all: (CreatedChild | string)[], index: string): (CreatedChild | string)[] => {
  const child = createdChildren.get(index) || createdChildren.getFragment(index)
  return child.fragmentChildIndexes
    ? all.concat(
        child.fragmentChildIndexes.reduce(
          getFlattenFragmentChildren(createdChildren, onlyIndexes),
          []
        )
      )
    : all.concat(onlyIndexes ? child.index : child)
}
