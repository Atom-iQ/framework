import type {
  CreatedChildrenManager,
  CreatedNodeChild,
  RvdChild,
  RvdFragmentElement
} from '../../../shared/types'
import { _FRAGMENT, arrayReduce } from '../../../shared'
import { RvdChildFlags, RvdElementFlags } from '../../../shared/flags'

export const childrenArrayToFragment = (children: RvdChild[]): RvdFragmentElement => ({
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.Fragment,
  children,
  childFlags:
    children.length === 1
      ? RvdChildFlags.HasSingleUnknownChild
      : RvdChildFlags.HasMultipleUnknownChildren
})

export const getFlattenFragmentChildren = (manager: CreatedChildrenManager) => (
  all: CreatedNodeChild[],
  index: string
): CreatedNodeChild[] => {
  const child = manager.children[index] || manager.fragmentChildren[index]
  if (child.fragmentChildIndexes) {
    all.push(...arrayReduce(child.fragmentChildIndexes, getFlattenFragmentChildren(manager), []))
  } else {
    all.push(child)
  }
  return all
}
