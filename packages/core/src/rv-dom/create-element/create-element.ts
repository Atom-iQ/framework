import {
  RvdChild, RvdComponent,
  RvdElement,
  RvdElementType,
  RvdProps
} from '@@types'

export default function createRvdElement(
  type: RvdElementType,
  props: RvdProps,
  children: RvdChild[] | null
): RvdElement {
  return _createElement(
    type,
    props,
    children,
    props.key,
    props.ref
  )
}

function _createElement(
  type: RvdElementType,
  props: RvdProps | null,
  children: RvdChild[] | null,
  key?: string | number,
  ref?: {}
): RvdElement {
  const rvdElement: RvdElement = {
    type,
    props,
    children
  }

  if (key) rvdElement.key = key
  if (ref) rvdElement.ref = ref
  if (isComponentType(type)) rvdElement._component = type

  return rvdElement
}

function isComponentType(type: RvdElementType): type is RvdComponent {
  return typeof type === 'function'
}
