import {
  RvdChild,
  RvdChildFlags,
  RvdComponent,
  RvdComponentElement,
  RvdComponentProps,
  RvdDOMElement,
  RvdDOMElementType,
  RvdDOMProps,
  RvdElement,
  RvdElementFlags,
  RvdFragmentElement,
  RxO
} from '../../shared/types'
import { _FRAGMENT, isArray } from '../../shared'

export const createRvdElement = (
  elementFlag: RvdElementFlags,
  type: RvdDOMElementType,
  className?: string | null | RxO<string | null>,
  props?: RvdDOMProps | null,
  children?: RvdChild | RvdChild[] | null,
  childFlags?: RvdChildFlags | null,
  key?: string | number | null,
  ref?: {}
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
        type: _FRAGMENT,
        children,
        elementFlag,
        childFlags,
        key
      }
    : null

export const createRvdComponent = (
  type: RvdComponent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: RvdComponentProps<any> | null,
  key?: string | number | null,
  ref?: {}
): RvdComponentElement => ({
  type,
  props,
  elementFlag: RvdElementFlags.Component,
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
        delete rvdElement.props.children
      }
    }
  }
  return rvdElement
}
