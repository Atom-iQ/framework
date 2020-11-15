import type { RvdChild, RvdFragmentNode } from '../../../shared/types'
import { _FRAGMENT } from '../../../shared'
// noinspection ES6PreferShortImport
import { RvdChildFlags, RvdNodeFlags } from '../../../shared/flags'

export const childrenArrayToFragment = (children: RvdChild[]): RvdFragmentNode => ({
  type: _FRAGMENT,
  flag: RvdNodeFlags.Fragment,
  children,
  childFlags:
    children.length === 1
      ? RvdChildFlags.HasSingleUnknownChild
      : RvdChildFlags.HasMultipleUnknownChildren
})
