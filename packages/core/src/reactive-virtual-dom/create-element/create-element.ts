import type { RvdChild, RvdNode } from 'types'
import { isArray } from 'shared'
import { RvdChildFlags, RvdNodeFlags } from '../../shared/flags'

export function normalizeProps(rvdElement: RvdNode): RvdNode {
  if (rvdElement.props && RvdNodeFlags.Element & rvdElement.flag) {
    if (rvdElement.props['class'] || rvdElement.props['className']) {
      rvdElement.className = rvdElement.props['class'] || rvdElement.props['className']
      delete rvdElement.props['class']
      delete rvdElement.props['className']
    }

    if (rvdElement.props.children) {
      if (
        !rvdElement.children ||
        (isArray(rvdElement.children) && rvdElement.children.length === 0)
      ) {
        rvdElement.children = rvdElement.props.children as RvdChild | RvdChild[]
        rvdElement.childFlags = isArray(rvdElement.children)
          ? RvdChildFlags.HasMultipleUnknownChildren
          : RvdChildFlags.HasSingleUnknownChild
      }
      delete rvdElement.props.children
    }
  }
  return rvdElement
}
