import type { RvdChild, RvdListProps, RvdNode, RvdProps } from 'types'
import { isArray } from 'shared'
import { RvdNodeFlags } from 'shared/flags'

export function normalizeProps(rvdElement: RvdNode): RvdNode {
  if (rvdElement.props && RvdNodeFlags.Element & rvdElement.flag) {
    if (rvdElement.props['class'] || rvdElement.props['className']) {
      rvdElement.className = rvdElement.props['class'] || rvdElement.props['className']
      delete rvdElement.props['class']
      delete rvdElement.props['className']
    }

    if ((rvdElement.props as Exclude<RvdProps, RvdListProps>).children) {
      if (
        !rvdElement.children ||
        (isArray(rvdElement.children) && rvdElement.children.length === 0)
      ) {
        rvdElement.children = (rvdElement.props as Exclude<RvdProps, RvdListProps>).children as
          | RvdChild
          | RvdChild[]
      }
      delete (rvdElement.props as Exclude<RvdProps, RvdListProps>).children
    }
  }
  return rvdElement
}
