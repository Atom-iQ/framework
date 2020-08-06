import { RvdChild, RvdFragmentElement } from '@@types'

export const childrenArrayToFragment = (children: RvdChild[]): RvdFragmentElement => ({
  props: null,
  type: '_Fragment',
  children
})
