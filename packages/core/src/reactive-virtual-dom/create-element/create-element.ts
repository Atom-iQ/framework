import type {
  ComponentRefProp,
  ElementRefProp,
  RvdChild,
  RvdComponent,
  RvdComponentNode,
  RvdComponentProps,
  RvdElementNode,
  RvdElementNodeType,
  RvdDOMProps,
  RvdNode,
  RvdFragmentNode
} from '../../shared/types'
import { _FRAGMENT, isArray } from '../../shared'
import { RvdChildFlags, RvdNodeFlags } from '../../shared/flags'
import { Observable } from 'rxjs'

/*
 * TODO: createElement functions should be removed and JSX plugin should return
 * objects and only normalizeProps() function call for elements with spread props
 */

export function createRvdElement(
  elementFlag: RvdNodeFlags,
  type: RvdElementNodeType,
  className?: string | null | Observable<string | null>,
  props?: RvdDOMProps | null,
  children?: RvdChild | RvdChild[] | null,
  childFlags?: RvdChildFlags | null,
  key?: string | number | null,
  ref?: ElementRefProp
): RvdElementNode {
  return {
    elementFlag,
    type,
    className,
    props,
    children,
    childFlags,
    key,
    ref
  }
}

export function createRvdFragment(
  elementFlag: RvdNodeFlags,
  children?: RvdChild[] | null,
  childFlags?: RvdChildFlags | null,
  key?: string | number
): RvdFragmentNode {
  return children && childFlags
    ? {
        elementFlag,
        type: _FRAGMENT,
        children,
        childFlags,
        key
      }
    : null
}

export function createRvdComponent(
  type: RvdComponent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: RvdComponentProps<any> | null,
  key?: string | number | null,
  ref?: ComponentRefProp
): RvdComponentNode {
  return {
    elementFlag: RvdNodeFlags.Component,
    type,
    props,
    key,
    ref
  }
}

export function normalizeProps(rvdElement: RvdNode): RvdNode {
  if (rvdElement.props && RvdNodeFlags.Element & rvdElement.elementFlag) {
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
