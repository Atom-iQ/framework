import type {
  ComponentRefProp,
  ElementRefProp,
  RvdChild,
  RvdComponent,
  RvdComponentElement,
  RvdComponentProps,
  RvdDOMElement,
  RvdDOMElementType,
  RvdDOMProps,
  RvdElement,
  RvdFragmentElement
} from '../../shared/types'
import { _FRAGMENT, isArray } from '../../shared'
import { RvdChildFlags, RvdElementFlags } from '../../shared/flags'
import { Observable } from 'rxjs'

export const createRvdElement = (
  elementFlag: RvdElementFlags,
  type: RvdDOMElementType,
  className?: string | null | Observable<string | null>,
  props?: RvdDOMProps | null,
  children?: RvdChild | RvdChild[] | null,
  childFlags?: RvdChildFlags | null,
  key?: string | number | null,
  ref?: ElementRefProp
): RvdDOMElement => ({
  elementFlag,
  type,
  className,
  props,
  children,
  childFlags,
  key,
  ref
})

export const createRvdFragment = (
  elementFlag: RvdElementFlags,
  children?: RvdChild[] | null,
  childFlags?: RvdChildFlags | null,
  key?: string | number
): RvdFragmentElement =>
  children && childFlags
    ? {
        elementFlag,
        type: _FRAGMENT,
        children,
        childFlags,
        key
      }
    : null

export const createRvdComponent = (
  type: RvdComponent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: RvdComponentProps<any> | null,
  key?: string | number | null,
  ref?: ComponentRefProp
): RvdComponentElement => ({
  elementFlag: RvdElementFlags.Component,
  type,
  props,
  key,
  ref
})

export const normalizeProps = (rvdElement: RvdElement): RvdElement => {
  if (rvdElement.props && RvdElementFlags.Element & rvdElement.elementFlag) {
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
