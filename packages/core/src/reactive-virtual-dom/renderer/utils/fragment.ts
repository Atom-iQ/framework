import type {
  RvdChildrenManager,
  CreatedNodeChild,
  RvdChild,
  RvdFragmentNode
} from '../../../shared/types'
import { _FRAGMENT, arrayReduce } from '../../../shared'
// noinspection ES6PreferShortImport
import { RvdChildFlags, RvdNodeFlags } from '../../../shared/flags'

export const childrenArrayToFragment = (children: RvdChild[]): RvdFragmentNode => ({
  type: _FRAGMENT,
  elementFlag: RvdNodeFlags.Fragment,
  children,
  childFlags:
    children.length === 1
      ? RvdChildFlags.HasSingleUnknownChild
      : RvdChildFlags.HasMultipleUnknownChildren
})

export const getFlattenFragmentChildren = (manager: RvdChildrenManager) => (
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
