import type {
  CreatedChild,
  CreatedChildrenManager,
  RvdChild,
  RvdFragmentElement
} from '../../../shared/types'
import { _FRAGMENT } from '../../../shared'
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

export const getFlattenFragmentChildren = (createdChildren: CreatedChildrenManager) => (
  all: CreatedChild[],
  index: string
): CreatedChild[] => {
  const child = createdChildren.get(index) || createdChildren.getFragment(index)
  return child.fragmentChildIndexes
    ? all.concat(child.fragmentChildIndexes.reduce(getFlattenFragmentChildren(createdChildren), []))
    : all.concat(child)
}
