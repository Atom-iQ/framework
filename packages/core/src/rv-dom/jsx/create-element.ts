import { RvdChild, RvdElement, RvdElementType, RvdProps, RvdReffedAttributes } from '@@types'

export default function createRvdElement(
  type: RvdElementType,
  props: RvdProps,
  children: RvdChild[] | null
): RvdElement {
  if (!hasRef(props)) {
    return _createElement(type, props, children)
  }

  const { ref, ...normalizedProps } = props

  return _createElement(
    type,
    normalizedProps,
    children,
    ref
  )
}

function _createElement(
  type: RvdElementType,
  props: RvdProps | null,
  children: RvdChild[] | null,
  ref?: {}
): RvdElement {

  const rvdElement: RvdElement = {
    type,
    props,
    children
  }

  if (ref) rvdElement.ref = ref
  if (typeof type === 'function') rvdElement._component = type

  return rvdElement
}

function hasRef(props: RvdProps): props is RvdProps & RvdReffedAttributes<unknown> {
  return !!(props && (props as RvdReffedAttributes<unknown>).ref)
}
